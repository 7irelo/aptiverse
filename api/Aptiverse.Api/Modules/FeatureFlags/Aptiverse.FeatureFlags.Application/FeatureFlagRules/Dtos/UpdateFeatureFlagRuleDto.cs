namespace Aptiverse.FeatureFlags.Application.FeatureFlagRules.Dtos
{
    public record UpdateFeatureFlagRuleDto
    {
        public long FeatureFlagId { get; init; }
        public string RuleType { get; init; }
        public string Operator { get; init; }
        public string Value { get; init; }
        public int Priority { get; init; }
        public bool IsEnabled { get; init; }
    }
}
