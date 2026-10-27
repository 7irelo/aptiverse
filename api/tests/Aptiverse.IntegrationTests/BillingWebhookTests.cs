using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json.Nodes;
using Aptiverse.Billing.Contracts;
using Aptiverse.Billing.Domain;
using Aptiverse.Billing.Paystack;
using Microsoft.EntityFrameworkCore;
using static Aptiverse.IntegrationTests.BillingTestSupport;

namespace Aptiverse.IntegrationTests;

[Collection(ApiTestGroup.Name)]
public sealed class BillingWebhookTests(ApiFactory factory)
{
    private readonly BillingTestSupport _billing = new(factory);

    private void SkipWithoutDocker() => Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);

    [Fact]
    public async Task Missing_wrong_and_tampered_signatures_are_401_and_store_nothing()
    {
        SkipWithoutDocker();
        var marker = $"sig_{Guid.NewGuid():N}";
        var body = Envelope("charge.success", new JsonObject { ["id"] = 1, ["status"] = "success", ["reference"] = marker });
        var tampered = Envelope("charge.success", new JsonObject { ["id"] = 1, ["status"] = "success", ["reference"] = marker + "x" });

        var missing = await _billing.WebhookAsync(body, sign: false);
        var wrongKey = await _billing.WebhookAsync(body, PaystackWebhooks.Sign(body, "sk_test_someone_else"));
        var garbage = await _billing.WebhookAsync(body, "deadbeef");
        var changedBody = await _billing.WebhookAsync(tampered, PaystackWebhooks.Sign(body, ApiFactory.PaystackSecret));

        foreach (var response in new[] { missing, wrongKey, garbage, changedBody })
        {
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            Assert.Equal("billing.webhook_bad_signature", await ProblemCodeAsync(response));
        }

        Assert.Equal(0, await _billing.WithDbAsync(db => db.PaystackEvents.CountAsync(e => e.ObjectRef != null && e.ObjectRef.StartsWith(marker), Ct)));
    }

    [Fact]
    public async Task Oversized_body_is_413_and_malformed_json_is_400()
    {
        SkipWithoutDocker();
        var huge = Encoding.UTF8.GetBytes("{\"event\":\"charge.success\",\"data\":{\"pad\":\"" + new string('a', PaystackWebhooks.MaxBodyBytes) + "\"}}");
        var oversized = await _billing.WebhookAsync(huge);
        Assert.Equal(HttpStatusCode.RequestEntityTooLarge, oversized.StatusCode);

        var malformed = await _billing.WebhookAsync(Encoding.UTF8.GetBytes("{not json"));
        Assert.Equal(HttpStatusCode.BadRequest, malformed.StatusCode);

        var noEvent = await _billing.WebhookAsync(Encoding.UTF8.GetBytes("""{"data":{}}"""));
        Assert.Equal(HttpStatusCode.BadRequest, noEvent.StatusCode);
    }

    [Fact]
    public async Task Unknown_event_is_accepted_and_ignored()
    {
        SkipWithoutDocker();
        var marker = $"cust_{Guid.NewGuid():N}";
        var response = await _billing.WebhookAsync("customeridentification.success", new JsonObject { ["id"] = 3, ["reference"] = marker });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var row = await _billing.WithDbAsync(db => db.PaystackEvents.AsNoTracking().SingleAsync(e => e.ObjectRef == marker, Ct));
        Assert.Equal(InboxStatuses.Ignored, row.Status);
        Assert.Equal(InboxSources.Webhook, row.Source);
    }

    [Fact]
    public async Task The_same_signed_webhook_replayed_ten_times_applies_once()
    {
        SkipWithoutDocker();
        await _billing.EnsurePlansSyncedAsync();
        var student = await _billing.StudentAsync();
        var reference = await ReferenceAsync(await CheckoutAsync(student.Client));
        _billing.Paystack.MarkPaid(reference);
        var body = Envelope(PaystackEvents.ChargeSuccess, StubPaystack.TransactionData(_billing.Paystack.Transactions[reference]));

        var succeeded = new List<PaymentSucceeded>();
        for (var i = 0; i < 10; i++)
        {
            var (response, session) = await _billing.WebhookTrackedAsync(body);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            succeeded.AddRange(MessagesOf<PaymentSucceeded>(session));
        }

        await _billing.WithDbAsync(async db =>
        {
            Assert.Equal(1, await db.PaystackEvents.CountAsync(e => e.ObjectRef == reference, Ct));
            var payment = await db.Payments.AsNoTracking().SingleAsync(p => p.PaystackReference == reference, Ct);
            Assert.Equal(1, await db.Invoices.CountAsync(i => i.UserId == student.UserId, Ct));
            Assert.Equal(1, await db.LedgerEntries.CountAsync(l => l.PaymentId == payment.Id, Ct));
            var subscription = await db.Subscriptions.AsNoTracking().SingleAsync(s => s.OwnerUserId == student.UserId, Ct);
            Assert.Equal(1, await db.SubscriptionTransitions.CountAsync(t => t.SubscriptionId == subscription.Id && t.Transition == SubscriptionStateMachine.FirstPayment, Ct));
        });
        Assert.Single(succeeded);
        Assert.Equal(12_900, succeeded[0].AmountCents);
        Assert.True(succeeded[0].IsFirstPaymentForUser);
    }

    [Fact]
    public async Task Verify_then_webhook_and_webhook_then_verify_each_apply_once()
    {
        SkipWithoutDocker();
        await _billing.EnsurePlansSyncedAsync();

        // Verify first (the welcome page), then the webhook arrives.
        var first = await _billing.StudentAsync();
        var firstReference = await ReferenceAsync(await CheckoutAsync(first.Client));
        _billing.Paystack.MarkPaid(firstReference);
        var verified = await first.Client.PostAsJsonAsync("/billing/checkout/verify", new { reference = firstReference }, Ct);
        Assert.Equal(HttpStatusCode.OK, verified.StatusCode);
        var status = await verified.Content.ReadFromJsonAsync<JsonObject>(Ct);
        Assert.Equal("paid", status!["status"]!.GetValue<string>());
        Assert.Equal("active", status["subscriptionStatus"]!.GetValue<string>());
        Assert.Equal(HttpStatusCode.OK, (await _billing.ChargeSuccessAsync(firstReference)).StatusCode);

        // The webhook first, then the welcome page verifies.
        var second = await _billing.StudentAsync();
        var secondReference = await ReferenceAsync(await CheckoutAsync(second.Client));
        _billing.Paystack.MarkPaid(secondReference);
        Assert.Equal(HttpStatusCode.OK, (await _billing.ChargeSuccessAsync(secondReference)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await second.Client.PostAsJsonAsync("/billing/checkout/verify", new { reference = secondReference }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await second.Client.PostAsJsonAsync("/billing/checkout/verify", new { reference = secondReference }, Ct)).StatusCode);

        await _billing.WithDbAsync(async db =>
        {
            foreach (var reference in new[] { firstReference, secondReference })
            {
                Assert.Equal(1, await db.Payments.CountAsync(p => p.PaystackReference == reference, Ct));
                Assert.Equal(1, await db.PaystackEvents.CountAsync(e => e.ObjectRef == reference, Ct));
            }
        });
    }

    [Fact]
    public async Task A_charge_whose_amount_differs_from_the_session_is_stored_not_applied_and_raises_drift()
    {
        SkipWithoutDocker();
        await _billing.EnsurePlansSyncedAsync();
        var student = await _billing.StudentAsync();
        var reference = await ReferenceAsync(await CheckoutAsync(student.Client));
        _billing.Paystack.MarkPaid(reference, amount: 100);

        Assert.Equal(HttpStatusCode.OK, (await _billing.ChargeSuccessAsync(reference)).StatusCode);

        await _billing.WithDbAsync(async db =>
        {
            Assert.False(await db.Payments.AnyAsync(p => p.PaystackReference == reference, Ct));
            Assert.Equal(SubscriptionStatuses.Incomplete, await db.Subscriptions.Where(s => s.OwnerUserId == student.UserId).Select(s => s.Status).SingleAsync(Ct));
            var row = await db.PaystackEvents.AsNoTracking().SingleAsync(e => e.ObjectRef == reference, Ct);
            Assert.Equal(InboxStatuses.Ignored, row.Status);
            Assert.Equal("amount_mismatch", row.LastErrorCode);
            var drift = await db.ReconciliationDrifts.AsNoTracking().SingleAsync(d => d.PaystackRef == reference, Ct);
            Assert.Equal(DriftKinds.AmountMismatch, drift.Kind);
            Assert.Equal("12900 ZAR", drift.Expected);
        });
    }

    [Fact]
    public async Task A_charge_paystack_does_not_confirm_is_ignored_even_when_signed()
    {
        SkipWithoutDocker();
        await _billing.EnsurePlansSyncedAsync();
        var student = await _billing.StudentAsync();
        var reference = await ReferenceAsync(await CheckoutAsync(student.Client));

        // Signed and claiming success, but Paystack's verify still says the payer abandoned it.
        var forged = StubPaystack.TransactionData(_billing.Paystack.Transactions[reference]);
        forged["status"] = "success";
        Assert.Equal(HttpStatusCode.OK, (await _billing.WebhookAsync(PaystackEvents.ChargeSuccess, forged)).StatusCode);

        Assert.False(await _billing.WithDbAsync(db => db.Payments.AnyAsync(p => p.PaystackReference == reference, Ct)));
    }
}
