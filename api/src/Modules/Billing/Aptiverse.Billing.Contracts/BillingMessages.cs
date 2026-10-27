namespace Aptiverse.Billing.Contracts;

// Work messages that only the Billing module sends and handles. They live here, not in the module, because Wolverine
// handlers must be public and the architecture rules allow a public handler only for a Contracts message. Other
// modules must never send them.

/// <summary>Billing only: process one stored Paystack event from the inbox.</summary>
public sealed record ProcessPaystackEvent(Guid EventId);

/// <summary>Billing only: release a usage reservation that nobody confirmed or refunded in time.</summary>
public sealed record ExpireUsageReservation(Guid ReservationId);

/// <summary>Billing only: abandon an unpaid checkout session at its expiry.</summary>
public sealed record ExpireCheckoutSession(Guid CheckoutSessionId);

/// <summary>Billing only: end a cancelling subscription at its period end. Stale when the period end moved.</summary>
public sealed record EndSubscriptionPeriod(Guid SubscriptionId, DateTimeOffset PeriodEnd);

/// <summary>Billing only: end a past due subscription when the grace period ran out without a successful charge.</summary>
public sealed record CheckPastDueSubscription(Guid SubscriptionId, DateTimeOffset PastDueSince);

/// <summary>Billing only: the nightly reconciliation against the Paystack transaction list.</summary>
public sealed record RunPaystackReconciliation(DateOnly ScheduledFor);
