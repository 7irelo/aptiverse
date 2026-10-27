using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Features.Common;
using Aptiverse.Identity.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Identity.Features.RevokeMySession;

/// <summary>Signs one of the caller's devices out. Another user's session id is simply not found. Idempotent.</summary>
internal sealed partial class RevokeMySessionHandler(
    IDbContextOutbox<IdentityDbContext> outbox,
    SessionService sessions,
    IClock clock,
    ILogger<RevokeMySessionHandler> logger)
{
    public async Task<Result> HandleAsync(Guid userId, Guid? currentSessionId, Guid targetSessionId, RequestInfo origin, CancellationToken cancellationToken)
    {
        var db = outbox.DbContext;
        var session = await db.Sessions.SingleOrDefaultAsync(s => s.Id == targetSessionId && s.UserId == userId, cancellationToken);
        if (session is null)
        {
            return IdentityErrors.SessionNotFound;
        }

        if (session.RevokedAt is not null)
        {
            return Result.Success();
        }

        var reason = session.Id == currentSessionId ? RevocationReasons.Logout : RevocationReasons.SignedOutRemotely;
        await sessions.RevokeAsync(session, reason, cancellationToken);
        db.SecurityEvents.Add(SecurityEvent.Create(SecurityEventTypes.SessionRevoked, userId, null, origin, $"Session {session.Id} ({reason})."));
        await outbox.PublishAsync(new SessionsRevoked(userId, [session.Id], reason, clock.UtcNow));
        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        await sessions.EvictAsync([session.Id]);

        IdentityMetrics.SessionsRevoked(reason, 1);
        LogRevoked(logger, userId, currentSessionId, session.Id);
        return Result.Success();
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} (session {SessionId}) revoked session {TargetSessionId}")]
    private static partial void LogRevoked(ILogger logger, Guid userId, Guid? sessionId, Guid targetSessionId);
}
