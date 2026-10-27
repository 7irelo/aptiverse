using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Progress.Features.Common;

/// <summary>A goal in a list. Progress is null until there is evidence, never zero by default.</summary>
/// <param name="Id">The goal.</param>
/// <param name="Title">3 to 120 characters.</param>
/// <param name="CriteriaType">"practice_tests_completed", "practice_score_best", "mastery_threshold", "assessments_submitted" or "assessment_mark_threshold".</param>
/// <param name="StudyUnitId">The subject or course.</param>
/// <param name="Topic">Mastery goals only; null means the whole unit.</param>
/// <param name="AssessmentId">The linked upcoming assessment, if any.</param>
/// <param name="TargetValue">A count (1 to 100) or a percent (1 to 100).</param>
/// <param name="BaselineValue">Where the student was at creation; null when there was no evidence.</param>
/// <param name="CurrentValue">Measured from real work since creation; null until evidence exists (count goals start at 0).</param>
/// <param name="ProgressPercent">Current value over target, 0 to 100; null when the current value is null.</param>
/// <param name="Status">"active", "at_risk", "achieved", "expired" or "abandoned".</param>
/// <param name="DueAt">When it is due.</param>
/// <param name="Locked">Achieved goals are locked: only title, description and order can change.</param>
/// <param name="SortOrder">Display order among your goals.</param>
internal sealed record GoalSummary(
    Guid Id,
    string Title,
    string CriteriaType,
    Guid StudyUnitId,
    string? Topic,
    Guid? AssessmentId,
    decimal TargetValue,
    decimal? BaselineValue,
    decimal? CurrentValue,
    decimal? ProgressPercent,
    string Status,
    DateTimeOffset DueAt,
    bool Locked,
    int SortOrder);

/// <summary>One goal in full with its milestones and the evidence behind every change.</summary>
/// <param name="Id">The goal.</param>
/// <param name="Title">3 to 120 characters.</param>
/// <param name="Description">Up to 500 characters.</param>
/// <param name="CriteriaType">One of the five verifiable goal types.</param>
/// <param name="StudyUnitId">The subject or course.</param>
/// <param name="Topic">Mastery goals only; null means the whole unit.</param>
/// <param name="AssessmentId">The linked upcoming assessment, if any.</param>
/// <param name="TargetValue">A count or a percent.</param>
/// <param name="BaselineValue">Where the student was at creation; null when there was no evidence.</param>
/// <param name="BaselineCapturedAt">When the baseline was measured.</param>
/// <param name="CurrentValue">Measured from real work; null until evidence exists.</param>
/// <param name="ProgressPercent">Null when the current value is null.</param>
/// <param name="Status">"active", "at_risk", "achieved", "expired" or "abandoned".</param>
/// <param name="DueAt">When it is due.</param>
/// <param name="AchievedAt">When the evidence that achieved it was produced.</param>
/// <param name="Locked">True once achieved.</param>
/// <param name="SortOrder">Display order.</param>
/// <param name="CreatedAt">Created; count goals count work from here.</param>
/// <param name="Milestones">Up to 5, by position.</param>
/// <param name="Evidence">Every change in value, newest first (at most 100).</param>
internal sealed record GoalView(
    Guid Id,
    string Title,
    string? Description,
    string CriteriaType,
    Guid StudyUnitId,
    string? Topic,
    Guid? AssessmentId,
    decimal TargetValue,
    decimal? BaselineValue,
    DateTimeOffset BaselineCapturedAt,
    decimal? CurrentValue,
    decimal? ProgressPercent,
    string Status,
    DateTimeOffset DueAt,
    DateTimeOffset? AchievedAt,
    bool Locked,
    int SortOrder,
    DateTimeOffset CreatedAt,
    IReadOnlyList<MilestoneView> Milestones,
    IReadOnlyList<EvidenceView> Evidence);

/// <param name="Id">The milestone.</param>
/// <param name="Position">1 to 5.</param>
/// <param name="Title">3 to 120 characters.</param>
/// <param name="ThresholdValue">Below the goal target, increasing by position.</param>
/// <param name="ReachedAt">When evidence first reached it.</param>
internal sealed record MilestoneView(Guid Id, int Position, string Title, decimal ThresholdValue, DateTimeOffset? ReachedAt);

/// <param name="SourceType">"practice_attempt", "assessment_submitted", "assessment_graded", "mastery_update" or "regrade".</param>
/// <param name="Summary">For example "Practice test, 78%".</param>
/// <param name="ValueAfter">The goal's value after this evidence.</param>
/// <param name="OccurredAt">When the work was done, not when it was processed.</param>
/// <param name="Link">App-relative link to the attempt or assessment.</param>
internal sealed record EvidenceView(string SourceType, string Summary, decimal? ValueAfter, DateTimeOffset OccurredAt, string? Link);

internal static class GoalViews
{
    public const int MaxEvidence = 100;

    public static MilestoneView ToView(this Milestone milestone)
    {
        ArgumentNullException.ThrowIfNull(milestone);
        return new(milestone.Id, milestone.Position, milestone.Title, milestone.ThresholdValue, milestone.ReachedAt);
    }

    /// <summary>The caller's goal, tracked for a write. Null for a missing, deleted or someone else's goal.</summary>
    public static Task<Goal?> OwnedGoalAsync(this ProgressDbContext db, Guid userId, Guid goalId, CancellationToken cancellationToken) =>
        db.Goals.SingleOrDefaultAsync(g => g.Id == goalId && g.UserId == userId, cancellationToken);

    public static async Task<GoalView> ToViewAsync(this ProgressDbContext db, Goal goal, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(db);
        ArgumentNullException.ThrowIfNull(goal);
        var milestones = await db.Milestones.AsNoTracking()
            .Where(m => m.GoalId == goal.Id)
            .OrderBy(m => m.Position)
            .ToListAsync(cancellationToken);
        var evidence = await db.GoalEvidence.AsNoTracking()
            .Where(e => e.GoalId == goal.Id)
            .OrderByDescending(e => e.OccurredAt)
            .ThenByDescending(e => e.Id)
            .Take(MaxEvidence)
            .Select(e => new EvidenceView(e.SourceType, e.Summary, e.ValueAfter, e.OccurredAt, e.Link))
            .ToListAsync(cancellationToken);

        return new GoalView(
            goal.Id,
            goal.Title,
            goal.Description,
            goal.CriteriaType,
            goal.StudyUnitId,
            goal.Topic,
            goal.AssessmentId,
            goal.TargetValue,
            goal.BaselineValue,
            goal.BaselineCapturedAt,
            goal.CurrentValue,
            GoalEvaluator.ProgressPercent(goal.CurrentValue, goal.TargetValue),
            goal.Status,
            goal.DueAt,
            goal.AchievedAt,
            goal.IsLocked,
            goal.SortOrder,
            goal.CreatedAt,
            milestones.Select(m => m.ToView()).ToList(),
            evidence);
    }
}

/// <summary>Milestone ordering rules shared by create, add, edit and reorder.</summary>
internal static class MilestoneRules
{
    /// <summary>Thresholds in position order must be positive, strictly increasing and below the target.</summary>
    public static bool AreValid(IReadOnlyList<decimal> thresholdsInOrder, decimal target)
    {
        ArgumentNullException.ThrowIfNull(thresholdsInOrder);
        if (thresholdsInOrder.Count > Goal.MaxMilestones)
        {
            return false;
        }

        for (var i = 0; i < thresholdsInOrder.Count; i++)
        {
            if (thresholdsInOrder[i] <= 0 || thresholdsInOrder[i] >= target || (i > 0 && thresholdsInOrder[i] <= thresholdsInOrder[i - 1]))
            {
                return false;
            }
        }

        return true;
    }

    /// <summary>True when <paramref name="ids"/> holds exactly the expected ids, each once.</summary>
    public static bool IsExactSet(IReadOnlyCollection<Guid> ids, IReadOnlyCollection<Guid> expected)
    {
        ArgumentNullException.ThrowIfNull(ids);
        ArgumentNullException.ThrowIfNull(expected);
        return ids.Count == expected.Count && ids.Distinct().Count() == ids.Count && ids.All(expected.Contains);
    }
}
