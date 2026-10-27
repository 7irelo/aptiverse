using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.Extensions.Logging;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Identity.Features.RevokeOtherSessions;

/// <param name="Revoked">How many other sessions were signed out.</param>
internal sealed record RevokeOtherSessionsResponse(int Revoked);

/// <summary>Signs out every device except the one making the request. Idempotent.</summary>
internal sealed partial class RevokeOtherSessionsHandler(
    IDbContextOutbox<IdentityDbContext> outbox,
    SessionService sessions,
    IClock clock,
    ILogger<RevokeOtherSessionsHandler> logger)
{
    public async Task<RevokeOtherSessionsResponse> HandleAsync(Guid userId, Guid? currentSessionId, RequestInfo origin, CancellationToken cancellationToken)
    {
        var revoked = await sessions.RevokeAllAsync(userId, RevocationReasons.SignedOutRemotely, currentSessionId, cancellationToken);
        if (revoked.Count == 0)
        {
            return new RevokeOtherSessionsResponse(0);
        }

        outbox.DbContext.SecurityEvents.Add(SecurityEvent.Create(
            SecurityEventTypes.SessionRevoked, userId, null, origin, $"{revoked.Count} other sessions signed out."));
        await outbox.PublishAsync(new SessionsRevoked(userId, revoked, RevocationReasons.SignedOutRemotely, clock.UtcNow));
        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        await sessions.EvictAsync(revoked);

        IdentityMetrics.SessionsRevoked(RevocationReasons.SignedOutRemotely, revoked.Count);
        LogRevoked(logger, userId, currentSessionId, revoked.Count);
        return new RevokeOtherSessionsResponse(revoked.Count);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} (session {SessionId}) signed out {RevokedCount} other sessions")]
    private static partial void LogRevoked(ILogger logger, Guid userId, Guid? sessionId, int revokedCount);
}
