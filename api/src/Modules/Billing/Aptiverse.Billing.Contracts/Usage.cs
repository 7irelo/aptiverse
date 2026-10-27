namespace Aptiverse.Billing.Contracts;

/// <summary>
/// Quota metering for paid allowances. Callers reserve before the expensive work (the reservation commits in its own
/// transaction, so no transaction ever spans a network call), confirm with the amount actually used, and refund when
/// the work failed or was cancelled. A reservation nobody resolves is released by a scheduled message when it expires.
/// The meter fails closed: when it cannot be read, the reserve answers <see cref="ReserveStatus.Unavailable"/> and
/// the caller must refuse the work, never run it for free.
/// </summary>
public interface IUsageMeter
{
    /// <summary>Reserves <paramref name="amount"/> units, held for the default 15 minutes.</summary>
    Task<ReserveOutcome> ReserveAsync(Guid userId, string quotaKey, int amount, string correlation, CancellationToken cancellationToken);

    /// <summary>Reserves <paramref name="amount"/> units held for <paramref name="holdFor"/> (1 minute to 24 hours), for long background work.</summary>
    Task<ReserveOutcome> ReserveAsync(Guid userId, string quotaKey, int amount, string correlation, TimeSpan holdFor, CancellationToken cancellationToken);

    /// <summary>
    /// Moves the reservation to used with the actual amount (0 or more) and records the provider cost on the usage
    /// ledger. Idempotent: a reservation that is already confirmed or refunded is left as it is. A reservation that
    /// already expired is still charged, because the work was done. Returns false for an unknown id. Throws when the
    /// meter cannot be written, so a background caller retries.
    /// </summary>
    Task<bool> ConfirmAsync(Guid reservationId, int actualAmount, long costUsdMicros, CancellationToken cancellationToken);

    /// <summary>Releases the reservation. Idempotent like <see cref="ConfirmAsync"/>. Returns false for an unknown id.</summary>
    Task<bool> RefundAsync(Guid reservationId, string reason, CancellationToken cancellationToken);

    /// <summary>The user's allowance for one quota key in the current period.</summary>
    Task<UsageSnapshot> GetAsync(Guid userId, string quotaKey, CancellationToken cancellationToken);
}

public enum ReserveStatus
{
    /// <summary>The units are held; resolve the reservation with confirm or refund.</summary>
    Reserved,

    /// <summary>The allowance for the period is used up, or the plan does not include this quota at all.</summary>
    Exhausted,

    /// <summary>The meter could not be read. Refuse the work.</summary>
    Unavailable,
}

/// <param name="Status">Whether the units were reserved.</param>
/// <param name="ReservationId">Set only when reserved.</param>
/// <param name="QuotaKey">The quota that was asked for.</param>
/// <param name="Remaining">Units left after this reservation; null when unlimited or unknown.</param>
/// <param name="ResetsAt">Start of the next period (calendar month in Africa/Johannesburg).</param>
public sealed record ReserveOutcome(ReserveStatus Status, Guid? ReservationId, string QuotaKey, int? Remaining, DateTimeOffset ResetsAt);

/// <param name="QuotaKey">The quota.</param>
/// <param name="Used">Confirmed units this period.</param>
/// <param name="Reserved">Units held by unresolved reservations.</param>
/// <param name="Limit">Units allowed this period; null when unlimited.</param>
/// <param name="Unlimited">True when any entitled plan grants unlimited use.</param>
/// <param name="ResetsAt">Start of the next period.</param>
public sealed record UsageSnapshot(string QuotaKey, int Used, int Reserved, int? Limit, bool Unlimited, DateTimeOffset ResetsAt);

/// <summary>Quota keys. Other modules use these constants, never string literals.</summary>
public static class QuotaKeys
{
    /// <summary>Standard tutor replies.</summary>
    public const string AiQuick = "ai.quick";

    /// <summary>Deep tutor replies.</summary>
    public const string AiDeep = "ai.deep";

    /// <summary>The help bot, so navigation questions never eat into tutor replies.</summary>
    public const string AiHelp = "ai.help";

    /// <summary>Generated practice tests.</summary>
    public const string PracticeGenerate = "practice.generate";

    /// <summary>Marked essay answers.</summary>
    public const string PracticeEssayFeedback = "practice.essay_feedback";

    public const int MaxLength = 40;

    public static IReadOnlyList<string> All { get; } = [AiQuick, AiDeep, AiHelp, PracticeGenerate, PracticeEssayFeedback];
}
