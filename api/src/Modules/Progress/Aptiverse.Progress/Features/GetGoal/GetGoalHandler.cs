using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Features.Common;
using Aptiverse.Progress.Persistence;
using Aptiverse.SharedKernel.Results;

namespace Aptiverse.Progress.Features.GetGoal;

internal sealed class GetGoalHandler(ProgressDbContext db)
{
    public async Task<Result<(GoalView View, string ETag)>> HandleAsync(Guid userId, Guid goalId, CancellationToken cancellationToken)
    {
        var goal = await db.OwnedGoalAsync(userId, goalId, cancellationToken);
        if (goal is null)
        {
            return ProgressErrors.GoalNotFound;
        }

        return (await db.ToViewAsync(goal, cancellationToken), ETags.Of(db, goal));
    }
}
