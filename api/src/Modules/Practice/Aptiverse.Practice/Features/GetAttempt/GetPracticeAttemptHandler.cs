using Aptiverse.Practice.Domain;
using Aptiverse.Practice.Features.Common;
using Aptiverse.Practice.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Practice.Features.GetAttempt;

/// <summary>Resumes the runner after a reload; remaining time is computed on the server.</summary>
internal sealed class GetPracticeAttemptHandler(PracticeDbContext db, AttemptViews views, IClock clock)
{
    public async Task<Result<AttemptState>> HandleAsync(Guid userId, Guid attemptId, CancellationToken cancellationToken)
    {
        var attempt = await db.Attempts.AsNoTracking().SingleOrDefaultAsync(a => a.Id == attemptId && a.UserId == userId, cancellationToken);
        return attempt is null
            ? PracticeErrors.AttemptNotFound
            : await views.BuildAsync(attempt, clock.UtcNow, cancellationToken);
    }
}
