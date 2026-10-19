using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Aptiverse.Identity.Authentication;

internal sealed record IssuedRefreshToken(string Token, DateTimeOffset ExpiresAt);

internal sealed record StartedSession(Session Session, IssuedRefreshToken Refresh);

internal sealed record RotatedSession(User User, Session Session, IssuedRefreshToken Refresh);

/// <summary>
/// Sessions and their refresh token families: start, rotate with reuse detection, and revoke.
/// A refresh token expires after the sliding window unless rotated, and never outlives the session's
/// absolute expiry.
/// </summary>
internal sealed class SessionService(
    IdentityDbContext db,
    IClock clock,
    IOptions<AuthOptions> options,
    SessionRevocationCache revocations,
    ILogger<SessionService> logger)
{
    public static readonly Error InvalidRefreshToken =
        Error.Unauthorized("identity.refresh_token_invalid", "Your session has ended. Please sign in again.");

    /// <summary>Adds a new session and its first refresh token to the context. The caller saves.</summary>
    public StartedSession Start(User user, string authMethod, RequestInfo request)
    {
        ArgumentNullException.ThrowIfNull(user);

        var now = clock.UtcNow;
        var session = Session.Start(user.Id, authMethod, request, now, TimeSpan.FromDays(options.Value.RefreshTokenAbsoluteDays));
        db.Sessions.Add(session);
        return new StartedSession(session, AddRefreshToken(user.Id, session, now));
    }

    public async Task<Result<RotatedSession>> RotateAsync(string presentedToken, RequestInfo request, CancellationToken cancellationToken)
    {
        var hash = SecureTokens.Hash(presentedToken);
        var token = await db.RefreshTokens.SingleOrDefaultAsync(t => t.TokenHash == hash, cancellationToken);
        if (token is null)
        {
            return InvalidRefreshToken;
        }

        var session = await db.Sessions.SingleAsync(s => s.Id == token.SessionId, cancellationToken);
        var now = clock.UtcNow;

        if (token.ConsumedAt is not null)
        {
            await RevokeFamilyForReuseAsync(session.Id, request, cancellationToken);
            return InvalidRefreshToken;
        }

        if (token.RevokedAt is not null || !session.IsActive(now) || token.ExpiresAt <= now)
        {
            return InvalidRefreshToken;
        }

        var user = await db.Users.SingleOrDefaultAsync(u => u.Id == token.UserId, cancellationToken);
        if (user is null)
        {
            await RevokeAsync(session, RevocationReasons.SignedOutRemotely, cancellationToken);
            await db.SaveChangesAsync(cancellationToken);
            await revocations.EvictAsync([session.Id]);
            return InvalidRefreshToken;
        }

        token.Consume(now);
        session.Touch(now, request);
        var refresh = AddRefreshToken(user.Id, session, now);

        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            // Another request rotated the same token first: the token was presented twice, which is reuse.
            db.ChangeTracker.Clear();
            await RevokeFamilyForReuseAsync(session.Id, request, cancellationToken);
            return InvalidRefreshToken;
        }

        return new RotatedSession(user, session, refresh);
    }

    /// <summary>Marks the session and every live refresh token in its family revoked. The caller saves, then evicts.</summary>
    public async Task RevokeAsync(Session session, string reason, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(session);

        var now = clock.UtcNow;
        session.Revoke(now, reason);

        var tokens = await db.RefreshTokens
            .Where(t => t.SessionId == session.Id && t.RevokedAt == null)
            .ToListAsync(cancellationToken);
        foreach (var token in tokens)
        {
            token.Revoke(now);
        }
    }

    /// <summary>Revokes every active session of the user except <paramref name="keepSessionId"/>. The caller saves, then evicts.</summary>
    public async Task<IReadOnlyList<Guid>> RevokeAllAsync(Guid userId, string reason, Guid? keepSessionId, CancellationToken cancellationToken)
    {
        var sessions = await db.Sessions
            .Where(s => s.UserId == userId && s.RevokedAt == null && s.Id != keepSessionId)
            .ToListAsync(cancellationToken);

        foreach (var session in sessions)
        {
            await RevokeAsync(session, reason, cancellationToken);
        }

        return sessions.Select(s => s.Id).ToList();
    }

    public Task EvictAsync(IEnumerable<Guid> sessionIds) => revocations.EvictAsync(sessionIds);

    private async Task RevokeFamilyForReuseAsync(Guid sessionId, RequestInfo request, CancellationToken cancellationToken)
    {
        var session = await db.Sessions.SingleAsync(s => s.Id == sessionId, cancellationToken);
        await RevokeAsync(session, RevocationReasons.RefreshReuse, cancellationToken);
        db.SecurityEvents.Add(SecurityEvent.Create(
            SecurityEventTypes.RefreshReuseDetected, session.UserId, null, request, $"Session {session.Id} revoked."));
        await db.SaveChangesAsync(cancellationToken);
        await revocations.EvictAsync([session.Id]);

        logger.LogWarning("Refresh token reuse detected for session {SessionId}; the session was revoked", session.Id);
    }

    private IssuedRefreshToken AddRefreshToken(Guid userId, Session session, DateTimeOffset now)
    {
        var sliding = now.AddDays(options.Value.RefreshTokenSlidingDays);
        var expiresAt = sliding < session.ExpiresAt ? sliding : session.ExpiresAt;
        var token = SecureTokens.Create();

        db.RefreshTokens.Add(RefreshToken.Create(userId, session.Id, SecureTokens.Hash(token), expiresAt));
        return new IssuedRefreshToken(token, expiresAt);
    }
}
