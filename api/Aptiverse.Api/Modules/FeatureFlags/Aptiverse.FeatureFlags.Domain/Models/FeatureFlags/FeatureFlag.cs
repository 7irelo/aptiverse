namespace Aptiverse.FeatureFlags.Domain.Models.FeatureFlags
{
    public class FeatureFlag
    {
        public long Id { get; set; }
        public string Key { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsEnabled { get; set; }
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