using Aptiverse.Api.Data.Abstractions;
using Aptiverse.Booking.Domain.Models.External.Identity;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Booking.Domain.Models.Booking
{
    // The relationship row linking a tutor to a student they coach.
    // Read by TutorId (a tutor's roster) and by StudentId (who tutors
    // this student?); active-only filtering is the common query shape.
    [Index(nameof(TutorId))]
    [Index(nameof(StudentId))]
    [Index(nameof(TutorId), nameof(IsActive))]
    [Index(nameof(StudentId), nameof(IsActive))]
    public class TutorStudent : IEntityTimestamps
    {
        public long Id { get; set; }
        public long TutorId { get; set; }

        // Canonical identity = the string identity.users.Id.
        // Bare user-id string; no FK/navigation to the local booking.students read-model stub.
        public string StudentId { get; set; }
        public DateTime StartedDate { get; set; }
        public bool IsActive { get; set; } = true;
        public int SessionsPerWeek { get; set; }

        public virtual Tutor Tutor { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
