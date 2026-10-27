using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using Aptiverse.Billing.Contracts;
using Aptiverse.Billing.Domain;
using Aptiverse.Billing.Paystack;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using static Aptiverse.IntegrationTests.BillingTestSupport;

namespace Aptiverse.IntegrationTests;

/// <summary>The subscription state machine driven through webhooks, the user routes and the scheduled messages.</summary>
[Collection(ApiTestGroup.Name)]
public sealed class BillingSubscriptionTests(ApiFactory factory)
{
    private readonly BillingTestSupport _billing = new(factory);

    private void SkipWithoutDocker() => Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);

    [Fact]
    public async Task First_payment_activates_the_subscription_and_grants_the_plan()
    {
        SkipWithoutDocker();
        var paid = await _billing.PaidStudentAsync();

        await _billing.WithDbAsync(async db =>
        {
            var subscription = await db.Subscriptions.AsNoTracking().SingleAsync(s => s.Id == paid.SubscriptionId, Ct);
            Assert.Equal(SubscriptionStatuses.Active, subscription.Status);
            Assert.Equal(paid.CustomerCode, subscription.PaystackCustomerCode);
            Assert.InRange((subscription.CurrentPeriodEnd!.Value - subscription.CurrentPeriodStart!.Value).TotalDays, 28, 31);
            Assert.Equal(CheckoutStatuses.Paid, await db.CheckoutSessions.Where(c => c.Reference == paid.Reference).Select(c => c.Status).SingleAsync(Ct));
        });

        await using var scope = factory.Services.CreateAsyncScope();
        var entitlements = scope.ServiceProvider.GetRequiredService<IEntitlements>();
        var set = await entitlements.GetAsync(paid.UserId, Ct);
        Assert.Equal("student.pro", set.CurrentPlanCode);
        Assert.Equal(SubscriptionStatuses.Active, set.SubscriptionStatus);
        Assert.Contains("free", set.PlanCodes);
        Assert.True(await entitlements.HasFeatureAsync(paid.UserId, FeatureKeys.AiTutor, Ct));

        var stranger = await _billing.StudentAsync();
        Assert.False(await entitlements.HasFeatureAsync(stranger.UserId, FeatureKeys.AiTutor, Ct));
        Assert.Equal("free", (await entitlements.GetAsync(stranger.UserId, Ct)).CurrentPlanCode);
    }

    [Fact]
    public async Task Renewal_extends_the_period_and_a_failed_renewal_goes_past_due_then_recovers()
    {
        SkipWithoutDocker();
        var paid = await _billing.PaidStudentAsync();
        var paystackSubscription = await _billing.LinkPaystackSubscriptionAsync(paid);
        var firstEnd = await PeriodEndAsync(paid.SubscriptionId);

        var renewal = _billing.Paystack.AddRenewal(paid.CustomerCode, paystackSubscription.PlanCode, 12_900);
        var renewed = await _billing.WebhookSessionAsync(PaystackEvents.ChargeSuccess, StubPaystack.TransactionData(renewal));
        Assert.Single(MessagesOf<PaymentSucceeded>(renewed), p => p.Purpose == PaymentPurposes.Renewal);
        var secondEnd = await PeriodEndAsync(paid.SubscriptionId);
        Assert.InRange((secondEnd - firstEnd).TotalDays, 28, 31);

        var failed = await _billing.WebhookSessionAsync(PaystackEvents.InvoicePaymentFailed, new JsonObject
        {
            ["id"] = _billing.Paystack.NextId(),
            ["status"] = "failed",
            ["invoice_code"] = $"INV_{Guid.NewGuid():N}",
            ["subscription"] = new JsonObject { ["subscription_code"] = paystackSubscription.Code },
        });
        Assert.Single(MessagesOf<PaymentFailed>(failed));
        Assert.Equal(SubscriptionStatuses.PastDue, await StatusAsync(paid.SubscriptionId));

        var retry = _billing.Paystack.AddRenewal(paid.CustomerCode, paystackSubscription.PlanCode, 12_900);
        await _billing.ChargeSuccessAsync(retry.Reference);
        Assert.Equal(SubscriptionStatuses.Active, await StatusAsync(paid.SubscriptionId));
        Assert.Equal(
            [SubscriptionStateMachine.CheckoutStarted, SubscriptionStateMachine.FirstPayment, SubscriptionStateMachine.Renewed, SubscriptionStateMachine.RenewalFailed, SubscriptionStateMachine.RetrySucceeded],
            await TransitionsAsync(paid.SubscriptionId));
        Assert.Equal(3, await _billing.WithDbAsync(db => db.Payments.CountAsync(p => p.SubscriptionId == paid.SubscriptionId, Ct)));
    }

    [Fact]
    public async Task Past_due_ends_when_the_grace_runs_out_or_paystack_disables_it()
    {
        SkipWithoutDocker();
        var graced = await _billing.PaidStudentAsync();
        var gracedSub = await _billing.LinkPaystackSubscriptionAsync(graced);
        await FailRenewalAsync(gracedSub.Code);
        var since = await _billing.WithDbAsync(db => db.Subscriptions.Where(s => s.Id == graced.SubscriptionId).Select(s => s.PastDueSince!.Value).SingleAsync(Ct));

        // A stale message (another past due spell) changes nothing; the matching one ends it.
        await _billing.DeliverAsync(new CheckPastDueSubscription(graced.SubscriptionId, since.AddDays(-30)));
        Assert.Equal(SubscriptionStatuses.PastDue, await StatusAsync(graced.SubscriptionId));
        var ended = await _billing.DeliverAsync(new CheckPastDueSubscription(graced.SubscriptionId, since));
        Assert.Equal(SubscriptionStatuses.Cancelled, await StatusAsync(graced.SubscriptionId));
        Assert.Single(MessagesOf<SubscriptionCancelled>(ended), c => c.Reason == "past_due");

        var disabled = await _billing.PaidStudentAsync();
        var disabledSub = await _billing.LinkPaystackSubscriptionAsync(disabled);
        await FailRenewalAsync(disabledSub.Code);
        await _billing.WebhookAsync(PaystackEvents.SubscriptionDisable, StubPaystack.SubscriptionData(disabledSub, "complete"));
        Assert.Equal(SubscriptionStatuses.Cancelled, await StatusAsync(disabled.SubscriptionId));
    }

    [Fact]
    public async Task Cancel_at_period_end_then_resume_toggles_paystack_and_is_idempotent()
    {
        SkipWithoutDocker();
        var paid = await _billing.PaidStudentAsync();
        var paystackSubscription = await _billing.LinkPaystackSubscriptionAsync(paid);

        HttpResponseMessage? cancel = null;
        var session = await _billing.TrackAsync(async () => cancel = await paid.Client.PostAsJsonAsync("/billing/subscription/cancel", new { reason = "too_expensive" }, Ct));
        Assert.Equal(HttpStatusCode.OK, cancel!.StatusCode);
        var view = await cancel.Content.ReadFromJsonAsync<JsonObject>(Ct);
        Assert.True(view!["subscription"]!["cancelAtPeriodEnd"]!.GetValue<bool>());
        Assert.Equal("cancelling", view["subscription"]!["status"]!.GetValue<string>());
        Assert.Equal("non-renewing", paystackSubscription.Status);
        Assert.Single(MessagesOf<SubscriptionCancelled>(session), c => c.Reason == "user");

        Assert.Equal(HttpStatusCode.OK, (await paid.Client.PostAsJsonAsync("/billing/subscription/cancel", new { }, Ct)).StatusCode);

        // Still entitled while cancelling.
        await using (var scope = factory.Services.CreateAsyncScope())
        {
            Assert.True(await scope.ServiceProvider.GetRequiredService<IEntitlements>().HasFeatureAsync(paid.UserId, FeatureKeys.AiTutor, Ct));
        }

        var resume = await paid.Client.PostAsync("/billing/subscription/resume", null, Ct);
        Assert.Equal(HttpStatusCode.OK, resume.StatusCode);
        Assert.Equal("active", paystackSubscription.Status);
        Assert.Equal(SubscriptionStatuses.Active, await StatusAsync(paid.SubscriptionId));
        Assert.Equal(HttpStatusCode.OK, (await paid.Client.PostAsync("/billing/subscription/resume", null, Ct)).StatusCode);
        Assert.Equal(
            [SubscriptionStateMachine.CheckoutStarted, SubscriptionStateMachine.FirstPayment, SubscriptionStateMachine.CancelRequested, SubscriptionStateMachine.Resumed],
            await TransitionsAsync(paid.SubscriptionId));
    }

    [Fact]
    public async Task A_paystack_outage_during_cancel_changes_nothing()
    {
        SkipWithoutDocker();
        var paid = await _billing.PaidStudentAsync();
        await _billing.LinkPaystackSubscriptionAsync(paid);

        _billing.Paystack.Down = true;
        HttpResponseMessage response;
        try
        {
            response = await paid.Client.PostAsJsonAsync("/billing/subscription/cancel", new { }, Ct);
        }
        finally
        {
            _billing.Paystack.Down = false;
        }

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Equal("billing.provider_unavailable", await ProblemCodeAsync(response));
        Assert.Equal(SubscriptionStatuses.Active, await StatusAsync(paid.SubscriptionId));
    }

    [Fact]
    public async Task A_cancelling_subscription_ends_at_its_period_end_and_cannot_be_resumed_after()
    {
        SkipWithoutDocker();
        var paid = await _billing.PaidStudentAsync();
        await _billing.LinkPaystackSubscriptionAsync(paid);
        Assert.Equal(HttpStatusCode.OK, (await paid.Client.PostAsJsonAsync("/billing/subscription/cancel", new { }, Ct)).StatusCode);

        var past = DateTimeOffset.UtcNow.AddMinutes(-1);
        await _billing.WithDbAsync(db => db.Subscriptions.Where(s => s.Id == paid.SubscriptionId).ExecuteUpdateAsync(s => s.SetProperty(x => x.CurrentPeriodEnd, past), Ct));

        var resume = await paid.Client.PostAsync("/billing/subscription/resume", null, Ct);
        Assert.Equal(HttpStatusCode.Conflict, resume.StatusCode);
        Assert.Equal("billing.cannot_resume", await ProblemCodeAsync(resume));

        var stored = await _billing.WithDbAsync(db => db.Subscriptions.Where(s => s.Id == paid.SubscriptionId).Select(s => s.CurrentPeriodEnd!.Value).SingleAsync(Ct));
        await _billing.DeliverAsync(new EndSubscriptionPeriod(paid.SubscriptionId, stored.AddDays(-3)));
        Assert.Equal(SubscriptionStatuses.Cancelling, await StatusAsync(paid.SubscriptionId));
        await _billing.DeliverAsync(new EndSubscriptionPeriod(paid.SubscriptionId, stored));
        Assert.Equal(SubscriptionStatuses.Cancelled, await StatusAsync(paid.SubscriptionId));
        Assert.Contains(SubscriptionStateMachine.PeriodEnded, await TransitionsAsync(paid.SubscriptionId));
    }

    [Fact]
    public async Task Subscription_create_before_charge_success_is_retried_and_converges()
    {
        SkipWithoutDocker();
        await _billing.EnsurePlansSyncedAsync();
        var student = await _billing.StudentAsync();
        var reference = await ReferenceAsync(await CheckoutAsync(student.Client));
        var transaction = _billing.Paystack.MarkPaid(reference);
        var paystackSubscription = _billing.Paystack.AddSubscription(transaction.CustomerCode!, transaction.PlanCode!);

        await _billing.WebhookAsync(PaystackEvents.SubscriptionCreate, StubPaystack.SubscriptionData(paystackSubscription));
        var early = await _billing.WithDbAsync(db => db.PaystackEvents.AsNoTracking().SingleAsync(e => e.ObjectRef == paystackSubscription.Code, Ct));
        Assert.Equal(InboxStatuses.Pending, early.Status);
        Assert.Equal("subscription_not_found", early.LastErrorCode);

        await _billing.ChargeSuccessAsync(reference);
        await _billing.DeliverAsync(new ProcessPaystackEvent(early.Id));

        await _billing.WithDbAsync(async db =>
        {
            Assert.Equal(InboxStatuses.Processed, await db.PaystackEvents.Where(e => e.Id == early.Id).Select(e => e.Status).SingleAsync(Ct));
            var subscription = await db.Subscriptions.AsNoTracking().SingleAsync(s => s.OwnerUserId == student.UserId, Ct);
            Assert.Equal(paystackSubscription.Code, subscription.PaystackSubscriptionCode);
            Assert.Equal(SubscriptionStatuses.Active, subscription.Status);
        });
    }

    [Fact]
    public async Task An_unpaid_checkout_is_abandoned_at_expiry_and_its_subscription_expires()
    {
        SkipWithoutDocker();
        await _billing.EnsurePlansSyncedAsync();
        var student = await _billing.StudentAsync();
        var reference = await ReferenceAsync(await CheckoutAsync(student.Client));
        var sessionId = await _billing.WithDbAsync(db => db.CheckoutSessions.Where(c => c.Reference == reference).Select(c => c.Id).SingleAsync(Ct));

        // Early delivery does nothing.
        await _billing.DeliverAsync(new ExpireCheckoutSession(sessionId));
        Assert.Equal(CheckoutStatuses.Open, await _billing.WithDbAsync(db => db.CheckoutSessions.Where(c => c.Id == sessionId).Select(c => c.Status).SingleAsync(Ct)));

        var past = DateTimeOffset.UtcNow.AddMinutes(-1);
        await _billing.WithDbAsync(db => db.CheckoutSessions.Where(c => c.Id == sessionId).ExecuteUpdateAsync(s => s.SetProperty(c => c.ExpiresAt, past), Ct));
        await _billing.DeliverAsync(new ExpireCheckoutSession(sessionId));

        await _billing.WithDbAsync(async db =>
        {
            Assert.Equal(CheckoutStatuses.Abandoned, await db.CheckoutSessions.Where(c => c.Id == sessionId).Select(c => c.Status).SingleAsync(Ct));
            Assert.Equal(SubscriptionStatuses.Expired, await db.Subscriptions.Where(s => s.OwnerUserId == student.UserId).Select(s => s.Status).SingleAsync(Ct));
        });

        var verify = await student.Client.PostAsJsonAsync("/billing/checkout/verify", new { reference }, Ct);
        Assert.Equal("abandoned", (await verify.Content.ReadFromJsonAsync<JsonObject>(Ct))!["status"]!.GetValue<string>());
    }

    private async Task FailRenewalAsync(string subscriptionCode) =>
        await _billing.WebhookAsync(PaystackEvents.InvoicePaymentFailed, new JsonObject
        {
            ["id"] = _billing.Paystack.NextId(),
            ["status"] = "failed",
            ["invoice_code"] = $"INV_{Guid.NewGuid():N}",
            ["subscription"] = new JsonObject { ["subscription_code"] = subscriptionCode },
        });

    private Task<string> StatusAsync(Guid subscriptionId) =>
        _billing.WithDbAsync(db => db.Subscriptions.Where(s => s.Id == subscriptionId).Select(s => s.Status).SingleAsync(Ct));

    private Task<DateTimeOffset> PeriodEndAsync(Guid subscriptionId) =>
        _billing.WithDbAsync(db => db.Subscriptions.Where(s => s.Id == subscriptionId).Select(s => s.CurrentPeriodEnd!.Value).SingleAsync(Ct));

    private Task<List<string>> TransitionsAsync(Guid subscriptionId) =>
        _billing.WithDbAsync(db => db.SubscriptionTransitions.Where(t => t.SubscriptionId == subscriptionId)
            .OrderBy(t => t.OccurredAt).ThenBy(t => t.Id).Select(t => t.Transition).ToListAsync(Ct));
}
