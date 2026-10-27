using Aptiverse.Progress.Contracts;
using Aptiverse.Progress.Features.Common;
using Aptiverse.Progress.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Progress.Goals;

/// <summary>
/// Runs at a goal's due date (a scheduled message, BE-PRG-23). A message for a due date that has since moved is
/// stale and ignored; the reschedule sent a new one.
/// </summary>
internal sealed class GoalExpirer(IDbContextOutbox<ProgressDbContext> outbox, IClock clock)
{
    private ProgressDbContext Db => outbox.DbContext;

    public async Task ExpireAsync(ExpireProgressGoal message, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        var userId = await Db.Goals.Where(g => g.Id == message.GoalId).Select(g => (Guid?)g.UserId).SingleOrDefaultAsync(cancellationToken);
        if (userId is null)
        {
            return;
        }

        await UserLocks.RunAsync(Db, userId.Value, async () =>
        {
            var goal = await Db.Goals.SingleOrDefaultAsync(g => g.Id == message.GoalId, cancellationToken);
            var now = clock.UtcNow;
            if (goal is null || goal.DueAt != Domain.Goal.ToStoredPrecision(message.DueAt) || !goal.Expire(now))
            {
                return;
            }

            await outbox.PublishAsync(new GoalExpired(goal.Id, goal.UserId, now));
            await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        }, cancellationToken);
    }
}
