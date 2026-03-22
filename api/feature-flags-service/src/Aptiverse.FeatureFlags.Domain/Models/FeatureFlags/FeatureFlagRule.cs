namespace Aptiverse.FeatureFlags.Domain.Models.FeatureFlags
{
    public class FeatureFlagRule
    {
        public long Id { get; set; }
        public long FeatureFlagId { get; set; }
        public string RuleType { get; set; }
        public string Operator { get; set; }
        public string Value { get; set; }
        public int Priority { get; set; }
        public bool IsEnabled { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual FeatureFlag FeatureFlag { get; set; }
    }
}