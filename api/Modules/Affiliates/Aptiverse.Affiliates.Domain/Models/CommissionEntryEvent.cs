using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Affiliates.Domain.Models
{
    // Every lifecycle move a commission entry makes, written once and never
    // touched again. Held to Payable, Payable to Paid, anything to Reversed:
    // each one lands here with who did it, when, and why.
    //
    // Without this the ledger would have a mutable status column and no way to
    // show that the mutation was legitimate. With it, the entry's history can
    // be replayed from the rows themselves.
    [Index(nameof(CommissionEntryId))]
    [Index(nameof(OccurredAt))]
    public class CommissionEntryEvent
    {
        public long Id { get; set; }
        public long CommissionEntryId { get; set; }

        // Null on the creation event: there was no previous status.
        public CommissionStatus? FromStatus { get; set; }
        public CommissionStatus ToStatus { get; set; }

        public string? Reason { get; set; }

        // "system" for the hold-release worker and the payment hooks,
        // otherwise the acting admin's user id.
        public string ActorUserId { get; set; } = "system";

        public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
    }
}
