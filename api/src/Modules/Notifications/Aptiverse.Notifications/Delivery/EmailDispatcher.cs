using System.Diagnostics;
using Aptiverse.Notifications.Email;
using Aptiverse.Notifications.Persistence;
using Aptiverse.Notifications.Templates;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Npgsql;

namespace Aptiverse.Notifications.Delivery;

/// <summary>One email to send. <paramref name="ToAddress"/> and <paramref name="Model"/> are personal information.</summary>
internal sealed record EmailRequest(
    Guid DedupeKey,
    EmailTemplate Template,
    Guid? UserId,
    string ToAddress,
    string? ToName,
    IReadOnlyDictionary<string, string> Model);

internal enum EmailOutcome
{
    Sent,
    Duplicate,
    Failed,
}

/// <summary>
/// Renders and sends one email at most once per (dedupe key, template), recording every attempt in the delivery log.
/// A transient provider failure is recorded and rethrown as <see cref="EmailDeliveryDeferredException"/> so Wolverine
/// retries with backoff; a permanent failure, or the last allowed attempt, is recorded as failed and not retried.
/// Logs carry the delivery id, template, user id and provider message id, never the address, link or body.
/// </summary>
internal sealed partial class EmailDispatcher(
    NotificationsDbContext db,
    IEmailSender sender,
    EmailTemplateRenderer renderer,
    RecipientPrivacy privacy,
    IOptions<EmailOptions> options,
    IClock clock,
    ILogger<EmailDispatcher> logger)
{
    public async Task<EmailOutcome> SendAsync(EmailRequest request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var template = request.Template;

        var delivery = await db.Deliveries
            .SingleOrDefaultAsync(d => d.DedupeKey == request.DedupeKey && d.TemplateKey == template.Key, cancellationToken);
        if (delivery is { IsPending: false })
        {
            return Duplicate(template, delivery.Id, request.UserId);
        }

        if (delivery is null)
        {
            delivery = EmailDelivery.Create(
                request.DedupeKey,
                template.Key,
                template.Category,
                request.UserId,
                privacy.Hash(request.ToAddress),
                RecipientPrivacy.Mask(request.ToAddress),
                clock.UtcNow);
            db.Deliveries.Add(delivery);
        }

        // Rendering first: a template bug must not count as a provider attempt.
        var rendered = renderer.Render(template, request.Model);

        // Claiming the attempt is optimistic (xmin), so two workers handling the same event cannot both send.
        delivery.BeginAttempt();
        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (ex is DbUpdateConcurrencyException
            || ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            return Duplicate(template, delivery.Id, request.UserId);
        }

        var started = Stopwatch.GetTimestamp();
        try
        {
            var messageId = await sender.SendAsync(
                new OutgoingEmail(request.ToAddress, request.ToName, rendered.Subject, rendered.Text, rendered.Html),
                cancellationToken);

            delivery.MarkSent(messageId, clock.UtcNow);
            // The provider accepted the email: record it even if the caller has given up waiting.
            await db.SaveChangesAsync(CancellationToken.None);
            NotificationsMetrics.Sent(template.Key, template.Category, Stopwatch.GetElapsedTime(started).TotalMilliseconds);
            LogSent(logger, delivery.Id, template.Key, request.UserId, messageId, delivery.Attempts);
            return EmailOutcome.Sent;
        }
        catch (EmailSendException ex) when (!ex.IsTransient || delivery.Attempts >= options.Value.MaxSendAttempts)
        {
            delivery.MarkFailed(ex.ErrorCode, clock.UtcNow);
            await db.SaveChangesAsync(CancellationToken.None);
            NotificationsMetrics.Failed(template.Key, ex.ErrorCode, final: true);
            LogFailed(logger, delivery.Id, template.Key, request.UserId, ex.ErrorCode, delivery.Attempts, ex.IsTransient);
            return EmailOutcome.Failed;
        }
        catch (EmailSendException ex)
        {
            delivery.RecordTransientFailure(ex.ErrorCode);
            await db.SaveChangesAsync(CancellationToken.None);
            NotificationsMetrics.Failed(template.Key, ex.ErrorCode, final: false);
            LogDeferred(logger, delivery.Id, template.Key, request.UserId, ex.ErrorCode, delivery.Attempts);
            throw new EmailDeliveryDeferredException(
                $"Email delivery {delivery.Id} ({template.Key}) failed attempt {delivery.Attempts} with {ex.ErrorCode}; it will be retried.");
        }
    }

    private EmailOutcome Duplicate(EmailTemplate template, Guid deliveryId, Guid? userId)
    {
        NotificationsMetrics.Skipped(template.Key, "duplicate");
        LogDuplicate(logger, deliveryId, template.Key, userId);
        return EmailOutcome.Duplicate;
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Email delivery {DeliveryId} ({TemplateKey}) for user {UserId} sent as {ProviderMessageId} on attempt {Attempt}")]
    private static partial void LogSent(ILogger logger, Guid deliveryId, string templateKey, Guid? userId, string providerMessageId, int attempt);

    [LoggerMessage(Level = LogLevel.Error, Message = "Email delivery {DeliveryId} ({TemplateKey}) for user {UserId} failed with {ErrorCode} on attempt {Attempt} (transient {Transient}); not retrying")]
    private static partial void LogFailed(ILogger logger, Guid deliveryId, string templateKey, Guid? userId, string errorCode, int attempt, bool transient);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Email delivery {DeliveryId} ({TemplateKey}) for user {UserId} failed with {ErrorCode} on attempt {Attempt}; retrying later")]
    private static partial void LogDeferred(ILogger logger, Guid deliveryId, string templateKey, Guid? userId, string errorCode, int attempt);

    [LoggerMessage(Level = LogLevel.Information, Message = "Email delivery {DeliveryId} ({TemplateKey}) for user {UserId} already handled; skipping the redelivered event")]
    private static partial void LogDuplicate(ILogger logger, Guid deliveryId, string templateKey, Guid? userId);
}
