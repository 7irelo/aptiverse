namespace Aptiverse.Progress.Features.GetGoalBaseline;

/// <param name="CriteriaType">One of the five goal types.</param>
/// <param name="StudyUnitId">One of your subjects or courses.</param>
/// <param name="Topic">Mastery goals only; omit for the whole unit.</param>
/// <param name="AssessmentId">Optional linked assessment.</param>
internal sealed record GetGoalBaselineRequest(string? CriteriaType, Guid StudyUnitId, string? Topic, Guid? AssessmentId);

/// <param name="BaselineValue">Null when there is no evidence yet.</param>
/// <param name="BaselineSource">For example "mastery in Algebra, early read", "latest mark" or "counts from today".</param>
/// <param name="MinimumTarget">The smallest target accepted: the baseline plus one (rounded down first), or 1.</param>
/// <param name="EarlyRead">A mastery baseline backed by fewer than 5 questions.</param>
internal sealed record GoalPreview(decimal? BaselineValue, string BaselineSource, decimal MinimumTarget, bool EarlyRead);
