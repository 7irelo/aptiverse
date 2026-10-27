using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Identity.Messaging;

/// <summary>Issues a 60 minute reset token and queues the email. Google-only accounts get one too, so they can set a password.</summary>
internal sealed partial class PasswordResetIssuer(
    IDbContextOutbox<IdentityDbContext> outbox,
    OneTimeTokens oneTimeTokens,
    IClock clock,
    ILogger<PasswordResetIssuer> logger)
{
    public async Task IssueAsync(IssuePasswordReset message, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        var db = outbox.DbContext;
        var user = await db.Users.SingleOrDefaultAsync(u => u.NormalizedEmail == message.NormalizedEmail, cancellationToken);
        IdentityMetrics.PasswordResetRequested(user is not null);
        if (user is null)
        {
            return;
        }

        var token = await oneTimeTokens.IssueAsync(user.Id, TokenPurposes.PasswordReset, cancellationToken);
        db.SecurityEvents.Add(SecurityEvent.Create(
            SecurityEventTypes.PasswordResetRequested, user.Id, null, new RequestInfo(message.IpAddress, message.UserAgent)));
        await outbox.PublishAsync(new PasswordResetRequested(user.Id, user.Email, user.Name, token.Link, token.ExpiresAt, clock.UtcNow));
        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        LogIssued(logger, user.Id);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Issued a password reset link to user {UserId}")]
    private static partial void LogIssued(ILogger logger, Guid userId);
}

/// <summary>Issues a 48 hour verification token and queues the email, at most once a minute per account.</summary>
internal sealed partial class EmailVerificationIssuer(
    IDbContextOutbox<IdentityDbContext> outbox,
    OneTimeTokens oneTimeTokens,
    IClock clock,
    ILogger<EmailVerificationIssuer> logger)
{
    public static readonly TimeSpan Cooldown = TimeSpan.FromSeconds(60);

    public async Task IssueAsync(string normalizedEmail, CancellationToken cancellationToken)
    {
        var db = outbox.DbContext;
        var user = await db.Users.SingleOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail, cancellationToken);
        if (user is null || user.EmailConfirmed)
        {
            return;
        }

        var now = clock.UtcNow;
        if (await oneTimeTokens.LastIssuedAtAsync(user.Id, TokenPurposes.EmailVerification, cancellationToken) is { } last && now - last < Cooldown)
        {
            return;
        }

        var token = await oneTimeTokens.IssueAsync(user.Id, TokenPurposes.EmailVerification, cancellationToken);
        await outbox.PublishAsync(new EmailVerificationRequested(user.Id, user.Email, user.Name, token.Link, token.ExpiresAt, now));
        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        LogIssued(logger, user.Id);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Issued a new verification link to user {UserId}")]
    private static partial void LogIssued(ILogger logger, Guid userId);
}
