using Aptiverse.Affiliates.Domain.Models;
using Aptiverse.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Affiliates.Application.Services
{
    public class AffiliateLedger(
        ApplicationDbContext db,
        IAffiliateService affiliates,
        ILogger<AffiliateLedger> logger) : IAffiliateLedger
    {
        public async Task<CommissionAccrualResult> RecordPaymentAsync(
            AffiliatePaymentReceipt receipt, CancellationToken ct = default)
        {
            try
            {
                return await RecordPaymentCoreAsync(receipt, ct);
            }
            catch (DbUpdateException)
            {
                // The unique constraint on (referral, payment reference, type)
                // fired, which means the other path got there first. That is
                // the constraint doing its job, not a fault.
                logger.LogDebug(
                    "Affiliate accrual for {Reference} lost the race to the other payment path; already recorded.",
                    receipt.PaymentReference);
                return new CommissionAccrualResult { Accrued = false, Reason = "already accrued" };
            }
            catch (Exception ex)
            {
                // A commission is important; a customer's subscription is more
                // important. If this fails the person who paid still gets what
                // they paid for, and the failure is loud in the logs.
                logger.LogError(ex,
                    "Affiliate accrual failed for payment {Reference}; billing is unaffected.",
                    receipt.PaymentReference);
                return new CommissionAccrualResult { Accrued = false, Reason = "error" };
            }
        }

        private async Task<CommissionAccrualResult> RecordPaymentCoreAsync(
            AffiliatePaymentReceipt receipt, CancellationToken ct)
        {
            var reference = receipt.PaymentReference?.Trim();
            if (string.IsNullOrWhiteSpace(reference))
                return new CommissionAccrualResult { Reason = "no payment reference" };

            // Commission only ever accrues on money that was actually
            // received. A free plan, a comped plan and a zero-rand test all
            // land here as zero and all correctly earn nothing.
            if (receipt.AmountZar <= 0m)
                return new CommissionAccrualResult { Reason = "no money received" };

            // Record the card fingerprint against the payer first, whether or
            // not a commission results. It is what makes the self-referral
            // check possible on the NEXT payment as well as this one.
            if (!string.IsNullOrWhiteSpace(receipt.CardSignature))
            {
                await RecordCardFingerprintAsync(
                    receipt.PayerUserId, receipt.CardSignature!, receipt.CardBrand, receipt.CardLast4, ct);
            }

            var referral = await db.Set<Referral>()
                .FirstOrDefaultAsync(r => r.ReferredUserId == receipt.PayerUserId, ct);

            // Nothing was recorded at signup. Fall back to the code carried
            // through checkout metadata, which covers the person who arrived
            // on a referral link and paid in the same session before any
            // authenticated page had a chance to claim it.
            if (referral is null && !string.IsNullOrWhiteSpace(receipt.ReferralCodeHint))
            {
                var claim = await affiliates.ClaimReferralAsync(new ReferralClaim
                {
                    ReferredUserId = receipt.PayerUserId,
                    Code = receipt.ReferralCodeHint!,
                    Source = "checkout",
                }, ct);
                referral = claim.Referral;
            }

            if (referral is null)
                return new CommissionAccrualResult { Reason = "not referred" };

            if (referral.Status == ReferralStatus.Blocked)
                return new CommissionAccrualResult { Reason = "referral blocked" };

            var affiliate = await db.Set<Affiliate>()
                .FirstOrDefaultAsync(a => a.Id == referral.AffiliateId, ct);
            if (affiliate is null)
                return new CommissionAccrualResult { Reason = "affiliate missing" };

            // Belt to the braces on the claim-time check. A self-referral that
            // somehow reached this point earns nothing and is recorded.
            if (string.Equals(affiliate.UserId, receipt.PayerUserId, StringComparison.Ordinal))
            {
                await BlockForSelfReferralAsync(affiliate, referral, ct);
                return new CommissionAccrualResult { Reason = "self referral" };
            }

            // Same physical card on both sides. Not proof, so it flags rather
            // than blocks, and commission parks as Pending until an admin says
            // otherwise.
            if (!string.IsNullOrWhiteSpace(receipt.CardSignature))
            {
                await CheckSharedCardAsync(affiliate, referral, receipt.CardSignature!, ct);
            }

            // The attribution window. Null means lifetime, which is what the
            // programme runs today.
            if (AffiliateProgramme.AttributionWindow is { } window
                && receipt.PaidAt - referral.SignedUpAt > window)
            {
                return new CommissionAccrualResult { Reason = "outside attribution window" };
            }

            // Idempotency. Both the verify path and the webhook path fire for
            // the same payment, by design, and only one of them may write.
            var alreadyAccrued = await db.Set<CommissionEntry>().AnyAsync(
                e => e.ReferralId == referral.Id
                  && e.SourcePaymentReference == reference
                  && e.EntryType == CommissionEntryType.Accrual, ct);
            if (alreadyAccrued)
                return new CommissionAccrualResult { Reason = "already accrued" };

            // Which payment is this? Reversed accruals do not count, so a
            // refunded month does not consume one of the three.
            var live = await db.Set<CommissionEntry>()
                .Where(e => e.ReferralId == referral.Id
                         && e.EntryType == CommissionEntryType.Accrual
                         && e.Status != CommissionStatus.Reversed)
                .CountAsync(ct);
            var cap = AffiliateProgramme.CommissionablePaymentsFor(receipt.IsAnnual);
            if (live >= cap)
                return new CommissionAccrualResult { Reason = "commissionable payments exhausted" };

            var paymentNumber = live + 1;
            var amount = AffiliateProgramme.CommissionOn(receipt.AmountZar);

            // Pending rather than Held whenever the earning is not clean: a
            // flagged referral or a suspended affiliate does not start the
            // 30-day clock, so it can never quietly become payable.
            var clean = referral.Status != ReferralStatus.Flagged
                     && affiliate.Status == AffiliateStatus.Active;

            var entry = new CommissionEntry
            {
                AffiliateId = affiliate.Id,
                ReferralId = referral.Id,
                EntryType = CommissionEntryType.Accrual,
                PaymentNumber = paymentNumber,
                SourcePaymentReference = reference,
                SourceSubscriptionId = receipt.SubscriptionId,
                SourcePlanCode = receipt.PlanCode,
                SourcePaymentAmountZar = AffiliateProgramme.ToCents(receipt.AmountZar),
                CommissionRate = AffiliateProgramme.CommissionRate,
                AmountZar = amount,
                Status = clean ? CommissionStatus.Held : CommissionStatus.Pending,
                OccurredAt = receipt.PaidAt,
                HoldUntil = clean ? receipt.PaidAt.AddDays(AffiliateProgramme.HoldDays) : null,
                CreatedByUserId = "system",
            };
            db.Set<CommissionEntry>().Add(entry);
            await db.SaveChangesAsync(ct);

            db.Set<CommissionEntryEvent>().Add(new CommissionEntryEvent
            {
                CommissionEntryId = entry.Id,
                FromStatus = null,
                ToStatus = entry.Status,
                Reason = clean
                    ? $"Accrued on payment {paymentNumber} of {AffiliateProgramme.CommissionablePayments}."
                    : "Accrued but parked pending review.",
                ActorUserId = "system",
                OccurredAt = DateTime.UtcNow,
            });

            referral.FirstPaymentAt ??= receipt.PaidAt;
            if (referral.Status is ReferralStatus.Signed)
                referral.Status = ReferralStatus.Earning;
            if (paymentNumber >= AffiliateProgramme.CommissionablePayments
                && referral.Status == ReferralStatus.Earning)
            {
                referral.Status = ReferralStatus.Completed;
                referral.CompletedAt = DateTime.UtcNow;
            }
            referral.UpdatedAt = DateTime.UtcNow;

            await db.SaveChangesAsync(ct);

            logger.LogInformation(
                "Affiliate {Affiliate}: accrued R{Amount} on payment {N} of referral {Referral} ({Reference}).",
                affiliate.Id, amount, paymentNumber, referral.Id, reference);

            return new CommissionAccrualResult
            {
                Accrued = true,
                Reason = clean ? "held" : "pending review",
                AmountZar = amount,
                PaymentNumber = paymentNumber,
                CommissionEntryId = entry.Id,
            };
        }

        public async Task<int> ReverseForPaymentAsync(
            string paymentReference, string reason, string actorUserId, CancellationToken ct = default)
        {
            var reference = paymentReference?.Trim();
            if (string.IsNullOrWhiteSpace(reference)) return 0;

            var originals = await db.Set<CommissionEntry>()
                .Where(e => e.SourcePaymentReference == reference
                         && e.EntryType == CommissionEntryType.Accrual
                         && e.Status != CommissionStatus.Reversed)
                .ToListAsync(ct);
            if (originals.Count == 0) return 0;

            var now = DateTime.UtcNow;
            foreach (var original in originals)
            {
                var wasPaid = original.Status == CommissionStatus.Paid;

                // The offsetting entry. If the original was already paid out,
                // the reversal is Payable so the next payout run nets it off.
                // If it was not, the reversal is bookkeeping only: it cancels
                // an amount that was never going to leave the bank.
                var reversal = new CommissionEntry
                {
                    AffiliateId = original.AffiliateId,
                    ReferralId = original.ReferralId,
                    EntryType = CommissionEntryType.Reversal,
                    PaymentNumber = 0,
                    SourcePaymentReference = reference,
                    SourceSubscriptionId = original.SourceSubscriptionId,
                    SourcePlanCode = original.SourcePlanCode,
                    SourcePaymentAmountZar = -original.SourcePaymentAmountZar,
                    CommissionRate = original.CommissionRate,
                    AmountZar = AffiliateProgramme.ToCents(-original.AmountZar),
                    Status = wasPaid ? CommissionStatus.Payable : CommissionStatus.Reversed,
                    OccurredAt = now,
                    BecamePayableAt = wasPaid ? now : null,
                    Reason = reason,
                    ReversesEntryId = original.Id,
                    CreatedByUserId = actorUserId,
                };
                db.Set<CommissionEntry>().Add(reversal);

                var from = original.Status;
                original.Status = CommissionStatus.Reversed;
                original.UpdatedAt = now;

                await db.SaveChangesAsync(ct);

                db.Set<CommissionEntryEvent>().Add(new CommissionEntryEvent
                {
                    CommissionEntryId = original.Id,
                    FromStatus = from,
                    ToStatus = CommissionStatus.Reversed,
                    Reason = reason,
                    ActorUserId = actorUserId,
                    OccurredAt = now,
                });
                db.Set<CommissionEntryEvent>().Add(new CommissionEntryEvent
                {
                    CommissionEntryId = reversal.Id,
                    FromStatus = null,
                    ToStatus = reversal.Status,
                    Reason = wasPaid
                        ? "Offsets an already-paid commission; carried against the next payout."
                        : "Offsets a commission that had not been paid.",
                    ActorUserId = actorUserId,
                    OccurredAt = now,
                });

                // A reversed payment frees its slot: three GENUINE payments is
                // what the programme promises, not three attempts.
                var referral = await db.Set<Referral>()
                    .FirstOrDefaultAsync(r => r.Id == original.ReferralId, ct);
                if (referral is not null && referral.Status == ReferralStatus.Completed)
                {
                    referral.Status = ReferralStatus.Earning;
                    referral.CompletedAt = null;
                    referral.UpdatedAt = now;
                }

                await db.SaveChangesAsync(ct);
            }

            logger.LogInformation(
                "Clawback: reversed {Count} commission entries for payment {Reference} ({Reason}).",
                originals.Count, reference, reason);
            return originals.Count;
        }

        private async Task RecordCardFingerprintAsync(
            string userId, string signature, string? brand, string? last4, CancellationToken ct)
        {
            var hash = AffiliateProgramme.Hash(signature);
            var existing = await db.Set<PaymentFingerprint>()
                .FirstOrDefaultAsync(f => f.UserId == userId && f.FingerprintHash == hash, ct);
            if (existing is not null)
            {
                existing.LastSeenAt = DateTime.UtcNow;
            }
            else
            {
                db.Set<PaymentFingerprint>().Add(new PaymentFingerprint
                {
                    UserId = userId,
                    FingerprintHash = hash,
                    CardBrand = brand,
                    CardLast4 = last4,
                });
            }
            await db.SaveChangesAsync(ct);
        }

        private async Task BlockForSelfReferralAsync(
            Affiliate affiliate, Referral referral, CancellationToken ct)
        {
            referral.Status = ReferralStatus.Blocked;
            referral.FlagReason = "Self-referral: the payer is the affiliate.";
            referral.UpdatedAt = DateTime.UtcNow;
            db.Set<ReferralFraudSignal>().Add(new ReferralFraudSignal
            {
                AffiliateId = affiliate.Id,
                ReferralId = referral.Id,
                SignalType = "self_referral_user",
                Severity = FraudSignalSeverity.Block,
                Detail = "The paying account is the affiliate's own account.",
                SubjectUserId = affiliate.UserId,
            });
            await db.SaveChangesAsync(ct);
        }

        private async Task CheckSharedCardAsync(
            Affiliate affiliate, Referral referral, string signature, CancellationToken ct)
        {
            if (referral.Status is ReferralStatus.Flagged or ReferralStatus.Blocked) return;

            var hash = AffiliateProgramme.Hash(signature);
            var affiliateUsesSameCard = await db.Set<PaymentFingerprint>()
                .AnyAsync(f => f.UserId == affiliate.UserId && f.FingerprintHash == hash, ct);
            if (!affiliateUsesSameCard) return;

            referral.Status = ReferralStatus.Flagged;
            referral.FlagReason = "The referred account paid with the same card as the affiliate.";
            referral.UpdatedAt = DateTime.UtcNow;
            db.Set<ReferralFraudSignal>().Add(new ReferralFraudSignal
            {
                AffiliateId = affiliate.Id,
                ReferralId = referral.Id,
                SignalType = "shared_card_fingerprint",
                Severity = FraudSignalSeverity.Review,
                Detail = "The same card fingerprint has paid for both accounts.",
                SubjectUserId = referral.ReferredUserId,
            });
            await db.SaveChangesAsync(ct);
        }
    }
}
