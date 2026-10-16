namespace Aptiverse.Affiliates.Application.Services
{
    // A payment that has actually been received. Every field here is a fact
    // about money that moved, which is the only thing this programme ever pays
    // on: invoiced-but-unpaid amounts do not appear.
    public record AffiliatePaymentReceipt
    {
        // The person whose card was charged, which is the subscription owner.
        public required string PayerUserId { get; init; }

        // Paystack's transaction reference. Doubles as the idempotency key,
        // because the verify path and the webhook path both fire for the same
        // payment and exactly one accrual may result.
        public required string PaymentReference { get; init; }

        // What was received, in rand. Zero or less means nothing accrues:
        // a free plan and a comped plan both land here as zero.
        public required decimal AmountZar { get; init; }

        public DateTime PaidAt { get; init; } = DateTime.UtcNow;

        public long? SubscriptionId { get; init; }
        public string? PlanCode { get; init; }

        // Whether this charge is an annual one. Annual pays a full year at once,
        // so it commissions fewer payments than a monthly plan does (see
        // AffiliateProgramme.CommissionablePaymentsFor).
        public bool IsAnnual { get; init; }

        // Paystack's card fingerprint. Recorded against the payer so that a
        // referrer paying for their own "referral" can be spotted.
        public string? CardSignature { get; init; }
        public string? CardBrand { get; init; }
        public string? CardLast4 { get; init; }

        // A referral code carried through checkout metadata. Only used as a
        // fallback when no referral was recorded at signup, and never allowed
        // to override one that was.
        public string? ReferralCodeHint { get; init; }
    }

    public record CommissionAccrualResult
    {
        public bool Accrued { get; init; }
        public string Reason { get; init; } = "";
        public decimal AmountZar { get; init; }
        public int PaymentNumber { get; init; }
        public long? CommissionEntryId { get; init; }
    }

    // The write side of the commission ledger. Called from the places money is
    // confirmed and nowhere else.
    public interface IAffiliateLedger
    {
        // Accrue the commission rate of a received payment to whoever referred the payer, if
        // this is one of their first three payments. Idempotent on the
        // payment reference. Never throws into the caller: a billing flow must
        // not fail because a commission could not be written.
        Task<CommissionAccrualResult> RecordPaymentAsync(
            AffiliatePaymentReceipt receipt, CancellationToken ct = default);

        // Clawback. Reverses the commission that came from a payment which has
        // since been refunded or charged back. Returns how many entries were
        // reversed.
        Task<int> ReverseForPaymentAsync(
            string paymentReference, string reason, string actorUserId,
            CancellationToken ct = default);
    }
}
