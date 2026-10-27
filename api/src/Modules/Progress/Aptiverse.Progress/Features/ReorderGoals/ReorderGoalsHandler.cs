using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Features.Common;
using Aptiverse.Progress.Persistence;
using Aptiverse.SharedKernel.Results;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Progress.Features.ReorderGoals;

internal sealed class ReorderGoalsHandler(ProgressDbContext db)
{
    public Task<Result> HandleAsync(Guid userId, ReorderGoalsRequest request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        return UserLocks.RunAsync<Result>(db, userId, async () =>
        {
            var goals = await db.Goals.Where(g => g.UserId == userId && GoalStatuses.Open.Contains(g.Status)).ToListAsync(cancellationToken);
            var ids = request.GoalIds!;

            // Another user's id is simply not in the caller's set, so it fails the same way as a missing one.
            if (!MilestoneRules.IsExactSet(ids.ToList(), goals.Select(g => g.Id).ToList()))
            {
                return ProgressErrors.ReorderMismatch;
            }

            for (var i = 0; i < ids.Count; i++)
            {
                goals.Single(g => g.Id == ids[i]).SetSortOrder(i + 1);
            }

            try
            {
                await db.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateConcurrencyException)
            {
                return ProgressErrors.VersionMismatch;
            }

            return Result.Success();
        }, cancellationToken);
    }
}
