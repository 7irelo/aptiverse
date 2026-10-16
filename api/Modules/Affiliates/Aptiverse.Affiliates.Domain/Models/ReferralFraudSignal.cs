using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Affiliates.Domain.Models
{
    public enum FraudSignalSeverity
    {
        // Strong enough to refuse outright. Only self-referral on the same
        // account qualifies: it is not a judgement call.
        Block,
        // Suspicious. The referral is flagged, commission accrues but parks as
        // Pending, and an admin decides. Never silently paid, never silently
        // discarded either.
        Review,
    }

    // Why a referral was blocked or flagged, kept as its own row so the
    // decision can be explained later rather than inferred from a status.
    [Index(nameof(AffiliateId))]
    [Index(nameof(ReferralId))]
    [Index(nameof(SignalType))]
    public class ReferralFraudSignal
    {
        public long Id { get; set; }

        public long AffiliateId { get; set; }
        // Null when the referral was refused outright and therefore never
        // created.
        public long? ReferralId { get; set; }

        // self_referral_user | self_referral_email | shared_card_fingerprint |
        // shared_device | shared_ip
        public required string SignalType { get; set; }

        public FraudSignalSeverity Severity { get; set; } = FraudSignalSeverity.Review;

        // Human-readable, and deliberately not the raw sensitive value: a card
        // fingerprint match is recorded as a match, not as the fingerprint.
        public string? Detail { get; set; }

        public string? SubjectUserId { get; set; }

        public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
    }
}
