using Microsoft.EntityFrameworkCore;
using Aptiverse.Api.Data.Abstractions;
using Aptiverse.Insights.Domain.Models.External.AcademicPlanning;

namespace Aptiverse.Insights.Domain.Models.Insights
{
    // Per-(student-subject) grade histogram bucket: a Grade label and the
    // Count of items that fell into it. Derived/recomputed insight data,
    // so it audits with CreatedAt/UpdatedAt.
    [Index(nameof(StudentSubjectId))]
    // Natural key for the AI grade-distribution upsert (ai/app/data/sinks.py):
    // one row per (student-subject, grade band). UNIQUE so ON CONFLICT binds.
    [Index(nameof(StudentSubjectId), nameof(Grade), IsUnique = true)]
    public class GradeDistribution : IEntityTimestamps
    {
        public long Id { get; set; }
        public long StudentSubjectId { get; set; }

        // Grade label for this bucket (e.g. letter grades "A+"/"B-" or
        // band labels). Kept as free-text string rather than an enum:
        // the stored values can't be guaranteed to round-trip to
        // PascalCase enum member names (e.g. "A+", "B-").
        public string Grade { get; set; }
        public int Count { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual StudentSubject StudentSubject { get; set; }
    }
}
