using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Features.Common;
using Aptiverse.SharedKernel.Results;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Progress.Features.AddMilestone;

internal sealed partial class AddMilestoneHandler(MilestoneWrites writes, ILogger<AddMilestoneHandler> logger)
{
    public Task<Result<MilestoneWrite<MilestoneView>>> HandleAsync(Guid userId, Guid goalId, AddMilestoneRequest request, CancellationToken cancellationToken)
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
            if (!goal.IsOpen)
            {
                return ProgressErrors.Locked;
            }

            if (milestones.Count >= Goal.MaxMilestones)
            {
                return ProgressErrors.MilestoneLimit;
            }

            var position = Math.Clamp(request.Position ?? milestones.Count + 1, 1, milestones.Count + 1);
            var milestone = Milestone.Create(goal.Id, position, request.Title!, request.ThresholdValue);
            milestones.Insert(position - 1, milestone);
            if (!MilestoneWrites.AreValid(goal, milestones))
            {
                return ProgressErrors.InvalidMilestones;
            }

            for (var i = 0; i < milestones.Count; i++)
            {
                milestones[i].MoveTo(i + 1);
            }

            writes.Db.Milestones.Add(milestone);
            var saved = await writes.SaveAsync(goal, cancellationToken);
            if (saved.IsFailure)
            {
                return saved.Error!;
            }

            LogAdded(logger, userId, goal.Id, milestone.Id);
            return new MilestoneWrite<MilestoneView>(milestone.ToView(), saved.Value);
        }, cancellationToken);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} added milestone {MilestoneId} to goal {GoalId}")]
    private static partial void LogAdded(ILogger logger, Guid userId, Guid goalId, Guid milestoneId);
}
