using System.Text.Json;
using System.Text.Json.Serialization;

namespace Aptiverse.Billing.Paystack;

// Wire models for the Paystack REST API (snake_case JSON). They stay internal: nothing here is part of this API's
// public contract. Amounts are in the currency's minor unit (cents for ZAR), as Paystack sends them.

internal sealed record InitializeTransaction(
    string Email,
    long Amount,
    string Currency,
    string Reference,
    string CallbackUrl,
    string? Plan,
    IReadOnlyDictionary<string, string> Metadata);

internal sealed record InitializedTransaction(string AuthorizationUrl, string AccessCode, string Reference);

/// <summary>A transaction as verify and list return it. Raw keeps the exact data object for the inbox payload.</summary>
internal sealed record PaystackTransaction(
    long Id,
    string Status,
    string Reference,
    long Amount,
    string Currency,
    DateTimeOffset? PaidAt,
    string? Channel,
    long? Fees,
    string? CustomerCode,
    string? PlanCode,
    JsonElement Raw);

internal sealed record PaystackPlan(string PlanCode, string Name, long Amount, string Interval, string Currency);

internal sealed record PaystackSubscription(string SubscriptionCode, string Status, string? EmailToken, DateTimeOffset? NextPaymentDate);

internal sealed record InitializeWire(string? AuthorizationUrl, string? AccessCode, string? Reference);

internal sealed record PlanWire(string? PlanCode, string? Name, long Amount, string? Interval, string? Currency);

internal sealed record SubscriptionWire(string? SubscriptionCode, string? Status, string? EmailToken, DateTimeOffset? NextPaymentDate);

internal static class PaystackJson
{
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        NumberHandling = JsonNumberHandling.AllowReadingFromString,
    };

    /// <summary>Reads a transaction object from verify, list or a charge.success webhook.</summary>
    public static PaystackTransaction ReadTransaction(JsonElement data) => new(
        Long(data, "id") ?? 0,
        String(data, "status") ?? string.Empty,
        String(data, "reference") ?? string.Empty,
        Long(data, "amount") ?? 0,
        String(data, "currency") ?? string.Empty,
        Date(data, "paid_at") ?? Date(data, "paidAt"),
        String(data, "channel"),
        Long(data, "fees"),
        Nested(data, "customer", "customer_code"),
        PlanCode(data),
        data.Clone());

    public static string? String(JsonElement element, string name) =>
        element.ValueKind == JsonValueKind.Object && element.TryGetProperty(name, out var value)
            ? value.ValueKind switch
            {
                JsonValueKind.String => value.GetString(),
                JsonValueKind.Number => value.GetRawText(),
                _ => null,
            }
            : null;

    public static long? Long(JsonElement element, string name)
    {
        if (element.ValueKind != JsonValueKind.Object || !element.TryGetProperty(name, out var value))
        {
            return null;
        }

        return value.ValueKind switch
        {
            JsonValueKind.Number when value.TryGetInt64(out var number) => number,
            JsonValueKind.String when long.TryParse(value.GetString(), System.Globalization.NumberStyles.Integer, System.Globalization.CultureInfo.InvariantCulture, out var parsed) => parsed,
            _ => null,
        };
    }

    public static DateTimeOffset? Date(JsonElement element, string name) =>
        String(element, name) is { } text && DateTimeOffset.TryParse(text, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.AssumeUniversal, out var date)
            ? date.ToUniversalTime()
            : null;

    public static string? Nested(JsonElement element, string parent, string name) =>
        element.ValueKind == JsonValueKind.Object && element.TryGetProperty(parent, out var child) ? String(child, name) : null;

    /// <summary>Paystack sends the plan as an object, a plan code string, or nothing, depending on the endpoint.</summary>
    public static string? PlanCode(JsonElement data)
    {
        if (data.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        if (data.TryGetProperty("plan", out var plan))
        {
            if (plan.ValueKind == JsonValueKind.String && plan.GetString() is { Length: > 0 } code && code.StartsWith("PLN_", StringComparison.Ordinal))
            {
                return code;
            }

            if (String(plan, "plan_code") is { Length: > 0 } nested)
            {
                return nested;
            }
        }

        return Nested(data, "plan_object", "plan_code");
    }
}
