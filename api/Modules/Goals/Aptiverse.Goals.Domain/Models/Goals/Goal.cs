using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Goals.Domain.Models.Goals
{
    // Simplified entity matching the FrontendGoalDto shape. The previous
    // Goal carried TargetValue/CurrentValue/Unit/GoalType which we're
    // not surfacing through the UI today — promote them back when there's
    // a real product reason.
    [Index(nameof(StudentId))]
    [Index(nameof(SubjectId))]
    [Index(nameof(Status))]
    [Index(nameof(Category))]
    [Index(nameof(StudentId), nameof(Status))]
    public class Goal : IEntityTimestamps
    {
        public long Id { get; set; }

        // Owner of the goal — identity.users.id. Populated from the JWT's
        // NameIdentifier on insert. Nullable on the column so the migration
        // doesn't blow up on legacy rows (those are wiped during the
        // AddGoalStudentId migration), but new inserts always set it.
        public string? StudentId { get; set; }

        // Optional link to a specific subject (e.g. "math", "physci").
        // Free-form for now — when AcademicPlanning.Subject is real, this
        // becomes a typed FK.
        public string? SubjectId { get; set; }

        public string Title { get; set; } = "";
        public string Description { get; set; } = "";

        // Display-only "what done looks like" label ("75% mastery", "3 / 3").
        public string Target { get; set; } = "";

        // 0-100 percent. Persisted (not derived) so teachers can override.
        public int Progress { get; set; }

        // active | at_risk | completed | verified
        public string Status { get; set; } = "active";

        public DateTime DueDate { get; set; }

        // academic | wellbeing | habit | career
        public string Category { get; set; } = "academic";

        // Optional reward label shown next to the goal card.
        public string? Reward { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<GoalMilestone> Milestones { get; set; } = [];
    }
}
