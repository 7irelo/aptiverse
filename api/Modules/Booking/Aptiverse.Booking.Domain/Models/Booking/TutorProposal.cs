using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Booking.Domain.Models.Booking
{
    // A tutor's bid on a student's listing. Submitting one spends connects, so a
    // tutor puts them where they can genuinely help rather than blanketing every
    // listing. The poster reads the proposals and accepts one, which forms the
    // connection. One proposal per tutor per listing. Auto-maps to
    // booking.tutor_proposals via reflection discovery.
    [Index(nameof(ListingId))]
    [Index(nameof(TutorUserId))]
    [Index(nameof(ListingId), nameof(TutorUserId), IsUnique = true)]
    public class TutorProposal : IEntityTimestamps
    {
        public long Id { get; set; }

        public long ListingId { get; set; }

        // identity.users.id of the bidding tutor, plus their name for display.
        public string TutorUserId { get; set; } = "";
        public string TutorName { get; set; } = "";

        // The tutor's pitch to the learner.
        public string Message { get; set; } = "";

        // Connects debited when this was submitted, kept for the ledger/refund.
        public int ConnectsSpent { get; set; }

        // "submitted" | "accepted" | "declined" | "withdrawn"
        public string Status { get; set; } = "submitted";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
