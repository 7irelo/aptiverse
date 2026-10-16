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

        // Who the tutor is, so students can judge fit: a tutor may be a current
        // university student (has matric, studying toward a degree), a graduate,
        // or someone who has completed matric. Drives the identity line on the
        // discovery card and profile.
        //   "university_student" | "graduate" | "completed_matric"
        public string TutorKind { get; set; } = "university_student";
        // Where they study or studied (university/college). Empty for a plain
        // matriculant.
        public string Institution { get; set; } = "";
        // What they are studying toward, for a current student (e.g.
        // "BSc Computer Science").
        public string StudyingToward { get; set; } = "";
        // The year they matriculated, if given.
        public int? MatricYear { get; set; }

        // Placement weight in discovery: higher floats a tutor up the list. Set
        // by the platform (verification, a premium listing), not self-serve, so
        // the ordering can be earned rather than gamed. 0 is the default rank.
        public int FeaturedRank { get; set; }

        // Connects: the finite currency a tutor spends to submit a proposal on a
        // student's listing, so bids stay considered rather than spammed. Topped
        // up by their plan each month; a starter balance is granted when they
        // first set up a profile.
        public int Connects { get; set; } = 20;
        // When the monthly connect grant was last applied, so the top-up runs
        // once per calendar month.
        public DateTime? ConnectsRefreshedAt { get; set; }

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
