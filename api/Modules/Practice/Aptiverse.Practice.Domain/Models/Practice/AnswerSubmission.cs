using Aptiverse.Api.Data.Abstractions;

namespace Aptiverse.Practice.Domain.Models.Practice
{
    // A submitted answer for a question in an attempt. Transactional row
    // recorded at submit time and potentially updated on re-grade, so it
    // opts into audit timestamps (stamped by AuditableEntityInterceptor).
    public class AnswerSubmission : IEntityTimestamps
    {
        public long Id { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
