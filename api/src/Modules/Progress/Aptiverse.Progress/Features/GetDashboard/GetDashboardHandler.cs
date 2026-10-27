using Aptiverse.Academics.Contracts;
using Aptiverse.Practice.Contracts;
using Aptiverse.Progress.Contracts;
using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Features.ListGoals;
using Aptiverse.Progress.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Progress.Features.GetDashboard;

internal sealed class GetDashboardHandler(
    ProgressDbContext db,
    IActiveAttemptLookup attempts,
    IAssessmentLookup assessments,
    IMasterySnapshot mastery,
    IClock clock)
{
    public const int BlockSize = 3;

    public async Task<DashboardView> HandleAsync(Guid userId, CancellationToken cancellationToken)
    {
        var now = clock.UtcNow;
        var active = await attempts.GetActiveAttemptAsync(userId, cancellationToken);
        var upcoming = (await assessments.GetOpenForUserAsync(userId, cancellationToken))
            .Where(a => a.DueAt >= now)
            .Take(BlockSize)
            .Select(a => new DashboardAssessment(a.AssessmentId, a.Title, a.StudyUnitId, a.UnitName, a.DueAt))
            .ToList();

        var goals = await db.Goals.AsNoTracking()
            .Where(g => g.UserId == userId && GoalStatuses.Open.Contains(g.Status))
            .OrderBy(g => g.SortOrder)
            .ThenBy(g => g.Id)
            .Take(BlockSize)
            .ToListAsync(cancellationToken);

        var weakest = (await mastery.GetWeakestTopicsAsync(userId, BlockSize, cancellationToken))
            .Select(t => new DashboardTopic(t.StudyUnitId, t.Topic, t.Score, t.Band, t.EarlyRead, t.EvidenceQuestions))
            .ToList();

        var masteryRows = await db.TopicMastery.AsNoTracking()
            .Where(m => m.UserId == userId && m.Model == MasteryModels.RecencyWeightedV1 && m.Score != null)
            .Select(m => new { m.Score, m.EvidenceQuestions })
            .ToListAsync(cancellationToken);
        var (masteryScore, _) = MasteryMath.Combine(masteryRows.Select(r => (r.Score, r.EvidenceQuestions)));

        var today = Sast.Day(now);
        var from = Sast.StartOf(today.AddDays(-6));
        var practice = await db.PracticeResults.AsNoTracking()
            .Where(r => r.UserId == userId && r.SubmittedAt >= from)
            .Select(r => new { r.SubmittedAt, r.ScorePercent, r.PartiallyGraded, r.SecondsOnTask })
            .ToListAsync(cancellationToken);
        var full = practice.Where(p => !p.PartiallyGraded).Select(p => p.ScorePercent).ToList();
        var recent = new RecentPracticeView(
            practice.Count,
            full.Count == 0 ? null : Math.Round(full.Average(), 2, MidpointRounding.AwayFromZero),
            full.Count == 0 ? null : full.Max(),
            practice.Sum(p => p.SecondsOnTask) / 60);
        var days = Enumerable.Range(0, 7)
            .Select(i => today.AddDays(i - 6))
            .Select(day =>
            {
                var onDay = practice.Where(p => Sast.Day(p.SubmittedAt) == day).ToList();
                return new ActivityDay(day, onDay.Sum(p => p.SecondsOnTask) / 60, onDay.Count);
            })
            .ToList();

        return new DashboardView(
            active is null ? null : new DashboardAttempt(active.AttemptId, active.TestId, active.DeadlineAt, active.Paused),
            upcoming,
            goals.Select(ListGoalsHandler.ToSummary).ToList(),
            weakest,
            masteryScore,
            recent,
            days);
    }
}
