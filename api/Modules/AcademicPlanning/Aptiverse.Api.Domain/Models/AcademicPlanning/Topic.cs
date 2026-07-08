using Microsoft.EntityFrameworkCore;

namespace Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning
{
    // Canonical, emergent topic vocabulary for a subject. There is no seeded
    // CAPS topic list — topics grow as AI practice generation tags questions:
    // a new label is slugified and upserted here, an existing one is reused.
    // This keeps the free-text topic strings on practice tests + score
    // summaries drawn from a controlled vocabulary, so per-topic mastery
    // buckets stay consistent instead of fragmenting ("Trig" vs "Trigonometry").
    //
    // Flat (subject -> topic), grade-agnostic. Shared across students for
    // catalog subjects; naturally private for a student-owned subject because
    // the SubjectId is itself private to that student.
    [Index(nameof(SubjectId))]
    [Index(nameof(SubjectId), nameof(Slug), IsUnique = true)]
    public class Topic
    {
        public long Id { get; set; }

        // FK to Subject.Id (the subject slug). Not a hard relational FK so a
        // student-owned subject id works the same as a catalog slug.
        public required string SubjectId { get; set; }

        // Slugified canonical key, unique per subject. The dedupe key.
        public required string Slug { get; set; }

        // Human display label (the first spelling we saw for this slug).
        public required string Name { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
