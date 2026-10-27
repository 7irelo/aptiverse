namespace Aptiverse.Practice.Domain;

// Closed value sets. Each one backs a check constraint and a validator rule, so the database and the API reject
// the same values.

/// <summary>The five v1 formats (decision 16). They match the ai service's generation formats one to one.</summary>
internal static class PracticeFormats
{
    public const string Quiz = "quiz";
    public const string ExamPaper = "exam_paper";
    public const string Reading = "reading";
    public const string Flashcards = "flashcards";
    public const string Essay = "essay";

    public static IReadOnlyList<string> All { get; } = [Quiz, ExamPaper, Reading, Flashcards, Essay];

    /// <summary>Formats sized by a question count. An exam paper is sized by marks; an essay is one long answer.</summary>
    public static bool UsesQuestionCount(string format) => format is Quiz or Reading or Flashcards;

    /// <summary>The mode a format forces, or null when the student chooses.</summary>
    public static string? ForcedMode(string format) => format switch
    {
        ExamPaper => PracticeModes.Timed,
        Flashcards => PracticeModes.Untimed,
        _ => null,
    };

    public static string EffectiveMode(string format, string? requested) =>
        ForcedMode(format) ?? requested ?? PracticeModes.Untimed;

    public static string Label(string format) => format switch
    {
        Quiz => "Quiz",
        ExamPaper => "Exam paper",
        Reading => "Reading comprehension",
        Flashcards => "Flashcards",
        Essay => "Essay",
        _ => format,
    };
}

internal static class PracticeModes
{
    public const string Timed = "timed";
    public const string Untimed = "untimed";

    public static IReadOnlyList<string> All { get; } = [Timed, Untimed];
}

internal static class Difficulties
{
    public const string Foundation = "foundation";
    public const string Core = "core";
    public const string Stretch = "stretch";

    public static IReadOnlyList<string> All { get; } = [Foundation, Core, Stretch];
}

/// <summary>Matches the Academics study unit stage values.</summary>
internal static class Stages
{
    public const string HighSchool = "high_school";
    public const string University = "university";

    public static IReadOnlyList<string> All { get; } = [HighSchool, University];
}

internal static class TestStatuses
{
    public const string Generating = "generating";
    public const string Ready = "ready";
    public const string Failed = "failed";
    public const string Archived = "archived";

    public static IReadOnlyList<string> All { get; } = [Generating, Ready, Failed, Archived];
}

internal static class TestSources
{
    public const string Ai = "ai";
    public const string Legacy = "legacy";

    public static IReadOnlyList<string> All { get; } = [Ai, Legacy];
}

/// <summary>Question types as the ai service produces them.</summary>
internal static class QuestionKinds
{
    public const string Mcq = "mcq";
    public const string Short = "short";
    public const string Numeric = "numeric";
    public const string Long = "long";
    public const string Flashcard = "flashcard";
    public const string Essay = "essay";

    public static IReadOnlyList<string> All { get; } = [Mcq, Short, Numeric, Long, Flashcard, Essay];

    /// <summary>Answered with text and marked by the ai grader.</summary>
    public static bool IsWritten(string kind) => kind is Short or Numeric or Long or Essay;
}

internal static class JobStatuses
{
    public const string Queued = "queued";
    public const string Running = "running";
    public const string Succeeded = "succeeded";
    public const string Failed = "failed";

    public static IReadOnlyList<string> All { get; } = [Queued, Running, Succeeded, Failed];

    public static IReadOnlyList<string> Active { get; } = [Queued, Running];
}

internal static class AttemptStatuses
{
    public const string InProgress = "in_progress";
    public const string Paused = "paused";
    public const string Submitted = "submitted";
    public const string Grading = "grading";
    public const string Graded = "graded";

    public static IReadOnlyList<string> All { get; } = [InProgress, Paused, Submitted, Grading, Graded];

    public static IReadOnlyList<string> Active { get; } = [InProgress, Paused];

    public static bool IsActive(string status) => status is InProgress or Paused;
}

internal static class SubmitSources
{
    public const string Student = "student";
    public const string Deadline = "deadline";

    public static IReadOnlyList<string> All { get; } = [Student, Deadline];
}

internal static class GradedBy
{
    public const string Auto = "auto";
    public const string Ai = "ai";
    public const string Pending = "pending";

    public static IReadOnlyList<string> All { get; } = [Auto, Ai, Pending];
}

internal static class SelfRatings
{
    public const string Knew = "knew";
    public const string Unsure = "unsure";
    public const string DidNotKnow = "did_not_know";

    public static IReadOnlyList<string> All { get; } = [Knew, Unsure, DidNotKnow];
}

internal static class FocusLossKinds
{
    public static IReadOnlyList<string> All { get; } = ["visibility_hidden", "window_blur"];
}

/// <summary>Generation failure codes stored on the job and shown by the status endpoint.</summary>
internal static class GenerationErrorCodes
{
    public const string Failed = "practice.generation_failed";
    public const string InvalidOutput = "practice.generation_invalid_output";
    public const string TimedOut = "practice.generation_timed_out";
    public const string Cancelled = "practice.generation_cancelled";
}
