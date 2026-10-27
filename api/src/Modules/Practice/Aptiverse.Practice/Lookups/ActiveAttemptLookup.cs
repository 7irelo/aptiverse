using Aptiverse.Practice.Contracts;
using Aptiverse.Practice.Domain;
using Aptiverse.Practice.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Aptiverse.Practice.Lookups;

/// <summary>
/// One indexed read on the one-active-attempt-per-user index; paused counts as active. A timed attempt past its
/// deadline plus grace is no longer active (it can take no more answers and the deadline message owns it), and an
/// untimed attempt idle for longer than the configured window stops blocking the tutor.
/// </summary>
internal sealed class ActiveAttemptLookup(PracticeDbContext db, IClock clock, IOptions<PracticeOptions> options) : IActiveAttemptLookup
{
    public async Task<ActiveAttempt?> GetActiveAttemptAsync(Guid userId, CancellationToken cancellationToken)
    {
        var attempt = await db.Attempts.AsNoTracking()
            .Where(a => a.UserId == userId && AttemptStatuses.Active.Contains(a.Status))
            .OrderByDescending(a => a.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
        if (attempt is null)
        {
            return null;
        }

        var now = clock.UtcNow;
        if (attempt.IsPastGrace(now, options.Value.NetworkGrace))
        {
            return null;
        }

        if (!attempt.IsTimed && now - attempt.LastActivityAt > TimeSpan.FromHours(options.Value.UntimedIdleHours))
        {
            return null;
        }

        return new ActiveAttempt(attempt.Id, attempt.TestId, attempt.DeadlineAt, attempt.Status == AttemptStatuses.Paused);
    }
}
