using Microsoft.EntityFrameworkCore;

namespace Aptiverse.FeatureFlags.Domain.Models.FeatureFlags
{
    // Append-only log of a single flag evaluation for a user. Immutable
    // once written (never updated), so it carries its own EvaluatedAt
    // timestamp and intentionally does NOT adopt IEntityTimestamps.
    // Queried by FeatureFlagId (FK) and by UserId, often ordered by
    // EvaluatedAt.
    [Index(nameof(FeatureFlagId))]
    [Index(nameof(UserId))]
    [Index(nameof(FeatureFlagId), nameof(UserId))]
    [Index(nameof(EvaluatedAt))]
    public class FeatureFlagEvaluation
    {
        public long Id { get; set; }
        public long FeatureFlagId { get; set; }
        public string UserId { get; set; }
        public bool Result { get; set; }
        public string MatchedRuleId { get; set; }
        public string Context { get; set; }
        public DateTime EvaluatedAt { get; set; } = DateTime.UtcNow;

        public virtual FeatureFlag FeatureFlag { get; set; }
    }
}
