using Aptiverse.Identity.Contracts;
using Aptiverse.Notifications.Delivery;
using Aptiverse.Notifications.Email;
using Aptiverse.Notifications.Templates;
using Aptiverse.SharedKernel.Authorization;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Notifications.Messaging;

/// <summary>
/// Turns Identity events into emails. Events that carry the address use it; the welcome and sessions notices look
/// the user up at send time because their events carry only the id. UserRegistered sends nothing: registration raises
/// EmailVerificationRequested in the same transaction, and the welcome waits until the address is verified.
/// </summary>
internal sealed partial class IdentityEmails(
    EmailDispatcher dispatcher,
    EmailLinks links,
    IUserDirectory directory,
    ILogger<IdentityEmails> logger)
{
    // Reasons that already produce their own email (password notices) or need none (the user signing out themselves,
    // or a deleted account).
    private static readonly Dictionary<string, string> RevocationExplanations = new(StringComparer.Ordinal)
    {
        ["signed_out_remotely"] = "They were signed out from the devices list in your account settings.",
        ["account_linked"] = "Your account was linked to Google sign in, so we signed out your other devices to be safe.",
        ["refresh_reuse"] = "We saw a sign in token being used twice, which can mean it was copied, so we signed that device out to protect you.",
    };

    public async Task VerificationRequestedAsync(EmailVerificationRequested message, CancellationToken cancellationToken)
    {
        var link = links.WithToken(EmailLinks.VerifyEmailPath, message.VerificationUrl);
        if (link is null)
        {
            Skip(EmailTemplates.VerifyEmail, message.UserId, "invalid_link");
            return;
        }

        await SendAsync(
            DedupeKeys.ForEvent(nameof(EmailVerificationRequested), message.UserId, message.OccurredAt),
            EmailTemplates.VerifyEmail,
            message.UserId,
            message.Email,
            message.Name,
            new Dictionary<string, string>
            {
                ["name"] = message.Name,
                ["link"] = link.AbsoluteUri,
                ["expires_at"] = EmailFormat.When(message.ExpiresAt),
            },
            cancellationToken);
    }

    public async Task PasswordResetRequestedAsync(PasswordResetRequested message, CancellationToken cancellationToken)
    {
        var link = links.WithToken(EmailLinks.ResetPasswordPath, message.ResetUrl);
        if (link is null)
        {
            Skip(EmailTemplates.ResetPassword, message.UserId, "invalid_link");
            return;
        }

        await SendAsync(
            DedupeKeys.ForEvent(nameof(PasswordResetRequested), message.UserId, message.OccurredAt),
            EmailTemplates.ResetPassword,
            message.UserId,
            message.Email,
            message.Name,
            new Dictionary<string, string>
            {
                ["name"] = message.Name,
                ["link"] = link.AbsoluteUri,
                ["expires_at"] = EmailFormat.When(message.ExpiresAt),
            },
            cancellationToken);
    }

    public Task PasswordChangedAsync(PasswordChanged message, CancellationToken cancellationToken) =>
        SendAsync(
            DedupeKeys.ForEvent(nameof(PasswordChanged), message.UserId, message.OccurredAt),
            EmailTemplates.PasswordChanged,
            message.UserId,
            message.Email,
            message.Name,
            new Dictionary<string, string>
            {
                ["name"] = message.Name,
                ["changed_at"] = EmailFormat.When(message.OccurredAt),
                ["via_reset"] = EmailFormat.Flag(message.ViaReset),
                ["reset_link"] = links.To(EmailLinks.ForgotPasswordPath).AbsoluteUri,
            },
            cancellationToken);

    public Task AccountLockedOutAsync(AccountLockedOut message, CancellationToken cancellationToken) =>
        SendAsync(
            DedupeKeys.ForEvent(nameof(AccountLockedOut), message.UserId, message.OccurredAt),
            EmailTemplates.AccountLocked,
            message.UserId,
            message.Email,
            message.Name,
            new Dictionary<string, string>
            {
                ["name"] = message.Name,
                ["locked_until"] = EmailFormat.When(message.LockedUntil),
                ["reset_link"] = links.To(EmailLinks.ForgotPasswordPath).AbsoluteUri,
            },
            cancellationToken);

    public async Task EmailVerifiedAsync(EmailVerified message, CancellationToken cancellationToken)
    {
        var contact = await directory.GetContactAsync(message.UserId, cancellationToken);
        if (contact is null)
        {
            Skip(EmailTemplates.Welcome, message.UserId, "no_recipient");
            return;
        }

        // Once per user, whatever verifies the address and however often.
        await SendAsync(
            DedupeKeys.OncePerUser(EmailTemplates.Welcome.Key, message.UserId),
            EmailTemplates.Welcome,
            message.UserId,
            contact.Email,
            contact.Name,
            new Dictionary<string, string>
            {
                ["name"] = contact.Name,
                ["is_parent"] = EmailFormat.Flag(contact.Roles.Contains(Roles.Parent) && !contact.Roles.Contains(Roles.Student)),
                ["app_link"] = links.Home().AbsoluteUri,
            },
            cancellationToken);
    }

    public async Task SessionsRevokedAsync(SessionsRevoked message, CancellationToken cancellationToken)
    {
        if (!RevocationExplanations.TryGetValue(message.Reason, out var explanation) || message.SessionIds.Count == 0)
        {
            return;
        }

        var contact = await directory.GetContactAsync(message.UserId, cancellationToken);
        if (contact is null)
        {
            Skip(EmailTemplates.SessionsRevoked, message.UserId, "no_recipient");
            return;
        }

        await SendAsync(
            DedupeKeys.ForEvent(nameof(SessionsRevoked), message.UserId, message.OccurredAt),
            EmailTemplates.SessionsRevoked,
            message.UserId,
            contact.Email,
            contact.Name,
            new Dictionary<string, string>
            {
                ["name"] = contact.Name,
                ["revoked_at"] = EmailFormat.When(message.OccurredAt),
                ["device_count"] = EmailFormat.Number(message.SessionIds.Count),
                ["reason_text"] = explanation,
                ["security_link"] = links.To(EmailLinks.SecuritySettingsPath).AbsoluteUri,
                ["reset_link"] = links.To(EmailLinks.ForgotPasswordPath).AbsoluteUri,
            },
            cancellationToken);
    }

    private async Task SendAsync(
        Guid dedupeKey,
        EmailTemplate template,
        Guid userId,
        string address,
        string name,
        IReadOnlyDictionary<string, string> model,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(address))
        {
            Skip(template, userId, "no_recipient");
            return;
        }

        await dispatcher.SendAsync(new EmailRequest(dedupeKey, template, userId, address.Trim(), name, model), cancellationToken);
    }

    private void Skip(EmailTemplate template, Guid userId, string reason)
    {
        NotificationsMetrics.Skipped(template.Key, reason);
        LogSkipped(logger, template.Key, userId, reason);
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "Email {TemplateKey} for user {UserId} not sent: {Reason}")]
    private static partial void LogSkipped(ILogger logger, string templateKey, Guid userId, string reason);
}
