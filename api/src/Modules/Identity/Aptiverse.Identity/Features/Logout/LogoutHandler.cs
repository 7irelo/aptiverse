using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Identity.Features.Logout;

/// <summary>
/// Ends the caller's session and its refresh token family, then evicts the revocation cache so the access token
/// is refused at once on this instance (and within the cache window on others). Idempotent.
/// </summary>
internal sealed partial class LogoutHandler(IdentityDbContext db, SessionService sessions, ILogger<LogoutHandler> logger)
{
    public async Task HandleAsync(Guid userId, Guid? sessionId, RequestInfo origin, CancellationToken cancellationToken)
    {
        if (sessionId is null)
        {
            return;
        }

        var session = await db.Sessions.SingleOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId, cancellationToken);
        if (session is null || session.RevokedAt is not null)
        {
            return;
        }

        await sessions.RevokeAsync(session, RevocationReasons.Logout, cancellationToken);
        db.SecurityEvents.Add(SecurityEvent.Create(SecurityEventTypes.Logout, userId, null, origin));
        await db.SaveChangesAsync(cancellationToken);
        await sessions.EvictAsync([session.Id]);

        IdentityMetrics.LoggedOut();
        LogLoggedOut(logger, userId, session.Id);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} logged out of session {SessionId}")]
    private static partial void LogLoggedOut(ILogger logger, Guid userId, Guid sessionId);
}
