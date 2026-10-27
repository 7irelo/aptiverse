using System.Text;
using System.Text.Json;
using Aptiverse.Billing.Domain;
using Aptiverse.Billing.Inbox;
using Aptiverse.Billing.Paystack;
using Aptiverse.SharedKernel.Results;
using FluentValidation;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Aptiverse.Billing.Features.ReceivePaystackWebhook;

/// <summary>The parsed webhook body. Only checked after the signature has been verified over the raw bytes.</summary>
/// <param name="Event">The event name, for example "charge.success".</param>
/// <param name="Data">The event's data object.</param>
internal sealed record PaystackEnvelope(string Event, JsonElement Data);

internal sealed class PaystackEnvelopeValidator : AbstractValidator<PaystackEnvelope>
{
    public PaystackEnvelopeValidator()
    {
        RuleFor(e => e.Event).NotEmpty().MaximumLength(PaystackEvent.EventTypeMaxLength).Matches("^[a-z_.]+$");
        RuleFor(e => e.Data.ValueKind).Equal(JsonValueKind.Object).WithMessage("data must be an object.");
    }
}

internal enum WebhookOutcome
{
    Accepted,
    Duplicate,
}

/// <summary>
/// Verifies first, parses second: the HMAC-SHA512 signature over the exact raw bytes is checked in constant time
/// before the body is even parsed, and a bad signature stores nothing. A good one is stored once per dedupe key and
/// queued for processing through the outbox; nothing on this path calls Paystack, so it stays fast during an outage.
/// </summary>
internal sealed partial class ReceivePaystackWebhookHandler(
    InboxWriter inbox,
    IValidator<PaystackEnvelope> validator,
    IOptions<BillingOptions> options,
    ILogger<ReceivePaystackWebhookHandler> logger)
{
    public static readonly Error MalformedBody = Error.Validation("billing.webhook_malformed", "The webhook body is not a Paystack event.");

    public async Task<Result<WebhookOutcome>> HandleAsync(ReadOnlyMemory<byte> body, string? signature, CancellationToken cancellationToken)
    {
        if (!PaystackWebhooks.IsValidSignature(body.Span, signature, options.Value.Paystack.SigningSecret))
        {
            BillingMetrics.Webhook("unknown", "bad_signature");
            LogBadSignature(logger, body.Length);
            return BillingErrors.WebhookBadSignature;
        }

        PaystackEnvelope? envelope;
        try
        {
            using var document = JsonDocument.Parse(body);
            var root = document.RootElement;
            envelope = root.ValueKind == JsonValueKind.Object && root.TryGetProperty("event", out var name) && name.ValueKind == JsonValueKind.String
                ? new PaystackEnvelope(name.GetString()!, root.TryGetProperty("data", out var data) ? data.Clone() : default)
                : null;
        }
        catch (JsonException)
        {
            envelope = null;
        }

        if (envelope is null || !(await validator.ValidateAsync(envelope, cancellationToken)).IsValid)
        {
            BillingMetrics.Webhook("unknown", "malformed");
            return MalformedBody;
        }

        var stored = await inbox.StoreAsync(
            envelope.Event,
            envelope.Data,
            Encoding.UTF8.GetString(body.Span),
            PaystackWebhooks.Sha256Hex(body.Span),
            InboxSources.Webhook,
            TimeSpan.Zero,
            cancellationToken);

        var outcome = stored.Duplicate ? WebhookOutcome.Duplicate : WebhookOutcome.Accepted;
        BillingMetrics.Webhook(envelope.Event, stored.Duplicate ? "duplicate" : "accepted");
        LogReceived(logger, envelope.Event, stored.EventId, outcome, body.Length);
        return outcome;
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "Rejected a Paystack webhook with a bad signature ({BodyBytes} bytes)")]
    private static partial void LogBadSignature(ILogger logger, int bodyBytes);

    [LoggerMessage(Level = LogLevel.Information, Message = "Paystack webhook {EventType} stored as {EventId}: {Outcome} ({BodyBytes} bytes)")]
    private static partial void LogReceived(ILogger logger, string eventType, Guid eventId, WebhookOutcome outcome, int bodyBytes);
}
