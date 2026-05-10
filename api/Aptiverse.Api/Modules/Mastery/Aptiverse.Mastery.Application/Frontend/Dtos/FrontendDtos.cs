using System.Text.Json.Serialization;

namespace Aptiverse.Mastery.Application.Frontend.Dtos
{
    public record FrontendTopicMasteryDto
    {
        [JsonPropertyName("subjectId")] public string SubjectId { get; init; } = "";
        [JsonPropertyName("subject")] public string Subject { get; init; } = "";
        [JsonPropertyName("topic")] public string Topic { get; init; } = "";
        [JsonPropertyName("mastery")] public int Mastery { get; init; }
        [JsonPropertyName("trend")] public int Trend { get; init; }
    }

    public record FrontendTermPredictionDto
    {
        [JsonPropertyName("subjectId")] public string SubjectId { get; init; } = "";
        [JsonPropertyName("subject")] public string Subject { get; init; } = "";
        [JsonPropertyName("currentTerm")] public int CurrentTerm { get; init; }
        [JsonPropertyName("predictedNextTerm")] public int PredictedNextTerm { get; init; }
        [JsonPropertyName("confidence")] public double Confidence { get; init; }
    }
}
