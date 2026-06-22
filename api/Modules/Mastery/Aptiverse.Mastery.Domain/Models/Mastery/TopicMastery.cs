using Aptiverse.Api.Data.Abstractions;
using Aptiverse.Mastery.Domain.Models.External.AcademicPlanning;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Mastery.Domain.Models.Mastery
{
    // Transactional per-student mastery row; mutated as mastery levels change.
    // Implements IEntityTimestamps for automatic audit stamping (additive).
    // NOTE: TopicId is string here (not long like the other entities) — left
    // unchanged per the PK/type-change exclusion.
    [Index(nameof(StudentSubjectId))]
    [Index(nameof(TopicId))]
    [Index(nameof(StudentSubjectId), nameof(TopicId))]
    public class TopicMastery : IEntityTimestamps
    {
        public long Id { get; set; }
        public long StudentSubjectId { get; set; }
        public string TopicId { get; set; }
        public double MasteryLevel { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public StudentSubjectTopic Topic { get; set; }
        public virtual StudentSubject StudentSubject { get; set; }
    }
}
