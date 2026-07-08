using Aptiverse.Marketplace.Domain.Models.External.Booking;
using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Marketplace.Domain.Models.Marketplace
{
    [Index(nameof(UserId))]
    [Index(nameof(IsVerified))]
    public class Tutor : IEntityTimestamps
    {
        public long Id { get; set; }
        public string UserId { get; set; }
        public string Qualification { get; set; }
        public string Specialization { get; set; }
        public string Bio { get; set; }
        public decimal HourlyRate { get; set; }
        public int YearsOfExperience { get; set; }
        public string TeachingStyle { get; set; }
        public bool IsVerified { get; set; }
        public double Rating { get; set; }
        public int TotalReviews { get; set; }

        // Settings-driven fields, edited on the tutor Settings page. Availability
        // is a lightweight summary (accepting new students, open days, open-hour
        // window) rather than a full slot calendar. Subjects is a comma-list of
        // what they teach; Specialization holds finer specialist topics.
        public bool AcceptingStudents { get; set; } = true;
        public string AvailableDays { get; set; } = "Mon,Tue,Wed,Thu,Fri";
        public int EarliestHour { get; set; } = 15;
        public int LatestHour { get; set; } = 20;
        public string Subjects { get; set; } = "";
        public bool NotifyOnConnection { get; set; } = true;
        public bool NotifyOnReview { get; set; } = true;
        public bool WeeklySummary { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<TutorSubject> TutorSubjects { get; set; }
        public virtual ICollection<TutorStudent> TutorStudents { get; set; }
        public virtual ICollection<Course> Courses { get; set; }
        public virtual ICollection<Resource> Resources { get; set; }
        public virtual ICollection<TutorAvailability> Availabilities { get; set; }
    }
}
