namespace Aptiverse.Practice.Features.ListTests;

/// <param name="StudyUnitId">Optional: only tests of this study unit.</param>
/// <param name="Status">Optional: "generating", "ready", "failed" or "archived".</param>
/// <param name="Attempted">Optional: true for tests with an attempt, false for tests without.</param>
/// <param name="Page">1-based page.</param>
/// <param name="PageSize">1 to 50, default 20.</param>
internal sealed record ListPracticeTestsRequest(
    Guid? StudyUnitId,
    string? Status,
    bool? Attempted,
    int Page = 1,
    int PageSize = ListPracticeTestsRequest.DefaultPageSize)
{
    public const int DefaultPageSize = 20;
    public const int MaxPageSize = 50;
}

/// <param name="Id">The test.</param>
/// <param name="Title">Its title.</param>
/// <param name="StudyUnitId">The study unit.</param>
/// <param name="AssessmentId">The assessment it was generated for.</param>
/// <param name="Format">"quiz", "exam_paper", "reading", "flashcards" or "essay".</param>
/// <param name="Mode">"timed" or "untimed".</param>
/// <param name="DurationMinutes">Duration of a timed test.</param>
/// <param name="QuestionCount">Questions once ready.</param>
/// <param name="TotalMarks">Marks once ready (0 for flashcards).</param>
/// <param name="Status">"generating", "ready", "failed" or "archived".</param>
/// <param name="CreatedAt">When it was requested.</param>
/// <param name="LatestAttempt">The test's one attempt, or null.</param>
internal sealed record PracticeTestSummary(
    Guid Id,
    string Title,
    Guid StudyUnitId,
    Guid AssessmentId,
    string Format,
    string Mode,
    int? DurationMinutes,
    int QuestionCount,
    int TotalMarks,
    string Status,
    DateTimeOffset CreatedAt,
    AttemptSummary? LatestAttempt);

/// <param name="AttemptId">The attempt.</param>
/// <param name="Status">"in_progress", "paused", "submitted", "grading" or "graded".</param>
/// <param name="ScorePercent">Null until fully graded, never zero for unmarked work.</param>
/// <param name="SubmittedAt">When it was submitted.</param>
internal sealed record AttemptSummary(Guid AttemptId, string Status, decimal? ScorePercent, DateTimeOffset? SubmittedAt);
