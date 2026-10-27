using System.Text;
using System.Text.Json;
using Aptiverse.Billing.Catalog;
using Aptiverse.Billing.Contracts;
using Aptiverse.Billing.Domain;
using Aptiverse.Billing.Entitlements;
using Aptiverse.Billing.Features.CancelSubscription;
using Aptiverse.Billing.Features.ListMyInvoices;
using Aptiverse.Billing.Features.ListPlans;
using Aptiverse.Billing.Features.ReceivePaystackWebhook;
using Aptiverse.Billing.Features.StartCheckout;
using Aptiverse.Billing.Features.VerifyCheckout;
using Aptiverse.Billing.Paystack;
using Aptiverse.Billing.Reconciliation;
using Aptiverse.Identity.Contracts;

namespace Aptiverse.IntegrationTests;

/// <summary>Pure rules of the Billing module: the state machine, money maths, webhook signature and dedupe key, catalog and validators.</summary>
public sealed class BillingDomainTests
{
    private const string Secret = "sk_test_unit_only";

    public static TheoryData<string> Transitions => new(SubscriptionStateMachine.Table.Keys);

    [Theory]
    [MemberData(nameof(Transitions))]
    public void Every_transition_in_the_table_applies_from_its_own_status(string transition)
    {
        var (from, to) = SubscriptionStateMachine.Table[transition];

        var next = SubscriptionStateMachine.Next(from, transition);

        Assert.True(next.IsSuccess);
        Assert.Equal(to, next.Value);
    }

    [Fact]
    public void Every_pair_not_in_the_table_is_refused_as_an_illegal_transition()
    {
        string?[] statuses = [null, .. SubscriptionStatuses.All];
        foreach (var transition in SubscriptionStateMachine.Table.Keys)
        {
            foreach (var from in statuses.Where(s => s != SubscriptionStateMachine.Table[transition].From))
            {
                var next = SubscriptionStateMachine.Next(from, transition);
                Assert.True(next.IsFailure, $"{transition} from {from ?? "(none)"} should be refused");
                Assert.Equal("billing.illegal_transition", next.Error!.Code);
            }
        }

        Assert.True(SubscriptionStateMachine.Next(SubscriptionStatuses.Active, "T99").IsFailure);
    }

    [Theory]
    [InlineData(SubscriptionStatuses.Active, true)]
    [InlineData(SubscriptionStatuses.PastDue, true)]
    [InlineData(SubscriptionStatuses.Incomplete, false)]
    [InlineData(SubscriptionStatuses.Cancelled, false)]
    [InlineData(SubscriptionStatuses.Expired, false)]
    public void Entitled_statuses(string status, bool entitled)
    {
        Assert.Equal(entitled, SubscriptionStatuses.IsEntitled(status, DateTimeOffset.UtcNow.AddDays(-1), DateTimeOffset.UtcNow));
    }

    [Fact]
    public void Cancelling_is_entitled_only_until_the_period_end()
    {
        var now = DateTimeOffset.UtcNow;
        Assert.True(SubscriptionStatuses.IsEntitled(SubscriptionStatuses.Cancelling, now.AddDays(1), now));
        Assert.False(SubscriptionStatuses.IsEntitled(SubscriptionStatuses.Cancelling, now.AddSeconds(-1), now));
    }

    [Theory]
    [InlineData(12_900, false, 1500, 0)]
    [InlineData(12_900, true, 1500, 1683)]
    [InlineData(115, true, 1500, 15)]
    [InlineData(1, true, 1500, 0)]
    [InlineData(0, true, 1500, 0)]
    public void Vat_split_is_inclusive_and_always_sums_to_the_total(long total, bool registered, int rate, long vat)
    {
        var split = MoneyMath.SplitInclusive(total, registered, rate);

        Assert.Equal(vat, split.VatCents);
        Assert.Equal(total, split.SubtotalCents + split.VatCents);
        Assert.Equal(registered, split.IsTaxInvoice);
    }

    [Fact]
    public void Vat_split_sums_for_every_amount_up_to_ten_thousand_rand()
    {
        for (long cents = 0; cents <= 1_000_000; cents += 997)
        {
            var split = MoneyMath.SplitInclusive(cents, true, 1500);
            Assert.Equal(cents, split.SubtotalCents + split.VatCents);
            Assert.InRange(split.VatCents, 0, cents);
        }
    }

    [Fact]
    public void Invoice_numbers_are_zero_padded_per_year()
    {
        Assert.Equal("APT-2026-000123", MoneyMath.InvoiceNumber(2026, 123));
    }

    [Fact]
    public void Signature_accepts_only_the_exact_body_signed_with_the_secret()
    {
        var body = Encoding.UTF8.GetBytes("""{"event":"charge.success","data":{"id":1}}""");
        var signature = PaystackWebhooks.Sign(body, Secret);

        Assert.True(PaystackWebhooks.IsValidSignature(body, signature, Secret));
        Assert.True(PaystackWebhooks.IsValidSignature(body, signature.ToUpperInvariant(), Secret));
        Assert.False(PaystackWebhooks.IsValidSignature(body, null, Secret));
        Assert.False(PaystackWebhooks.IsValidSignature(body, string.Empty, Secret));
        Assert.False(PaystackWebhooks.IsValidSignature(body, "not-hex", Secret));
        Assert.False(PaystackWebhooks.IsValidSignature(body, signature[..^2], Secret));
        Assert.False(PaystackWebhooks.IsValidSignature(body, PaystackWebhooks.Sign(body, "sk_test_other"), Secret));
        Assert.False(PaystackWebhooks.IsValidSignature(body, signature, null));

        var tampered = (byte[])body.Clone();
        tampered[^3] ^= 0x01;
        Assert.False(PaystackWebhooks.IsValidSignature(tampered, signature, Secret));
    }

    [Fact]
    public void Dedupe_key_is_stable_per_event_and_differs_by_status_and_type()
    {
        using var success = JsonDocument.Parse("""{"id":9,"status":"success","reference":"apt_1"}""");
        using var failed = JsonDocument.Parse("""{"id":9,"status":"failed","reference":"apt_1"}""");
        using var reordered = JsonDocument.Parse("""{"reference":"apt_1","status":"success","id":9,"amount":5}""");

        var key = PaystackWebhooks.DedupeKey("charge.success", success.RootElement);

        Assert.Equal(64, key.Length);
        Assert.Equal(key, PaystackWebhooks.DedupeKey("charge.success", reordered.RootElement));
        Assert.NotEqual(key, PaystackWebhooks.DedupeKey("charge.success", failed.RootElement));
        Assert.NotEqual(key, PaystackWebhooks.DedupeKey("refund.processed", success.RootElement));
    }

    [Fact]
    public void Subscription_events_include_the_next_payment_date_in_the_key()
    {
        using var first = JsonDocument.Parse("""{"id":5,"status":"active","subscription_code":"SUB_1","next_payment_date":"2026-11-01"}""");
        using var next = JsonDocument.Parse("""{"id":5,"status":"active","subscription_code":"SUB_1","next_payment_date":"2026-12-01"}""");

        Assert.NotEqual(
            PaystackWebhooks.DedupeKey("subscription.create", first.RootElement),
            PaystackWebhooks.DedupeKey("subscription.create", next.RootElement));
    }

    [Fact]
    public void Usage_period_is_the_calendar_month_in_johannesburg()
    {
        // 22:30 UTC on 31 October is already 1 November in South Africa.
        var (start, end) = UsagePeriods.For(new DateTimeOffset(2026, 10, 31, 22, 30, 0, TimeSpan.Zero));

        Assert.Equal(new DateTimeOffset(2026, 10, 31, 22, 0, 0, TimeSpan.Zero), start);
        Assert.Equal(new DateTimeOffset(2026, 11, 30, 22, 0, 0, TimeSpan.Zero), end);
    }

    [Fact]
    public void Nightly_reconciliation_runs_at_two_in_johannesburg()
    {
        var (date, at) = Reconciler.NextRun(new DateTimeOffset(2026, 10, 27, 23, 30, 0, TimeSpan.Zero));

        Assert.Equal(new DateOnly(2026, 10, 28), date);
        Assert.Equal(new DateTimeOffset(2026, 10, 28, 0, 0, 0, TimeSpan.Zero), at);
    }

    [Fact]
    public void Catalog_is_v1_with_cents_and_a_small_free_allowance()
    {
        var plans = CatalogSeeder.Plans.ToDictionary(p => p.Code);

        Assert.Equal(["free", "parent.1", "parent.2", "parent.3", "parent.4", "student.max", "student.pro"], plans.Keys.Order(StringComparer.Ordinal));
        Assert.False(plans["student.max"].IsActive);
        Assert.Equal(12_900, plans["student.pro"].MonthlyCents);
        Assert.Equal(129_000, plans["student.pro"].AnnualCents);
        Assert.Null(plans["free"].MonthlyCents);

        var free = plans["free"].Quotas.ToDictionary(q => q.Key, q => q.PerPeriod);
        Assert.Equal(3, free[QuotaKeys.PracticeGenerate]);
        Assert.Equal(15, free[QuotaKeys.AiQuick]);
        Assert.Equal(0, free[QuotaKeys.AiDeep]);
        Assert.All(QuotaKeys.All, k => Assert.True(free.ContainsKey(k)));
        Assert.All(plans.Values.SelectMany(p => p.Quotas), q => Assert.Contains(q.Key, QuotaKeys.All));
    }

    [Theory]
    [InlineData(false, false, true)]
    [InlineData(true, false, false)]
    [InlineData(true, true, true)]
    [InlineData(null, true, false)]
    [InlineData(null, false, false)]
    public void Payer_rules(bool? isMinor, bool consent, bool mayPay)
    {
        Assert.Equal(mayPay, new PayerEligibility(isMinor, consent).MayPay);
    }

    [Theory]
    [InlineData("student.pro", "monthly", true)]
    [InlineData("parent.2", "annual", true)]
    [InlineData("student.pro", "weekly", false)]
    [InlineData("", "monthly", false)]
    [InlineData("STUDENT.PRO", "monthly", false)]
    [InlineData("student pro", "monthly", false)]
    public void Checkout_request(string planCode, string interval, bool valid)
    {
        Assert.Equal(valid, new StartCheckoutValidator().Validate(new StartCheckoutRequest(planCode, interval)).IsValid);
    }

    [Fact]
    public void Checkout_request_has_no_amount_field()
    {
        // The contract itself cannot carry a client amount.
        Assert.DoesNotContain(typeof(StartCheckoutRequest).GetProperties(), p => p.Name.Contains("amount", StringComparison.OrdinalIgnoreCase));
    }

    [Theory]
    [InlineData("apt_0192aa", true)]
    [InlineData("", false)]
    [InlineData("bad reference", false)]
    public void Verify_request(string reference, bool valid)
    {
        Assert.Equal(valid, new VerifyCheckoutValidator().Validate(new VerifyCheckoutRequest(reference)).IsValid);
    }

    [Fact]
    public void Verify_request_rejects_long_references()
    {
        Assert.False(new VerifyCheckoutValidator().Validate(new VerifyCheckoutRequest(new string('a', 65))).IsValid);
    }

    [Theory]
    [InlineData(null, null, true)]
    [InlineData("too_expensive", "Money is tight", true)]
    [InlineData("bored", null, false)]
    public void Cancel_request(string? reason, string? comment, bool valid)
    {
        Assert.Equal(valid, new CancelSubscriptionValidator().Validate(new CancelSubscriptionRequest(reason, comment)).IsValid);
    }

    [Fact]
    public void Cancel_request_caps_the_comment()
    {
        Assert.False(new CancelSubscriptionValidator().Validate(new CancelSubscriptionRequest(null, new string('x', 501))).IsValid);
    }

    [Theory]
    [InlineData(null, true)]
    [InlineData("student", true)]
    [InlineData("parent", true)]
    [InlineData("tutor", false)]
    public void Plans_request(string? audience, bool valid)
    {
        Assert.Equal(valid, new ListPlansValidator().Validate(new ListPlansRequest(audience)).IsValid);
    }

    [Theory]
    [InlineData(1, 20, true)]
    [InlineData(0, 20, false)]
    [InlineData(1, 51, false)]
    public void Invoices_request(int page, int pageSize, bool valid)
    {
        Assert.Equal(valid, new ListMyInvoicesValidator().Validate(new ListMyInvoicesRequest(page, pageSize)).IsValid);
    }

    [Fact]
    public void Webhook_envelope()
    {
        using var data = JsonDocument.Parse("{}");
        using var array = JsonDocument.Parse("[]");
        var validator = new PaystackEnvelopeValidator();

        Assert.True(validator.Validate(new PaystackEnvelope("charge.success", data.RootElement)).IsValid);
        Assert.False(validator.Validate(new PaystackEnvelope(string.Empty, data.RootElement)).IsValid);
        Assert.False(validator.Validate(new PaystackEnvelope("Charge Success!", data.RootElement)).IsValid);
        Assert.False(validator.Validate(new PaystackEnvelope("charge.success", array.RootElement)).IsValid);
        Assert.False(validator.Validate(new PaystackEnvelope(new string('a', 61), data.RootElement)).IsValid);
    }

    [Fact]
    public void Paystack_plan_names_say_the_interval()
    {
        var plan = Plan.Create("student.pro", "Student Pro", "d", PlanKinds.Paid, Audiences.Student, 1, true, 1, true);
        Assert.Equal("Aptiverse Student Pro (annual)", PlanSyncer.PaystackName(plan, PlanPrice.Create(plan.Id, Intervals.Annual, 1)));
    }
}
