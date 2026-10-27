using Aptiverse.Billing.Contracts;
using Aptiverse.Billing.Domain;
using Aptiverse.Billing.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Billing.Entitlements;

/// <summary>The calendar month in Africa/Johannesburg that quotas reset on.</summary>
internal static class UsagePeriods
{
    private static readonly TimeZoneInfo Johannesburg = TimeZoneInfo.FindSystemTimeZoneById("Africa/Johannesburg");

    public static (DateTimeOffset Start, DateTimeOffset End) For(DateTimeOffset now)
    {
        var local = TimeZoneInfo.ConvertTime(now, Johannesburg);
        var startLocal = new DateTime(local.Year, local.Month, 1, 0, 0, 0, DateTimeKind.Unspecified);
        var endLocal = startLocal.AddMonths(1);
        return (Offset(startLocal), Offset(endLocal));
    }

    private static DateTimeOffset Offset(DateTime local) =>
        new DateTimeOffset(local, Johannesburg.GetUtcOffset(local)).ToUniversalTime();
}

/// <summary>
/// Resolves which plans a user is entitled to and what they allow: the free plan always, plus every subscription the
/// user owns in an entitled status. Limits take the best of all entitled plans, and unlimited wins.
/// </summary>
internal sealed class PlanAccess(BillingDbContext db, IClock clock) : IEntitlements
{
    public async Task<IReadOnlyList<Guid>> EntitledPlanIdsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var now = clock.UtcNow;
        var free = await db.Plans.AsNoTracking().Where(p => p.Code == PlanCodes.Free).Select(p => p.Id).ToListAsync(cancellationToken);
        var subscriptions = await OwnedHoldingAsync(userId, cancellationToken);
        return free.Concat(subscriptions.Where(s => s.IsEntitled(now)).Select(s => s.PlanId)).Distinct().ToList();
    }

    /// <summary>Units per period: null when unlimited, 0 when no entitled plan includes the quota.</summary>
    public async Task<int?> LimitAsync(Guid userId, string quotaKey, CancellationToken cancellationToken)
    {
        var planIds = await EntitledPlanIdsAsync(userId, cancellationToken);
        var limits = await db.PlanQuotas.AsNoTracking()
            .Where(q => planIds.Contains(q.PlanId) && q.QuotaKey == quotaKey)
            .Select(q => q.PerPeriod)
            .ToListAsync(cancellationToken);

        if (limits.Contains(PlanQuota.Unlimited))
        {
            return null;
        }

        return limits.Count == 0 ? 0 : limits.Max();
    }

    public async Task<bool> HasFeatureAsync(Guid userId, string featureKey, CancellationToken cancellationToken)
    {
        var planIds = await EntitledPlanIdsAsync(userId, cancellationToken);
        return await db.PlanFeatures.AsNoTracking().AnyAsync(f => planIds.Contains(f.PlanId) && f.FeatureKey == featureKey, cancellationToken);
    }

    public async Task<EntitlementSet> GetAsync(Guid userId, CancellationToken cancellationToken)
    {
        var now = clock.UtcNow;
        var subscriptions = await OwnedHoldingAsync(userId, cancellationToken);
        var entitled = subscriptions.Where(s => s.IsEntitled(now)).OrderByDescending(s => s.CurrentPeriodEnd).ToList();
        var planIds = await EntitledPlanIdsAsync(userId, cancellationToken);

        var plans = await db.Plans.AsNoTracking().Where(p => planIds.Contains(p.Id)).ToDictionaryAsync(p => p.Id, cancellationToken);
        var features = await db.PlanFeatures.AsNoTracking()
            .Where(f => planIds.Contains(f.PlanId))
            .Select(f => f.FeatureKey)
            .Distinct()
            .ToListAsync(cancellationToken);

        var current = entitled.FirstOrDefault();
        return new EntitlementSet(
            features.Order(StringComparer.Ordinal).ToList(),
            plans.Values.OrderBy(p => p.SortOrder).Select(p => p.Code).ToList(),
            current is not null && plans.TryGetValue(current.PlanId, out var plan) ? plan.Code : PlanCodes.Free,
            current?.Status);
    }

    private Task<List<Subscription>> OwnedHoldingAsync(Guid userId, CancellationToken cancellationToken) =>
        db.Subscriptions.AsNoTracking()
            .Where(s => s.OwnerUserId == userId && (SubscriptionStatuses.Holding.Contains(s.Status) || s.Status == SubscriptionStatuses.Paused))
            .ToListAsync(cancellationToken);
}
