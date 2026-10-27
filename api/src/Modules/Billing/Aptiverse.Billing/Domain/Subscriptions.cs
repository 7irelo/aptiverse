using Aptiverse.SharedKernel.Domain;
using Aptiverse.SharedKernel.Results;

namespace Aptiverse.Billing.Domain;

/// <summary>
/// One paid subscription. Status only changes through <see cref="Apply"/>, which consults the state machine and returns
/// the append-only transition row to save with it. A user holds at most one subscription per audience in a holding
/// status (partial unique index).
/// </summary>
internal sealed class Subscription : Entity
{
    public const int PaystackCodeMaxLength = 40;
    public const int CancelReasonMaxLength = 32;

    private Subscription()
    {
    }

    public Guid OwnerUserId { get; private set; }

    public string Audience { get; private set; } = Audiences.Student;

    public Guid PlanId { get; private set; }

    public Guid? PlanPriceId { get; private set; }

    public string Status { get; private set; } = SubscriptionStatuses.Incomplete;

    public string? Interval { get; private set; }

    public DateTimeOffset? CurrentPeriodStart { get; private set; }

    public DateTimeOffset? CurrentPeriodEnd { get; private set; }

    public DateTimeOffset? PastDueSince { get; private set; }

    public int RenewalFailureCount { get; private set; }

    public DateTimeOffset? CancelledAt { get; private set; }

    public string? CancelReason { get; private set; }

    public DateTimeOffset? EndedAt { get; private set; }

    public string? PaystackSubscriptionCode { get; private set; }

    /// <summary>Paystack's customer code: a pseudonymous id, never the email.</summary>
    public string? PaystackCustomerCode { get; private set; }

    /// <summary>T01: a new subscription waiting for its first payment.</summary>
    public static (Subscription Subscription, SubscriptionTransition Transition) Start(
        Guid ownerUserId, Plan plan, PlanPrice price, string triggerRef, DateTimeOffset now)
    {
        ArgumentNullException.ThrowIfNull(plan);
        ArgumentNullException.ThrowIfNull(price);
        var subscription = new Subscription
        {
            OwnerUserId = ownerUserId,
            Audience = plan.Audience,
            PlanId = plan.Id,
            PlanPriceId = price.Id,
            Interval = price.Interval,
            Status = SubscriptionStatuses.Incomplete,
        };
        var transition = SubscriptionTransition.Record(
            subscription.Id, null, SubscriptionStatuses.Incomplete, SubscriptionStateMachine.CheckoutStarted, TriggerTypes.User, triggerRef, now);
        return (subscription, transition);
    }

    public bool IsEntitled(DateTimeOffset now) => SubscriptionStatuses.IsEntitled(Status, CurrentPeriodEnd, now);

    /// <summary>Moves to the next status per the state machine; the caller saves the returned row with the change.</summary>
    public Result<SubscriptionTransition> Apply(string transition, string triggerType, string? triggerRef, DateTimeOffset now)
    {
        var next = SubscriptionStateMachine.Next(Status, transition);
        if (next.IsFailure)
        {
            return next.Error!;
        }

        var from = Status;
        Status = next.Value;
        return SubscriptionTransition.Record(Id, from, Status, transition, triggerType, triggerRef, now);
    }

    public void StartPeriod(DateTimeOffset start)
    {
        CurrentPeriodStart = start;
        CurrentPeriodEnd = Intervals.Advance(start, Interval ?? Intervals.Monthly);
        PastDueSince = null;
        RenewalFailureCount = 0;
    }

    /// <summary>A renewal extends from the end of the paid period, so paying early never loses days.</summary>
    public void ExtendPeriod(DateTimeOffset paidAt)
    {
        var start = CurrentPeriodEnd is { } end && end > paidAt ? end : paidAt;
        StartPeriod(start);
    }

    public void LinkPaystack(string? customerCode, string? subscriptionCode)
    {
        PaystackCustomerCode = string.IsNullOrWhiteSpace(customerCode) ? PaystackCustomerCode : customerCode;
        PaystackSubscriptionCode = string.IsNullOrWhiteSpace(subscriptionCode) ? PaystackSubscriptionCode : subscriptionCode;
    }

    public void RecordRenewalFailure(DateTimeOffset now)
    {
        RenewalFailureCount++;
        PastDueSince ??= now;
    }

    public void MarkCancelling(string reason, DateTimeOffset now)
    {
        CancelledAt = now;
        CancelReason = reason.Length <= CancelReasonMaxLength ? reason : reason[..CancelReasonMaxLength];
    }

    public void ClearCancellation()
    {
        CancelledAt = null;
        CancelReason = null;
    }

    public void MarkEnded(DateTimeOffset now) => EndedAt ??= now;
}

/// <summary>Append-only audit of every status change, with what triggered it.</summary>
internal sealed class SubscriptionTransition : Entity
{
    public const int TriggerRefMaxLength = 100;

    private SubscriptionTransition()
    {
    }

    public Guid SubscriptionId { get; private set; }

    public string? FromStatus { get; private set; }

    public string ToStatus { get; private set; } = string.Empty;

    public string Transition { get; private set; } = string.Empty;

    public string TriggerType { get; private set; } = TriggerTypes.User;

    public string? TriggerRef { get; private set; }

    public DateTimeOffset OccurredAt { get; private set; }

    public static SubscriptionTransition Record(
        Guid subscriptionId, string? from, string to, string transition, string triggerType, string? triggerRef, DateTimeOffset now) => new()
        {
            SubscriptionId = subscriptionId,
            FromStatus = from,
            ToStatus = to,
            Transition = transition,
            TriggerType = triggerType,
            TriggerRef = triggerRef is { Length: > TriggerRefMaxLength } ? triggerRef[..TriggerRefMaxLength] : triggerRef,
            OccurredAt = now,
        };
}

/// <summary>One Paystack checkout. The reference is generated here and the amount comes from the price row, never the client.</summary>
internal sealed class CheckoutSession : Entity
{
    public const int ReferenceMaxLength = 64;
    public const int AccessCodeMaxLength = 64;
    public const int AuthorizationUrlMaxLength = 500;
    public const int IdempotencyKeyMaxLength = 64;

    private CheckoutSession()
    {
    }

    public Guid UserId { get; private set; }

    public string Purpose { get; private set; } = CheckoutPurposes.Subscription;

    public Guid? PlanPriceId { get; private set; }

    public Guid? SubscriptionId { get; private set; }

    public string Reference { get; private set; } = string.Empty;

    public string? AccessCode { get; private set; }

    public string? AuthorizationUrl { get; private set; }

    public long AmountCents { get; private set; }

    public string Currency { get; private set; } = Currencies.Zar;

    public string Status { get; private set; } = CheckoutStatuses.Open;

    public DateTimeOffset ExpiresAt { get; private set; }

    public string? IdempotencyKey { get; private set; }

    public static string NewReference() => $"apt_{Guid.CreateVersion7():N}";

    public static CheckoutSession Open(
        Guid userId, PlanPrice price, Guid subscriptionId, string reference, string accessCode, string authorizationUrl, DateTimeOffset expiresAt, string? idempotencyKey)
    {
        ArgumentNullException.ThrowIfNull(price);
        return new()
        {
            UserId = userId,
            Purpose = CheckoutPurposes.Subscription,
            PlanPriceId = price.Id,
            SubscriptionId = subscriptionId,
            Reference = reference,
            AccessCode = accessCode.Length <= AccessCodeMaxLength ? accessCode : null,
            AuthorizationUrl = authorizationUrl,
            AmountCents = price.AmountCents,
            Currency = price.Currency,
            Status = CheckoutStatuses.Open,
            ExpiresAt = expiresAt,
            IdempotencyKey = idempotencyKey,
        };
    }

    public void MarkPaid() => Status = CheckoutStatuses.Paid;

    public void MarkFailed() => Status = Status == CheckoutStatuses.Open ? CheckoutStatuses.Failed : Status;

    public bool Abandon()
    {
        if (Status != CheckoutStatuses.Open)
        {
            return false;
        }

        Status = CheckoutStatuses.Abandoned;
        return true;
    }
}
