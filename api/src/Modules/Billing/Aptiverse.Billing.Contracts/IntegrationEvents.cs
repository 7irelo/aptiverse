namespace Aptiverse.Billing.Contracts;

// Integration events published by Billing through the transactional outbox, in the same transaction as the money
// rows they describe. Amounts are integer cents in the given currency (always ZAR in v1).

/// <summary>A payment was verified with Paystack and recorded. Purpose is "subscription" or "renewal".</summary>
public sealed record PaymentSucceeded(
    Guid PaymentId,
    Guid UserId,
    Guid? SubscriptionId,
    string? PlanCode,
    long AmountCents,
    long VatCents,
    string Currency,
    string Purpose,
    bool IsFirstPaymentForUser,
    DateTimeOffset PaidAt);

/// <summary>A renewal charge failed. Reason is a stable code such as "invoice_payment_failed".</summary>
public sealed record PaymentFailed(Guid UserId, Guid? SubscriptionId, string Reason, DateTimeOffset OccurredAt);

/// <summary>A subscription became entitled after its first payment.</summary>
public sealed record SubscriptionActivated(
    Guid SubscriptionId,
    Guid UserId,
    string PlanCode,
    string Interval,
    DateTimeOffset CurrentPeriodEnd,
    DateTimeOffset OccurredAt);

/// <summary>
/// A subscription was set to end. EffectiveAt is when access stops: the period end for a cancellation at period end,
/// or the moment it ended. Reason is "user", "erasure", "past_due" or "paystack".
/// </summary>
public sealed record SubscriptionCancelled(
    Guid SubscriptionId,
    Guid UserId,
    string PlanCode,
    string Reason,
    DateTimeOffset EffectiveAt,
    DateTimeOffset OccurredAt);

/// <summary>Every change of subscription status, with the state machine transition id.</summary>
public sealed record SubscriptionStatusChanged(
    Guid SubscriptionId,
    Guid OwnerUserId,
    string PlanCode,
    string? FromStatus,
    string ToStatus,
    string Transition,
    DateTimeOffset OccurredAt);

/// <summary>Paystack processed a refund of a recorded payment.</summary>
public sealed record RefundIssued(
    Guid RefundId,
    Guid PaymentId,
    Guid UserId,
    long AmountCents,
    string Currency,
    bool IsFullRefund,
    DateTimeOffset ProcessedAt);
