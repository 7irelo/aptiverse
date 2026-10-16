using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Affiliates.Domain.Models
{
    public enum CommissionEntryType
    {
        // The commission rate (AffiliateProgramme.CommissionRate) of a payment that was actually received.
        Accrual,
        // Offsets an accrual because the payment was refunded or charged back.
        Reversal,
        // Any other correction, made by an admin, always with a reason.
        Adjustment,
    }

    public enum CommissionStatus
    {
        // Earned, but the clock is not running: the referral is flagged for
        // review, or the affiliate is suspended. Nothing here can be paid.
        Pending,
        // Clean. The 30-day hold is counting down towards HoldUntil.
        Held,
        // Hold elapsed. Ready to be swept into a payout run.
        Payable,
        // Settled by a payout with a bank reference against it.
        Paid,
        // Superseded by a Reversal entry. The row is kept, untouched in
        // amount, because the trail is the point.
        Reversed,
    }

    // The ledger. Append-only in every way that matters:
    //
    //   - a row is never deleted;
    //   - AmountZar, EntryType, SourcePaymentReference and the referral it
    //     belongs to are never edited once written;
    //   - a correction is a NEW row that offsets the old one, carrying a
    //     reason and a pointer back at what it reverses;
    //   - the only fields that move are the lifecycle ones (Status, PayoutId
    //     and the matching timestamps), and every one of those transitions
    //     writes a CommissionEntryEvent row recording who did it and why.
    //
    // That last point is what makes this defensible rather than merely tidy.
    // A status column that changes with no record of the change is indistinct
    // from an edited table.
    [Index(nameof(AffiliateId))]
    [Index(nameof(ReferralId))]
    [Index(nameof(Status))]
    [Index(nameof(SourcePaymentReference))]
    [Index(nameof(OccurredAt))]
    // The verify path and the webhook path both fire for the same payment,
    // deliberately, and the renewal worker races its own charge.success
    // webhook. The service checks before writing, but a check-then-write is
    // not a guarantee under concurrency and paying somebody twice for one
    // payment is exactly the kind of bug nobody reports. This constraint is
    // the guarantee.
    [Index(nameof(ReferralId), nameof(SourcePaymentReference), nameof(EntryType), IsUnique = true)]
    public class CommissionEntry : IEntityTimestamps
    {
        public long Id { get; set; }

        public long AffiliateId { get; set; }
        public long ReferralId { get; set; }

        public CommissionEntryType EntryType { get; set; } = CommissionEntryType.Accrual;

        // 1, 2 or 3 for an accrual. 0 for a reversal or an adjustment, which
        // are not themselves one of the three commissionable payments.
        public int PaymentNumber { get; set; }

        // The Paystack transaction reference the money arrived under. This is
        // also the idempotency key: the verify path and the webhook path both
        // fire for the same payment, and only one accrual may exist per
        // reference per referral.
        public required string SourcePaymentReference { get; set; }

        // entitlements.subscriptions.id, when known.
        public long? SourceSubscriptionId { get; set; }
        public string? SourcePlanCode { get; set; }

        // What was actually received, in rand, rounded to cents at write time.
        [Precision(18, 2)]
        public decimal SourcePaymentAmountZar { get; set; }

        // 0.2000 today. Stored per entry so a later rate change cannot
        // retroactively restate what was earned under the old one.
        [Precision(6, 4)]
        public decimal CommissionRate { get; set; }

        // Positive on an accrual, negative on a reversal. Rounded to cents
        // explicitly at the point it is stored.
        [Precision(18, 2)]
        public decimal AmountZar { get; set; }

        public CommissionStatus Status { get; set; } = CommissionStatus.Held;

        // When the money was received. The hold and the tax year are both
        // measured from this, not from when the row happened to be written.
        public DateTime OccurredAt { get; set; } = DateTime.UtcNow;

        // OccurredAt + 30 days. Null on entries that are not on the clock.
        public DateTime? HoldUntil { get; set; }
        public DateTime? BecamePayableAt { get; set; }
        public DateTime? PaidAt { get; set; }

        public long? PayoutId { get; set; }

        // Mandatory on Reversal and Adjustment. A correction with no stated
        // reason is worth very little to anyone reading this later.
        public string? Reason { get; set; }

        // The entry this one offsets, on a Reversal.
        public long? ReversesEntryId { get; set; }

        // Who wrote it: "system" for automatic accrual and clawback, otherwise
        // the admin's user id.
        public string CreatedByUserId { get; set; } = "system";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual Referral? Referral { get; set; }
    }
}
