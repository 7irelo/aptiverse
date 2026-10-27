namespace Aptiverse.Practice.Features.GenerateTest;

/// <param name="AssessmentId">One of your scheduled or in progress assessments; the subject or course, its level and stage come from it.</param>
/// <param name="Format">"quiz", "exam_paper", "reading" (high school only), "flashcards" or "essay".</param>
/// <param name="Topics">0 to 8 topics, each 1 to 80 characters; when empty the unit's known topics are used.</param>
/// <param name="Mode">"timed" or "untimed". An exam paper is always timed and flashcards are always untimed.</param>
/// <param name="Difficulty">"foundation", "core" (default) or "stretch", relative to the unit's level.</param>
/// <param name="FocusOnWeakest">Let the server pick up to 3 of your weakest topics in the unit from earlier results.</param>
/// <param name="DurationMinutes">5 to 180; required for a timed test other than an exam paper, otherwise omitted.</param>
/// <param name="QuestionCount">5 to 40 (default 10) for a quiz, reading or flashcards; omitted for an exam paper or essay.</param>
/// <param name="PaperMarks">Exam paper only: 30 to 150 marks; the paper is timed at a minute per mark.</param>
internal sealed record GeneratePracticeTestRequest(
    Guid AssessmentId,
    string Format,
    IReadOnlyList<string>? Topics = null,
    string? Mode = null,
    string? Difficulty = null,
    bool FocusOnWeakest = false,
    int? DurationMinutes = null,
    int? QuestionCount = null,
    int? PaperMarks = null);

/// <param name="TestId">The test being generated.</param>
/// <param name="JobId">The generation job; getActiveGeneration recovers it on another device.</param>
/// <param name="Status">"queued", "running", "ready" or "failed" (a replay returns the current status).</param>
/// <param name="StatusUrl">Poll this for progress.</param>
internal sealed record GenerationAccepted(Guid TestId, Guid JobId, string Status, string StatusUrl);
