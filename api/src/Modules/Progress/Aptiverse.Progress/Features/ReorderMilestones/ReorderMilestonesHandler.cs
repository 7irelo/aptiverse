using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Features.Common;
using Aptiverse.SharedKernel.Results;

namespace Aptiverse.Progress.Features.ReorderMilestones;

internal sealed class ReorderMilestonesHandler(MilestoneWrites writes)
{
    public Task<Result<MilestoneWrite<IReadOnlyList<MilestoneView>>>> HandleAsync(
        Guid userId,
        Guid goalId,
        ReorderMilestonesRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        return UserLocks.RunAsync<Result<MilestoneWrite<IReadOnlyList<MilestoneView>>>>(writes.Db, userId, async () =>
        {
            var loaded = await writes.LoadAsync(userId, goalId, cancellationToken);
            if (loaded.IsFailure)
            {
                return loaded.Error!;
            }

            var (goal, milestones) = loaded.Value;
            var ids = request.MilestoneIds!;
            if (!MilestoneRules.IsExactSet(ids.ToList(), milestones.Select(m => m.Id).ToList()))
            {
                return ProgressErrors.ReorderMismatch;
            }

            var ordered = ids.Select(id => milestones.Single(m => m.Id == id)).ToList();
            if (!MilestoneWrites.AreValid(goal, ordered))
            {
                return ProgressErrors.InvalidMilestones;
            }

            for (var i = 0; i < ordered.Count; i++)
            {
                ordered[i].MoveTo(i + 1);
            }

            var saved = await writes.SaveAsync(goal, cancellationToken);
            return saved.IsFailure
                ? saved.Error!
                : new MilestoneWrite<IReadOnlyList<MilestoneView>>(ordered.Select(m => m.ToView()).ToList(), saved.Value);
        }, cancellationToken);
    }
}
