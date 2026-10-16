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
    [Index(nameof(OwnerStudentId))]
    public class PracticeTest : IEntityTimestamps
    {
        public long Id { get; set; }

        // Owner of a privately-generated test. Null = a shared test (teacher-
        // authored or seeded), visible to everyone; non-null = an AI test the
        // student generated for themselves, visible only to them. Keeps
        // "generate from your weakest" out of the global catalogue.
        public string? OwnerStudentId { get; set; }

        // Canonical subject slug (e.g. "math", "physci"). Matches the Subject
        // catalog Id used elsewhere, so the UI can filter by subject without a
        // join. Kept as string to mirror the frontend PracticeTest contract.
        public string SubjectId { get; set; } = "";

        public string Title { get; set; } = "";

        // Content format: multiple_choice (default, back-compatible) | short_answer
        // | reading | flashcards | essay. Governs how the client renders + takes
        // it and how the service marks it. Existing rows default to
        // multiple_choice via the column default.
        public string Format { get; set; } = "multiple_choice";

        // Reading-comprehension passage the questions refer to. Null for other
        // formats.
        public string? Passage { get; set; }

        // Essay prompt. Null for non-essay formats. An essay test is feedback-
        // only: the student writes in the workspace and the tutor comments
        // against Criteria; there is no scored attempt.
        public string? Prompt { get; set; }

        // Essay marking criteria (jsonb string[]). Empty for non-essay formats.
        public List<string> Criteria { get; set; } = [];

        // Topic labels this test exercises. Drives the per-topic correctness
        // tagging at score time (each question references one of these topics).
        // Stored as a jsonb string[] — see configuration.
        public List<string> Topics { get; set; } = [];

        // foundation | core | challenge — mirrors the frontend difficulty union.
        public string Difficulty { get; set; } = "core";

        public int DurationMinutes { get; set; }

        // The Academic Planning assessment this test was generated for. A
        // student cannot conjure practice out of nothing: they generate it
        // against something they have actually logged, past or upcoming, and
        // the assessment is what supplies the subject and the level.
        //
        // Null on seeded/teacher-authored tests and on anything generated
        // before this was required, so it stays nullable.
        //
        // The column is still called aligned_sba. "SBA" is CAPS high-school
        // language and this now carries a university student's assessments
        // too, so the property reads level-neutrally while the mapping keeps
        // the existing column and costs no migration.
        //
        // The name is spelled out in full because the snake_case convention
        // only derives a column name for properties that don't declare one, and
        // an explicit [Column] is taken verbatim. "AlignedSBA" here produced a
        // quoted "AlignedSBA" that does not exist, and every read of the
        // practice list 500'd on it.
        [Column("aligned_sba")]
        public string? AssessmentId { get; set; }

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

        // How this question is taken + marked: mc (default) | short | flashcard.
        // Reading tests mix mc and short. Defaults keep every existing jsonb
        // question a multiple-choice one.
        public string Kind { get; set; } = "mc";

        public List<string> Options { get; set; } = [];

        // Index into Options that is the correct choice. This is the answer
        // key — never serialized to the student before they submit. Only
        // meaningful for Kind == "mc".
        public int AnswerIdx { get; set; }

        // Short-answer marking key: the canonical expected answer plus any
        // acceptable alternates. Marked by case/whitespace/punctuation-
        // insensitive match — no OCR, no free-form AI grading.
        public string? ExpectedAnswer { get; set; }
        public List<string> AcceptableAnswers { get; set; } = [];

        // Flashcard back (the answer / definition). Front is Question. Only
        // set for Kind == "flashcard".
        public string? Back { get; set; }

        public string? Explanation { get; set; }

        // Topic label this question maps to (one of the parent test's Topics).
        // Drives per-topic correctness aggregation. Falls back to the test's
        // first topic at score time when blank.
        public string? Topic { get; set; }

        // ---- Exam papers -------------------------------------------------
        // Only meaningful when the parent test's Format is "exam". Everything
        // below rides in the same jsonb column as the rest of the question, so
        // none of it is a migration: an older question simply deserialises with
        // the defaults.

        // What this question is out of. A real paper is marked out of a total,
        // not out of a question count: "1.3 (5)" means five marks are on offer
        // and a student budgets their time by that number. Defaults to 1, which
        // is exactly what every non-exam test already behaves like, so
        // marks-based scoring and question-count scoring agree on those.
        public int Marks { get; set; } = 1;

        // Section this question sits in ("A", "B", "C"). Null outside an exam.
        // Sections are what make a paper feel like a paper: a block of
        // multiple-choice to warm up, then short answers, then something long.
        public string? Section { get; set; }

        // The marking memo for a written answer: what an examiner is looking
        // for, and where the marks are. Kind == "short" or "long" only.
        //
        // This exists because ExpectedAnswer above cannot carry a real memo. It
        // holds one canonical string matched case-insensitively, which is fine
        // for "1789" and useless for "explain why the reaction is exothermic",
        // where a correct answer can be written fifty ways and half marks are
        // normal. The memo is handed to the marker along with the student's
        // answer, so partial credit is awarded against stated criteria rather
        // than invented on the spot.
        public string? MarkingMemo { get; set; }
    }
}
