using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Aptiverse.Billing.Paystack;

/// <summary>Signature check and dedupe key for Paystack webhooks. Pure, so every rule is unit tested.</summary>
internal static class PaystackWebhooks
{
    public const string SignatureHeader = "x-paystack-signature";
    public const int MaxBodyBytes = 64 * 1024;

    private const int Sha512Bytes = 64;

    /// <summary>
    /// HMAC-SHA512 of the raw body bytes with the secret, compared in constant time with the hex header. A missing,
    /// malformed or wrong signature, or a missing secret, is false.
    /// </summary>
    public static bool IsValidSignature(ReadOnlySpan<byte> body, string? signatureHeader, string? secret)
    {
        if (string.IsNullOrWhiteSpace(secret) || string.IsNullOrWhiteSpace(signatureHeader))
        {
            return false;
        }

        var header = signatureHeader.Trim();
        if (header.Length != Sha512Bytes * 2)
        {
            return false;
        }

        Span<byte> received = stackalloc byte[Sha512Bytes];
        if (Convert.FromHexString(header, received, out _, out var written) != System.Buffers.OperationStatus.Done || written != Sha512Bytes)
        {
            return false;
        }

        Span<byte> expected = stackalloc byte[Sha512Bytes];
        HMACSHA512.HashData(Encoding.UTF8.GetBytes(secret), body, expected);
        return CryptographicOperations.FixedTimeEquals(expected, received);
    }

    /// <summary>Hex HMAC-SHA512 as Paystack sends it; used by tests and local tooling to sign fake events.</summary>
    public static string Sign(ReadOnlySpan<byte> body, string secret) =>
        Convert.ToHexStringLower(HMACSHA512.HashData(Encoding.UTF8.GetBytes(secret), body));

    public static string Sha256Hex(ReadOnlySpan<byte> body) => Convert.ToHexStringLower(SHA256.HashData(body));

    /// <summary>
    /// Paystack sends no event id, so the key is sha256(event:data.id:data.status:ref), where ref is the reference,
    /// subscription code or invoice code. For subscription events, whose data.id repeats, the next payment date is
    /// added. A verify on the welcome page builds the same key for charge.success from the verify response.
    /// </summary>
    public static string DedupeKey(string eventType, JsonElement data)
    {
        ArgumentNullException.ThrowIfNull(eventType);
        var reference = ObjectRef(eventType, data) ?? string.Empty;
        var text = $"{eventType}:{PaystackJson.String(data, "id")}:{PaystackJson.String(data, "status")}:{reference}";
        if (eventType.StartsWith("subscription.", StringComparison.Ordinal))
        {
            text += ":" + PaystackJson.String(data, "next_payment_date");
        }

        return Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(text)));
    }

    /// <summary>The object an event is about: a transaction reference, subscription code, invoice code or refunded reference.</summary>
    public static string? ObjectRef(string eventType, JsonElement data) =>
        PaystackJson.String(data, "reference")
        ?? PaystackJson.String(data, "subscription_code")
        ?? PaystackJson.Nested(data, "subscription", "subscription_code")
        ?? PaystackJson.String(data, "invoice_code")
        ?? PaystackJson.String(data, "transaction_reference")
        ?? (eventType.StartsWith("refund.", StringComparison.Ordinal) ? PaystackJson.Nested(data, "transaction", "reference") : null);
}

/// <summary>Event names Billing acts on. Anything else is stored and marked ignored.</summary>
internal static class PaystackEvents
{
    public const string ChargeSuccess = "charge.success";
    public const string SubscriptionCreate = "subscription.create";
    public const string SubscriptionNotRenew = "subscription.not_renew";
    public const string SubscriptionDisable = "subscription.disable";
    public const string SubscriptionEnable = "subscription.enable";
    public const string InvoicePaymentFailed = "invoice.payment_failed";
    public const string RefundProcessed = "refund.processed";
    public const string RefundFailed = "refund.failed";
    public const string RefundPending = "refund.pending";
}
