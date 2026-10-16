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
        // The assessment this test was generated for. The workspace uses it to
        // open the right assessment around the test, and the practice list uses
        // it to say what each test is preparing the student for.
        [JsonPropertyName("assessmentId")] public string? AssessmentId { get; init; }
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
        // mc | short | long | flashcard. Governs the taking UI + marking.
        [JsonPropertyName("kind")] public string Kind { get; init; } = "mc";
        [JsonPropertyName("options")] public IList<string> Options { get; init; } = [];

        // ---- The answer key --------------------------------------------
        // Everything from here to Topic is withheld until the student has a
        // submitted attempt. See PracticeService.GetQuestionsAsync: this
        // endpoint serves both taking a test and reviewing a finished one, and
        // it used to hand the key over in both cases. AnswerIdx is -1 and the
        // rest null while a test is still takeable.
        [JsonPropertyName("answerIdx")] public int AnswerIdx { get; init; }
        // Short-answer marking key (mirrors AnswerIdx's existing after-submit
        // review contract) and flashcard back.
        [JsonPropertyName("expectedAnswer")] public string? ExpectedAnswer { get; init; }
        [JsonPropertyName("acceptableAnswers")] public IList<string> AcceptableAnswers { get; init; } = [];
        [JsonPropertyName("back")] public string? Back { get; init; }
        [JsonPropertyName("explanation")] public string? Explanation { get; init; }

        [JsonPropertyName("topic")] public string? Topic { get; init; }

        // ---- Exam papers ------------------------------------------------
        // Safe before submit, and necessary: the marks are printed next to each
        // question on a real paper precisely so the student can budget the hour.

        // What this question is out of. 1 on every non-exam test.
        [JsonPropertyName("marks")] public int Marks { get; init; } = 1;

        // "A" | "B" | "C" on an exam, null elsewhere.
        [JsonPropertyName("section")] public string? Section { get; init; }
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

        // True on exactly one response in a student's lifetime: the submit that
        // graded their first ever attempt. Marketing needs an activation
        // signal, and "registered" is not one, because a registration that
        // never practises is not a customer. Deciding it here rather than in
        // the browser is the whole point: a device-local flag would re-fire on
        // a second phone and vanish when someone clears their storage, which
        // would quietly corrupt the number an ad budget is steered by.
        //
        // Never set on a read (GetLatestAttempt) or on a resubmit of an
        // already-graded attempt, so it cannot be replayed.
        [JsonPropertyName("firstSubmittedAttempt")] public bool FirstSubmittedAttempt { get; init; }
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

        // Exam papers only; null everywhere else. "43/70" is what a student
        // recognises from a real paper, and what they will compare against the
        // one they sit. ScorePercent above is the same number for mastery.
        [JsonPropertyName("marksAwarded")] public int? MarksAwarded { get; init; }
        [JsonPropertyName("marksTotal")] public int? MarksTotal { get; init; }

        // The marked script, question by question. Only populated for an exam.
        [JsonPropertyName("markedAnswers")] public IList<FrontendMarkedAnswerDto> MarkedAnswers { get; init; } = [];
    }

    // One marked written answer, as the examiner left it.
    public record FrontendMarkedAnswerDto
    {
        [JsonPropertyName("questionId")] public string QuestionId { get; init; } = "";
        [JsonPropertyName("marksAwarded")] public int? MarksAwarded { get; init; }
        [JsonPropertyName("marksAvailable")] public int? MarksAvailable { get; init; }
        // Where the marks went and what was missing. Null when the question was
        // machine-marked, or when marking was unavailable.
        [JsonPropertyName("feedback")] public string? Feedback { get; init; }
        [JsonPropertyName("givenAnswerText")] public string? GivenAnswerText { get; init; }
    }

    public record FrontendTopicScoreDto
    {
        [JsonPropertyName("topic")] public string Topic { get; init; } = "";
        [JsonPropertyName("correct")] public int Correct { get; init; }
        [JsonPropertyName("total")] public int Total { get; init; }
        [JsonPropertyName("percent")] public int Percent { get; init; }
    }

    // A queued AI generation, as the client polls it. Generation runs on
    // PracticeGenerationWorker rather than on the request thread, so the
    // browser starts a job and then watches this shape until it settles.
    public record FrontendGenerationJobDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        // queued | running | succeeded | failed.
        [JsonPropertyName("status")] public string Status { get; init; } = "queued";
        // multiple_choice | short_answer | reading | flashcards | essay | exam.
        // The waiting UI reads it to say how long a paper usually takes.
        [JsonPropertyName("format")] public string Format { get; init; } = "multiple_choice";
        // The test this job produced. Null until the job succeeds; the client
        // navigates to it the moment it appears.
        [JsonPropertyName("practiceTestId")] public string? PracticeTestId { get; init; }
        // A real message on failure, never a spinner that never resolves.
        [JsonPropertyName("error")] public string? Error { get; init; }
        [JsonPropertyName("attempts")] public int Attempts { get; init; }
        [JsonPropertyName("createdAt")] public DateTime CreatedAt { get; init; }
        [JsonPropertyName("startedAt")] public DateTime? StartedAt { get; init; }
        [JsonPropertyName("finishedAt")] public DateTime? FinishedAt { get; init; }
    }
}
