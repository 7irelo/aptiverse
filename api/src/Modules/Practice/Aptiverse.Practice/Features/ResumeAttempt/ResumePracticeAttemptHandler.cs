using Aptiverse.Practice.Domain;
using Aptiverse.Practice.Features.Common;
using Aptiverse.Practice.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Practice.Features.ResumeAttempt;

/// <summary>Resumes a paused attempt, adding the pause to the paused total so it never counts as time on task.</summary>
internal sealed partial class ResumePracticeAttemptHandler(
    PracticeDbContext db,
    AttemptViews views,
    IClock clock,
    ILogger<ResumePracticeAttemptHandler> logger)
{
    public async Task<Result<AttemptState>> HandleAsync(Guid userId, Guid attemptId, CancellationToken cancellationToken)
    {
        var attempt = await db.AttemptAsync(userId, attemptId, cancellationToken);
        if (attempt is null)
        {
            return PracticeErrors.AttemptNotFound;
        }

        var now = clock.UtcNow;
        var pausedBefore = attempt.PausedSecondsTotal;
        var resumed = attempt.Resume(now);
        if (resumed.IsFailure)
        {
            return resumed.Error!;
        }

        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            return PracticeErrors.ConcurrencyConflict;
        }

        LogResumed(logger, userId, attempt.Id, attempt.PausedSecondsTotal - pausedBefore);
        return await views.BuildAsync(attempt, now, cancellationToken);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} resumed attempt {AttemptId} after {PausedSeconds} s")]
    private static partial void LogResumed(ILogger logger, Guid userId, Guid attemptId, int pausedSeconds);
}
