using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Marketplace.Domain.Models.Marketplace
{
    // A student's review of a tutor. Keyed on the tutor's identity-user id
    // (string) so "my reviews" reads straight off the JWT without joining the
    // fragmented marketplace/booking tutor-profile tables. Auto-maps to
    // marketplace.reviews via the DbContext's reflection discovery.
    [Index(nameof(TutorUserId))]
    [Index(nameof(StudentId))]
    public class Review : IEntityTimestamps
    {
        public long Id { get; set; }

        // identity.users.id of the tutor being reviewed.
        public string TutorUserId { get; set; } = "";

        // identity.users.id of the reviewer + a denormalised display name.
        public string StudentId { get; set; } = "";
        public string StudentName { get; set; } = "";

        public int Rating { get; set; } // 1-5
        public string Body { get; set; } = "";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
