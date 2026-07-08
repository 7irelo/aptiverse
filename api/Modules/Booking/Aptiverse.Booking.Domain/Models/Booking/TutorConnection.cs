using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Booking.Domain.Models.Booking
{
    // A tutor <-> student/parent connection. Under the subscription model
    // Aptiverse does not facilitate paid sessions or take commission; this is
    // just the roster of people a tutor has connected with. Any tutoring
    // arrangement and payment happens directly between them, off-platform.
    // Auto-maps to booking.tutor_connections via reflection discovery.
    [Index(nameof(TutorUserId))]
    [Index(nameof(StudentId))]
    public class TutorConnection : IEntityTimestamps
    {
        public long Id { get; set; }

        // identity.users.id of the tutor.
        public string TutorUserId { get; set; } = "";

        // identity.users.id of the connected student/parent + display name.
        public string StudentId { get; set; } = "";
        public string StudentName { get; set; } = "";

        // Free-form subject the connection is about (e.g. "Mathematics").
        public string Subject { get; set; } = "";

        // active | paused
        public string Status { get; set; } = "active";

        public DateTime ConnectedAt { get; set; } = DateTime.UtcNow;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
