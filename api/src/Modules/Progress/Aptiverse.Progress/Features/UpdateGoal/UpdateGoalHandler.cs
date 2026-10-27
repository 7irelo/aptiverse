using Aptiverse.Progress.Contracts;
using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Features.Common;
using Aptiverse.Progress.Goals;
using Aptiverse.Progress.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wolverine;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Progress.Features.UpdateGoal;

internal sealed partial class UpdateGoalHandler(
    IDbContextOutbox<ProgressDbContext> outbox,
    GoalMeasurer measurer,
    GoalProgress progress,
    IClock clock,
    ILogger<UpdateGoalHandler> logger)
{
    public static readonly Error WholeNumberTarget = Error.Validation(
        "goal.invalid_target",
        "Count goals take a whole number target.",
        new Dictionary<string, string[]> { ["targetValue"] = ["Count goals take a whole number from 1 to 100."] });

    private ProgressDbContext Db => outbox.DbContext;

    public Task<Result<(GoalView View, string ETag)>> HandleAsync(
        Guid userId,
        Guid goalId,
        UpdateGoalRequest request,
        string? ifMatch,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        return UserLocks.RunAsync<Result<(GoalView View, string ETag)>>(Db, userId, async () =>
        {
            var goal = await Db.OwnedGoalAsync(userId, goalId, cancellationToken);
            if (goal is null)
            {
                return ProgressErrors.GoalNotFound;
            }

            if (ETags.Check(Db, goal, ifMatch) is { } precondition)
            {
                return precondition;
            }

            var changesCriteria = request.TargetValue is not null || request.DueAt is not null;
            if (goal.Status is GoalStatuses.Abandoned or GoalStatuses.Expired || (goal.IsLocked && changesCriteria))
            {
                return ProgressErrors.Locked;
            }

            var changed = new List<string>();
            if (request.Title is not null)
            {
                goal.Rename(request.Title);
                changed.Add("title");
            }

            if (request.Description is not null)
            {
                goal.Describe(request.Description);
                changed.Add("description");
            }

            if (request.SortOrder is { } sortOrder)
            {
                goal.SetSortOrder(sortOrder);
                changed.Add("sortOrder");
            }

            var now = clock.UtcNow;
            if (request.TargetValue is { } target)
            {
                if (goal.IsCount && decimal.Truncate(target) != target)
                {
                    return WholeNumberTarget;
                }

                var baseline = await measurer.BaselineAsync(
                    new GoalCriteria(userId, goal.StudyUnitId, goal.CriteriaType, goal.TopicKey, goal.Topic, goal.AssessmentId),
                    cancellationToken);
                if (!GoalEvaluator.IsAboveBaseline(target, baseline.Value))
                {
                    ProgressMetrics.BaselineRefused();
                    return ProgressErrors.TargetNotAboveBaseline(baseline.Value!.Value);
                }

                var thresholds = await Db.Milestones.Where(m => m.GoalId == goal.Id).OrderBy(m => m.Position).Select(m => m.ThresholdValue).ToListAsync(cancellationToken);
                if (!MilestoneRules.AreValid(thresholds, target))
                {
                    return ProgressErrors.InvalidMilestones;
                }

                goal.Retarget(target, baseline.Value, now);
                changed.Add("targetValue");
            }

            if (request.DueAt is { } dueAt)
            {
                goal.Reschedule(dueAt);
                await outbox.ScheduleAsync(new ExpireProgressGoal(goal.Id, goal.DueAt), goal.DueAt);
                changed.Add("dueAt");
            }

            var events = new List<object>();
            if (changesCriteria)
            {
                await progress.EvaluateAsync(goal, null, events, cancellationToken);
            }

            foreach (var message in events)
            {
                await outbox.PublishAsync(message);
            }

            // Always a write, so the version moves and a replayed request with the old ETag gets 412.
            Db.Entry(goal).State = EntityState.Modified;
            try
            {
                await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
            }
            catch (DbUpdateConcurrencyException)
            {
                return ProgressErrors.VersionMismatch;
            }

            LogUpdated(logger, userId, goal.Id, string.Join(",", changed), goal.IsLocked);
            return Result.Success((await Db.ToViewAsync(goal, cancellationToken), ETags.Of(Db, goal)));
        }, cancellationToken);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} changed goal {GoalId}: {ChangedFields} (locked: {Locked})")]
    private static partial void LogUpdated(ILogger logger, Guid userId, Guid goalId, string changedFields, bool locked);
}
