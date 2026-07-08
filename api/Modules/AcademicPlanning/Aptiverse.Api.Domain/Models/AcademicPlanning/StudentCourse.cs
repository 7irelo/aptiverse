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

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual Course? Course { get; set; }
    }
}
