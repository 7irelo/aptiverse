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

    // "Term" here is a historical field name, not a claim about the student.
    // CurrentTerm / PredictedNextTerm are the current and projected averages
    // for whatever reporting period the student works in: a school term for a
    // high-school student, a semester for a tertiary one. The figures are
    // computed identically either way, from weighted graded work.
    //
    // The names are deliberately not being renamed. They are wire identifiers
    // that no student ever reads, the client presents them through its own
    // level-aware vocabulary, and a rename would break every consumer at once
    // on an unversioned API. If they are ever changed, the additive path is to
    // emit currentPeriod / predictedNextPeriod alongside these and retire the
    // old pair once nothing reads it.
    public record FrontendTermPredictionDto
    {
        [JsonPropertyName("subjectId")] public string SubjectId { get; init; } = "";
        [JsonPropertyName("subject")] public string Subject { get; init; } = "";
        [JsonPropertyName("currentTerm")] public int CurrentTerm { get; init; }
        [JsonPropertyName("predictedNextTerm")] public int PredictedNextTerm { get; init; }
        [JsonPropertyName("confidence")] public double Confidence { get; init; }
    }
}
