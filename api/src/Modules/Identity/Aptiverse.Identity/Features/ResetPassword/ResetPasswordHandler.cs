using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Identity.Features.ResetPassword;

/// <summary>
/// Sets a new password from a reset link. Every session of the account ends (whoever forced the reset may hold one),
/// the security stamp rotates, lockout clears, and the email counts as verified because the link proved the inbox.
/// </summary>
internal sealed partial class ResetPasswordHandler(
    IDbContextOutbox<IdentityDbContext> outbox,
    UserManager<User> users,
    OneTimeTokens oneTimeTokens,
    SessionService sessions,
    EmailRateLimiter throttle,
    IClock clock,
    ILogger<ResetPasswordHandler> logger)
{
    private IdentityDbContext Db => outbox.DbContext;

    public async Task<Result> HandleAsync(ResetPasswordRequest request, RequestInfo origin, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var redeemed = await oneTimeTokens.RedeemAsync(request.Token, TokenPurposes.PasswordReset, cancellationToken);
        if (redeemed.IsFailure)
        {
            IdentityMetrics.PasswordReset("invalid_token");
            return redeemed.Error!;
        }

        var user = await Db.Users.SingleOrDefaultAsync(u => u.Id == redeemed.Value, cancellationToken);
        if (user is null)
        {
            IdentityMetrics.PasswordReset("invalid_token");
            return OneTimeTokens.InvalidToken;
        }

        // Nothing is saved on a rejected password, so the link stays usable for a second try.
        var hash = await PasswordPolicy.HashAsync(users, user, request.NewPassword, "newPassword");
        if (hash.IsFailure)
        {
            IdentityMetrics.PasswordReset("rejected");
            return hash.Error!;
        }

        var now = clock.UtcNow;
        user.ReplacePasswordHash(hash.Value);
        user.ConfirmEmail();
        var revoked = await sessions.RevokeAllAsync(user.Id, RevocationReasons.PasswordReset, null, cancellationToken);
        Db.SecurityEvents.Add(SecurityEvent.Create(
            SecurityEventTypes.PasswordReset, user.Id, null, origin, $"{revoked.Count} sessions revoked."));
        await outbox.PublishAsync(new PasswordChanged(user.Id, user.Email, user.Name, ViaReset: true, now));
        if (revoked.Count > 0)
        {
            await outbox.PublishAsync(new SessionsRevoked(user.Id, revoked, RevocationReasons.PasswordReset, now));
        }

        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        await sessions.EvictAsync(revoked);
        throttle.ClearLogin(user.NormalizedEmail);

        IdentityMetrics.PasswordReset("success");
        IdentityMetrics.SessionsRevoked(RevocationReasons.PasswordReset, revoked.Count);
        LogReset(logger, user.Id, revoked.Count);
        return Result.Success();
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} reset their password; {RevokedSessions} sessions revoked")]
    private static partial void LogReset(ILogger logger, Guid userId, int revokedSessions);
}
