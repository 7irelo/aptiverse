using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Notifications.Delivery;

/// <summary>
/// One logical email and what happened to it. Unique per (dedupe key, template) so a redelivered event never sends
/// twice. Stores a keyed hash and a mask of the address, never the address itself, and never the body.
/// </summary>
internal sealed class EmailDelivery : Entity
{
    public const int TemplateKeyMaxLength = 64;
    public const int CategoryMaxLength = 32;
    public const int StatusMaxLength = 16;
    public const int ProviderMessageIdMaxLength = 128;
    public const int ErrorCodeMaxLength = 64;

    private EmailDelivery()
    {
    }

    /// <summary>Null for recipients who are not users.</summary>
    public Guid? UserId { get; private set; }

    public string ToAddressHash { get; private set; } = string.Empty;

    public string ToAddressMasked { get; private set; } = string.Empty;

    public string TemplateKey { get; private set; } = string.Empty;

    public string Category { get; private set; } = string.Empty;

    /// <summary>Derived from the triggering event, so every delivery of that event maps to this row.</summary>
    public Guid DedupeKey { get; private set; }

    public string Status { get; private set; } = DeliveryStatuses.Queued;

    public string? ProviderMessageId { get; private set; }

    /// <summary>Provider calls made so far.</summary>
    public short Attempts { get; private set; }

    /// <summary>Provider error code of the last failure; never a provider message.</summary>
    public string? LastErrorCode { get; private set; }

    public DateTimeOffset? SentAt { get; private set; }

    public DateTimeOffset StatusChangedAt { get; private set; }

    public bool IsPending => Status == DeliveryStatuses.Queued;

    public static EmailDelivery Create(
        Guid dedupeKey,
        string templateKey,
        string category,
        Guid? userId,
        string toAddressHash,
        string toAddressMasked,
        DateTimeOffset now) => new()
        {
            DedupeKey = dedupeKey,
            TemplateKey = templateKey,
            Category = category,
            UserId = userId,
            ToAddressHash = toAddressHash,
            ToAddressMasked = toAddressMasked,
            StatusChangedAt = now,
        };

    public void BeginAttempt() => Attempts++;

    public void MarkSent(string providerMessageId, DateTimeOffset now)
    {
        ProviderMessageId = providerMessageId.Length > ProviderMessageIdMaxLength ? providerMessageId[..ProviderMessageIdMaxLength] : providerMessageId;
        LastErrorCode = null;
        SentAt = now;
        ChangeStatus(DeliveryStatuses.Sent, now);
    }

    /// <summary>A transient failure: the row stays queued for the next attempt.</summary>
    public void RecordTransientFailure(string errorCode) => LastErrorCode = Truncate(errorCode);

    /// <summary>A permanent failure, or transient failures past the attempt limit. Never retried.</summary>
    public void MarkFailed(string errorCode, DateTimeOffset now)
    {
        LastErrorCode = Truncate(errorCode);
        ChangeStatus(DeliveryStatuses.Failed, now);
    }

    private void ChangeStatus(string status, DateTimeOffset now)
    {
        Status = status;
        StatusChangedAt = now;
    }

    private static string Truncate(string code) => code.Length > ErrorCodeMaxLength ? code[..ErrorCodeMaxLength] : code;
}

internal static class DeliveryStatuses
{
    public const string Queued = "queued";
    public const string Sent = "sent";
    public const string Delivered = "delivered";
    public const string Bounced = "bounced";
    public const string Complained = "complained";
    public const string Failed = "failed";
    public const string Suppressed = "suppressed";

    /// <summary>Delivered, bounced, complained and suppressed are reserved for SES event handling (not built yet).</summary>
    public static IReadOnlyList<string> All { get; } = [Queued, Sent, Delivered, Bounced, Complained, Failed, Suppressed];
}
