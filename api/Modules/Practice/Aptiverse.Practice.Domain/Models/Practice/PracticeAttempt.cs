using Aptiverse.Api.Data.Abstractions;

namespace Aptiverse.Practice.Domain.Models.Practice
{
    // A student's attempt at a practice test. Transactional row that is
    // created when an attempt starts and mutated as it is submitted /
    // scored, so it opts into audit timestamps. CreatedAt/UpdatedAt are
    // stamped automatically by AuditableEntityInterceptor.
    public class PracticeAttempt : IEntityTimestamps
    {
        public long Id { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
