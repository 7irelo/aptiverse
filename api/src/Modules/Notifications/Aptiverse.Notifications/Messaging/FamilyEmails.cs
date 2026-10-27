using Aptiverse.Family.Contracts;
using Aptiverse.Identity.Contracts;
using Aptiverse.Notifications.Delivery;
using Aptiverse.Notifications.Email;
using Aptiverse.Notifications.Templates;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Notifications.Messaging;

/// <summary>
/// Turns Family events into emails. The invite goes to the invited address (which may have no account yet); link
/// notices look both people up at send time, because the events carry only ids. A link ended by account erasure sends
/// nothing: the erased side is gone and the other side is told in the app.
/// </summary>
internal sealed partial class FamilyEmails(
    EmailDispatcher dispatcher,
    EmailLinks links,
    IUserDirectory directory,
    ILogger<FamilyEmails> logger)
{
    private const string RemovedByParent = "parent";
    private const string RemovedByStudent = "student";

    public async Task InviteSentAsync(FamilyInviteSent message, CancellationToken cancellationToken)
    {
        var link = links.WithToken(EmailLinks.FamilyInvitePath, message.AcceptUrl);
        if (link is null || string.IsNullOrWhiteSpace(message.InviteeEmail))
        {
            Skip(EmailTemplates.FamilyInvite, message.InviterUserId, link is null ? "invalid_link" : "no_recipient");
            return;
        }

        await dispatcher.SendAsync(
            new EmailRequest(
                DedupeKeys.ForEvent(nameof(FamilyInviteSent), message.InviteId, message.OccurredAt),
                EmailTemplates.FamilyInvite,
                null,
                message.InviteeEmail.Trim(),
                null,
                new Dictionary<string, string>
                {
                    ["name"] = message.InviterDisplayName,
                    ["link"] = link.AbsoluteUri,
                    ["expires_at"] = EmailFormat.When(message.ExpiresAt),
                }),
            cancellationToken);
    }

    public async Task LinkCreatedAsync(FamilyLinkCreated message, CancellationToken cancellationToken)
    {
        var parent = await directory.GetContactAsync(message.ParentUserId, cancellationToken);
        var student = await directory.GetContactAsync(message.StudentUserId, cancellationToken);
        if (parent is null || student is null)
        {
            Skip(EmailTemplates.FamilyLinkCreated, message.ParentUserId, "no_recipient");
            return;
        }

        await SendAsync(
            DedupeKeys.ForEvent(nameof(FamilyLinkCreated), message.LinkId, message.OccurredAt),
            EmailTemplates.FamilyLinkCreated,
            parent,
            new Dictionary<string, string>
            {
                ["name"] = parent.Name,
                ["other_name"] = student.Name,
                ["family_link"] = links.To(EmailLinks.FamilyPath).AbsoluteUri,
            },
            cancellationToken);
    }

    public async Task LinkRemovedAsync(FamilyLinkRemoved message, CancellationToken cancellationToken)
    {
        // The person who did not remove the link is the one told.
        var (recipientId, otherId, recipientIsParent) = message.RemovedBy switch
        {
            RemovedByParent => (message.StudentUserId, message.ParentUserId, false),
            RemovedByStudent => (message.ParentUserId, message.StudentUserId, true),
            _ => (Guid.Empty, Guid.Empty, false),
        };
        if (recipientId == Guid.Empty)
        {
            return;
        }

        var recipient = await directory.GetContactAsync(recipientId, cancellationToken);
        var other = await directory.GetContactAsync(otherId, cancellationToken);
        if (recipient is null || other is null)
        {
            Skip(EmailTemplates.FamilyLinkRemoved, recipientId, "no_recipient");
            return;
        }

        await SendAsync(
            DedupeKeys.ForEvent(nameof(FamilyLinkRemoved), message.LinkId, message.OccurredAt),
            EmailTemplates.FamilyLinkRemoved,
            recipient,
            new Dictionary<string, string>
            {
                ["name"] = recipient.Name,
                ["other_name"] = other.Name,
                ["is_parent"] = EmailFormat.Flag(recipientIsParent),
                ["family_link"] = links.To(EmailLinks.FamilyPath).AbsoluteUri,
            },
            cancellationToken);
    }

    private async Task SendAsync(
        Guid dedupeKey,
        EmailTemplate template,
        UserContact recipient,
        IReadOnlyDictionary<string, string> model,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(recipient.Email))
        {
            Skip(template, recipient.UserId, "no_recipient");
            return;
        }

        await dispatcher.SendAsync(
            new EmailRequest(dedupeKey, template, recipient.UserId, recipient.Email.Trim(), recipient.Name, model),
            cancellationToken);
    }

    private void Skip(EmailTemplate template, Guid userId, string reason)
    {
        NotificationsMetrics.Skipped(template.Key, reason);
        LogSkipped(logger, template.Key, userId, reason);
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "Email {TemplateKey} for user {UserId} not sent: {Reason}")]
    private static partial void LogSkipped(ILogger logger, string templateKey, Guid userId, string reason);
}
