using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Features.Common;
using Aptiverse.Identity.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Identity.Features.CancelAccountDeletion;

/// <summary>
/// Cancels a pending deletion request inside the cooling-off period. The scheduled erasure message still fires but
/// finds the request cancelled and does nothing. Once erasure has started it can no longer be cancelled.
/// </summary>
internal sealed partial class CancelAccountDeletionHandler(IdentityDbContext db, IClock clock, ILogger<CancelAccountDeletionHandler> logger)
{
    public async Task<Result> HandleAsync(Guid userId, RequestInfo origin, CancellationToken cancellationToken)
    {
        var latest = await db.AccountDeletionRequests
            .Where(r => r.UserId == userId && r.Status != AccountDeletionRequest.Cancelled)
            .OrderByDescending(r => r.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
        if (latest is null)
        {
            return Result.Success();
        }

        if (latest.Status != AccountDeletionRequest.Pending)
        {
            return IdentityErrors.ErasureInProgress;
        }

        var user = await db.Users.SingleOrDefaultAsync(u => u.Id == userId, cancellationToken);
        latest.Cancel(clock.UtcNow);
        user?.ClearDeletionRequest();
        db.SecurityEvents.Add(SecurityEvent.Create(SecurityEventTypes.AccountDeletionCancelled, userId, null, origin, $"Request {latest.Id}."));

        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            // The erasure processor approved the request at the same moment.
            return IdentityErrors.ErasureInProgress;
        }

        IdentityMetrics.DeletionCancelled();
        LogCancelled(logger, userId, latest.Id);
        return Result.Success();
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} cancelled account deletion {RequestId}")]
    private static partial void LogCancelled(ILogger logger, Guid userId, Guid requestId);
}
