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

namespace Aptiverse.Identity.Features.ChangeMyPassword;

/// <summary>
/// Changes the password with the current one as proof. A wrong current password counts toward the same lockout as
/// sign-in, so a stolen access token cannot be used to guess it. Every other session ends; this one stays.
/// </summary>
internal sealed partial class ChangeMyPasswordHandler(
    IDbContextOutbox<IdentityDbContext> outbox,
    UserManager<User> users,
    PasswordVerifier passwords,
    SessionService sessions,
    IOptions<IdentityOptions> identity,
    IClock clock,
    ILogger<ChangeMyPasswordHandler> logger)
{
    private IdentityDbContext Db => outbox.DbContext;

    public async Task<Result> HandleAsync(
        Guid userId,
        Guid? currentSessionId,
        ChangeMyPasswordRequest request,
        RequestInfo origin,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var user = await Db.Users.SingleOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user is null)
        {
            return IdentityErrors.UserNotFound;
        }

        var now = clock.UtcNow;
        if (user.IsLockedOut(now))
        {
            IdentityMetrics.PasswordChange("locked");
            return AuthRateLimiting.TooManyAttempts(user.LockoutEnd!.Value - now);
        }

        if (user.PasswordHash is not null)
        {
            if (string.IsNullOrEmpty(request.CurrentPassword) || !passwords.Verify(user, request.CurrentPassword))
            {
                return await WrongCurrentPasswordAsync(user, origin, now, cancellationToken);
            }
        }

        var hash = await PasswordPolicy.HashAsync(users, user, request.NewPassword, "newPassword");
        if (hash.IsFailure)
        {
            IdentityMetrics.PasswordChange("rejected");
            return hash.Error!;
        }

        user.ReplacePasswordHash(hash.Value);
        var revoked = await sessions.RevokeAllAsync(user.Id, RevocationReasons.PasswordChanged, currentSessionId, cancellationToken);
        Db.SecurityEvents.Add(SecurityEvent.Create(
            SecurityEventTypes.PasswordChanged, user.Id, null, origin, $"{revoked.Count} other sessions revoked."));
        await outbox.PublishAsync(new PasswordChanged(user.Id, user.Email, user.Name, ViaReset: false, now));
        if (revoked.Count > 0)
        {
            await outbox.PublishAsync(new SessionsRevoked(user.Id, revoked, RevocationReasons.PasswordChanged, now));
        }

        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        await sessions.EvictAsync(revoked);

        IdentityMetrics.PasswordChange("success");
        IdentityMetrics.SessionsRevoked(RevocationReasons.PasswordChanged, revoked.Count);
        LogChanged(logger, user.Id, currentSessionId, revoked.Count);
        return Result.Success();
    }

    private async Task<Result> WrongCurrentPasswordAsync(User user, RequestInfo origin, DateTimeOffset now, CancellationToken cancellationToken)
    {
        var lockout = identity.Value.Lockout;
        var lockedNow = user.RecordFailedSignIn(now, lockout.MaxFailedAccessAttempts, lockout.DefaultLockoutTimeSpan);
        Db.SecurityEvents.Add(SecurityEvent.Create(SecurityEventTypes.LoginFailed, user.Id, null, origin, "Wrong current password on change."));
        if (lockedNow)
        {
            Db.SecurityEvents.Add(SecurityEvent.Create(SecurityEventTypes.Lockout, user.Id, null, origin));
            await outbox.PublishAsync(new AccountLockedOut(user.Id, user.Email, user.Name, user.LockoutEnd!.Value, now));
            IdentityMetrics.LockedOut();
        }

        try
        {
            await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            // A parallel request moved the counter first.
        }

        IdentityMetrics.PasswordChange("invalid");
        return lockedNow ? AuthRateLimiting.TooManyAttempts(user.LockoutEnd!.Value - now) : IdentityErrors.InvalidCredentials;
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} (session {SessionId}) changed their password; {RevokedSessions} other sessions revoked")]
    private static partial void LogChanged(ILogger logger, Guid userId, Guid? sessionId, int revokedSessions);
}
