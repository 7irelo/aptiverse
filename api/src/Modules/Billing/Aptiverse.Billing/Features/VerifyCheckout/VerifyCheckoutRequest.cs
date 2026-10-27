namespace Aptiverse.Billing.Features.VerifyCheckout;

/// <param name="Reference">The reference from startCheckout (Paystack appends it to the callback URL).</param>
internal sealed record VerifyCheckoutRequest(string Reference);

/// <param name="Status">"paid", "pending", "failed" or "abandoned".</param>
/// <param name="SubscriptionStatus">The subscription's status after the payment was applied.</param>
/// <param name="PlanCode">The plan bought.</param>
internal sealed record CheckoutStatus(string Status, string? SubscriptionStatus, string PlanCode);
