using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.FeatureFlags.Domain.Models.FeatureFlags
{
    // A targeting rule attached to a FeatureFlag. Queried by its FK
    // FeatureFlagId, evaluated in Priority order, and filtered by
    // IsEnabled. Editable via the update path, so it adopts the
    // IEntityTimestamps audit pair (CreatedAt already existed; UpdatedAt
    // added so the foundation interceptor bumps it on edits).
    [Index(nameof(FeatureFlagId))]
    [Index(nameof(FeatureFlagId), nameof(IsEnabled))]
    [Index(nameof(FeatureFlagId), nameof(Priority))]
    public class FeatureFlagRule : IEntityTimestamps
    {
        public long Id { get; set; }
        public long FeatureFlagId { get; set; }

        // Closed-set candidates, but no documented/seeded value set
        // exists to verify against and rows are populated purely via the
        // API. Kept as string to guarantee value-string compatibility.
        public string RuleType { get; set; }
        public string Operator { get; set; }
        public string Value { get; set; }
        public int Priority { get; set; }
        public bool IsEnabled { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual FeatureFlag FeatureFlag { get; set; }
    }
}
