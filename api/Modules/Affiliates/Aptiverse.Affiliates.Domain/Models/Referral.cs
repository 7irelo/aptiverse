using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Affiliates.Domain.Models
{
    public enum ReferralStatus
    {
        // Signed up through the link, has not paid yet. This is where most
        // referrals live, often for months, and the affiliate can see them.
        Signed,
        // At least one payment has produced commission.
        Earning,
        // All three commissionable payments have accrued. Nothing more will.
        Completed,
        // Something looked wrong. Commission accrues but is parked as Pending
        // until an admin clears or blocks it. Nothing is silently paid.
        Flagged,
        // Rejected on review, or blocked at claim time (self-referral).
        // Never earns.
        Blocked,
    }

    // One referred person, bound to one affiliate, for life.
    //
    // Created the moment the referred account is created, not when money
    // moves. The overwhelmingly common path is: click a link, sign up free,
    // use the product for weeks, then upgrade. If a referral only existed once
    // payment followed, the programme would pay out on almost nothing and
    // affiliates would conclude it was broken.
    //
    // ReferredUserId is unique: one referrer per referred user, fixed at
    // signup, first touch wins. A second code arriving later is ignored.
    [Index(nameof(ReferredUserId), IsUnique = true)]
    [Index(nameof(AffiliateId))]
    [Index(nameof(Status))]
    public class Referral : IEntityTimestamps
    {
        public long Id { get; set; }

        public long AffiliateId { get; set; }

        // identity.users.id of the person who was referred.
        public required string ReferredUserId { get; set; }

        // The code exactly as it was used. Snapshotted, so a later code change
        // does not rewrite what actually happened.
        public required string CodeUsed { get; set; }

        public ReferralStatus Status { get; set; } = ReferralStatus.Signed;

        // When the referral was recorded, which is at (or within seconds of)
        // account creation.
        public DateTime SignedUpAt { get; set; } = DateTime.UtcNow;

        // When the referred person first paid. This, not SignedUpAt, is what
        // opens the three-payment window.
        public DateTime? FirstPaymentAt { get; set; }
        public DateTime? CompletedAt { get; set; }

        // Where they landed, for the affiliate's own reporting.
        public string? LandingPath { get; set; }

        // Fraud review trail.
        public string? FlagReason { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewedByUserId { get; set; }
        public string? ReviewNotes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual Affiliate? Affiliate { get; set; }
    }
}
