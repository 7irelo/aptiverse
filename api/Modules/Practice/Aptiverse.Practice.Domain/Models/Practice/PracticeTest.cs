using Aptiverse.Api.Data.Abstractions;

namespace Aptiverse.Practice.Domain.Models.Practice
{
    // A practice test definition (may be user-authored or AI-generated).
    // Not immutable catalog data — it is created and edited over time, so
    // it opts into audit timestamps (stamped by AuditableEntityInterceptor).
    public class PracticeTest : IEntityTimestamps
    {
        public long Id { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
