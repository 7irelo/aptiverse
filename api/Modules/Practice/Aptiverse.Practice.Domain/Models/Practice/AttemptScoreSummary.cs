using System.ComponentModel.DataAnnotations.Schema;
using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Practice.Domain.Models.Practice
{
    // Derived per-attempt scoring summary. Created when an attempt is scored
    // and refreshed on re-score, so it opts into audit timestamps (stamped
    // automatically by AuditableEntityInterceptor).
    //
    // PerTopic correctness is the headline ML signal — it's what feeds the
    // mastery model. Stored as a jsonb list of (topic, correct, total) rows.
    [Index(nameof(AttemptId), IsUnique = true)]
    public class AttemptScoreSummary : IEntityTimestamps
    {
        public long Id { get; set; }

        // 1:1 with the attempt.
        public long AttemptId { get; set; }

        // Totals.
        public int TotalQuestions { get; set; }
        public int CorrectCount { get; set; }
        public int IncorrectCount { get; set; }
        public int UnansweredCount { get; set; }

        // Final score as a 0-100 percentage (rounded). Correct / Total.
        public int ScorePercent { get; set; }

        // Total time across all answered questions, milliseconds.
        public int TotalTimeMs { get; set; }

        // Per-topic correctness breakdown — the mastery feed. jsonb column.
        public List<TopicScore> PerTopic { get; set; } = [];

        public virtual PracticeAttempt? Attempt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    // One topic's correctness within an attempt. Value object serialized into
    // AttemptScoreSummary.PerTopic. [NotMapped] keeps it out of entity
    // auto-discovery.
    [NotMapped]
    public class TopicScore
    {
        public string Topic { get; set; } = "";
        public int Correct { get; set; }
        public int Total { get; set; }

        // Correct / Total as a 0-100 percentage. Precomputed so consumers
        // don't divide-by-zero on empty topics.
        public int Percent { get; set; }
    }
}
