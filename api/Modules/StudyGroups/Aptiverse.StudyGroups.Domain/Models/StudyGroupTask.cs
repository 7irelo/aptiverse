using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.StudyGroups.Domain.Models
{
    // A shared task on a study group's board. A member adds one, everyone gets
    // notified, and each member can sync it into their own upcoming list (a
    // calendar event) so a group deadline shows up alongside their personal
    // ones. Completion is shared: the group ticks it off together. Auto-maps to
    // study_groups.study_group_tasks via reflection discovery.
    [Index(nameof(StudyGroupId), nameof(DueDate))]
    public class StudyGroupTask : IEntityTimestamps
    {
        public long Id { get; set; }

        public long StudyGroupId { get; set; }

        // identity.users.id of whoever added it, plus their display name so the
        // board can attribute it without a join.
        public string CreatedByUserId { get; set; } = "";
        public string CreatedByName { get; set; } = "";

        public string Title { get; set; } = "";
        public string Notes { get; set; } = "";

        // When it is due. Optional, but a task with a date is the one worth
        // syncing into a member's upcoming list.
        public DateTime? DueDate { get; set; }

        // Shared completion: any member can tick the group's task off.
        public bool Done { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
