using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Features.Common;
using Aptiverse.SharedKernel.Results;

namespace Aptiverse.Progress.Features.DeleteMilestone;

internal sealed class DeleteMilestoneHandler(MilestoneWrites writes)
{
    public Task<Result> HandleAsync(Guid userId, Guid goalId, Guid milestoneId, CancellationToken cancellationToken) =>
        UserLocks.RunAsync<Result>(writes.Db, userId, async () =>
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
                return Result.Success();
            }

            if (goal.Status is GoalStatuses.Abandoned or GoalStatuses.Expired)
            {
                return ProgressErrors.Locked;
            }

            milestones.Remove(milestone);
            writes.Db.Milestones.Remove(milestone);
            for (var i = 0; i < milestones.Count; i++)
            {
                milestones[i].MoveTo(i + 1);
            }

            var saved = await writes.SaveAsync(goal, cancellationToken);
            return saved.IsFailure ? saved.Error! : Result.Success();
        }, cancellationToken);
}
