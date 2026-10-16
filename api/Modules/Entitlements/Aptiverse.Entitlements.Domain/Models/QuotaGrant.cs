using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Entitlements.Domain.Models
{
    // A temporary top-up on one metered quota, earned rather than bought.
    //
    // A student who verifies a goal earns points; points buy a window of extra
    // allowance on something the platform can actually hand over: more deep-AI
    // sessions, more quick tutor exchanges, more generated practice tests.
    // That is the whole reason rewards are shaped this way. A prize we cannot
    // deliver is a lie with a countdown on it, whereas raising a number we
    // already enforce costs us only inference and always works.
    //
    // Lives in Entitlements, not Goals, because UsageMeter has to read it on
    // every metered call and Entitlements.Application cannot reference another
    // module's domain. Goals only ever writes these, and it does that from the
    // host, which is allowed to see both.
    //
    // Temporary by design. A permanent grant is just a worse subscription: it
    // would let a student ratchet their way to Pro for free and would make the
    // plan the student is on unknowable. Expiry also gives the reward its pull,
    // since a window that closes is worth using.
    [Index(nameof(StudentId), nameof(QuotaKey), nameof(ExpiresAt))]
    [Index(nameof(ExpiresAt))]
    public class QuotaGrant : IEntityTimestamps
    {
        public long Id { get; set; }

        // identity.users.id of the student who earned it.
        public string StudentId { get; set; } = "";

        // Matches PlanQuota.QuotaKey: "ai.deep", "ai.quick", "practice.generate".
        public string QuotaKey { get; set; } = "";

        // Added on top of the plan's PerMonth while this grant is live. Never
        // -1: a reward may raise a ceiling, never remove it. Unlimited is
        // something a plan sells, not something a goal hands out.
        public int Bonus { get; set; }

        // What was redeemed, for the ledger and for the UI. Matches a code in
        // RewardCatalog so the title/description stay in one place.
        public string RewardCode { get; set; } = "";

        // The goal that paid for this, when it came from one. Null when the
        // student spent banked points directly.
        public long? GoalId { get; set; }

        // Points debited. Kept on the grant so the ledger and the grant cannot
        // disagree about what it cost.
        public int PointsSpent { get; set; }

        public DateTime GrantedAt { get; set; } = DateTime.UtcNow;

        // UsageMeter counts a grant only while now < ExpiresAt. Expired rows
        // are left in place: they are the student's history of what they earned,
        // and deleting them would make the ledger reference nothing.
        public DateTime ExpiresAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive(DateTime now) => now < ExpiresAt;
    }
}
