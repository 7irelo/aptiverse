using Aptiverse.Progress.Contracts;
using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Features.Common;
using Aptiverse.Progress.Persistence;
using Aptiverse.SharedKernel.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Progress.Features.AbandonGoal;

internal sealed partial class AbandonGoalHandler(IDbContextOutbox<ProgressDbContext> outbox, IClock clock, ILogger<AbandonGoalHandler> logger)
{
    private ProgressDbContext Db => outbox.DbContext;

    public Task<Result> HandleAsync(Guid userId, Guid goalId, string? ifMatch, CancellationToken cancellationToken) =>
        UserLocks.RunAsync<Result>(Db, userId, async () =>
        {
            var goal = await Db.OwnedGoalAsync(userId, goalId, cancellationToken);
            if (goal is null)
            {
                var removedByOwner = await Db.Goals.IgnoreQueryFilters([ModuleDbContext.SoftDeleteFilter])
                    .AnyAsync(g => g.Id == goalId && g.UserId == userId && g.DeletedAt != null, cancellationToken);
                return removedByOwner ? Result.Success() : ProgressErrors.GoalNotFound;
            }

            if (ETags.Check(Db, goal, ifMatch) is { } precondition)
            {
                return precondition;
            }

            var abandoned = goal.IsOpen;
            if (abandoned)
            {
                goal.Abandon();
                await outbox.PublishAsync(new GoalAbandoned(goal.Id, userId, clock.UtcNow));
            }
            else
            {
                Db.Goals.Remove(goal);
            }

            try
            {
                await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
            }
            catch (DbUpdateConcurrencyException)
            {
                return ProgressErrors.VersionMismatch;
            }

            if (abandoned)
            {
                ProgressMetrics.GoalAbandoned();
            }

            LogRemoved(logger, userId, goal.Id, abandoned);
            return Result.Success();
        }, cancellationToken);

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} removed goal {GoalId} (abandoned: {Abandoned})")]
    private static partial void LogRemoved(ILogger logger, Guid userId, Guid goalId, bool abandoned);
}
