using Aptiverse.Api.Data.Abstractions;

namespace Aptiverse.Practice.Domain.Models.Practice
{
    // Derived per-attempt scoring summary. Created when an attempt is
    // scored and refreshed on re-score, so it opts into audit timestamps
    // (stamped automatically by AuditableEntityInterceptor).
    public class AttemptScoreSummary : IEntityTimestamps
    {
        public long Id { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
