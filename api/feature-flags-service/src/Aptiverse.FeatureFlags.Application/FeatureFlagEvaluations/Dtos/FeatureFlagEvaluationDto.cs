namespace Aptiverse.FeatureFlags.Application.FeatureFlagEvaluations.Dtos
{
    public record FeatureFlagEvaluationDto
    {
        public long Id { get; init; }
        public long FeatureFlagId { get; init; }
        public string UserId { get; init; }
        public bool Result { get; init; }
        public string MatchedRuleId { get; init; }
        public string Context { get; init; }
        public DateTime EvaluatedAt { get; init; }
    }
}
