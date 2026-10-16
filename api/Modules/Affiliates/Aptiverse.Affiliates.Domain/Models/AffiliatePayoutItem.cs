using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Affiliates.Domain.Models
{
    // Which ledger entries a payout settled, and for how much each.
    //
    // CommissionEntry.PayoutId would technically answer the same question, but
    // it answers it from the mutable side. This row is written once, carries
    // the amount as it stood when the payout was generated, and is never
    // edited. Reconciling a bank statement line back to individual commissions
    // reads from here.
    [Index(nameof(PayoutId))]
    [Index(nameof(CommissionEntryId))]
    public class AffiliatePayoutItem
    {
        public long Id { get; set; }
        public long PayoutId { get; set; }
        public long CommissionEntryId { get; set; }

        [Precision(18, 2)]
        public decimal AmountZar { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual AffiliatePayout? Payout { get; set; }
    }
}
