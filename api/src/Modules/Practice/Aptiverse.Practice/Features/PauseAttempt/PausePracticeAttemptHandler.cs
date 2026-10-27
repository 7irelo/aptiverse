using Aptiverse.Practice.Domain;
using Aptiverse.Practice.Features.Common;
using Aptiverse.Practice.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Practice.Features.PauseAttempt;

/// <summary>Pauses an untimed attempt. Timed attempts never pause (decision 17), which keeps their deadline fixed.</summary>
internal sealed partial class PausePracticeAttemptHandler(
    PracticeDbContext db,
    AttemptViews views,
    IClock clock,
    ILogger<PausePracticeAttemptHandler> logger)
{
    public async Task<Result<AttemptState>> HandleAsync(Guid userId, Guid attemptId, CancellationToken cancellationToken)
    {
        var attempt = await db.AttemptAsync(userId, attemptId, cancellationToken);
        if (attempt is null)
        {
            return PracticeErrors.AttemptNotFound;
        }

        var now = clock.UtcNow;
        var from = attempt.Status;
        var paused = attempt.Pause(now);
        if (paused.IsFailure)
        {
            return paused.Error!;
        }

        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            return PracticeErrors.ConcurrencyConflict;
        }

        if (from != attempt.Status)
        {
            LogPaused(logger, userId, attempt.Id, attempt.PauseCount);
        }

        return await views.BuildAsync(attempt, now, cancellationToken);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} paused attempt {AttemptId} (pause {PauseCount})")]
    private static partial void LogPaused(ILogger logger, Guid userId, Guid attemptId, int pauseCount);
}
