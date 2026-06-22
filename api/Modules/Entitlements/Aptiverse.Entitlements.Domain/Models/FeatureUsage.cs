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
    public class FeatureUsage
    {
        public long Id { get; set; }
        public required string UserId { get; set; }
        public required string QuotaKey { get; set; }
        public DateTime PeriodStart { get; set; }
        public int Used { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
