namespace Aptiverse.FeatureFlags.Application.FeatureFlags.Dtos
{
    public record CreateFeatureFlagDto
    {
        public string Key { get; init; }
        public string Name { get; init; }
        public string Description { get; init; }
        public bool IsEnabled { get; init; }
        public string Environment { get; init; }
        public int RolloutPercentage { get; init; }
        public string TargetAudience { get; init; }
        public DateTime? ExpiresAt { get; init; }
        public string CreatedBy { get; init; }
    }
}
