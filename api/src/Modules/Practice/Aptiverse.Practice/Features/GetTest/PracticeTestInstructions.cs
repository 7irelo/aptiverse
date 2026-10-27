using Aptiverse.Practice.Features.Common;

namespace Aptiverse.Practice.Features.GetTest;

/// <summary>
/// The instructions screen of a test. It never carries questions, options or answers before an attempt exists, nor
/// after submission (results come from getPracticeAttemptResults); while the test's attempt is active it carries the
/// full attempt state so a reload of the runner recovers from one call.
/// </summary>
/// <param name="Id">The test.</param>
/// <param name="Title">Its title.</param>
/// <param name="StudyUnitId">The study unit.</param>
/// <param name="AssessmentId">The assessment it was generated for.</param>
/// <param name="Format">"quiz", "exam_paper", "reading", "flashcards" or "essay".</param>
/// <param name="Mode">"timed" or "untimed".</param>
/// <param name="DurationMinutes">Duration of a timed test.</param>
/// <param name="QuestionCount">Number of questions.</param>
/// <param name="TotalMarks">Marks available (0 for flashcards, which are self-rated).</param>
/// <param name="Topics">The topics the test covers.</param>
/// <param name="Difficulty">"foundation", "core" or "stretch".</param>
/// <param name="PauseAllowed">True only for untimed tests; timed tests run under exam conditions.</param>
/// <param name="Status">"generating", "ready", "failed" or "archived".</param>
/// <param name="ServerNow">The server clock.</param>
/// <param name="Attempt">The test's one attempt, or null.</param>
/// <param name="ActiveAttempt">The full attempt state while the attempt is in progress or paused, otherwise null.</param>
internal sealed record PracticeTestInstructions(
    Guid Id,
    string Title,
    Guid StudyUnitId,
    Guid AssessmentId,
    string Format,
    string Mode,
    int? DurationMinutes,
    int QuestionCount,
    int TotalMarks,
    IReadOnlyList<string> Topics,
    string Difficulty,
    bool PauseAllowed,
    string Status,
    DateTimeOffset ServerNow,
    AttemptRef? Attempt,
    AttemptState? ActiveAttempt);

internal sealed record AttemptRef(Guid AttemptId, string Status);
