using Aptiverse.Api.Data.Abstractions;
using Aptiverse.Mastery.Domain.Models.External.AcademicPlanning;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Mastery.Domain.Models.Mastery
{
    // Transactional: rows are created/updated/deleted via KnowledgeGapService.
    // Implements IEntityTimestamps so the SaveChanges interceptor stamps
    // CreatedAt/UpdatedAt automatically (new columns, additive).
    [Index(nameof(StudentSubjectId))]
    [Index(nameof(TopicId))]
    [Index(nameof(Severity))]
    // Matches the common service query shape: filter by subject + severity.
    [Index(nameof(StudentSubjectId), nameof(Severity))]
    public class KnowledgeGap : IEntityTimestamps
    {
        public long Id { get; set; }
        public long StudentSubjectId { get; set; }
        public long TopicId { get; set; }
        public string Concept { get; set; }

        // Closed-set conceptually, but kept as string: the Application layer
        // (KnowledgeGapService filter/sort predicates) compares this against
        // a string severity parameter and the DTOs expose it as string.
        // Converting to an enum would break that out-of-module code, so it
        // stays text. The foundation enum-as-string convention can adopt it
        // later once the Application layer is updated in the same pass.
        public string Severity { get; set; }
        public DateTime LastTested { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public virtual StudentSubject StudentSubject { get; set; }
        public virtual StudentSubjectTopic Topic { get; set; }
    }
}
