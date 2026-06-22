namespace Aptiverse.Entitlements.Application.Services
{
    // Quota enforcement for metered features. Plan tiers give monthly
    // allowances (PlanQuota); FeatureUsage tracks consumption per user
    // per calendar month. TryConsumeAsync atomically checks-and-increments
    // — call it at the start of any metered action; if it returns false,
    // reject the action with 402 Payment Required so the UI can prompt
    // the user to upgrade.
    public interface IUsageMeter
    {
        // Max-across-plans the user is a member of (including the
        // implicit free plan). -1 → unlimited.
        Task<int> GetLimitAsync(string userId, string quotaKey, CancellationToken ct = default);

        // Current month's consumption.
        Task<int> GetUsedAsync(string userId, string quotaKey, CancellationToken ct = default);

        // Combined snapshot for the UI meter ("17 of 200 left").
        Task<UsageSnapshot> GetUsageAsync(string userId, string quotaKey, CancellationToken ct = default);

        // Atomic check-and-increment. Returns false (no DB write) when
        // would exceed limit. Always succeeds on unlimited plans.
        Task<bool> TryConsumeAsync(string userId, string quotaKey, int amount = 1, CancellationToken ct = default);
    }

    public record UsageSnapshot
    {
        public required int Used { get; init; }
        public required int Limit { get; init; }      // -1 = unlimited
        public required int Remaining { get; init; }  // int.MaxValue when unlimited
        public required bool Unlimited { get; init; }
        public required DateTime PeriodStart { get; init; }
    }
}
