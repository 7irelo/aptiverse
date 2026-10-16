using Aptiverse.Affiliates.Domain.Models;

namespace Aptiverse.Affiliates.Application.Services
{
    public record ReferralClaim
    {
        public required string ReferredUserId { get; init; }
        public required string Code { get; init; }
        // "signup" | "app" | "checkout". Recorded for nothing more than being
        // able to tell later where a referral actually came from.
        public string Source { get; init; } = "app";
        public string? LandingPath { get; init; }
        // An opaque browser-generated id. Hashed, never stored raw.
        public string? DeviceId { get; init; }
    }

    public record ReferralClaimResult
    {
        public bool Recorded { get; init; }
        // recorded | already-referred | unknown-code | suspended | own-code |
        // existing-account
        public string Outcome { get; init; } = "";
        public Referral? Referral { get; init; }
    }

    public record PayoutRunResult
    {
        public string RunReference { get; init; } = "";
        public int PayoutCount { get; init; }
        public decimal TotalZar { get; init; }
        public int SkippedNoDetails { get; init; }
        public decimal SkippedNoDetailsZar { get; init; }
        public int CarriedNegative { get; init; }
    }

    public interface IAffiliateService
    {
        // Mint the affiliate row and its code if the account does not have one
        // yet. Every account gets one: a referral code costs nothing and the
        // friction of an application form is what kills these programmes.
        Task<Affiliate> EnsureAffiliateAsync(
            string userId, string? audience = null, CancellationToken ct = default);

        Task<Affiliate?> FindByCodeAsync(string code, CancellationToken ct = default);

        // Bind a referred account to an affiliate. First touch wins and is
        // never reassigned; self-referral is refused outright.
        Task<ReferralClaimResult> ClaimReferralAsync(
            ReferralClaim claim, CancellationToken ct = default);

        // Move Held entries whose 30-day hold has elapsed to Payable. Run by
        // the background worker; safe to call at any time.
        Task<int> ReleaseMaturedHoldsAsync(CancellationToken ct = default);

        // Build the founder's payout list. Creates Draft payouts; moves no
        // money and never will.
        Task<PayoutRunResult> GeneratePayoutRunAsync(
            DateTime periodEnd, decimal minimumZar, string actorUserId, CancellationToken ct = default);

        // Record that he has paid one, with the reference from his banking app.
        Task<AffiliatePayout?> MarkPayoutPaidAsync(
            long payoutId, string paymentReference, DateTime paidAt, string? notes,
            string actorUserId, CancellationToken ct = default);

        Task<AffiliatePayout?> CancelPayoutAsync(
            long payoutId, string reason, string actorUserId, CancellationToken ct = default);
    }
}
