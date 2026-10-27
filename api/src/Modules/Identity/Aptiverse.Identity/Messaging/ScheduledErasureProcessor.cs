using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Identity.Messaging;

/// <summary>
/// Runs when a deletion request's cooling-off period ends. A cancelled (or already processed) request is a no-op,
/// so a cancellation always wins even if this message still fires. Otherwise the request is approved, every session
/// ends, and <see cref="AccountDeletionRequested"/> goes out through the outbox so every module erases its rows.
/// </summary>
internal sealed partial class ScheduledErasureProcessor(
    IDbContextOutbox<IdentityDbContext> outbox,
    SessionService sessions,
    IClock clock,
    ILogger<ScheduledErasureProcessor> logger)
{
    public async Task ProcessAsync(Guid requestId, CancellationToken cancellationToken)
    {
        var db = outbox.DbContext;
        var request = await db.AccountDeletionRequests.SingleOrDefaultAsync(r => r.Id == requestId, cancellationToken);
        if (request is null || request.Status != AccountDeletionRequest.Pending)
        {
            LogSkipped(logger, requestId);
            return;
        }

        var user = await db.Users.SingleOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
        if (user is null)
        {
            LogSkipped(logger, requestId);
            return;
        }

        var now = clock.UtcNow;
        request.Approve(now);
        var revoked = await sessions.RevokeAllAsync(user.Id, RevocationReasons.AccountDeleted, null, cancellationToken);
        await outbox.PublishAsync(new AccountDeletionRequested(user.Id, user.Email, user.Name, now));
        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        await sessions.EvictAsync(revoked);

        LogApproved(logger, requestId, user.Id, revoked.Count);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Deletion request {RequestId} is no longer pending; nothing to erase")]
    private static partial void LogSkipped(ILogger logger, Guid requestId);

    [LoggerMessage(
        Level = LogLevel.Warning,
        Message = "Deletion request {RequestId} for user {UserId} reached the end of its cooling-off period; erasure started and {Sessions} sessions ended")]
    private static partial void LogApproved(ILogger logger, Guid requestId, Guid userId, int sessions);
}
