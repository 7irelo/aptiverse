using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Entitlements.Domain.Models
{
    // A subscription tier. Seeded as structural catalog data — not
    // user-editable. Pricing is for display only; actual billing is
    // handled by Paystack when a paid sign-up is in scope (separate
    // phase from the entitlement plumbing).
    //
    // Kind ("free" / "paid" / "custom") drives the sign-up CTA and is
    // filtered when listing plans by group, so index it.
    [Index(nameof(Kind))]
    public class Plan
    {
        // Plan.Code is the primary key (not a conventional Id) — string
        // slug like "free" / "student". [Key] tells EF this is the PK so
        // it can build FK relationships from PlanFeature.PlanCode and
        // Subscription.PlanCode.
        [Key]
        public required string Code { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }

        // Display-only. Null for plans with custom pricing (e.g. school).
        public decimal? MonthlyPriceZar { get; set; }
        public decimal? AnnualPriceZar { get; set; }

        // How many users a single subscription on this plan can entitle.
        // 1 for free/student; 4 for family (typical SA household);
        // higher for school. Enforced when adding members.
        public int MaxMembers { get; set; } = 1;

        // free / paid / custom — drives the sign-up CTA.
        public string Kind { get; set; } = "paid";

        // Marketplace commission on tutor bookings, expressed as 0.10 for
        // 10%. Null on non-marketplace plans (students, families, schools).
        // Used by the booking flow to compute the platform's cut. The
        // Tutor Free plan has a 15% cut; Pro halves it; Max waives it
        // entirely as the carrot for committing to a subscription.
        public decimal? CommissionPercent { get; set; }

        public virtual ICollection<PlanFeature> PlanFeatures { get; set; } = [];
    }
}
