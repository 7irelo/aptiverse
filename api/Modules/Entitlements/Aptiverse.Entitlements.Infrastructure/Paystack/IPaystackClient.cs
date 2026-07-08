namespace Aptiverse.Entitlements.Infrastructure.Paystack
{
    // Thin typed wrapper over the Paystack REST API. Only the surface we
    // need for subscription billing is modelled:
    //   - InitializeTransactionAsync -> returns the hosted checkout URL
    //   - VerifySignature           -> validates the x-paystack-signature
    //                                  HMAC-SHA512 of the raw webhook body
    //
    // Wire up (read from config / environment, never hardcoded):
    //   PAYSTACK_SECRET_KEY in api/.env  (or Paystack:SecretKey in appsettings)
    //   Paystack:BaseUrl    optional, defaults to https://api.paystack.co
    public interface IPaystackClient
    {
        // True once a secret key has been supplied. Endpoints should 503
        // when this is false rather than calling Paystack with no key.
        bool IsConfigured { get; }

        // Creates a Paystack transaction and returns the data needed to
        // redirect the buyer to Paystack's hosted checkout.
        Task<PaystackInitResult> InitializeTransactionAsync(
            PaystackInitRequest request, CancellationToken ct = default);

        // Creates a recurring billing Plan on Paystack and returns its
        // plan_code (PLN_...). Initializing a transaction with that code is
        // what turns a one-off charge into an auto-renewing subscription.
        Task<string> CreatePlanAsync(
            PaystackPlanRequest request, CancellationToken ct = default);

        // Fetches a subscription's live state (status, next payment date,
        // amount, the card on file, and the email_token needed to cancel).
        // Returns null when not configured or the subscription is unknown.
        Task<PaystackSubscriptionInfo?> FetchSubscriptionAsync(
            string codeOrId, CancellationToken ct = default);

        // Disables (cancels) a subscription. Needs the subscription code and
        // its email_token, both returned by FetchSubscriptionAsync.
        Task<bool> DisableSubscriptionAsync(
            string code, string emailToken, CancellationToken ct = default);

        // Re-enables a previously disabled subscription (undo a scheduled
        // downgrade). Same arguments as disable.
        Task<bool> EnableSubscriptionAsync(
            string code, string emailToken, CancellationToken ct = default);

        // Lists a customer's successful transactions (payment history), most
        // recent first. Empty when not configured or none found.
        Task<IReadOnlyList<PaystackTransactionInfo>> ListTransactionsAsync(
            long customerId, int count = 24, CancellationToken ct = default);

        // Verifies a transaction by its reference (the return-from-checkout
        // path). Lets us confirm a payment server-side without waiting for
        // the webhook — essential in dev where Paystack can't reach the host.
        Task<PaystackVerifyInfo?> VerifyTransactionAsync(
            string reference, CancellationToken ct = default);

        // Finds a customer's most relevant subscription (active first, else
        // most recent) so we can recover its SUB_ code + next payment date
        // right after a checkout, before any subscription.* webhook lands.
        Task<PaystackSubscriptionInfo?> FindLatestSubscriptionAsync(
            long customerId, CancellationToken ct = default);

        // Starts a new recurring subscription for an existing customer on a
        // plan, charging their saved authorization. Legacy: Path A renews via
        // ChargeAuthorizationAsync instead, so this is only kept for any
        // pre-Path-A subscriptions still linked to a Paystack subscription.
        Task<PaystackSubscriptionInfo?> CreateSubscriptionAsync(
            string customerCode, string planCode, string authorizationCode, CancellationToken ct = default);

        // Charges a saved card token directly (no Paystack subscription, so no
        // manage-link email). This is how Path A drives every renewal and
        // scheduled downgrade: we own the cadence, Paystack just moves money.
        Task<PaystackChargeResult> ChargeAuthorizationAsync(
            PaystackChargeRequest request, CancellationToken ct = default);

        // Recomputes HMAC-SHA512(rawBody, secretKey) and compares it,
        // constant-time, to the value Paystack put in x-paystack-signature.
        // Returns false when not configured or when the header is missing.
        bool VerifySignature(string rawBody, string? signatureHeader);
    }

    public record PaystackInitRequest
    {
        public required string Email { get; init; }
        // Amount in the smallest currency unit (kobo / cents). Paystack
        // bills in integer minor units; ZAR -> cents (R1 = 100).
        public required long AmountMinor { get; init; }
        public string Currency { get; init; } = "ZAR";
        // Where Paystack returns the buyer after payment. Optional.
        public string? CallbackUrl { get; init; }
        // Optional plan code on Paystack's side to start a subscription.
        public string? PaystackPlanCode { get; init; }
        // Free-form metadata echoed back on the charge.success webhook so
        // we can correlate the payment to our local Subscription.
        public IDictionary<string, string>? Metadata { get; init; }
    }

    public record PaystackInitResult
    {
        public required string AuthorizationUrl { get; init; }
        public required string AccessCode { get; init; }
        public required string Reference { get; init; }
    }

    public record PaystackPlanRequest
    {
        public required string Name { get; init; }
        // Amount per interval in the smallest currency unit (ZAR cents).
        public required long AmountMinor { get; init; }
        // Paystack billing interval: "monthly", "annually", "weekly", etc.
        public required string Interval { get; init; }
        public string Currency { get; init; } = "ZAR";
    }

    public record PaystackSubscriptionInfo
    {
        public required string SubscriptionCode { get; init; }
        public string? EmailToken { get; init; }
        public string? Status { get; init; }
        public DateTime? NextPaymentDate { get; init; }
        public long? AmountMinor { get; init; }
        public long? CustomerId { get; init; }
        public string? CustomerCode { get; init; }
        public string? CardBrand { get; init; }
        public string? CardLast4 { get; init; }
        public int? CardExpMonth { get; init; }
        public int? CardExpYear { get; init; }
        // Reusable card token — lets us start a new subscription (e.g. a
        // scheduled downgrade) without re-collecting the card.
        public string? AuthorizationCode { get; init; }
    }

    public record PaystackTransactionInfo
    {
        public required string Reference { get; init; }
        public long AmountMinor { get; init; }
        public string Currency { get; init; } = "ZAR";
        public string? Status { get; init; }
        public DateTime? PaidAt { get; init; }
    }

    public record PaystackVerifyInfo
    {
        public required string Reference { get; init; }
        public string? Status { get; init; } // "success", "failed", "abandoned", ...
        public bool Success => string.Equals(Status, "success", StringComparison.OrdinalIgnoreCase);
        public long? AmountMinor { get; init; }
        public long? CustomerId { get; init; }
        public string? CustomerCode { get; init; }
        public string? Email { get; init; }
        // Our correlation ids passed through init metadata.
        public long? LocalSubscriptionId { get; init; }
        public string? PlanCode { get; init; }
        // The reusable card token + card summary from the first charge. Path A
        // stores these so it can renew (charge_authorization) and show the
        // card on file without a Paystack subscription to read from.
        public string? AuthorizationCode { get; init; }
        public string? CardBrand { get; init; }
        public string? CardLast4 { get; init; }
        public int? CardExpMonth { get; init; }
        public int? CardExpYear { get; init; }
    }

    // A direct charge against a saved authorization (reusable card token).
    public record PaystackChargeRequest
    {
        public required string Email { get; init; }
        public required long AmountMinor { get; init; }
        public required string AuthorizationCode { get; init; }
        public string Currency { get; init; } = "ZAR";
        public IDictionary<string, string>? Metadata { get; init; }
    }

    public record PaystackChargeResult
    {
        public bool Success { get; init; }
        // Paystack transaction status: "success", "failed", "send_otp", ...
        public string? Status { get; init; }
        public string? Reference { get; init; }
        public string? GatewayResponse { get; init; }
        // The authorization can rotate (card re-tokenised); capture the latest.
        public string? AuthorizationCode { get; init; }
        public string? CardBrand { get; init; }
        public string? CardLast4 { get; init; }
        public int? CardExpMonth { get; init; }
        public int? CardExpYear { get; init; }
    }
}
