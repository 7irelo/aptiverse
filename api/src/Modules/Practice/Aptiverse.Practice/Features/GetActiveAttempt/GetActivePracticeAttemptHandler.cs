using Aptiverse.Practice.Domain;
using Aptiverse.Practice.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Practice.Features.GetActiveAttempt;

/// <param name="AttemptId">The attempt in progress or paused.</param>
/// <param name="TestId">Its test.</param>
/// <param name="TestTitle">The test's title, for the banner.</param>
/// <param name="Mode">"timed" or "untimed".</param>
/// <param name="DeadlineAt">Server deadline of a timed attempt.</param>
/// <param name="RemainingSeconds">Seconds left on a timed attempt, null for untimed.</param>
/// <param name="Paused">True while an untimed attempt is paused.</param>
/// <param name="ServerNow">The server clock.</param>
internal sealed record ActiveAttemptView(
    Guid AttemptId,
    Guid TestId,
    string TestTitle,
    string Mode,
    DateTimeOffset? DeadlineAt,
    int? RemainingSeconds,
    bool Paused,
    DateTimeOffset ServerNow);

/// <summary>The same indexed read as the tutor block, for the shell banner and dashboard.</summary>
internal sealed class GetActivePracticeAttemptHandler(PracticeDbContext db, IClock clock)
{
    public async Task<ActiveAttemptView?> HandleAsync(Guid userId, CancellationToken cancellationToken)
    {
        var row = await (from a in db.Attempts.AsNoTracking()
                         join t in db.Tests.IgnoreQueryFilters().AsNoTracking() on a.TestId equals t.Id
                         where a.UserId == userId && t.UserId == userId && AttemptStatuses.Active.Contains(a.Status)
                         select new { Attempt = a, t.Title })
            .FirstOrDefaultAsync(cancellationToken);
        if (row is null)
        {
            return null;
        }

        var now = clock.UtcNow;
        var attempt = row.Attempt;
        return new ActiveAttemptView(
            attempt.Id,
            attempt.TestId,
            row.Title,
            attempt.Mode,
            attempt.DeadlineAt,
            attempt.RemainingSeconds(now),
            attempt.Status == AttemptStatuses.Paused,
            now);
    }
}
