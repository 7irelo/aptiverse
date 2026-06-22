using System.Text.Json.Serialization;

namespace Aptiverse.Practice.Application.Frontend.Dtos
{
    public record FrontendPracticeTestDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("subjectId")] public string SubjectId { get; init; } = "";
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("topics")] public IList<string> Topics { get; init; } = [];
        [JsonPropertyName("questionCount")] public int QuestionCount { get; init; }
        [JsonPropertyName("difficulty")] public string Difficulty { get; init; } = "core";
        [JsonPropertyName("durationMinutes")] public int DurationMinutes { get; init; }
        [JsonPropertyName("bestScore")] public int? BestScore { get; init; }
        [JsonPropertyName("attempts")] public int Attempts { get; init; }
        [JsonPropertyName("alignedSBA")] public string? AlignedSBA { get; init; }
        [JsonPropertyName("aiGenerated")] public bool AiGenerated { get; init; }
    }

    public record FrontendQuestionDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("question")] public string Question { get; init; } = "";
        [JsonPropertyName("options")] public IList<string> Options { get; init; } = [];
        [JsonPropertyName("answerIdx")] public int AnswerIdx { get; init; }
        [JsonPropertyName("explanation")] public string? Explanation { get; init; }
    }

    public record FrontendPastPaperDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("year")] public int Year { get; init; }
        [JsonPropertyName("subject")] public string Subject { get; init; } = "";
        [JsonPropertyName("paper")] public string Paper { get; init; } = "";
        [JsonPropertyName("board")] public string Board { get; init; } = "NSC";
        [JsonPropertyName("topic")] public string Topic { get; init; } = "";
        [JsonPropertyName("solved")] public bool Solved { get; init; }
    }

    public record FrontendAttemptDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("testId")] public string TestId { get; init; } = "";
        [JsonPropertyName("studentId")] public string StudentId { get; init; } = "";
        [JsonPropertyName("startedAt")] public DateTime StartedAt { get; init; }
        [JsonPropertyName("submittedAt")] public DateTime? SubmittedAt { get; init; }
        [JsonPropertyName("score")] public int? Score { get; init; }
        [JsonPropertyName("answers")] public IList<int> Answers { get; init; } = [];
    }
}
