using System.Text.Json.Serialization;

namespace Aptiverse.Practice.Application.Frontend.Dtos
{
    public record FrontendPracticeTestDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("subjectId")] public string SubjectId { get; init; } = "";
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        // multiple_choice | short_answer | reading | flashcards | essay.
        [JsonPropertyName("format")] public string Format { get; init; } = "multiple_choice";
        [JsonPropertyName("topics")] public IList<string> Topics { get; init; } = [];
        [JsonPropertyName("questionCount")] public int QuestionCount { get; init; }
        [JsonPropertyName("difficulty")] public string Difficulty { get; init; } = "core";
        [JsonPropertyName("durationMinutes")] public int DurationMinutes { get; init; }
        // Reading passage (reading format) / essay prompt + criteria (essay).
        [JsonPropertyName("passage")] public string? Passage { get; init; }
        [JsonPropertyName("prompt")] public string? Prompt { get; init; }
        [JsonPropertyName("criteria")] public IList<string> Criteria { get; init; } = [];
        [JsonPropertyName("bestScore")] public int? BestScore { get; init; }
        [JsonPropertyName("attempts")] public int Attempts { get; init; }
        [JsonPropertyName("alignedSBA")] public string? AlignedSBA { get; init; }
        [JsonPropertyName("aiGenerated")] public bool AiGenerated { get; init; }
    }

    // Student-facing question shape. AnswerIdx IS part of the contract the
    // existing UI reads (it renders explanations client-side after submit),
    // so it is kept — but the Application layer only returns it on the
    // questions endpoint, never leaking it any earlier matters less here.
    public record FrontendQuestionDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("question")] public string Question { get; init; } = "";
        // mc | short | flashcard. Governs the taking UI + marking.
        [JsonPropertyName("kind")] public string Kind { get; init; } = "mc";
        [JsonPropertyName("options")] public IList<string> Options { get; init; } = [];
        [JsonPropertyName("answerIdx")] public int AnswerIdx { get; init; }
        // Short-answer marking key (mirrors AnswerIdx's existing after-submit
        // review contract) and flashcard back.
        [JsonPropertyName("expectedAnswer")] public string? ExpectedAnswer { get; init; }
        [JsonPropertyName("acceptableAnswers")] public IList<string> AcceptableAnswers { get; init; } = [];
        [JsonPropertyName("back")] public string? Back { get; init; }
        [JsonPropertyName("explanation")] public string? Explanation { get; init; }
        [JsonPropertyName("topic")] public string? Topic { get; init; }
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

    // Returned for create-attempt and submit. `answers` (an index per
    // question) is retained for the simple client path; richer per-question
    // timing arrives via `answerItems` on submit. `score` and `summary` are
    // populated once the attempt is scored.
    public record FrontendAttemptDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("testId")] public string TestId { get; init; } = "";
        [JsonPropertyName("studentId")] public string StudentId { get; init; } = "";
        [JsonPropertyName("status")] public string Status { get; init; } = "in_progress";
        [JsonPropertyName("startedAt")] public DateTime StartedAt { get; init; }
        [JsonPropertyName("submittedAt")] public DateTime? SubmittedAt { get; init; }
        [JsonPropertyName("focusLossCount")] public int FocusLossCount { get; init; }
        [JsonPropertyName("score")] public int? Score { get; init; }
        [JsonPropertyName("answers")] public IList<int> Answers { get; init; } = [];
        [JsonPropertyName("answerItems")] public IList<FrontendAnswerItemDto> AnswerItems { get; init; } = [];
        [JsonPropertyName("summary")] public FrontendScoreSummaryDto? Summary { get; init; }
    }

    // Per-question answer carried on a submit PATCH (the ML-rich path).
    // Optional alongside the flat `answers` array.
    public record FrontendAnswerItemDto
    {
        [JsonPropertyName("questionId")] public string QuestionId { get; init; } = "";
        [JsonPropertyName("selectedIdx")] public int SelectedIdx { get; init; } = -1;
        // Typed answer for short-answer / reading short parts. Null for MC.
        [JsonPropertyName("textAnswer")] public string? TextAnswer { get; init; }
        [JsonPropertyName("timeMs")] public int TimeMs { get; init; }
    }

    public record FrontendScoreSummaryDto
    {
        [JsonPropertyName("totalQuestions")] public int TotalQuestions { get; init; }
        [JsonPropertyName("correctCount")] public int CorrectCount { get; init; }
        [JsonPropertyName("incorrectCount")] public int IncorrectCount { get; init; }
        [JsonPropertyName("unansweredCount")] public int UnansweredCount { get; init; }
        [JsonPropertyName("scorePercent")] public int ScorePercent { get; init; }
        [JsonPropertyName("totalTimeMs")] public int TotalTimeMs { get; init; }
        [JsonPropertyName("perTopic")] public IList<FrontendTopicScoreDto> PerTopic { get; init; } = [];
    }

    public record FrontendTopicScoreDto
    {
        [JsonPropertyName("topic")] public string Topic { get; init; } = "";
        [JsonPropertyName("correct")] public int Correct { get; init; }
        [JsonPropertyName("total")] public int Total { get; init; }
        [JsonPropertyName("percent")] public int Percent { get; init; }
    }
}
