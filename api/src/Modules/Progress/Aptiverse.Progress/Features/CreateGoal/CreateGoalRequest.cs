namespace Aptiverse.Progress.Features.CreateGoal;

/// <param name="Title">3 to 120 characters.</param>
/// <param name="Description">Optional, up to 500 characters.</param>
/// <param name="CriteriaType">"practice_tests_completed", "practice_score_best", "mastery_threshold", "assessments_submitted" or "assessment_mark_threshold".</param>
/// <param name="StudyUnitId">One of your active subjects or courses.</param>
/// <param name="Topic">Mastery goals only, up to 120 characters; omit for the whole unit.</param>
/// <param name="AssessmentId">Optional upcoming assessment in the unit, due on or before the goal.</param>
/// <param name="TargetValue">Count goals: whole number 1 to 100. Score, mark and mastery goals: percent 1 to 100.</param>
/// <param name="DueAt">At least 1 day and at most a year ahead.</param>
/// <param name="Milestones">0 to 5, thresholds strictly increasing and below the target.</param>
internal sealed record CreateGoalRequest(
    string? Title,
    string? Description,
    string? CriteriaType,
    Guid StudyUnitId,
    string? Topic,
    Guid? AssessmentId,
    decimal TargetValue,
    DateTimeOffset DueAt,
    IReadOnlyList<MilestoneInput>? Milestones);

/// <param name="Title">3 to 120 characters.</param>
/// <param name="ThresholdValue">Above the previous milestone and below the target.</param>
internal sealed record MilestoneInput(string? Title, decimal ThresholdValue);
