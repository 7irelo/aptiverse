using System.Text.Json.Serialization;

namespace Aptiverse.FeatureFlags.Application.Frontend.Dtos
{
    public record FrontendFeatureFlagDto
    {
        [JsonPropertyName("key")] public string Key { get; init; } = "";
        [JsonPropertyName("description")] public string Description { get; init; } = "";
        [JsonPropertyName("enabled")] public bool Enabled { get; init; }
        [JsonPropertyName("rollout")] public int Rollout { get; init; }
        [JsonPropertyName("env")] public string Env { get; init; } = "production";
    }

    public record FrontendToggleFlagInput
    {
        [JsonPropertyName("enabled")] public bool Enabled { get; init; }
        [JsonPropertyName("rollout")] public int? Rollout { get; init; }
    }
}
