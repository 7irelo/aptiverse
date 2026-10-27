using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Billing.Domain;

/// <summary>
/// Units used and held for one subject, quota key and period. Reservations move units from reserved to used (or
/// release them); used always equals the sum of the feature_usage ledger rows for the meter.
/// </summary>
internal sealed class UsageMeter : Entity
{
    private UsageMeter()
    {
    }

    public string SubjectType { get; private set; } = MeterSubjects.User;

    public Guid SubjectId { get; private set; }

    public string QuotaKey { get; private set; } = string.Empty;

    public DateTimeOffset PeriodStart { get; private set; }

    public DateTimeOffset PeriodEnd { get; private set; }

    public int Used { get; private set; }

    public int Reserved { get; private set; }

    public void Release(int amount) => Reserved = Math.Max(0, Reserved - amount);

    public void Charge(int amount) => Used = checked(Used + amount);
}

internal sealed class UsageReservation : Entity
{
    public const int CorrelationMaxLength = 100;

    private UsageReservation()
    {
    }

    public Guid MeterId { get; private set; }

    public Guid UserId { get; private set; }

    public string QuotaKey { get; private set; } = string.Empty;

    public int Amount { get; private set; }

    public string Status { get; private set; } = ReservationStatuses.Reserved;

    public int? ConfirmedAmount { get; private set; }

    public string Correlation { get; private set; } = string.Empty;

    public DateTimeOffset ExpiresAt { get; private set; }

    public DateTimeOffset? ResolvedAt { get; private set; }

    public static UsageReservation Hold(Guid meterId, Guid userId, string quotaKey, int amount, string correlation, DateTimeOffset expiresAt) => new()
    {
        MeterId = meterId,
        UserId = userId,
        QuotaKey = quotaKey,
        Amount = amount,
        Status = ReservationStatuses.Reserved,
        Correlation = correlation.Length <= CorrelationMaxLength ? correlation : correlation[..CorrelationMaxLength],
        ExpiresAt = expiresAt,
    };

    public void Resolve(string status, int? confirmedAmount, DateTimeOffset now)
    {
        Status = status;
        ConfirmedAmount = confirmedAmount;
        ResolvedAt = now;
    }
}

/// <summary>Append-only usage ledger. delta_used is positive on confirm and 0 on refund and expiry.</summary>
internal sealed class FeatureUsage : Entity
{
    private FeatureUsage()
    {
    }

    public Guid MeterId { get; private set; }

    public Guid? ReservationId { get; private set; }

    public Guid UserId { get; private set; }

    public string QuotaKey { get; private set; } = string.Empty;

    public int DeltaUsed { get; private set; }

    public string Kind { get; private set; } = UsageKinds.Confirm;

    /// <summary>Provider cost reported for the work, in millionths of a US dollar (0 when not reported).</summary>
    public long CostUsdMicros { get; private set; }

    public DateTimeOffset OccurredAt { get; private set; }

    public static FeatureUsage Record(UsageReservation reservation, string kind, int deltaUsed, long costUsdMicros, DateTimeOffset now)
    {
        ArgumentNullException.ThrowIfNull(reservation);
        return new()
        {
            MeterId = reservation.MeterId,
            ReservationId = reservation.Id,
            UserId = reservation.UserId,
            QuotaKey = reservation.QuotaKey,
            DeltaUsed = deltaUsed,
            Kind = kind,
            CostUsdMicros = Math.Max(0, costUsdMicros),
            OccurredAt = now,
        };
    }
}
