using Aptiverse.Billing.Contracts;
using Aptiverse.Billing.Domain;
using Aptiverse.Billing.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Wolverine;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Billing.Subscriptions;

/// <summary>
/// Applies a state machine transition: the status change, its append-only transition row and SubscriptionStatusChanged
/// go into the same unit of work, so they commit together. The caller saves.
/// </summary>
internal sealed class SubscriptionLifecycle(IDbContextOutbox<BillingDbContext> outbox, IClock clock)
{
    private BillingDbContext Db => outbox.DbContext;

    public async Task<Result> TransitionAsync(Subscription subscription, string transition, string triggerType, string? triggerRef, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(subscription);
        var from = subscription.Status;
        var now = clock.UtcNow;
        var applied = subscription.Apply(transition, triggerType, triggerRef, now);
        if (applied.IsFailure)
        {
            return applied.Error!;
        }

        Db.SubscriptionTransitions.Add(applied.Value);
        if (from != subscription.Status)
        {
            var planCode = await PlanCodeAsync(subscription.PlanId, cancellationToken);
            await outbox.PublishAsync(new SubscriptionStatusChanged(
                subscription.Id, subscription.OwnerUserId, planCode, from, subscription.Status, transition, now));
        }

        return Result.Success();
    }

    /// <summary>T11 plus the period end message and SubscriptionCancelled; access continues to the period end.</summary>
    public async Task<Result> CancelAtPeriodEndAsync(Subscription subscription, string reason, string triggerType, string? triggerRef, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(subscription);
        var result = await TransitionAsync(subscription, SubscriptionStateMachine.CancelRequested, triggerType, triggerRef, cancellationToken);
        if (result.IsFailure)
        {
            return result;
        }

        var now = clock.UtcNow;
        subscription.MarkCancelling(reason, now);
        var endsAt = subscription.CurrentPeriodEnd ?? now;
        await outbox.ScheduleAsync(new EndSubscriptionPeriod(subscription.Id, endsAt), endsAt > now ? endsAt - now : TimeSpan.Zero);
        await outbox.PublishAsync(new SubscriptionCancelled(
            subscription.Id, subscription.OwnerUserId, await PlanCodeAsync(subscription.PlanId, cancellationToken), reason, endsAt, now));
        return Result.Success();
    }

    /// <summary>Ends a subscription now (T10 or T13) and announces it.</summary>
    public async Task<Result> EndNowAsync(Subscription subscription, string transition, string reason, string triggerType, string? triggerRef, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(subscription);
        var wasCancelling = subscription.Status == SubscriptionStatuses.Cancelling;
        var result = await TransitionAsync(subscription, transition, triggerType, triggerRef, cancellationToken);
        if (result.IsFailure)
        {
            return result;
        }

        var now = clock.UtcNow;
        subscription.MarkEnded(now);
        if (!wasCancelling)
        {
            // A cancelling subscription announced its end when it was cancelled.
            subscription.MarkCancelling(reason, now);
            await outbox.PublishAsync(new SubscriptionCancelled(
                subscription.Id, subscription.OwnerUserId, await PlanCodeAsync(subscription.PlanId, cancellationToken), reason, now, now));
        }

        return Result.Success();
    }

    public Task<string> PlanCodeAsync(Guid planId, CancellationToken cancellationToken) =>
        Db.Plans.AsNoTracking().Where(p => p.Id == planId).Select(p => p.Code).SingleAsync(cancellationToken);
}
