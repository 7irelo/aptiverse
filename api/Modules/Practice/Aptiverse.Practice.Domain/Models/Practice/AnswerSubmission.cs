using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Practice.Domain.Models.Practice
{
    // The raw answer a student submitted for one question in an attempt —
    // exactly what arrived from the client, before/independent of grading.
    // Kept distinct from PracticeAttemptItem (the graded record) so the
    // un-touched input is preserved for ML and any later re-grade. One row
    // per answered question per attempt.
    //
    // Transactional row recorded at submit time and potentially updated on
    // re-grade, so it opts into audit timestamps (stamped by
    // AuditableEntityInterceptor).
    [Index(nameof(AttemptId))]
    [Index(nameof(AttemptId), nameof(QuestionId), IsUnique = true)]
    public class AnswerSubmission : IEntityTimestamps
    {
        public long Id { get; set; }

        // FK to the owning attempt.
        public long AttemptId { get; set; }

        // The PracticeQuestion.Id (stable string id within the test) this
        // answer is for.
        public string QuestionId { get; set; } = "";

        // Index the student selected into the question's Options. -1 means
        // the question was presented but left unanswered. Only meaningful for
        // multiple-choice questions.
        public int SelectedIdx { get; set; } = -1;

        // Typed answer for short-answer / reading short-response questions.
        // Null for multiple-choice. Preserved raw for ML and any later regrade.
        public string? TextAnswer { get; set; }

        // Wall-clock time the student spent on this question, in milliseconds.
        // 0 when the client didn't report timing. Core ML timing signal.
        public int TimeMs { get; set; }

        public virtual PracticeAttempt? Attempt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
