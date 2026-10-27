using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;
using Aptiverse.Billing.Contracts;
using Aptiverse.Billing.Domain;
using Aptiverse.Billing.Erasure;
using Aptiverse.Billing.Paystack;
using Aptiverse.Identity.Contracts;
using Microsoft.EntityFrameworkCore;
using static Aptiverse.IntegrationTests.BillingTestSupport;

namespace Aptiverse.IntegrationTests;

/// <summary>The money ledger, receipts, refunds, plan sync, reconciliation and erasure.</summary>
[Collection(ApiTestGroup.Name)]
public sealed class BillingLedgerTests(ApiFactory factory)
{
    private readonly BillingTestSupport _billing = new(factory);

    private void SkipWithoutDocker() => Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);

    [Fact]
    public async Task Ledger_invoices_and_refunds_reconcile_to_the_cent()
    {
        SkipWithoutDocker();
        var paid = await _billing.PaidStudentAsync();
        var paystackSubscription = await _billing.LinkPaystackSubscriptionAsync(paid);
        var renewal = _billing.Paystack.AddRenewal(paid.CustomerCode, paystackSubscription.PlanCode, 12_900);
        await _billing.ChargeSuccessAsync(renewal.Reference);

        // A partial refund (delivered twice), then the rest, then one cent too many.
        var partial = Refund(paid.Reference, 5_001);
        var issued = await _billing.WebhookSessionAsync(PaystackEvents.RefundProcessed, partial);
        await _billing.WebhookAsync(PaystackEvents.RefundProcessed, partial);
        await _billing.WebhookAsync(PaystackEvents.RefundProcessed, Refund(paid.Reference, 7_899));
        await _billing.WebhookAsync(PaystackEvents.RefundProcessed, Refund(paid.Reference, 1));

        var refundIssued = Assert.Single(MessagesOf<RefundIssued>(issued));
        Assert.False(refundIssued.IsFullRefund);
        Assert.Equal(5_001, refundIssued.AmountCents);

        await _billing.WithDbAsync(async db =>
        {
            var payments = await db.Payments.AsNoTracking().Where(p => p.UserId == paid.UserId).ToListAsync(Ct);
            var refunds = await db.Refunds.AsNoTracking().Where(r => payments.Select(p => p.Id).Contains(r.PaymentId) && r.Status == RefundStatuses.Processed).ToListAsync(Ct);
            var ledger = await db.LedgerEntries.AsNoTracking().Where(l => l.UserId == paid.UserId).ToListAsync(Ct);

            Assert.Equal(2, payments.Count);
            Assert.Equal(2, refunds.Count);
            Assert.Equal(4, ledger.Count);
            Assert.Equal(payments.Sum(p => p.AmountCents) - refunds.Sum(r => r.AmountCents), ledger.Sum(l => l.AmountCents));
            Assert.Equal(12_900, ledger.Sum(l => l.AmountCents));
            Assert.All(ledger, l => Assert.Equal("ZAR", l.Currency));
            foreach (var payment in payments)
            {
                var net = ledger.Where(l => l.PaymentId == payment.Id).Sum(l => l.AmountCents);
                Assert.Equal(payment.AmountCents - refunds.Where(r => r.PaymentId == payment.Id).Sum(r => r.AmountCents), net);
            }

            var invoices = await db.Invoices.AsNoTracking().Where(i => i.UserId == paid.UserId).OrderBy(i => i.Number).ToListAsync(Ct);
            Assert.Equal(2, invoices.Count);
            foreach (var invoice in invoices)
            {
                var lines = await db.InvoiceLines.AsNoTracking().Where(l => l.InvoiceId == invoice.Id).SumAsync(l => l.AmountCents, Ct);
                Assert.Equal(invoice.TotalCents, lines);
                Assert.Equal(invoice.TotalCents, invoice.SubtotalCents + invoice.VatCents);
                Assert.False(invoice.IsTaxInvoice);
                Assert.Equal(0, invoice.VatCents);
                Assert.Matches("^APT-[0-9]{4}-[0-9]{6}$", invoice.Number);
            }

            var first = invoices.Single(i => i.Id == payments.Single(p => p.PaystackReference == paid.Reference).InvoiceId);
            Assert.Equal(InvoiceStatuses.Refunded, first.Status);
            Assert.True(await db.ReconciliationDrifts.AnyAsync(d => d.PaystackRef == paid.Reference && d.Kind == DriftKinds.RefundExceedsPayment, Ct));
        });
    }

    [Fact]
    public async Task Invoice_numbers_are_unique_and_consecutive()
    {
        SkipWithoutDocker();
        var first = await _billing.PaidStudentAsync();
        var second = await _billing.PaidStudentAsync();

        var numbers = await _billing.WithDbAsync(db => db.Invoices.AsNoTracking()
            .Where(i => i.UserId == first.UserId || i.UserId == second.UserId)
            .Select(i => i.Number).ToListAsync(Ct));

        Assert.Equal(2, numbers.Distinct().Count());
        var sequence = numbers.Select(n => int.Parse(n[^6..], System.Globalization.CultureInfo.InvariantCulture)).Order().ToList();
        Assert.True(sequence[1] > sequence[0]);
    }

    [Fact]
    public async Task Plan_sync_creates_once_never_changes_amounts_and_dry_run_writes_nothing()
    {
        SkipWithoutDocker();
        await _billing.EnsurePlansSyncedAsync();
        var admin = factory.CreateAdminClient();
        var plansBefore = _billing.Paystack.Plans.Count;

        var dry = await admin.PostAsJsonAsync("/billing/admin/plans/sync", new { dryRun = true }, Ct);
        var again = await admin.PostAsJsonAsync("/billing/admin/plans/sync", new { dryRun = false }, Ct);

        Assert.Equal(HttpStatusCode.OK, dry.StatusCode);
        using var report = JsonDocument.Parse(await again.Content.ReadAsStringAsync(Ct));
        var items = report.RootElement.GetProperty("items").EnumerateArray().ToList();
        Assert.Contains(items, i => i.GetProperty("planCode").GetString() == "student.pro" && i.GetProperty("interval").GetString() == "monthly");
        Assert.DoesNotContain(items, i => i.GetProperty("action").GetString() == "create" && i.GetProperty("planCode").GetString() == "student.pro");
        Assert.Equal(plansBefore, _billing.Paystack.Plans.Count);

        var pro = _billing.Paystack.Plans.Values.Single(p => p.Name == "Aptiverse Student Pro (monthly)");
        Assert.Equal(12_900, pro.Amount);
        Assert.Equal("monthly", pro.Interval);
    }

    [Fact]
    public async Task Reconciliation_flags_a_paystack_payment_with_no_local_record()
    {
        SkipWithoutDocker();
        var paid = await _billing.PaidStudentAsync();
        var stray = _billing.Paystack.AddRenewal($"CUS_{Guid.NewGuid():N}", "PLN_unknown", 4_200);

        var response = await factory.CreateAdminClient().PostAsync("/billing/admin/reconciliation/run", null, Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        using var summary = JsonDocument.Parse(await response.Content.ReadAsStringAsync(Ct));
        var runId = summary.RootElement.GetProperty("runId").GetGuid();
        await _billing.WithDbAsync(async db =>
        {
            Assert.True(await db.ReconciliationDrifts.AnyAsync(d => d.RunId == runId && d.Kind == DriftKinds.MissingLocalPayment && d.PaystackRef == stray.Reference, Ct));
            Assert.False(await db.ReconciliationDrifts.AnyAsync(d => d.RunId == runId && d.PaystackRef == paid.Reference, Ct));
            Assert.Equal(RunStatuses.Succeeded, await db.ReconciliationRuns.Where(r => r.Id == runId).Select(r => r.Status).SingleAsync(Ct));
        });
    }

    [Fact]
    public async Task The_scheduled_reconciliation_runs_once_per_night_and_schedules_the_next()
    {
        SkipWithoutDocker();
        var night = new DateOnly(2001, 1, 1).AddDays(Random.Shared.Next(0, 3000));

        var first = await _billing.DeliverAsync(new RunPaystackReconciliation(night));
        await _billing.DeliverAsync(new RunPaystackReconciliation(night));

        Assert.Equal(1, await _billing.WithDbAsync(db => db.ReconciliationRuns.CountAsync(r => r.ScheduledFor == night, Ct)));
        var next = Assert.Single(first.Scheduled.MessagesOf<RunPaystackReconciliation>());
        Assert.True(next.ScheduledFor > DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)));
    }

    [Fact]
    public async Task Erasure_stops_billing_and_pseudonymises_invoices_but_keeps_financial_records()
    {
        SkipWithoutDocker();
        var paid = await _billing.PaidStudentAsync();
        var paystackSubscription = await _billing.LinkPaystackSubscriptionAsync(paid);
        var paymentsBefore = await _billing.WithDbAsync(db => db.Payments.CountAsync(p => p.UserId == paid.UserId, Ct));

        await _billing.DeliverAsync(new AccountDeletionRequested(paid.UserId, "gone@example.test", "Gone", DateTimeOffset.UtcNow));
        await _billing.DeliverAsync(new AccountDeletionRequested(paid.UserId, "gone@example.test", "Gone", DateTimeOffset.UtcNow));

        Assert.Equal("non-renewing", paystackSubscription.Status);
        await _billing.WithDbAsync(async db =>
        {
            Assert.Equal(SubscriptionStatuses.Cancelling, await db.Subscriptions.Where(s => s.Id == paid.SubscriptionId).Select(s => s.Status).SingleAsync(Ct));
            Assert.Equal(paymentsBefore, await db.Payments.CountAsync(p => p.UserId == paid.UserId, Ct));
            Assert.Equal(1, await db.LedgerEntries.CountAsync(l => l.UserId == paid.UserId, Ct));
            var invoice = await db.Invoices.AsNoTracking().SingleAsync(i => i.UserId == paid.UserId, Ct);
            Assert.Equal(BillingUserDataEraser.Pseudonym(paid.UserId), invoice.BillingName);
            Assert.Equal(string.Empty, invoice.BillingEmail);
            Assert.Equal(12_900, invoice.TotalCents);
        });
    }

    private JsonObject Refund(string reference, long amount) => new()
    {
        ["id"] = _billing.Paystack.NextId(),
        ["status"] = "processed",
        ["transaction_reference"] = reference,
        ["amount"] = amount,
        ["currency"] = "ZAR",
    };
}
