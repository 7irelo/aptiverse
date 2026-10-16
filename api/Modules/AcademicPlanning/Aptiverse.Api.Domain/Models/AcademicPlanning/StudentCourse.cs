using Microsoft.EntityFrameworkCore;
using Aptiverse.Api.Data.Abstractions;

namespace Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning
{
    // A course a tertiary student is enrolled in — the tertiary equivalent of
    // StudentSubject. Points at the institution-shared Course row; one row per
    // student per course.
    [Index(nameof(StudentId))]
    [Index(nameof(CourseId))]
    [Index(nameof(StudentId), nameof(CourseId), IsUnique = true)]
    public class StudentCourse : IEntityTimestamps
    {
        public long Id { get; set; }

        // FK to identity.users (string Identity Id).
        public required string StudentId { get; set; }

        // FK to the institution-shared Course row.
        public long CourseId { get; set; }

        // Optional lecturer name — the tertiary analogue of StudentSubject.Teacher.
        public string? Lecturer { get; set; }

        // Study level, set by the student at enrolment: first_year..fourth_year,
        // honours, masters, phd. Feeds the AI practice generator so a second-year
        // gets second-year questions rather than a school-level default. Null on
        // courses added before this existed (the generator falls back to a
        // generic tertiary pitch).
        public string? Level { get; set; }

        // How many semesters this course runs, as the student sets it at enrolment
        // (typically 1 for a single semester, 2 for a full year). Null on courses
        // added before this existed, which read as ongoing: without a duration
        // there is no computed end, so they stay active until finished by hand.
        public int? DurationSemesters { get; set; }

        // Set when the student marks the course finished. Overrides the computed
        // end entirely, in both directions: a course finished early is past
        // straight away, and one logged after it ended can be closed off. Null
        // means fall back to the CreatedAt + duration computation.
        public DateTime? CompletedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual Course? Course { get; set; }
    }
}
