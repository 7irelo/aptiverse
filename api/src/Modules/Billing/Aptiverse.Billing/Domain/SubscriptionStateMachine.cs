using Aptiverse.SharedKernel.Results;
using S = Aptiverse.Billing.Domain.SubscriptionStatuses;

namespace Aptiverse.Billing.Domain;

/// <summary>
/// The subscription state machine from the billing spec, as a pure table. Every status change goes through
/// <see cref="Next"/>; a pair that is not in the table is refused with billing.illegal_transition. A null from means
/// the subscription does not exist yet.
/// </summary>
internal static class SubscriptionStateMachine
{
    public const string CheckoutStarted = "T01";
    public const string FirstPayment = "T02";
    public const string CheckoutExpired = "T03";
    public const string TrialStarted = "T04";
    public const string TrialPaid = "T05";
    public const string TrialEnded = "T06";
    public const string Renewed = "T07";
    public const string RenewalFailed = "T08";
    public const string RetrySucceeded = "T09";
    public const string GraceExhausted = "T10";
    public const string CancelRequested = "T11";
    public const string Resumed = "T12";
    public const string PeriodEnded = "T13";
    public const string DowngradeScheduled = "T14";
    public const string DowngradeApplied = "T15";
    public const string DowngradeCancelled = "T16";
    public const string Upgraded = "T17";
    public const string RetentionMarker = "T18";
    public const string Paused = "T19";
    public const string Unpaused = "T20";
    public const string Comped = "T21";

    public const int IdMaxLength = 8;

    public static IReadOnlyDictionary<string, (string? From, string To)> Table { get; } = new Dictionary<string, (string? From, string To)>(StringComparer.Ordinal)
    {
        [CheckoutStarted] = (null, S.Incomplete),
        [FirstPayment] = (S.Incomplete, S.Active),
        [CheckoutExpired] = (S.Incomplete, S.Expired),
        [TrialStarted] = (null, S.Trialing),
        [TrialPaid] = (S.Trialing, S.Active),
        [TrialEnded] = (S.Trialing, S.Expired),
        [Renewed] = (S.Active, S.Active),
        [RenewalFailed] = (S.Active, S.PastDue),
        [RetrySucceeded] = (S.PastDue, S.Active),
        [GraceExhausted] = (S.PastDue, S.Cancelled),
        [CancelRequested] = (S.Active, S.Cancelling),
        [Resumed] = (S.Cancelling, S.Active),
        [PeriodEnded] = (S.Cancelling, S.Cancelled),
        [DowngradeScheduled] = (S.Active, S.Active),
        [DowngradeApplied] = (S.Active, S.Active),
        [DowngradeCancelled] = (S.Active, S.Active),
        [Upgraded] = (S.Active, S.Active),
        [RetentionMarker] = (S.Cancelled, S.Expired),
        [Paused] = (S.Active, S.Paused),
        [Unpaused] = (S.Paused, S.Active),
        [Comped] = (null, S.Active),
    };

    public static Error IllegalTransition(string transition, string? from) => BillingErrors.IllegalTransition
        .With("transition", transition)
        .With("from", from);

    /// <summary>The status after <paramref name="transition"/>, or the refusal when it does not start at <paramref name="from"/>.</summary>
    public static Result<string> Next(string? from, string transition)
    {
        ArgumentNullException.ThrowIfNull(transition);
        return Table.TryGetValue(transition, out var row) && string.Equals(row.From, from, StringComparison.Ordinal)
            ? row.To
            : IllegalTransition(transition, from);
    }
}
