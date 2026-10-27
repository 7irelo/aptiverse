namespace Aptiverse.Billing.Domain;

internal static class Currencies
{
    public const string Zar = "ZAR";
    public const int Length = 3;
}

internal static class PlanKinds
{
    public const string Free = "free";
    public const string Paid = "paid";
    public const string Custom = "custom";

    public static IReadOnlyList<string> All { get; } = [Free, Paid, Custom];
}

internal static class Audiences
{
    public const string Student = "student";
    public const string Parent = "parent";

    public static IReadOnlyList<string> All { get; } = [Student, Parent];
}

internal static class Intervals
{
    public const string Monthly = "monthly";
    public const string Annual = "annual";

    public static IReadOnlyList<string> All { get; } = [Monthly, Annual];

    public static DateTimeOffset Advance(DateTimeOffset from, string interval) =>
        interval == Annual ? from.AddYears(1) : from.AddMonths(1);

    /// <summary>Paystack's name for the interval.</summary>
    public static string ToPaystack(string interval) => interval == Annual ? "annually" : "monthly";
}

internal static class PlanCodes
{
    public const string Free = "free";
    public const string StudentPro = "student.pro";
    public const string StudentMax = "student.max";
    public const int MaxLength = 40;
}

internal static class SubscriptionStatuses
{
    public const string Incomplete = "incomplete";
    public const string Trialing = "trialing";
    public const string Active = "active";
    public const string PastDue = "past_due";

    /// <summary>Paystack's "non-renewing": access continues to the period end, then it ends.</summary>
    public const string Cancelling = "cancelling";
    public const string Paused = "paused";
    public const string Cancelled = "cancelled";
    public const string Expired = "expired";

    public const int MaxLength = 16;

    public static IReadOnlyList<string> All { get; } = [Incomplete, Trialing, Active, PastDue, Cancelling, Paused, Cancelled, Expired];

    /// <summary>Statuses that hold the one-per-audience slot (partial unique index).</summary>
    public static IReadOnlyList<string> Holding { get; } = [Trialing, Active, PastDue, Cancelling];

    public static bool IsEntitled(string status, DateTimeOffset? periodEnd, DateTimeOffset now) => status switch
    {
        Active or PastDue or Trialing => true,
        Cancelling or Paused => periodEnd is null || periodEnd > now,
        _ => false,
    };
}

internal static class TriggerTypes
{
    public const string Webhook = "webhook";
    public const string User = "user";
    public const string Scheduler = "scheduler";
    public const string Admin = "admin";
    public const string Reconciliation = "reconciliation";

    public static IReadOnlyList<string> All { get; } = [Webhook, User, Scheduler, Admin, Reconciliation];
}

internal static class CheckoutStatuses
{
    public const string Open = "open";
    public const string Paid = "paid";
    public const string Abandoned = "abandoned";
    public const string Failed = "failed";

    public static IReadOnlyList<string> All { get; } = [Open, Paid, Abandoned, Failed];
}

internal static class CheckoutPurposes
{
    public const string Subscription = "subscription";
    public const string Upgrade = "upgrade";
    public const string OneOff = "one_off";

    public static IReadOnlyList<string> All { get; } = [Subscription, Upgrade, OneOff];
}

internal static class PaymentStatuses
{
    public const string Succeeded = "succeeded";
    public const string Failed = "failed";
    public const string Reversed = "reversed";

    public static IReadOnlyList<string> All { get; } = [Succeeded, Failed, Reversed];
}

internal static class PaymentPurposes
{
    public const string Subscription = "subscription";
    public const string Renewal = "renewal";
    public const string Upgrade = "upgrade";
    public const string OneOff = "one_off";

    public static IReadOnlyList<string> All { get; } = [Subscription, Renewal, Upgrade, OneOff];
}

internal static class RefundStatuses
{
    public const string Pending = "pending";
    public const string Processed = "processed";
    public const string Failed = "failed";

    public static IReadOnlyList<string> All { get; } = [Pending, Processed, Failed];
}

internal static class InvoiceStatuses
{
    public const string Paid = "paid";
    public const string Refunded = "refunded";
    public const string PartiallyRefunded = "partially_refunded";
    public const string Void = "void";

    public static IReadOnlyList<string> All { get; } = [Paid, Refunded, PartiallyRefunded, Void];
}

internal static class LedgerKinds
{
    /// <summary>Money received. Positive amount.</summary>
    public const string Charge = "charge";

    /// <summary>Money returned to the payer. Negative amount.</summary>
    public const string Refund = "refund";

    /// <summary>Goodwill or correction owed to the payer. Negative amount.</summary>
    public const string Credit = "credit";

    public static IReadOnlyList<string> All { get; } = [Charge, Refund, Credit];
}

internal static class InboxStatuses
{
    public const string Pending = "pending";
    public const string Processing = "processing";
    public const string Processed = "processed";
    public const string Ignored = "ignored";
    public const string Failed = "failed";

    public static IReadOnlyList<string> All { get; } = [Pending, Processing, Processed, Ignored, Failed];
}

internal static class InboxSources
{
    public const string Webhook = "webhook";
    public const string Reconciliation = "reconciliation";

    public static IReadOnlyList<string> All { get; } = [Webhook, Reconciliation];
}

internal static class MeterSubjects
{
    public const string User = "user";
    public const string Subscription = "subscription";

    public static IReadOnlyList<string> All { get; } = [User, Subscription];
}

internal static class ReservationStatuses
{
    public const string Reserved = "reserved";
    public const string Confirmed = "confirmed";
    public const string Refunded = "refunded";
    public const string Expired = "expired";

    public static IReadOnlyList<string> All { get; } = [Reserved, Confirmed, Refunded, Expired];
}

internal static class UsageKinds
{
    public const string Confirm = "confirm";
    public const string Refund = "refund";
    public const string Expire = "expire";
    public const string AdminAdjust = "admin_adjust";

    public static IReadOnlyList<string> All { get; } = [Confirm, Refund, Expire, AdminAdjust];
}

internal static class DriftKinds
{
    public const string MissingLocalPayment = "missing_local_payment";
    public const string MissingRemotePayment = "missing_remote_payment";
    public const string AmountMismatch = "amount_mismatch";
    public const string StatusMismatch = "status_mismatch";
    public const string SubscriptionStatusMismatch = "subscription_status_mismatch";
    public const string UnprocessedEvent = "unprocessed_event";
    public const string UnmatchedCharge = "unmatched_charge";
    public const string RefundExceedsPayment = "refund_exceeds_payment";

    public static IReadOnlyList<string> All { get; } =
        [MissingLocalPayment, MissingRemotePayment, AmountMismatch, StatusMismatch, SubscriptionStatusMismatch, UnprocessedEvent, UnmatchedCharge, RefundExceedsPayment];
}

internal static class RunStatuses
{
    public const string Running = "running";
    public const string Succeeded = "succeeded";
    public const string Failed = "failed";

    public static IReadOnlyList<string> All { get; } = [Running, Succeeded, Failed];
}

internal static class RunTriggers
{
    public const string Scheduled = "scheduled";
    public const string Admin = "admin";

    public static IReadOnlyList<string> All { get; } = [Scheduled, Admin];
}
