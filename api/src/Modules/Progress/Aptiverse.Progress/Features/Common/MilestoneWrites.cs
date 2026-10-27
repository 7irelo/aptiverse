using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Goals;
using Aptiverse.Progress.Persistence;
using Aptiverse.SharedKernel.Results;
using Microsoft.EntityFrameworkCore;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Progress.Features.Common;

/// <summary>A milestone change saved; the goal's new ETag goes in the response header.</summary>
internal sealed record MilestoneWrite<T>(T Value, string ETag);

/// <summary>
/// Shared steps of the milestone slices: load the caller's open goal and its milestones, then save with the goal
/// touched so its version (the ETag) moves with every milestone change and concurrent edits conflict.
/// </summary>
internal sealed class MilestoneWrites(IDbContextOutbox<ProgressDbContext> outbox, GoalProgress progress)
{
    public ProgressDbContext Db => outbox.DbContext;

    public async Task<Result<(Goal Goal, List<Milestone> Milestones)>> LoadAsync(Guid userId, Guid goalId, CancellationToken cancellationToken)
    {
        var goal = await Db.OwnedGoalAsync(userId, goalId, cancellationToken);
        if (goal is null)
        {
            return ProgressErrors.GoalNotFound;
        }

        var milestones = await Db.Milestones.Where(m => m.GoalId == goal.Id).OrderBy(m => m.Position).ToListAsync(cancellationToken);
        return (goal, milestones);
    }

    /// <summary>Thresholds valid in position order; count goals take whole numbers.</summary>
    public static bool AreValid(Goal goal, IEnumerable<Milestone> inOrder)
    {
        ArgumentNullException.ThrowIfNull(goal);
        var thresholds = inOrder.Select(m => m.ThresholdValue).ToList();
        return MilestoneRules.AreValid(thresholds, goal.TargetValue)
            && (!goal.IsCount || thresholds.All(t => decimal.Truncate(t) == t));
    }

    /// <summary>Re-evaluates (a milestone already passed is marked reached), touches the goal and saves.</summary>
    public async Task<Result<string>> SaveAsync(Goal goal, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(goal);
        var events = new List<object>();
        await progress.EvaluateAsync(goal, null, events, cancellationToken);
        foreach (var message in events)
        {
            await outbox.PublishAsync(message);
        }

        Db.Entry(goal).State = EntityState.Modified;
        try
        {
            await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            return ProgressErrors.VersionMismatch;
        }

        return ETags.Of(Db, goal);
    }
}
