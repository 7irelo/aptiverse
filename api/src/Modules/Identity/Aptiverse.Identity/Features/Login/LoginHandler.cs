using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Features.Common;
using Aptiverse.Identity.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Identity.Features.Login;

/// <summary>
/// Password sign-in with lockout. An unknown email, a Google-only account and a locked account all run one hash
/// verification, so timing does not tell them apart, and every "too many" answer is the one 429 shared with the rate
/// limiters. Unknown emails count failures in <see cref="EmailRateLimiter"/> with the lockout's threshold and duration,
/// so they block at the same attempt a real account locks.
/// </summary>
internal sealed partial class LoginHandler(
    IDbContextOutbox<IdentityDbContext> outbox,
    EmailAddresses emails,
    PasswordVerifier passwords,
    EmailRateLimiter throttle,
    SessionService sessions,
    AuthTokensFactory tokens,
    IOptions<IdentityOptions> identity,
    IClock clock,
    ILogger<LoginHandler> logger)
{
    private IdentityDbContext Db => outbox.DbContext;

    public async Task<Result<AuthTokens>> HandleAsync(LoginRequest request, RequestInfo origin, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var normalized = emails.Normalize(request.Email);

        if (throttle.LoginBlockedFor(normalized) is { } blocked)
        {
            IdentityMetrics.Login("rate_limited", AuthMethods.Password);
            return AuthRateLimiting.TooManyAttempts(blocked);
        }

        var user = await Db.Users.SingleOrDefaultAsync(u => u.NormalizedEmail == normalized, cancellationToken);
        var now = clock.UtcNow;

        if (user is null)
        {
            passwords.BurnTime(request.Password);
            var unknownBlock = throttle.RecordLoginFailure(normalized);
            Db.SecurityEvents.Add(SecurityEvent.Create(SecurityEventTypes.LoginFailed, null, normalized, origin, "Unknown email."));
            await Db.SaveChangesAsync(cancellationToken);
            return Fail(unknownBlock is { } wait ? AuthRateLimiting.TooManyAttempts(wait) : IdentityErrors.InvalidCredentials);
        }

        if (user.IsLockedOut(now))
        {
            passwords.BurnTime(request.Password);
            Db.SecurityEvents.Add(SecurityEvent.Create(SecurityEventTypes.LoginFailed, user.Id, normalized, origin, "Account locked."));
            await Db.SaveChangesAsync(cancellationToken);
            IdentityMetrics.Login("locked", AuthMethods.Password);
            return AuthRateLimiting.TooManyAttempts(user.LockoutEnd!.Value - now);
        }

        if (!passwords.Verify(user, request.Password))
        {
            return await FailedPasswordAsync(user, normalized, origin, now, cancellationToken);
        }

        user.RecordSuccessfulSignIn();
        throttle.ClearLogin(normalized);
        var started = sessions.Start(user, AuthMethods.Password, origin);
        Db.SecurityEvents.Add(SecurityEvent.Create(SecurityEventTypes.LoginSucceeded, user.Id, null, origin));
        await Db.SaveChangesAsync(cancellationToken);

        IdentityMetrics.Login("success", AuthMethods.Password);
        LogSignedIn(logger, user.Id, started.Session.Id);
        return tokens.Create(user, started.Session, started.Refresh);
    }

    private async Task<Result<AuthTokens>> FailedPasswordAsync(
        User user,
        string normalized,
        RequestInfo origin,
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        var lockout = identity.Value.Lockout;
        var lockedNow = user.RecordFailedSignIn(now, lockout.MaxFailedAccessAttempts, lockout.DefaultLockoutTimeSpan);
        var emailBlock = throttle.RecordLoginFailure(normalized);
        Db.SecurityEvents.Add(SecurityEvent.Create(SecurityEventTypes.LoginFailed, user.Id, normalized, origin, "Wrong password."));

        if (lockedNow)
        {
            Db.SecurityEvents.Add(SecurityEvent.Create(
                SecurityEventTypes.Lockout, user.Id, null, origin, $"Locked for {lockout.DefaultLockoutTimeSpan.TotalMinutes:0} minutes."));
            await outbox.PublishAsync(new AccountLockedOut(user.Id, user.Email, user.Name, user.LockoutEnd!.Value, now));
            IdentityMetrics.LockedOut();
        }

        try
        {
            await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            // A parallel attempt updated the counter first; the per-email limiter still counted this one.
        }

        if (lockedNow || emailBlock is not null)
        {
            var wait = lockedNow ? user.LockoutEnd!.Value - now : emailBlock!.Value;
            return Fail(AuthRateLimiting.TooManyAttempts(wait));
        }

        return Fail(IdentityErrors.InvalidCredentials);
    }

    private static Result<AuthTokens> Fail(Error error)
    {
        IdentityMetrics.Login(error.Type == ErrorType.TooManyRequests ? "locked" : "invalid", AuthMethods.Password);
        return error;
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} signed in with a password, session {SessionId}")]
    private static partial void LogSignedIn(ILogger logger, Guid userId, Guid sessionId);
}
