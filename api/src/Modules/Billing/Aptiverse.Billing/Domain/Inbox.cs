using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Billing.Domain;

/// <summary>
/// The Paystack inbox. A webhook is stored once per dedupe key (unique), then processed exactly once by a Wolverine
/// message: the row is marked processed in the same transaction as the handler's writes and events. Verify on the
/// welcome page writes the same key, so verify and webhook can never both apply.
/// </summary>
internal sealed class PaystackEvent : Entity
{
    public const int DedupeKeyLength = 64;
    public const int EventTypeMaxLength = 60;
    public const int ObjectRefMaxLength = 100;
    public const int ErrorCodeMaxLength = 64;

    private PaystackEvent()
    {
    }

    public string DedupeKey { get; private set; } = string.Empty;

    public string EventType { get; private set; } = string.Empty;

    public string? ObjectRef { get; private set; }

    /// <summary>The body as received (jsonb). Holds the payer's email, so it is personal information.</summary>
    public string Payload { get; private set; } = "{}";

    public string BodySha256 { get; private set; } = string.Empty;

    public string Source { get; private set; } = InboxSources.Webhook;

    public string Status { get; private set; } = InboxStatuses.Pending;

    public int Attempts { get; private set; }

    public DateTimeOffset ReceivedAt { get; private set; }

    public DateTimeOffset? ProcessedAt { get; private set; }

    public string? LastErrorCode { get; private set; }

    public bool IsResolved => Status is InboxStatuses.Processed or InboxStatuses.Ignored or InboxStatuses.Failed;

    public static PaystackEvent Receive(
        string dedupeKey, string eventType, string? objectRef, string payload, string bodySha256, string source, DateTimeOffset now) => new()
        {
            DedupeKey = dedupeKey,
            EventType = eventType.Length <= EventTypeMaxLength ? eventType : eventType[..EventTypeMaxLength],
            ObjectRef = objectRef is { Length: > ObjectRefMaxLength } ? objectRef[..ObjectRefMaxLength] : objectRef,
            Payload = payload,
            BodySha256 = bodySha256,
            Source = source,
            Status = InboxStatuses.Pending,
            ReceivedAt = now,
        };

    public void MarkProcessed(DateTimeOffset now)
    {
        Status = InboxStatuses.Processed;
        ProcessedAt = now;
        Attempts++;
        LastErrorCode = null;
    }

    public void MarkIgnored(string reason, DateTimeOffset now)
    {
        Status = InboxStatuses.Ignored;
        ProcessedAt = now;
        Attempts++;
        LastErrorCode = Clip(reason);
    }

    /// <summary>Keeps the row pending for a later attempt (out of order delivery). Returns the attempts made.</summary>
    public int Defer(string reason)
    {
        Attempts++;
        LastErrorCode = Clip(reason);
        return Attempts;
    }

    public void MarkFailed(string reason, DateTimeOffset now)
    {
        Status = InboxStatuses.Failed;
        ProcessedAt = now;
        LastErrorCode = Clip(reason);
    }

    private static string Clip(string reason) => reason.Length <= ErrorCodeMaxLength ? reason : reason[..ErrorCodeMaxLength];
}
