namespace Aptiverse.Entitlements.Application.Services
{
    // Drives the Subscription lifecycle off Paystack webhook events.
    //
    // The controller is responsible for verifying the x-paystack-signature
    // BEFORE calling this — by the time an event reaches here it is trusted.
    // This service only maps Paystack event semantics onto our local
    // Subscription.Status (active | past_due | cancelled) and the Paystack
    // linkage fields.
    public interface IPaystackSubscriptionService
    {
        // Returns a short, log-safe description of what happened so the
        // controller can echo it back to Paystack (Paystack only cares
        // about the 200; the body is for our own observability).
        Task<PaystackWebhookOutcome> HandleEventAsync(
            PaystackWebhookEvent evt, CancellationToken ct = default);
    }

    // Normalised view of a Paystack webhook envelope. The controller parses
    // the raw JSON into this so the Application layer has no JSON concern.
    public record PaystackWebhookEvent
    {
        // e.g. charge.success | subscription.create |
        // subscription.not_renew | subscription.disable | invoice.payment_failed
        public required string Event { get; init; }

        // Paystack subscription code (SUB_xxx) when present on the event.
        public string? SubscriptionCode { get; init; }

        // Paystack customer code (CUS_xxx) when present on the event.
        public string? CustomerCode { get; init; }

        // Buyer email — fallback correlation when no codes are linked yet.
        public string? CustomerEmail { get; init; }

        // Our own Subscription.Id, when we passed it through init metadata.
        public long? LocalSubscriptionId { get; init; }

        // Next charge date from a subscription event — extends ValidUntil.
        public DateTime? NextPaymentDate { get; init; }
    }

    public record PaystackWebhookOutcome
    {
        public required bool Handled { get; init; }
        public required string Message { get; init; }
        public long? SubscriptionId { get; init; }
        public string? NewStatus { get; init; }
    }
}
