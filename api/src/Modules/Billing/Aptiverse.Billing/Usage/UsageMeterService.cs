using System.Data.Common;
using Aptiverse.Billing.Contracts;
using Aptiverse.Billing.Domain;
using Aptiverse.Billing.Entitlements;
using Aptiverse.Billing.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wolverine;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Billing.Usage;

/// <summary>
/// The meter behind <see cref="IUsageMeter"/>. Reserve is one atomic conditional update (no read then write), so
/// parallel reservations can never overshoot the limit; the reservation row and its expiry message commit in the
/// same transaction. Confirm, refund and expiry lock the reservation and then the meter, write the ledger row, and
/// leave a resolved reservation alone. Invariant: a meter's used equals the sum of its feature_usage delta_used.
/// </summary>
internal sealed partial class UsageMeterService(
    IDbContextOutbox<BillingDbContext> outbox,
    PlanAccess access,
    IClock clock,
    ILogger<UsageMeterService> logger) : IUsageMeter
{
    public static readonly TimeSpan DefaultHold = TimeSpan.FromMinutes(15);
    public static readonly TimeSpan MinHold = TimeSpan.FromMinutes(1);
    public static readonly TimeSpan MaxHold = TimeSpan.FromHours(24);
    public const int MaxAmount = 10_000;

    private BillingDbContext Db => outbox.DbContext;

    public Task<ReserveOutcome> ReserveAsync(Guid userId, string quotaKey, int amount, string correlation, CancellationToken cancellationToken) =>
        ReserveAsync(userId, quotaKey, amount, correlation, DefaultHold, cancellationToken);

    public async Task<ReserveOutcome> ReserveAsync(
        Guid userId, string quotaKey, int amount, string correlation, TimeSpan holdFor, CancellationToken cancellationToken)
    {
        if (!QuotaKeys.All.Contains(quotaKey))
        {
            throw new ArgumentException($"Unknown quota key {quotaKey}.", nameof(quotaKey));
        }

        ArgumentOutOfRangeException.ThrowIfLessThan(amount, 1);
        ArgumentOutOfRangeException.ThrowIfGreaterThan(amount, MaxAmount);
        ArgumentException.ThrowIfNullOrWhiteSpace(correlation);
        if (holdFor < MinHold || holdFor > MaxHold)
        {
            throw new ArgumentOutOfRangeException(nameof(holdFor), "A reservation is held for 1 minute to 24 hours.");
        }

        var now = clock.UtcNow;
        var (periodStart, periodEnd) = UsagePeriods.For(now);
        try
        {
            var limit = await access.LimitAsync(userId, quotaKey, cancellationToken);
            if (limit == 0)
            {
                BillingMetrics.QuotaExhausted(quotaKey);
                return new ReserveOutcome(ReserveStatus.Exhausted, null, quotaKey, 0, periodEnd);
            }

            var sqlLimit = limit ?? -1;
            await using var transaction = await Db.Database.BeginTransactionAsync(cancellationToken);
            var newId = Guid.CreateVersion7();
            await Db.Database.ExecuteSqlAsync(
                $"""
                INSERT INTO billing.usage_meters (id, subject_type, subject_id, quota_key, period_start, period_end, used, reserved, created_at, updated_at)
                VALUES ({newId}, 'user', {userId}, {quotaKey}, {periodStart}, {periodEnd}, 0, 0, {now}, {now})
                ON CONFLICT (subject_type, subject_id, quota_key, period_start) DO NOTHING
                """,
                cancellationToken);

            var held = await Db.Database.SqlQuery<Guid>(
                $"""
                UPDATE billing.usage_meters
                SET reserved = reserved + {amount}, updated_at = {now}
                WHERE subject_type = 'user' AND subject_id = {userId} AND quota_key = {quotaKey} AND period_start = {periodStart}
                  AND ({sqlLimit} < 0 OR used + reserved + {amount} <= {sqlLimit})
                RETURNING id AS "Value"
                """).ToListAsync(cancellationToken);

            if (held.Count == 0)
            {
                await transaction.RollbackAsync(cancellationToken);
                BillingMetrics.QuotaExhausted(quotaKey);
                return new ReserveOutcome(ReserveStatus.Exhausted, null, quotaKey, 0, periodEnd);
            }

            var meter = await Db.UsageMeters.AsNoTracking().SingleAsync(m => m.Id == held[0], cancellationToken);
            var reservation = UsageReservation.Hold(meter.Id, userId, quotaKey, amount, correlation, now + holdFor);
            Db.UsageReservations.Add(reservation);
            await outbox.ScheduleAsync(new ExpireUsageReservation(reservation.Id), holdFor);
            await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
            if (Db.Database.CurrentTransaction is not null)
            {
                await transaction.CommitAsync(cancellationToken);
            }

            int? remaining = limit is { } max ? Math.Max(0, max - meter.Used - meter.Reserved) : null;
            return new ReserveOutcome(ReserveStatus.Reserved, reservation.Id, quotaKey, remaining, periodEnd);
        }
        catch (Exception ex) when (IsUnavailable(ex))
        {
            // Fails closed: no reservation means no work.
            Db.ChangeTracker.Clear();
            LogUnavailable(logger, quotaKey, ex);
            return new ReserveOutcome(ReserveStatus.Unavailable, null, quotaKey, null, periodEnd);
        }
    }

    public Task<bool> ConfirmAsync(Guid reservationId, int actualAmount, long costUsdMicros, CancellationToken cancellationToken)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(actualAmount);
        ArgumentOutOfRangeException.ThrowIfGreaterThan(actualAmount, MaxAmount);
        return ResolveAsync(reservationId, (reservation, meter, now) =>
        {
            switch (reservation.Status)
            {
                case ReservationStatuses.Reserved:
                    meter.Release(reservation.Amount);
                    break;
                case ReservationStatuses.Expired:
                    // Its hold was already released; the work was still done, so it is still charged.
                    break;
                default:
                    return false;
            }

            meter.Charge(actualAmount);
            reservation.Resolve(ReservationStatuses.Confirmed, actualAmount, now);
            Db.FeatureUsage.Add(FeatureUsage.Record(reservation, UsageKinds.Confirm, actualAmount, costUsdMicros, now));
            return true;
        }, cancellationToken);
    }

    public Task<bool> RefundAsync(Guid reservationId, string reason, CancellationToken cancellationToken) =>
        ResolveAsync(reservationId, (reservation, meter, now) =>
        {
            if (reservation.Status != ReservationStatuses.Reserved)
            {
                return false;
            }

            meter.Release(reservation.Amount);
            reservation.Resolve(ReservationStatuses.Refunded, null, now);
            Db.FeatureUsage.Add(FeatureUsage.Record(reservation, UsageKinds.Refund, 0, 0, now));
            return true;
        }, cancellationToken);

    /// <summary>Releases a reservation still held after its expiry. A stale or early message changes nothing.</summary>
    public Task<bool> ExpireAsync(Guid reservationId, CancellationToken cancellationToken) =>
        ResolveAsync(reservationId, (reservation, meter, now) =>
        {
            if (reservation.Status != ReservationStatuses.Reserved || reservation.ExpiresAt > now)
            {
                return false;
            }

            meter.Release(reservation.Amount);
            reservation.Resolve(ReservationStatuses.Expired, null, now);
            Db.FeatureUsage.Add(FeatureUsage.Record(reservation, UsageKinds.Expire, 0, 0, now));
            BillingMetrics.ReservationExpired(reservation.QuotaKey);
            return true;
        }, cancellationToken);

    public async Task<UsageSnapshot> GetAsync(Guid userId, string quotaKey, CancellationToken cancellationToken)
    {
        var (periodStart, periodEnd) = UsagePeriods.For(clock.UtcNow);
        var limit = await access.LimitAsync(userId, quotaKey, cancellationToken);
        var meter = await Db.UsageMeters.AsNoTracking()
            .SingleOrDefaultAsync(
                m => m.SubjectType == MeterSubjects.User && m.SubjectId == userId && m.QuotaKey == quotaKey && m.PeriodStart == periodStart,
                cancellationToken);
        return new UsageSnapshot(quotaKey, meter?.Used ?? 0, meter?.Reserved ?? 0, limit, limit is null, periodEnd);
    }

    /// <summary>Locks the reservation, then its meter, applies the change and commits. True when the reservation exists.</summary>
    private async Task<bool> ResolveAsync(
        Guid reservationId, Func<UsageReservation, UsageMeter, DateTimeOffset, bool> apply, CancellationToken cancellationToken)
    {
        await using var transaction = await Db.Database.BeginTransactionAsync(cancellationToken);
        var reservation = await Db.UsageReservations
            .FromSql($"SELECT *, xmin FROM billing.usage_reservations WHERE id = {reservationId} FOR UPDATE")
            .SingleOrDefaultAsync(cancellationToken);
        if (reservation is null)
        {
            return false;
        }

        var meter = await Db.UsageMeters
            .FromSql($"SELECT *, xmin FROM billing.usage_meters WHERE id = {reservation.MeterId} FOR UPDATE")
            .SingleAsync(cancellationToken);

        if (apply(reservation, meter, clock.UtcNow))
        {
            await Db.SaveChangesAsync(cancellationToken);
        }

        await transaction.CommitAsync(cancellationToken);
        return true;
    }

    private static bool IsUnavailable(Exception exception) =>
        exception is DbException or DbUpdateException or InvalidOperationException or TimeoutException;

    [LoggerMessage(Level = LogLevel.Error, Message = "The usage meter for {QuotaKey} is unavailable; refusing the work")]
    private static partial void LogUnavailable(ILogger logger, string quotaKey, Exception exception);
}
