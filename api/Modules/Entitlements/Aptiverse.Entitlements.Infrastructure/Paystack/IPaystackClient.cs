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
}
