using Aptiverse.Api.Data.Abstractions;

namespace Aptiverse.Practice.Domain.Models.Practice
{
    // Per-question record within a PracticeAttempt. Transactional row
    // created/updated as the student works through the attempt, so it
    // opts into audit timestamps (stamped by AuditableEntityInterceptor).
    public class PracticeAttemptItem : IEntityTimestamps
    {
        public long Id { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
