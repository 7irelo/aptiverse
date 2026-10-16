using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Booking.Domain.Models.Booking
{
    // A student's request for a tutor, the way a client posts a job: it says
    // what help is needed, and tutors submit proposals against it. A parent can
    // post one on behalf of a linked child, so the learner and the poster are
    // tracked separately. Auto-maps to booking.tutor_listings via reflection
    // discovery.
    [Index(nameof(LearnerId))]
    [Index(nameof(PostedByUserId))]
    [Index(nameof(Status))]
    public class TutorListing : IEntityTimestamps
    {
        public long Id { get; set; }

        // identity.users.id of the student the tutoring is for, plus their name.
        public string LearnerId { get; set; } = "";
        public string LearnerName { get; set; } = "";

        // Who posted it: the learner themselves, or a parent for their child.
        public string PostedByUserId { get; set; } = "";
        // "student" | "parent"
        public string PostedByRole { get; set; } = "student";

        public string Title { get; set; } = "";
        // Free-text subject/course the help is about.
        public string Subject { get; set; } = "";
        // Grade or study-level context, free text (e.g. "Grade 11", "2nd year").
        public string Level { get; set; } = "";
        public string Details { get; set; } = "";
        // "online" | "in_person" | "either"
        public string Mode { get; set; } = "either";

        // "open" = taking proposals; "filled" = a proposal was accepted;
        // "closed" = the poster withdrew it.
        public string Status { get; set; } = "open";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
