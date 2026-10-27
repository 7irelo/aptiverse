using System.Diagnostics.Metrics;

namespace Aptiverse.Billing;

/// <summary>Billing counters. Tags are low-cardinality values only, never ids, references or amounts per user.</summary>
internal static class BillingMetrics
{
    public const string MeterName = "Aptiverse.Billing";

    private static readonly Meter Meter = new(MeterName);

    private static readonly Counter<long> Webhooks =
        Meter.CreateCounter<long>("aptiverse.billing.webhook.received", description: "Paystack webhooks by outcome");

    private static readonly Counter<long> CheckoutsStarted =
        Meter.CreateCounter<long>("aptiverse.billing.checkout.started", description: "Checkouts started");

    private static readonly Counter<long> PaymentsCents =
        Meter.CreateCounter<long>("aptiverse.billing.payments.succeeded_cents", unit: "cents", description: "Money received");

    private static readonly Counter<long> RefundsCents =
        Meter.CreateCounter<long>("aptiverse.billing.refunds.cents", unit: "cents", description: "Money refunded");

    private static readonly Counter<long> Exhausted =
        Meter.CreateCounter<long>("aptiverse.billing.usage.exhausted", description: "Reservations refused because the quota is used up");

    private static readonly Counter<long> Expired =
        Meter.CreateCounter<long>("aptiverse.billing.usage.reservations_expired", description: "Reservations nobody resolved in time");

    private static readonly Counter<long> PaystackErrors =
        Meter.CreateCounter<long>("aptiverse.billing.paystack.errors", description: "Failed Paystack calls");

    private static readonly Counter<long> Drifts =
        Meter.CreateCounter<long>("aptiverse.billing.reconciliation.drift_count", description: "Drift rows raised");

    public static void Webhook(string eventType, string outcome) => Webhooks.Add(
        1,
        new KeyValuePair<string, object?>("event_type", eventType),
        new KeyValuePair<string, object?>("outcome", outcome));

    public static void CheckoutStarted(string plan, string interval) => CheckoutsStarted.Add(
        1,
        new KeyValuePair<string, object?>("plan", plan),
        new KeyValuePair<string, object?>("interval", interval));

    public static void PaymentSucceeded(long cents) => PaymentsCents.Add(cents);

    public static void RefundProcessed(long cents) => RefundsCents.Add(cents);

    public static void QuotaExhausted(string quotaKey) => Exhausted.Add(1, new KeyValuePair<string, object?>("quota_key", quotaKey));

    public static void ReservationExpired(string quotaKey) => Expired.Add(1, new KeyValuePair<string, object?>("quota_key", quotaKey));

    public static void PaystackError(string operation) => PaystackErrors.Add(1, new KeyValuePair<string, object?>("operation", operation));

    public static void DriftRaised(string kind) => Drifts.Add(1, new KeyValuePair<string, object?>("kind", kind));
}
