namespace Aptiverse.FeatureFlags.Domain.Models.FeatureFlags
{
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