using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Practice.Domain.Models.Practice
{
    // A student's attempt at a practice test. Transactional row that is
    // created when an attempt starts and mutated as it is submitted /
    // scored, so it opts into audit timestamps. CreatedAt/UpdatedAt are
    // stamped automatically by AuditableEntityInterceptor.
    //
    // This is the #1 ML signal source: every attempt, with per-item
    // correctness + timing and the per-topic rollup, feeds mastery later.
    [Index(nameof(StudentId))]
    [Index(nameof(TestId))]
    [Index(nameof(StudentId), nameof(TestId))]
    [Index(nameof(StudentId), nameof(Status))]
    public class PracticeAttempt : IEntityTimestamps
    {
        public long Id { get; set; }

        // FK to the PracticeTest being attempted.
        public long TestId { get; set; }

        // Owner — identity.users.id (string UserId), mirrors the rest of the
        // app's per-student scoping.
        public string StudentId { get; set; } = "";

        public DateTime StartedAt { get; set; }
        public DateTime? SubmittedAt { get; set; }

        // Proctoring signal: how many times the student left the test tab
        // (switched tab / app / minimised) while the attempt was live and not
        // paused. Reported by the client at submit; 0 for a clean run.
        public int FocusLossCount { get; set; }

        // Persisted as text via the enum-as-string convention.
        public AttemptStatus Status { get; set; } = AttemptStatus.InProgress;

        // Denormalised final score percentage (0-100), null until submitted.
        // Duplicated from AttemptScoreSummary.ScorePercent so the attempts
        // list can render without loading the summary; the summary remains
        // the authoritative breakdown.
        public int? Score { get; set; }

        public virtual PracticeTest? Test { get; set; }

        // Per-question records, populated at submit time.
        public virtual ICollection<PracticeAttemptItem> Items { get; set; } = [];

        // 1:1 derived scoring rollup, written when the attempt is scored.
        public virtual AttemptScoreSummary? ScoreSummary { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
