using Aptiverse.Billing.Domain;
using Aptiverse.Billing.Features.Common;
using Aptiverse.Billing.Paystack;
using Aptiverse.Billing.Persistence;
using Aptiverse.Billing.Subscriptions;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Billing.Features.CancelSubscription;

/// <summary>
/// Cancel at period end (T11) and resume before it (T12). Paystack is changed first; if it fails, nothing changes here
/// and the call is safe to retry. Both are idempotent: cancelling a cancelling subscription or resuming an active one
/// answers with the current view.
/// </summary>
internal sealed partial class SubscriptionChangeHandler(
    IDbContextOutbox<BillingDbContext> outbox,
    IPaystackClient paystack,
    SubscriptionLifecycle lifecycle,
    SubscriptionViews views,
    IClock clock,
    ILogger<SubscriptionChangeHandler> logger)
{
    public async Task<Result<SubscriptionView>> CancelAsync(Guid userId, CancelSubscriptionRequest request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var subscription = await views.CurrentAsync(userId, tracking: true, cancellationToken);
        if (subscription?.Status == SubscriptionStatuses.Cancelling)
        {
            return await views.ForUserAsync(userId, cancellationToken);
        }

        if (subscription?.Status != SubscriptionStatuses.Active)
        {
            return BillingErrors.NoActiveSubscription;
        }

        if (subscription.PaystackSubscriptionCode is { } code && await ToggleAsync(code, enable: false, cancellationToken) is { } failure)
        {
            return failure;
        }

        var result = await lifecycle.CancelAtPeriodEndAsync(subscription, "user", TriggerTypes.User, userId.ToString(), cancellationToken);
        if (result.IsFailure)
        {
            return result.Error!;
        }

        if (await SaveAsync(cancellationToken) is { } conflict)
        {
            return conflict;
        }

        LogCancelled(logger, userId, subscription.Id, request.Reason ?? "none");
        return await views.ForUserAsync(userId, cancellationToken);
    }

    public async Task<Result<SubscriptionView>> ResumeAsync(Guid userId, CancellationToken cancellationToken)
    {
        var subscription = await views.CurrentAsync(userId, tracking: true, cancellationToken);
        if (subscription?.Status == SubscriptionStatuses.Active)
        {
            return await views.ForUserAsync(userId, cancellationToken);
        }

        if (subscription?.Status != SubscriptionStatuses.Cancelling || subscription.CurrentPeriodEnd <= clock.UtcNow)
        {
            return BillingErrors.CannotResume;
        }

        if (subscription.PaystackSubscriptionCode is { } code && await ToggleAsync(code, enable: true, cancellationToken) is { } failure)
        {
            return failure;
        }

        var result = await lifecycle.TransitionAsync(subscription, SubscriptionStateMachine.Resumed, TriggerTypes.User, userId.ToString(), cancellationToken);
        if (result.IsFailure)
        {
            return result.Error!;
        }

        subscription.ClearCancellation();
        if (await SaveAsync(cancellationToken) is { } conflict)
        {
            return conflict;
        }

        return await views.ForUserAsync(userId, cancellationToken);
    }

    /// <summary>Paystack's enable and disable need the subscription's email token, fetched fresh instead of stored.</summary>
    private async Task<Error?> ToggleAsync(string code, bool enable, CancellationToken cancellationToken)
    {
        try
        {
            var remote = await paystack.FetchSubscriptionAsync(code, cancellationToken);
            if (remote?.EmailToken is not { Length: > 0 } token)
            {
                return BillingErrors.ProviderError;
            }

            if (enable)
            {
                await paystack.EnableSubscriptionAsync(code, token, cancellationToken);
            }
            else
            {
                await paystack.DisableSubscriptionAsync(code, token, cancellationToken);
            }

            return null;
        }
        catch (PaystackUnavailableException)
        {
            BillingMetrics.PaystackError(enable ? "subscription_enable" : "subscription_disable");
            return BillingErrors.ProviderUnavailable;
        }
        catch (PaystackRejectedException)
        {
            BillingMetrics.PaystackError(enable ? "subscription_enable" : "subscription_disable");
            return BillingErrors.ProviderError;
        }
    }

    private async Task<Error?> SaveAsync(CancellationToken cancellationToken)
    {
        try
        {
            await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
            return null;
        }
        catch (DbUpdateConcurrencyException)
        {
            return BillingErrors.ConcurrencyConflict;
        }
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} cancelled subscription {SubscriptionId} at period end ({Reason})")]
    private static partial void LogCancelled(ILogger logger, Guid userId, Guid subscriptionId, string reason);
}
