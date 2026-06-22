using Microsoft.EntityFrameworkCore;
using Aptiverse.Api.Data.Abstractions;
using Aptiverse.Insights.Domain.Models.External.AcademicPlanning;

namespace Aptiverse.Insights.Domain.Models.Insights
{
    // A generated improvement suggestion for a (student-subject, topic).
    // Regenerated as the student's performance changes, so it audits with
    // CreatedAt/UpdatedAt.
    [Index(nameof(StudentSubjectId))]
    [Index(nameof(StudentSubjectTopicId))]
    [Index(nameof(StudentSubjectId), nameof(Priority))]
    // Natural key for the AI tips upsert (ai/app/data/sinks.py): one row per
    // (student-subject, topic). UNIQUE so the Python ON CONFLICT path binds.
    [Index(nameof(StudentSubjectId), nameof(StudentSubjectTopicId), IsUnique = true)]
    public class ImprovementTip : IEntityTimestamps
    {
        public long Id { get; set; }
        public long StudentSubjectId { get; set; }
        public long StudentSubjectTopicId { get; set; }
        public string Tip { get; set; }

        // Ordering rank for the tip (lower = surfaced first). Numeric
        // integer, not a closed label set — left as int (no enum).
        public int Priority { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual StudentSubject StudentSubject { get; set; }
        public virtual StudentSubjectTopic StudentSubjectTopic { get; set; }
    }
}
