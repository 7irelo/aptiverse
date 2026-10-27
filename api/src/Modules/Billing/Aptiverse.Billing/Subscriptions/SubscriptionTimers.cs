using Aptiverse.Billing.Contracts;
using Aptiverse.Billing.Domain;
using Aptiverse.Billing.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Billing.Subscriptions;

/// <summary>
/// The scheduled messages of the subscription lifecycle. Each checks the stored state still matches what it was
/// scheduled for, so a stale or repeated message is a no-op.
/// </summary>
internal sealed class SubscriptionTimers(IDbContextOutbox<BillingDbContext> outbox, SubscriptionLifecycle lifecycle, IClock clock)
{
    private BillingDbContext Db => outbox.DbContext;

    /// <summary>T03: an unpaid checkout is abandoned and its incomplete subscription expires.</summary>
    public async Task ExpireCheckoutAsync(ExpireCheckoutSession message, CancellationToken cancellationToken)
    {
        var session = await Db.CheckoutSessions.SingleOrDefaultAsync(c => c.Id == message.CheckoutSessionId, cancellationToken);
        if (session is null || session.ExpiresAt > clock.UtcNow || !session.Abandon())
        {
            return;
        }

        if (session.SubscriptionId is { } subscriptionId
            && await Db.Subscriptions.SingleOrDefaultAsync(s => s.Id == subscriptionId, cancellationToken) is { Status: SubscriptionStatuses.Incomplete } subscription)
        {
            await lifecycle.TransitionAsync(subscription, SubscriptionStateMachine.CheckoutExpired, TriggerTypes.Scheduler, session.Id.ToString(), cancellationToken);
        }

        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
    }

    /// <summary>T13: a cancelling subscription ends at its period end.</summary>
    public async Task EndPeriodAsync(EndSubscriptionPeriod message, CancellationToken cancellationToken)
    {
        var subscription = await Db.Subscriptions.SingleOrDefaultAsync(s => s.Id == message.SubscriptionId, cancellationToken);
        if (subscription is not { Status: SubscriptionStatuses.Cancelling }
            || !SameInstant(subscription.CurrentPeriodEnd, message.PeriodEnd)
            || message.PeriodEnd > clock.UtcNow)
        {
            return;
        }

        await lifecycle.EndNowAsync(subscription, SubscriptionStateMachine.PeriodEnded, subscription.CancelReason ?? "user", TriggerTypes.Scheduler, null, cancellationToken);
        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
    }

    /// <summary>T10: past due for the whole grace period with no successful charge.</summary>
    public async Task CheckPastDueAsync(CheckPastDueSubscription message, CancellationToken cancellationToken)
    {
        var subscription = await Db.Subscriptions.SingleOrDefaultAsync(s => s.Id == message.SubscriptionId, cancellationToken);
        if (subscription is not { Status: SubscriptionStatuses.PastDue } || !SameInstant(subscription.PastDueSince, message.PastDueSince))
        {
            return;
        }

        await lifecycle.EndNowAsync(subscription, SubscriptionStateMachine.GraceExhausted, "past_due", TriggerTypes.Scheduler, null, cancellationToken);
        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
    }

    /// <summary>Postgres keeps microseconds, so a timestamp read back can differ from the scheduled one below that.</summary>
    private static bool SameInstant(DateTimeOffset? stored, DateTimeOffset scheduled) =>
        stored is { } value && Math.Abs((value - scheduled).TotalMilliseconds) < 1;
}
