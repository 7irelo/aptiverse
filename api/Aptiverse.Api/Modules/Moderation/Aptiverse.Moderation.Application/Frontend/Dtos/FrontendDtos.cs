using System.Text.Json.Serialization;

namespace Aptiverse.Moderation.Application.Frontend.Dtos
{
    public record FrontendModerationFlagDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("reason")] public string Reason { get; init; } = "";
        [JsonPropertyName("target")] public string Target { get; init; } = "";
        [JsonPropertyName("reporter")] public string Reporter { get; init; } = "";
        [JsonPropertyName("excerpt")] public string Excerpt { get; init; } = "";
        [JsonPropertyName("severity")] public string Severity { get; init; } = "low";
        [JsonPropertyName("createdAt")] public DateTime CreatedAt { get; init; }
    }

    public record FrontendModerationActionInput
    {
        [JsonPropertyName("action")] public string Action { get; init; } = "dismiss"; // dismiss | warn | suspend | remove
        [JsonPropertyName("note")] public string? Note { get; init; }
    }
}
