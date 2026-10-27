namespace Aptiverse.Billing.Features.StartCheckout;

/// <param name="PlanCode">A public, active, paid plan for your role, for example "student.pro".</param>
/// <param name="Interval">"monthly" or "annual".</param>
internal sealed record StartCheckoutRequest(string PlanCode, string Interval);

/// <param name="CheckoutSessionId">Our checkout session.</param>
/// <param name="Reference">Paystack reference; send it to verifyCheckout from the welcome page.</param>
/// <param name="AuthorizationUrl">Paystack's hosted checkout. Redirect the payer here.</param>
/// <param name="ExpiresAt">After this the checkout is abandoned.</param>
internal sealed record CheckoutStartedResponse(Guid CheckoutSessionId, string Reference, string AuthorizationUrl, DateTimeOffset ExpiresAt);
