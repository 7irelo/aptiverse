using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Entitlements.Domain.Models
{
    // Per-user, per-month consumption of a metered feature. The
    // (UserId, QuotaKey, PeriodStart) tuple is unique — one row per
    // billing period per quota bucket per user.
    //
    // PeriodStart is always the first UTC day of the calendar month.
    // Rolls over automatically — a new row is created the first time
    // a user consumes anything in a new month. Old rows stay for
    // analytics / billing-reconciliation later.
    //
    // The lookups in UsageMeter all filter on (UserId, QuotaKey,
    // PeriodStart), so a composite index on that exact tuple covers
    // every read and the upsert path.
    [Index(nameof(UserId), nameof(QuotaKey), nameof(PeriodStart))]
    public class FeatureUsage : IEntityTimestamps
    {
        public long Id { get; set; }
        public required string UserId { get; set; }
        public required string QuotaKey { get; set; }
        public DateTime PeriodStart { get; set; }
        public int Used { get; set; }

        // Stamped on first insert by AuditableEntityInterceptor (the row
        // is created the first time a user consumes in a new period).
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Already maintained manually in UsageMeter; the interceptor now
        // also bumps it on every Modified save (consistent + harmless).
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
