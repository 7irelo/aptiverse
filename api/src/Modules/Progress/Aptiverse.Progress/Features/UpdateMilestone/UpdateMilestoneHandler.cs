using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Features.Common;
using Aptiverse.SharedKernel.Results;

namespace Aptiverse.Progress.Features.UpdateMilestone;

internal sealed class UpdateMilestoneHandler(MilestoneWrites writes)
{
    public Task<Result<MilestoneWrite<MilestoneView>>> HandleAsync(
        Guid userId,
        Guid goalId,
        Guid milestoneId,
        UpdateMilestoneRequest request,
        string? ifMatch,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        return UserLocks.RunAsync<Result<MilestoneWrite<MilestoneView>>>(writes.Db, userId, async () =>
        {
            var loaded = await writes.LoadAsync(userId, goalId, cancellationToken);
            if (loaded.IsFailure)
            {
                return loaded.Error!;
            }

            var (goal, milestones) = loaded.Value;
            var milestone = milestones.SingleOrDefault(m => m.Id == milestoneId);
            if (milestone is null)
            {
                return ProgressErrors.MilestoneNotFound;
            }

            if (ETags.Check(writes.Db, goal, ifMatch) is { } precondition)
            {
                return precondition;
            }

            if (goal.Status is GoalStatuses.Abandoned or GoalStatuses.Expired)
            {
                return ProgressErrors.Locked;
            }

            if (request.Title is not null)
            {
                milestone.Rename(request.Title);
            }

            if (request.ThresholdValue is { } threshold && threshold != milestone.ThresholdValue)
            {
                if (milestone.ReachedAt is not null || goal.IsLocked)
                {
                    return ProgressErrors.MilestoneReached;
                }

                milestone.SetThreshold(threshold);
                if (!MilestoneWrites.AreValid(goal, milestones))
                {
                    return ProgressErrors.InvalidMilestones;
                }
            }

            var saved = await writes.SaveAsync(goal, cancellationToken);
            return saved.IsFailure ? saved.Error! : new MilestoneWrite<MilestoneView>(milestone.ToView(), saved.Value);
        }, cancellationToken);
    }
}
