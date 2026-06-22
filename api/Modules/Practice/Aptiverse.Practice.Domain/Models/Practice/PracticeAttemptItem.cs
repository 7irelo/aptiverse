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

        // What the student chose (index into Options); -1 = unanswered.
        public int GivenAnswerIdx { get; set; } = -1;

        // The correct option index, copied from the test's answer key at
        // score time so the item is self-contained for ML even if the test
        // is later edited.
        public int CorrectAnswerIdx { get; set; }

        // Resolved correctness.
        public bool IsCorrect { get; set; }

        // Time spent on the question in milliseconds (mirrored from the
        // submission for convenient querying alongside correctness).
        public int TimeMs { get; set; }

        public virtual PracticeAttempt? Attempt { get; set; }
        public virtual AnswerSubmission? AnswerSubmission { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
