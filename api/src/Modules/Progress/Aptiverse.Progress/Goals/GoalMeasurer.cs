using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Progress.Goals;

/// <param name="Value">The baseline, null when no evidence existed.</param>
/// <param name="Source">Where it came from, for the goal form.</param>
/// <param name="EarlyRead">A mastery baseline backed by fewer than 5 questions.</param>
internal sealed record Baseline(decimal? Value, string Source, bool EarlyRead);

/// <summary>The criteria a goal measures, without the goal itself (the baseline lookup has no goal yet).</summary>
internal sealed record GoalCriteria(Guid UserId, Guid StudyUnitId, string CriteriaType, string TopicKey, string? Topic, Guid? AssessmentId);

/// <summary>
/// Measures goals and baselines from Progress's own evidence rows only (never another module's tables). Count goals
/// count work submitted after the goal was created (decision 20); thresholds take the best value since creation,
/// except mastery, which is the student's current mastery.
/// </summary>
internal sealed class GoalMeasurer(ProgressDbContext db, IClock clock)
{
    public const int ScoreBaselineDays = 60;

    public async Task<GoalMeasurement> MeasureAsync(Goal goal, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(goal);
        var since = goal.CreatedAt;
        switch (goal.CriteriaType)
        {
            case CriteriaTypes.PracticeTestsCompleted:
                return new(await Practice(goal.UserId, goal.StudyUnitId).CountAsync(r => r.SubmittedAt >= since, cancellationToken), null);

            case CriteriaTypes.PracticeScoreBest:
                return new(
                    await Practice(goal.UserId, goal.StudyUnitId)
                        .Where(r => !r.PartiallyGraded && r.SubmittedAt >= since)
                        .MaxAsync(r => (decimal?)r.ScorePercent, cancellationToken),
                    null);

            case CriteriaTypes.AssessmentsSubmitted:
                return new(
                    await Assessments(goal.UserId, goal.StudyUnitId).CountAsync(r => r.SubmittedAt != null && r.SubmittedAt >= since, cancellationToken),
                    null);

            case CriteriaTypes.AssessmentMarkThreshold:
                return new(
                    await Assessments(goal.UserId, goal.StudyUnitId)
                        .Where(r => r.MarkPercent != null && r.MarkRecordedAt >= since)
                        .Where(r => goal.AssessmentId == null || r.AssessmentId == goal.AssessmentId)
                        .MaxAsync(r => r.MarkPercent, cancellationToken),
                    null);

            case CriteriaTypes.MasteryThreshold:
                var (score, questions) = await MasteryAsync(goal.UserId, goal.StudyUnitId, goal.Topic is null ? null : goal.TopicKey, cancellationToken);
                return new(MasteryMath.ToPercent(score), questions);

            default:
                throw new InvalidOperationException($"Unknown criteria type '{goal.CriteriaType}'.");
        }
    }

    /// <summary>The baseline rule's reference value (decision 21).</summary>
    public async Task<Baseline> BaselineAsync(GoalCriteria criteria, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(criteria);
        switch (criteria.CriteriaType)
        {
            case CriteriaTypes.PracticeTestsCompleted:
            case CriteriaTypes.AssessmentsSubmitted:
                return new(0m, "counts from today", false);

            case CriteriaTypes.PracticeScoreBest:
                var from = clock.UtcNow.AddDays(-ScoreBaselineDays);
                var best = await Practice(criteria.UserId, criteria.StudyUnitId)
                    .Where(r => !r.PartiallyGraded && r.SubmittedAt >= from)
                    .MaxAsync(r => (decimal?)r.ScorePercent, cancellationToken);
                return new(best, best is null ? "no practice tests in the last 60 days" : "best practice score in the last 60 days", false);

            case CriteriaTypes.AssessmentMarkThreshold:
                var latest = await Assessments(criteria.UserId, criteria.StudyUnitId)
                    .Where(r => r.MarkPercent != null)
                    .OrderByDescending(r => r.MarkRecordedAt)
                    .Select(r => r.MarkPercent)
                    .FirstOrDefaultAsync(cancellationToken);
                return new(latest, latest is null ? "no marks yet" : "latest mark", false);

            case CriteriaTypes.MasteryThreshold:
                var (score, questions) = await MasteryAsync(
                    criteria.UserId,
                    criteria.StudyUnitId,
                    criteria.Topic is null ? null : criteria.TopicKey,
                    cancellationToken);
                if (score is null)
                {
                    return new(null, "no mastery evidence yet", false);
                }

                var early = questions < MasteryMath.EarlyReadBelowQuestions;
                var scope = criteria.Topic is null ? "this subject" : criteria.Topic;
                return new(MasteryMath.ToPercent(score), early ? $"mastery in {scope}, early read" : $"mastery in {scope}", early);

            default:
                throw new InvalidOperationException($"Unknown criteria type '{criteria.CriteriaType}'.");
        }
    }

    /// <summary>A topic's score, or the unit's evidence-weighted mean over every row when topicKey is null.</summary>
    public async Task<(decimal? Score, int Questions)> MasteryAsync(Guid userId, Guid studyUnitId, string? topicKey, CancellationToken cancellationToken)
    {
        var rows = await db.TopicMastery.AsNoTracking()
            .Where(m => m.UserId == userId && m.StudyUnitId == studyUnitId && m.Model == MasteryModels.RecencyWeightedV1)
            .Where(m => topicKey == null || m.TopicKey == topicKey)
            .Select(m => new { m.Score, m.EvidenceQuestions })
            .ToListAsync(cancellationToken);
        return MasteryMath.Combine(rows.Select(r => (r.Score, r.EvidenceQuestions)));
    }

    private IQueryable<PracticeResult> Practice(Guid userId, Guid studyUnitId) =>
        db.PracticeResults.AsNoTracking().Where(r => r.UserId == userId && r.StudyUnitId == studyUnitId);

    private IQueryable<AssessmentRecord> Assessments(Guid userId, Guid studyUnitId) =>
        db.AssessmentRecords.AsNoTracking().Where(r => r.UserId == userId && r.StudyUnitId == studyUnitId && r.WithdrawnAt == null);
}
