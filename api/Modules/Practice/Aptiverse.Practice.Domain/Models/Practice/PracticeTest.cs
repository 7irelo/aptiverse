using System.ComponentModel.DataAnnotations.Schema;
using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Practice.Domain.Models.Practice
{
    // A practice test definition (may be user-authored or AI-generated).
    // Not immutable catalog data — it is created and edited over time, so
    // it opts into audit timestamps (stamped by AuditableEntityInterceptor).
    //
    // Questions are stored inline as a jsonb column (PracticeQuestion is a
    // value object, not a separate table) — a test's question set is read and
    // written as a unit, and the answer key never needs to be queried
    // relationally. PracticeQuestionConfiguration wires the jsonb conversion.
    [Index(nameof(SubjectId))]
    [Index(nameof(SubjectId), nameof(Difficulty))]
    public class PracticeTest : IEntityTimestamps
    {
        public long Id { get; set; }

        // Canonical subject slug (e.g. "math", "physci"). Matches the Subject
        // catalog Id used elsewhere, so the UI can filter by subject without a
        // join. Kept as string to mirror the frontend PracticeTest contract.
        public string SubjectId { get; set; } = "";

        public string Title { get; set; } = "";

        // Topic labels this test exercises. Drives the per-topic correctness
        // tagging at score time (each question references one of these topics).
        // Stored as a jsonb string[] — see configuration.
        public List<string> Topics { get; set; } = [];

        // foundation | core | challenge — mirrors the frontend difficulty union.
        public string Difficulty { get; set; } = "core";

        public int DurationMinutes { get; set; }

        // Optional link to an Academic Planning SBA (assessment) id.
        public string? AlignedSBA { get; set; }

        // True when the test was produced by the practice-test generator
        // service rather than hand-authored.
        public bool AiGenerated { get; set; }

        // The ordered question set with the embedded answer key. Stored as a
        // jsonb column; the answer key (AnswerIdx) is never sent to the
        // student-facing question DTO — the Application layer strips it.
        public List<PracticeQuestion> Questions { get; set; } = [];

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    // A single multiple-choice question owned by a PracticeTest. Value object,
    // serialized into the parent's jsonb column — no separate table.
    // [NotMapped] tells ApplicationDbContext auto-discovery to skip it as an
    // entity.
    [NotMapped]
    public class PracticeQuestion
    {
        // Stable id within the test (e.g. "q1"). Used to correlate a submitted
        // answer back to the question it belongs to.
        public string Id { get; set; } = "";

        public string Question { get; set; } = "";

        public List<string> Options { get; set; } = [];

        // Index into Options that is the correct choice. This is the answer
        // key — never serialized to the student before they submit.
        public int AnswerIdx { get; set; }

        public string? Explanation { get; set; }

        // Topic label this question maps to (one of the parent test's Topics).
        // Drives per-topic correctness aggregation. Falls back to the test's
        // first topic at score time when blank.
        public string? Topic { get; set; }
    }
}
