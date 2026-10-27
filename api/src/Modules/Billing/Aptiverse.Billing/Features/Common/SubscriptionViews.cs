using System.Text.RegularExpressions;
using Aptiverse.Billing.Domain;
using Aptiverse.Billing.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Aptiverse.Billing.Features.Common;

/// <param name="PaystackMode">"test" or "live", for the test mode banner.</param>
/// <param name="Subscription">Null on the free plan.</param>
internal sealed record SubscriptionView(string PaystackMode, SubscriptionDetail? Subscription);

/// <param name="Id">The subscription.</param>
/// <param name="PlanCode">For example "student.pro".</param>
/// <param name="PlanName">Display name.</param>
/// <param name="Status">"active", "past_due", "cancelling", and so on.</param>
/// <param name="Interval">"monthly" or "annual".</param>
/// <param name="AmountCents">Price per interval in cents, VAT inclusive.</param>
/// <param name="Currency">Always "ZAR" in v1.</param>
/// <param name="CurrentPeriodEnd">When the paid period ends (and renews, unless cancelling).</param>
/// <param name="CancelAtPeriodEnd">True while cancelling: access continues to the period end.</param>
internal sealed record SubscriptionDetail(
    Guid Id,
    string PlanCode,
    string PlanName,
    string Status,
    string? Interval,
    long? AmountCents,
    string Currency,
    DateTimeOffset? CurrentPeriodEnd,
    bool CancelAtPeriodEnd);

/// <summary>Reads the caller's own subscription. Every query filters by owner, so another user's is simply absent.</summary>
internal sealed class SubscriptionViews(BillingDbContext db, IClock clock, IOptions<BillingOptions> options)
{
    public async Task<SubscriptionView> ForUserAsync(Guid userId, CancellationToken cancellationToken)
    {
        var subscription = await CurrentAsync(userId, tracking: false, cancellationToken);
        if (subscription is null)
        {
            return new SubscriptionView(options.Value.Paystack.Mode, null);
        }

        var plan = await db.Plans.AsNoTracking().SingleAsync(p => p.Id == subscription.PlanId, cancellationToken);
        var price = subscription.PlanPriceId is { } priceId
            ? await db.PlanPrices.AsNoTracking().SingleOrDefaultAsync(p => p.Id == priceId, cancellationToken)
            : null;

        return new SubscriptionView(
            options.Value.Paystack.Mode,
            new SubscriptionDetail(
                subscription.Id,
                plan.Code,
                plan.Name,
                subscription.Status,
                subscription.Interval,
                price?.AmountCents,
                price?.Currency ?? Currencies.Zar,
                subscription.CurrentPeriodEnd,
                subscription.Status == SubscriptionStatuses.Cancelling));
    }

    /// <summary>The caller's entitled subscription, newest first.</summary>
    public async Task<Subscription?> CurrentAsync(Guid userId, bool tracking, CancellationToken cancellationToken)
    {
        var query = tracking ? db.Subscriptions : db.Subscriptions.AsNoTracking();
        var candidates = await query
            .Where(s => s.OwnerUserId == userId && (SubscriptionStatuses.Holding.Contains(s.Status) || s.Status == SubscriptionStatuses.Paused))
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(cancellationToken);
        var now = clock.UtcNow;
        return candidates.FirstOrDefault(s => s.IsEntitled(now));
    }
}

internal static partial class IdempotencyKeys
{
    public static bool IsValid(string key) => Pattern().IsMatch(key);

    [GeneratedRegex("^[A-Za-z0-9_-]{8,64}$")]
    private static partial Regex Pattern();
}
