using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.FeatureFlags.Domain.Models.FeatureFlags
{
    // Definition of a single feature flag. Looked up by Key on the hot
    // evaluation path, listed/filtered by Environment and IsEnabled in
    // the admin UI. CreatedAt/UpdatedAt were already present; promoted
    // to IEntityTimestamps so the foundation interceptor stamps them.
    [Index(nameof(Key))]
    [Index(nameof(Environment))]
    [Index(nameof(IsEnabled))]
    public class FeatureFlag : IEntityTimestamps
    {
        public long Id { get; set; }
        public string Key { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsEnabled { get; set; }

        // Free text (e.g. "Production"). Closed-set candidate, but the
        // exact stored casing/value set is unverified (frontend defaults
        // to lowercase "production" while the entity defaults to
        // "Production"), and the foundation enum->string convention
        // serializes by exact PascalCase member name. Kept as string to
        // guarantee value-string compatibility with existing rows.
        public string Environment { get; set; } = "Production";
        public int RolloutPercentage { get; set; } = 100;
        public string TargetAudience { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<FeatureFlagRule> Rules { get; set; }
    }
}
