using Aptiverse.Practice.Domain;
using Aptiverse.Practice.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Aptiverse.Practice.Features.ReportFocusLoss;

/// <summary>
/// Counts a focus loss with one atomic update. Losses within the coalescing window of the previous one count once,
/// so a burst of blur and visibility events is a single loss. A paused attempt does not count. Never punitive.
/// </summary>
internal sealed partial class ReportFocusLossHandler(
    PracticeDbContext db,
    IClock clock,
    IOptions<PracticeOptions> options,
    ILogger<ReportFocusLossHandler> logger)
{
    public async Task<Result<FocusLossResult>> HandleAsync(Guid userId, Guid attemptId, CancellationToken cancellationToken)
    {
        var now = clock.UtcNow;
        var cutoff = now.AddSeconds(-options.Value.FocusLossCoalesceSeconds);
        var counted = await db.Attempts
            .Where(a => a.Id == attemptId && a.UserId == userId && a.Status == AttemptStatuses.InProgress)
            .Where(a => a.LastFocusLossAt == null || a.LastFocusLossAt < cutoff)
            .ExecuteUpdateAsync(
                set => set
                    .SetProperty(a => a.FocusLossCount, a => a.FocusLossCount + 1)
                    .SetProperty(a => a.LastFocusLossAt, now),
                cancellationToken);

        var row = await db.Attempts.AsNoTracking()
            .Where(a => a.Id == attemptId && a.UserId == userId)
            .Select(a => new { a.Status, a.Mode, a.FocusLossCount })
            .SingleOrDefaultAsync(cancellationToken);
        if (row is null)
        {
            return PracticeErrors.AttemptNotFound;
        }

        if (!AttemptStatuses.IsActive(row.Status))
        {
            return PracticeErrors.AttemptNotActive;
        }

        if (counted > 0)
        {
            PracticeMetrics.FocusLost(row.Mode);
            LogFocusLoss(logger, userId, attemptId, row.FocusLossCount);
        }

        return new FocusLossResult(row.FocusLossCount);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} attempt {AttemptId} lost focus ({FocusLossCount} so far)")]
    private static partial void LogFocusLoss(ILogger logger, Guid userId, Guid attemptId, int focusLossCount);
}
