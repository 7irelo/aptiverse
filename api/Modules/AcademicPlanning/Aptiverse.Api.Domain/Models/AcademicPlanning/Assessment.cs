using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using Aptiverse.Api.Data.Abstractions;

namespace Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning
{
    // A school-based assessment (SBA task, test, project, essay, exam, etc.)
    // logged by the student. Scoped per-user — students see only their own.
    // Marks (predicted + actual) are optional so students can log a future
    // assessment with no marks and fill them in as the term progresses.
    [Index(nameof(StudentId))]
    [Index(nameof(SubjectId))]
    [Index(nameof(StudentId), nameof(Status))]
    [Index(nameof(StudentId), nameof(SubjectId))]
    [Index(nameof(StudentId), nameof(DueDate))]
    [Index(nameof(Status))]
    [Index(nameof(Type))]
    public class Assessment : IEntityTimestamps
    {
        public long Id { get; set; }

        // Owner — FK to identity.users.id. Indexed via the snake_case
        // naming convention plugin.
        public required string StudentId { get; set; }

        // Canonical subject slug (e.g. "math", "physci"). Matches the
        // Subject catalog Id. Lets the UI filter by subject without
        // joining the student_subjects table.
        public required string SubjectId { get; set; }

        public required string Title { get; set; }

        // test | essay | investigation | practical | exam | project | oral
        public required string Type { get; set; }

        // Term-mark weight as a percentage (0-100).
        public int Weight { get; set; }

        public DateTime DueDate { get; set; }

        // scheduled | in_progress | submitted | graded
        public string Status { get; set; } = "scheduled";

        // Optional marks. PredictedMark is what the student / model expects;
        // ActualMark is filled in once the school returns the result.
        public int? PredictedMark { get; set; }
        public int? ActualMark { get; set; }

        public string? Notes { get; set; }

        // Editable checklist the student maintains while working on this
        // assessment ("Outline structure", "Practice 10 past-paper Qs", etc).
        // Stored as a JSON column — order is preserved, done state persists.
        // Nullable so existing rows don't need a backfill; the API surface
        // returns an empty list when null.
        public List<AssessmentTask>? Tasks { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    // A single task on the assessment checklist. Owned by the parent
    // Assessment as a JSON-serialized list — no separate table.
    // [NotMapped] tells the auto-discovery in ApplicationDbContext to
    // treat this as a plain value type, not an EF entity.
    [NotMapped]
    public class AssessmentTask
    {
        public required string Label { get; set; }
        public bool Done { get; set; }
    }
}
