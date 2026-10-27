using Aptiverse.SharedKernel.Results;

namespace Aptiverse.Billing.Domain;

/// <summary>Stable error codes of the Billing module. The web app switches on the code, so renaming one is a breaking change.</summary>
internal static class BillingErrors
{
    public static readonly Error PlanNotFound = Error.NotFound("billing.plan_not_found", "That plan or billing interval is not available.");

    public static readonly Error PlanNotSynced = Error.Conflict(
        "billing.plan_not_synced",
        "This plan cannot be bought yet. Please try again later.");

    public static readonly Error AlreadySubscribed = Error.Conflict(
        "billing.already_subscribed",
        "You already have an active subscription. Manage it from your billing settings.");

    public static readonly Error PayerMustBeAdult = Error.Forbidden(
        "billing.payer_must_be_adult",
        "Under-18s can pay only with a parent's recorded consent. Ask a parent to subscribe for you.");

    public static readonly Error ContactMissing = Error.Conflict(
        "billing.contact_missing",
        "Your account has no email address to send the receipt to.");

    public static readonly Error CheckoutUnavailable = Error.Unavailable(
        "billing.checkout_unavailable",
        "Payments are unavailable right now. Please try again in a few minutes.");

    public static readonly Error ProviderError = Error.BadGateway(
        "billing.provider_error",
        "The payment provider could not complete the request. Please try again.");

    public static readonly Error ProviderUnavailable = Error.Unavailable(
        "billing.provider_unavailable",
        "The payment provider is unavailable right now. Please try again in a few minutes.");

    public static readonly Error CheckoutNotFound = Error.NotFound("billing.checkout_not_found", "That checkout was not found.");

    public static readonly Error NoActiveSubscription = Error.Conflict(
        "billing.no_active_subscription",
        "You have no active subscription.");

    public static readonly Error CannotResume = Error.Conflict(
        "billing.cannot_resume",
        "This subscription cannot be resumed. It is not cancelling, or its period has already ended.");

    public static readonly Error IllegalTransition = Error.Conflict(
        "billing.illegal_transition",
        "The subscription cannot make that change from its current state.");

    public static readonly Error ConcurrencyConflict = Error.Conflict(
        "billing.concurrency_conflict",
        "The subscription changed at the same time. Please try again.");

    public static readonly Error WebhookBadSignature = Error.Unauthorized("billing.webhook_bad_signature", "The webhook signature is not valid.");

    public static readonly Error QuotaExhausted = Error.TooManyRequests("billing.quota_exhausted", "The allowance for this period is used up.");

    public static readonly Error QuotaUnavailable = Error.Unavailable("billing.quota_unavailable", "The allowance could not be checked. Please try again.");

    public static readonly Error InvalidIdempotencyKey = Error.Validation(
        "billing.invalid_idempotency_key",
        "The Idempotency-Key header must be 8 to 64 letters, digits, dashes or underscores.",
        new Dictionary<string, string[]> { ["Idempotency-Key"] = ["Use 8 to 64 letters, digits, dashes or underscores."] });
}
