using System.Text.Json.Serialization;

namespace Aptiverse.Insights.Application.Frontend.Dtos
{
    public record FrontendLiveActivityDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("studentId")] public string StudentId { get; init; } = "";
        [JsonPropertyName("student")] public string Student { get; init; } = "";
        [JsonPropertyName("action")] public string Action { get; init; } = "";
        [JsonPropertyName("subject")] public string? Subject { get; init; }
        [JsonPropertyName("detail")] public string? Detail { get; init; }
        [JsonPropertyName("ts")] public DateTime Ts { get; init; }
    }

    public record FrontendGapDto
    {
        [JsonPropertyName("topic")] public string Topic { get; init; } = "";
        [JsonPropertyName("className")] public string ClassName { get; init; } = "";
        [JsonPropertyName("strugglingPct")] public int StrugglingPct { get; init; }
        [JsonPropertyName("sample")] public int Sample { get; init; }
    }

    public record FrontendDifferentiationTierDto
    {
        [JsonPropertyName("label")] public string Label { get; init; } = "";
        [JsonPropertyName("count")] public int Count { get; init; }
        [JsonPropertyName("suggestion")] public string Suggestion { get; init; } = "";
    }
}
