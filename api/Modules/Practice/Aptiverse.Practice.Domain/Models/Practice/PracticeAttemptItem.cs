using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Practice.Domain.Models.Practice
{
    // Per-question graded record within a PracticeAttempt. Created at submit
    // time once the attempt is scored. Holds the resolved correctness + the
    // topic the question belongs to, which is the granularity mastery later
    // consumes.
    //
    // Transactional row created/updated as the attempt is scored, so it opts
    // into audit timestamps (stamped by AuditableEntityInterceptor).
    [Index(nameof(AttemptId))]
    [Index(nameof(AttemptId), nameof(QuestionId), IsUnique = true)]
    [Index(nameof(Topic))]
    public class PracticeAttemptItem : IEntityTimestamps
    {
        public long Id { get; set; }

        // FK to the owning attempt.
        public long AttemptId { get; set; }

        // FK to the raw submission this grade was derived from. Nullable so a
        // skipped/unanswered question can still get a (false) item row.
        public long? AnswerSubmissionId { get; set; }

        // The PracticeQuestion.Id this item grades.
        public string QuestionId { get; set; } = "";

        // Topic label resolved from the question (used for per-topic rollup).
        public string Topic { get; set; } = "";

        // What the student chose (index into Options); -1 = unanswered or a
        // non-multiple-choice question.
        public int GivenAnswerIdx { get; set; } = -1;

        // The correct option index, copied from the test's answer key at
        // score time so the item is self-contained for ML even if the test
        // is later edited. -1 for non-multiple-choice questions.
        public int CorrectAnswerIdx { get; set; }

        // Typed answer + expected answer for short-answer / reading short parts,
        // copied in at score time so the graded item stands alone for review
        // and ML. Null for multiple-choice.
        public string? GivenAnswerText { get; set; }
        public string? ExpectedAnswerText { get; set; }

        // Resolved correctness. On a marked exam question this is derived from
        // the marks (full marks = correct), because per-topic mastery counts
        // questions rather than marks and still needs an answer.
        public bool IsCorrect { get; set; }

        // ---- Marked written answers --------------------------------------
        // Null on everything that predates exam papers, and on any question
        // scored by answer key rather than by an examiner.

        // Marks awarded and marks on offer for this question.
        //
        // A bool cannot describe an exam. "Explain why the reaction is
        // exothermic (5)" answered with three of the five points is not correct
        // and it is certainly not wrong, and the difference is most of what a
        // student wants to know. IsCorrect above survives for mastery, which
        // counts questions, while these carry what the paper is actually out of.
        public int? MarksAwarded { get; set; }
        public int? MarksAvailable { get; set; }

        // The examiner's comment on this answer: where the marks went and what
        // was missing. The most valuable thing on the page, and the reason a
        // marked paper beats a score out of ten.
        public string? Feedback { get; set; }

        // Time spent on the question in milliseconds (mirrored from the
        // submission for convenient querying alongside correctness).
        public int TimeMs { get; set; }

        public virtual PracticeAttempt? Attempt { get; set; }
        public virtual AnswerSubmission? AnswerSubmission { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
