using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Features.Common;
using Aptiverse.Identity.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Npgsql;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Identity.Features.GoogleSignIn;

/// <summary>
/// Google sign-in for existing accounts only (decision 24): Google never creates an account, because sign-up must
/// record a role, consent versions and onboarding facts a bare Google token cannot carry. A linked Google subject
/// signs in; otherwise an account with the same address is linked when Google has verified it, and linking signs
/// out every other session in case someone else had been using the password.
/// </summary>
internal sealed partial class GoogleSignInHandler(
    IDbContextOutbox<IdentityDbContext> outbox,
    IGoogleTokenValidator google,
    EmailAddresses emails,
    SessionService sessions,
    AuthTokensFactory tokens,
    IClock clock,
    ILogger<GoogleSignInHandler> logger)
{
    private IdentityDbContext Db => outbox.DbContext;

    public async Task<Result<AuthTokens>> HandleAsync(GoogleSignInRequest request, RequestInfo origin, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var validated = await google.ValidateAsync(request.IdToken, cancellationToken);
        if (validated.IsFailure)
        {
            IdentityMetrics.Login(validated.Error!.Type == ErrorType.Unavailable ? "unavailable" : "invalid", AuthMethods.Google);
            return validated.Error!;
        }

        var identity = validated.Value;
        var userId = await Db.UserLogins
            .Where(l => l.Provider == UserLogin.Google && l.ProviderKey == identity.Subject)
            .Select(l => (Guid?)l.UserId)
            .SingleOrDefaultAsync(cancellationToken);

        User? user;
        var linked = false;
        IReadOnlyList<Guid> revoked = [];
        if (userId is not null)
        {
            user = await Db.Users.SingleOrDefaultAsync(u => u.Id == userId, cancellationToken);
        }
        else
        {
            var normalized = emails.Normalize(identity.Email);
            user = await Db.Users.SingleOrDefaultAsync(u => u.NormalizedEmail == normalized, cancellationToken);
            if (user is not null && !identity.EmailVerified)
            {
                IdentityMetrics.Login("unverified", AuthMethods.Google);
                return IdentityErrors.GoogleEmailUnverified;
            }

            if (user is not null)
            {
                Db.UserLogins.Add(UserLogin.Create(user.Id, UserLogin.Google, identity.Subject));
                user.ConfirmEmail();
                revoked = await sessions.RevokeAllAsync(user.Id, RevocationReasons.AccountLinked, null, cancellationToken);
                Db.SecurityEvents.Add(SecurityEvent.Create(
                    SecurityEventTypes.GoogleLinked, user.Id, null, origin, $"{revoked.Count} sessions revoked."));
                if (revoked.Count > 0)
                {
                    await outbox.PublishAsync(new SessionsRevoked(user.Id, revoked, RevocationReasons.AccountLinked, clock.UtcNow));
                }

                linked = true;
            }
        }

        if (user is null)
        {
            IdentityMetrics.Login("not_found", AuthMethods.Google);
            return IdentityErrors.AccountNotFound;
        }

        var started = sessions.Start(user, AuthMethods.Google, origin);
        Db.SecurityEvents.Add(SecurityEvent.Create(SecurityEventTypes.LoginSucceeded, user.Id, null, origin, "Google."));

        try
        {
            await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            // Two first sign-ins raced to link the same Google subject; the other one won, so this one asks for a retry.
            return GoogleTokenErrors.Invalid;
        }

        await sessions.EvictAsync(revoked);
        IdentityMetrics.Login("success", AuthMethods.Google);
        LogSignedIn(logger, user.Id, started.Session.Id, linked);
        return tokens.Create(user, started.Session, started.Refresh);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} signed in with Google, session {SessionId}, linked {Linked}")]
    private static partial void LogSignedIn(ILogger logger, Guid userId, Guid sessionId, bool linked);
}
