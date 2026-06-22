using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Wellbeing.Domain.Models.Wellbeing
{
    // A student-set wellbeing goal. Transactional (created, completed,
    // edited), so it opts into IEntityTimestamps for audit stamping.
    [Index(nameof(StudentId))]
    [Index(nameof(StudentId), nameof(IsCompleted))]
    [Index(nameof(Category))]
    [Index(nameof(IsCompleted))]
    [Index(nameof(TargetDate))]
    public class DiaryGoal : IEntityTimestamps
    {
        public long Id { get; set; }
        public long StudentId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        // Free-text category. Left as string: no documented closed value set
        // exists in the module to guarantee enum-string compatibility with
        // stored values.
        public string Category { get; set; }
        public DateTime TargetDate { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
