using System.Globalization;
using Aptiverse.Progress.Contracts;
using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Progress.Goals;

/// <summary>The event behind a re-evaluation; becomes the goal evidence row.</summary>
/// <param name="SourceType">One of <see cref="EvidenceSources"/>.</param>
/// <param name="SourceId">Stable per event, so a redelivery maps to the same row.</param>
/// <param name="OccurredAt">When the student produced the evidence.</param>
/// <param name="Summary">For example "Practice test, 78%".</param>
/// <param name="Link">App-relative path to the attempt or assessment.</param>
internal sealed record EvidenceSource(string SourceType, Guid SourceId, DateTimeOffset OccurredAt, string Summary, string? Link);

/// <summary>
/// Re-measures a student's open goals in a unit and records what changed. Values are recomputed from the evidence
/// rows each time (never incremented), so a redelivered event or a concurrent one cannot inflate a goal; the evidence
/// key (goal, source type, source id) is unique. Events are collected for the caller to publish through its outbox.
/// </summary>
internal sealed class GoalProgress(ProgressDbContext db, GoalMeasurer measurer, IClock clock)
{
    public async Task EvaluateUnitAsync(Guid userId, Guid studyUnitId, EvidenceSource source, List<object> events, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(source);
        ArgumentNullException.ThrowIfNull(events);
        var goals = await db.Goals
            .Where(g => g.UserId == userId && g.StudyUnitId == studyUnitId && GoalStatuses.Open.Contains(g.Status))
            .ToListAsync(cancellationToken);
        foreach (var goal in goals)
        {
            await EvaluateAsync(goal, source, events, cancellationToken);
        }
    }

    /// <summary>Evaluates one tracked goal; <paramref name="source"/> is null for a change the student made (new target).</summary>
    public async Task EvaluateAsync(Goal goal, EvidenceSource? source, List<object> events, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(goal);
        ArgumentNullException.ThrowIfNull(events);
        if (!goal.IsOpen)
        {
            return;
        }

        var now = clock.UtcNow;
        // Tracked milestones include ones added or removed in this unit of work but not saved yet.
        await db.Milestones.Where(m => m.GoalId == goal.Id).LoadAsync(cancellationToken);
        var milestones = db.Milestones.Local
            .Where(m => m.GoalId == goal.Id && db.Entry(m).State != EntityState.Deleted)
            .ToList();
        var measurement = await measurer.MeasureAsync(goal, cancellationToken);
        var change = goal.Recalculate(measurement, milestones, source?.OccurredAt ?? now, now);

        if (change.ValueChanged && source is not null)
        {
            var sourceType = goal.CriteriaType == CriteriaTypes.MasteryThreshold && source.SourceType != EvidenceSources.Regrade
                ? EvidenceSources.MasteryUpdate
                : source.SourceType;
            var exists = db.GoalEvidence.Local.Any(e => e.GoalId == goal.Id && e.SourceType == sourceType && e.SourceId == source.SourceId)
                || await db.GoalEvidence.IgnoreQueryFilters()
                    .AnyAsync(e => e.GoalId == goal.Id && e.SourceType == sourceType && e.SourceId == source.SourceId, cancellationToken);
            if (!exists)
            {
                db.GoalEvidence.Add(GoalEvidence.Create(goal.Id, sourceType, source.SourceId, goal.CurrentValue, Summary(goal, source), source.Link, source.OccurredAt));
            }
        }

        foreach (var milestone in change.Reached)
        {
            events.Add(new GoalMilestoneReached(goal.Id, goal.UserId, milestone.Position, milestone.Title, milestone.ReachedAt ?? now));
            Journey(JourneyKinds.MilestoneReached, goal, $"Milestone reached: {milestone.Title}", milestone.Id, milestone.ReachedAt ?? now);
        }

        if (change.Achieved)
        {
            var evidenceIds = await db.GoalEvidence.AsNoTracking().Where(e => e.GoalId == goal.Id).Select(e => e.Id).ToListAsync(cancellationToken);
            evidenceIds.AddRange(db.GoalEvidence.Local.Where(e => e.GoalId == goal.Id).Select(e => e.Id));
            events.Add(new GoalAchieved(goal.Id, goal.UserId, goal.Title, goal.AchievedAt ?? now, evidenceIds.Distinct().ToList()));
            Journey(JourneyKinds.GoalAchieved, goal, $"Goal achieved: {goal.Title}", goal.Id, goal.AchievedAt ?? now);
            ProgressMetrics.GoalAchieved(goal.CriteriaType);
        }
    }

    public void Journey(string kind, Goal goal, string title, Guid sourceId, DateTimeOffset occurredAt)
    {
        ArgumentNullException.ThrowIfNull(goal);
        db.JourneyEvents.Add(JourneyEvent.Create(goal.UserId, kind, title, $"/progress/goals/{goal.Id}", "goal", sourceId, occurredAt));
    }

    private static string Summary(Goal goal, EvidenceSource source) =>
        goal.CriteriaType == CriteriaTypes.MasteryThreshold && source.SourceType != EvidenceSources.Regrade
            ? goal.CurrentValue is { } value
                ? string.Create(CultureInfo.InvariantCulture, $"{source.Summary}; mastery now {value:0.##}%")
                : $"{source.Summary}; no mastery evidence"
            : source.Summary;
}
