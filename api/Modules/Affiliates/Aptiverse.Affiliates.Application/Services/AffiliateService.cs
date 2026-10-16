using Aptiverse.Affiliates.Domain.Models;
using Aptiverse.Api.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Affiliates.Application.Services
{
    public class AffiliateService(
        ApplicationDbContext db,
        ILogger<AffiliateService> logger) : IAffiliateService
    {
        public async Task<Affiliate> EnsureAffiliateAsync(
            string userId, string? audience = null, CancellationToken ct = default)
        {
            var existing = await db.Set<Affiliate>()
                .FirstOrDefaultAsync(a => a.UserId == userId, ct);
            if (existing is not null) return existing;

            var resolved = audience ?? await ResolveAudienceAsync(userId, ct);

            // Codes are random, so a collision is vanishingly unlikely, but a
            // unique index will happily reject one and a signup must not fail
            // over a coin flip. Try a few times, then let it surface.
            for (var attempt = 0; attempt < 5; attempt++)
            {
                var code = AffiliateProgramme.NewCode();
                if (await db.Set<Affiliate>().AnyAsync(a => a.ReferralCode == code, ct)) continue;

                var affiliate = new Affiliate
                {
                    UserId = userId,
                    ReferralCode = code,
                    Status = AffiliateStatus.Active,
                    Audience = resolved,
                    PayoutOnboardingStatus = PayoutOnboardingStatus.NotStarted,
                };
                db.Set<Affiliate>().Add(affiliate);
                try
                {
                    await db.SaveChangesAsync(ct);
                    return affiliate;
                }
                catch (DbUpdateException)
                {
                    // Either the code raced another writer or this user was
                    // given an affiliate row concurrently. Detach and look
                    // again before trying a new code.
                    db.Entry(affiliate).State = EntityState.Detached;
                    var raced = await db.Set<Affiliate>()
                        .FirstOrDefaultAsync(a => a.UserId == userId, ct);
                    if (raced is not null) return raced;
                }
            }

            throw new InvalidOperationException(
                $"Could not mint a referral code for user {userId} after 5 attempts.");
        }

        private async Task<string> ResolveAudienceAsync(string userId, CancellationToken ct)
        {
            var roles = await (
                from ur in db.Set<IdentityUserRole<string>>()
                join r in db.Set<IdentityRole>() on ur.RoleId equals r.Id
                where ur.UserId == userId
                select r.Name).ToListAsync(ct);

            if (roles.Any(r => string.Equals(r, "Student", StringComparison.OrdinalIgnoreCase))) return "student";
            if (roles.Any(r => string.Equals(r, "Tutor", StringComparison.OrdinalIgnoreCase))) return "tutor";
            if (roles.Any(r => string.Equals(r, "Parent", StringComparison.OrdinalIgnoreCase))) return "parent";
            return "public";
        }

        public async Task<Affiliate?> FindByCodeAsync(string code, CancellationToken ct = default)
        {
            var normalised = AffiliateProgramme.NormaliseCode(code);
            if (normalised.Length == 0) return null;
            return await db.Set<Affiliate>()
                .FirstOrDefaultAsync(a => a.ReferralCode == normalised, ct);
        }

        public async Task<ReferralClaimResult> ClaimReferralAsync(
            ReferralClaim claim, CancellationToken ct = default)
        {
            var code = AffiliateProgramme.NormaliseCode(claim.Code);
            if (code.Length == 0)
                return new ReferralClaimResult { Outcome = "unknown-code" };

            // First touch wins, permanently. A second code arriving later is
            // ignored rather than allowed to steal an existing referral.
            var already = await db.Set<Referral>()
                .FirstOrDefaultAsync(r => r.ReferredUserId == claim.ReferredUserId, ct);
            if (already is not null)
            {
                return new ReferralClaimResult
                {
                    Recorded = false,
                    Outcome = "already-referred",
                    Referral = already,
                };
            }

            var affiliate = await db.Set<Affiliate>()
                .FirstOrDefaultAsync(a => a.ReferralCode == code, ct);
            if (affiliate is null)
                return new ReferralClaimResult { Outcome = "unknown-code" };

            // A referral is a NEW signup, not an existing customer who clicked
            // a link. Somebody who has been on the platform for months and
            // opens a friend's referral URL would otherwise be attributed to
            // that friend, who would then earn 40% of payments the platform
            // was always going to receive.
            var accountCreatedAt = await db.Set<Aptiverse.Domain.Models.User>().AsNoTracking()
                .Where(u => u.Id == claim.ReferredUserId)
                .Select(u => (DateTime?)u.CreatedAt)
                .FirstOrDefaultAsync(ct);
            if (accountCreatedAt is { } created
                && DateTime.UtcNow - created > AffiliateProgramme.ClaimGracePeriod)
            {
                return new ReferralClaimResult { Outcome = "existing-account" };
            }

            // Self-referral, the obvious case, refused outright. No referral
            // row is created at all, so there is nothing that could later be
            // cleared by mistake.
            if (string.Equals(affiliate.UserId, claim.ReferredUserId, StringComparison.Ordinal))
            {
                db.Set<ReferralFraudSignal>().Add(new ReferralFraudSignal
                {
                    AffiliateId = affiliate.Id,
                    ReferralId = null,
                    SignalType = "self_referral_user",
                    Severity = FraudSignalSeverity.Block,
                    Detail = "The account tried to use its own referral code.",
                    SubjectUserId = claim.ReferredUserId,
                });
                await db.SaveChangesAsync(ct);
                return new ReferralClaimResult { Outcome = "own-code" };
            }

            if (affiliate.Status == AffiliateStatus.Suspended)
                return new ReferralClaimResult { Outcome = "suspended" };

            var referral = new Referral
            {
                AffiliateId = affiliate.Id,
                ReferredUserId = claim.ReferredUserId,
                CodeUsed = code,
                Status = ReferralStatus.Signed,
                SignedUpAt = DateTime.UtcNow,
                LandingPath = claim.LandingPath,
            };
            db.Set<Referral>().Add(referral);
            await db.SaveChangesAsync(ct);

            // Device overlap: a weaker signal than a card, and a shared family
            // laptop is a perfectly innocent explanation, so it flags for
            // review rather than blocking.
            if (!string.IsNullOrWhiteSpace(claim.DeviceId))
            {
                await CheckDeviceOverlapAsync(affiliate, referral, claim.DeviceId!, ct);
            }

            logger.LogInformation(
                "Referral recorded: affiliate {Affiliate} referred user {User} via {Source}.",
                affiliate.Id, claim.ReferredUserId, claim.Source);

            return new ReferralClaimResult { Recorded = true, Outcome = "recorded", Referral = referral };
        }

        private async Task CheckDeviceOverlapAsync(
            Affiliate affiliate, Referral referral, string deviceId, CancellationToken ct)
        {
            var hash = AffiliateProgramme.Hash(deviceId);

            var seen = await db.Set<DeviceFingerprint>()
                .FirstOrDefaultAsync(d => d.UserId == referral.ReferredUserId && d.DeviceHash == hash, ct);
            if (seen is null)
            {
                db.Set<DeviceFingerprint>().Add(new DeviceFingerprint
                {
                    UserId = referral.ReferredUserId,
                    DeviceHash = hash,
                });
            }
            else
            {
                seen.LastSeenAt = DateTime.UtcNow;
            }

            var affiliateSameDevice = await db.Set<DeviceFingerprint>()
                .AnyAsync(d => d.UserId == affiliate.UserId && d.DeviceHash == hash, ct);
            if (affiliateSameDevice)
            {
                referral.Status = ReferralStatus.Flagged;
                referral.FlagReason = "Signed up on the same device as the affiliate.";
                referral.UpdatedAt = DateTime.UtcNow;
                db.Set<ReferralFraudSignal>().Add(new ReferralFraudSignal
                {
                    AffiliateId = affiliate.Id,
                    ReferralId = referral.Id,
                    SignalType = "shared_device",
                    Severity = FraudSignalSeverity.Review,
                    Detail = "The referred account and the affiliate share a device id.",
                    SubjectUserId = referral.ReferredUserId,
                });
            }

            await db.SaveChangesAsync(ct);
        }

        public async Task<int> ReleaseMaturedHoldsAsync(CancellationToken ct = default)
        {
            var now = DateTime.UtcNow;
            var matured = await db.Set<CommissionEntry>()
                .Where(e => e.Status == CommissionStatus.Held
                         && e.HoldUntil != null && e.HoldUntil <= now)
                .ToListAsync(ct);
            if (matured.Count == 0) return 0;

            foreach (var entry in matured)
            {
                entry.Status = CommissionStatus.Payable;
                entry.BecamePayableAt = now;
                entry.UpdatedAt = now;
                db.Set<CommissionEntryEvent>().Add(new CommissionEntryEvent
                {
                    CommissionEntryId = entry.Id,
                    FromStatus = CommissionStatus.Held,
                    ToStatus = CommissionStatus.Payable,
                    Reason = $"{AffiliateProgramme.HoldDays}-day hold elapsed.",
                    ActorUserId = "system",
                    OccurredAt = now,
                });
            }

            await db.SaveChangesAsync(ct);
            logger.LogInformation("Affiliate holds released: {Count} entries are now payable.", matured.Count);
            return matured.Count;
        }

        public async Task<PayoutRunResult> GeneratePayoutRunAsync(
            DateTime periodEnd, decimal minimumZar, string actorUserId, CancellationToken ct = default)
        {
            var runReference = $"RUN-{DateTime.UtcNow:yyyyMMdd-HHmmss}";
            var now = DateTime.UtcNow;

            // Everything payable and not already attached to a payout. This
            // sweeps accruals and reversals alike, which is how an already-paid
            // commission that was later refunded nets off the next payment
            // rather than being chased as cash.
            var payable = await db.Set<CommissionEntry>()
                .Where(e => e.Status == CommissionStatus.Payable
                         && e.PayoutId == null
                         && e.OccurredAt <= periodEnd)
                .ToListAsync(ct);

            var byAffiliate = payable.GroupBy(e => e.AffiliateId).ToList();

            var payoutCount = 0;
            var runTotal = 0m;
            var skipped = 0;
            var skippedZar = 0m;
            var carriedNegative = 0;

            foreach (var group in byAffiliate)
            {
                var affiliate = await db.Set<Affiliate>()
                    .FirstOrDefaultAsync(a => a.Id == group.Key, ct);
                if (affiliate is null) continue;

                var entries = group.OrderBy(e => e.OccurredAt).ToList();
                var total = AffiliateProgramme.ToCents(entries.Sum(e => e.AmountZar));

                // A net-negative balance is not a payout. It stays payable and
                // simply reduces whatever the next run produces, which is the
                // only sane way to recover a clawback on money already sent.
                if (total <= 0m)
                {
                    carriedNegative++;
                    continue;
                }

                if (total < minimumZar) continue;

                if (affiliate.Status != AffiliateStatus.Active
                    || affiliate.PayoutOnboardingStatus != PayoutOnboardingStatus.Approved
                    || !affiliate.HasPayoutDetails())
                {
                    // Earned, and stays earned. It simply cannot be paid until
                    // they have told us who they are and where the money goes.
                    skipped++;
                    skippedZar += total;
                    continue;
                }

                var payout = new AffiliatePayout
                {
                    AffiliateId = affiliate.Id,
                    RunReference = runReference,
                    PeriodStart = entries.Min(e => e.OccurredAt),
                    PeriodEnd = periodEnd,
                    TotalZar = total,
                    EntryCount = entries.Count,
                    Status = PayoutStatus.Draft,
                    PayeeName = $"{affiliate.LegalFirstName} {affiliate.LegalLastName}".Trim(),
                    PayeeIdType = affiliate.IdType,
                    PayeeIdNumber = affiliate.IdNumber,
                    PayeeTaxReferenceNumber = affiliate.TaxReferenceNumber,
                    BankName = affiliate.BankName,
                    AccountHolderName = affiliate.AccountHolderName,
                    AccountNumber = affiliate.AccountNumber,
                    BranchCode = affiliate.BranchCode,
                    AccountType = affiliate.AccountType,
                };
                db.Set<AffiliatePayout>().Add(payout);
                await db.SaveChangesAsync(ct);

                foreach (var entry in entries)
                {
                    entry.PayoutId = payout.Id;
                    entry.UpdatedAt = now;
                    db.Set<AffiliatePayoutItem>().Add(new AffiliatePayoutItem
                    {
                        PayoutId = payout.Id,
                        CommissionEntryId = entry.Id,
                        AmountZar = entry.AmountZar,
                    });
                }
                await db.SaveChangesAsync(ct);

                payoutCount++;
                runTotal += total;
            }

            logger.LogInformation(
                "Payout run {Run} by {Actor}: {Count} payouts totalling R{Total}; {Skipped} skipped for missing details.",
                runReference, actorUserId, payoutCount, runTotal, skipped);

            return new PayoutRunResult
            {
                RunReference = runReference,
                PayoutCount = payoutCount,
                TotalZar = AffiliateProgramme.ToCents(runTotal),
                SkippedNoDetails = skipped,
                SkippedNoDetailsZar = AffiliateProgramme.ToCents(skippedZar),
                CarriedNegative = carriedNegative,
            };
        }

        public async Task<AffiliatePayout?> MarkPayoutPaidAsync(
            long payoutId, string paymentReference, DateTime paidAt, string? notes,
            string actorUserId, CancellationToken ct = default)
        {
            var payout = await db.Set<AffiliatePayout>()
                .FirstOrDefaultAsync(p => p.Id == payoutId, ct);
            if (payout is null || payout.Status != PayoutStatus.Draft) return null;

            var now = DateTime.UtcNow;
            payout.Status = PayoutStatus.Paid;
            payout.PaymentReference = paymentReference.Trim();
            payout.PaidAt = paidAt;
            payout.PaidByUserId = actorUserId;
            payout.Notes = notes;
            payout.UpdatedAt = now;

            var entries = await db.Set<CommissionEntry>()
                .Where(e => e.PayoutId == payoutId)
                .ToListAsync(ct);
            foreach (var entry in entries)
            {
                var from = entry.Status;
                entry.Status = CommissionStatus.Paid;
                entry.PaidAt = paidAt;
                entry.UpdatedAt = now;
                db.Set<CommissionEntryEvent>().Add(new CommissionEntryEvent
                {
                    CommissionEntryId = entry.Id,
                    FromStatus = from,
                    ToStatus = CommissionStatus.Paid,
                    Reason = $"Settled by payout {payoutId}, bank reference {payout.PaymentReference}.",
                    ActorUserId = actorUserId,
                    OccurredAt = now,
                });
            }

            await db.SaveChangesAsync(ct);
            return payout;
        }

        public async Task<AffiliatePayout?> CancelPayoutAsync(
            long payoutId, string reason, string actorUserId, CancellationToken ct = default)
        {
            var payout = await db.Set<AffiliatePayout>()
                .FirstOrDefaultAsync(p => p.Id == payoutId, ct);
            if (payout is null || payout.Status != PayoutStatus.Draft) return null;

            var now = DateTime.UtcNow;
            payout.Status = PayoutStatus.Cancelled;
            payout.Notes = reason;
            payout.UpdatedAt = now;

            // Release the entries so the next run picks them up again. The
            // payout row itself is kept: a cancelled run is part of the trail.
            var entries = await db.Set<CommissionEntry>()
                .Where(e => e.PayoutId == payoutId)
                .ToListAsync(ct);
            foreach (var entry in entries)
            {
                entry.PayoutId = null;
                entry.UpdatedAt = now;
                db.Set<CommissionEntryEvent>().Add(new CommissionEntryEvent
                {
                    CommissionEntryId = entry.Id,
                    FromStatus = entry.Status,
                    ToStatus = entry.Status,
                    Reason = $"Released from cancelled payout {payoutId}: {reason}",
                    ActorUserId = actorUserId,
                    OccurredAt = now,
                });
            }

            await db.SaveChangesAsync(ct);
            return payout;
        }
    }
}
