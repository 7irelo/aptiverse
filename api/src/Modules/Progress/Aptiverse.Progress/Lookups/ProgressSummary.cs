using Aptiverse.Progress.Contracts;
using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Progress.Lookups;

/// <summary>Reads the practice result and goal rows Progress already projects. Every query filters by the user id first.</summary>
internal sealed class ProgressSummary(ProgressDbContext db) : IProgressSummary
{
    public const int MaxTake = 20;

    public async Task<PracticeSummary> GetPracticeAsync(Guid userId, DateTimeOffset since, int take, CancellationToken cancellationToken)
    {
        var window = db.PracticeResults.AsNoTracking().Where(r => r.UserId == userId && r.GradedAt >= since);
        var completed = await window.CountAsync(cancellationToken);
        var average = await window.Where(r => !r.PartiallyGraded).AverageAsync(r => (decimal?)r.ScorePercent, cancellationToken);
        var recent = await window
            .OrderByDescending(r => r.GradedAt)
            .Take(Math.Clamp(take, 1, MaxTake))
            .Select(r => new PracticeResultSummary(r.AttemptId, r.StudyUnitId, r.ScorePercent, r.PartiallyGraded, r.GradedAt))
            .ToListAsync(cancellationToken);

        return new PracticeSummary(completed, average is { } mean ? Math.Round(mean, 1, MidpointRounding.AwayFromZero) : null, recent);
    }

    public async Task<IReadOnlyList<ActiveGoalSummary>> GetActiveGoalsAsync(Guid userId, int take, CancellationToken cancellationToken) =>
        await db.Goals.AsNoTracking()
            .Where(g => g.UserId == userId && GoalStatuses.Open.Contains(g.Status))
            .OrderBy(g => g.SortOrder)
            .ThenBy(g => g.DueAt)
            .Take(Math.Clamp(take, 1, MaxTake))
            .Select(g => new ActiveGoalSummary(g.Id, g.StudyUnitId, g.Title, g.CriteriaType, g.Status, g.TargetValue, g.CurrentValue, g.DueAt))
            .ToListAsync(cancellationToken);
}
