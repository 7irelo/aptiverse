using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Goals.Domain.Models.Goals
{
    [Index(nameof(GoalId))]
    [Index(nameof(IsCompleted))]
    public class GoalMilestone : IEntityTimestamps
    {
        public long Id { get; set; }
        public long GoalId { get; set; }

        public string Title { get; set; } = "";
        public string Description { get; set; } = "";

        // Manual ordering within a goal (1 = first to tackle).
        public int Priority { get; set; }

        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }

        // Points awarded when the milestone is verified.
        public int RewardPoints { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual Goal? Goal { get; set; }
    }
}
