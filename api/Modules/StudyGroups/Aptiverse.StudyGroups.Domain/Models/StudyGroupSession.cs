using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.StudyGroups.Domain.Models
{
    // A scheduled meeting of a StudyGroup. Any member can schedule one; the
    // session's creator or the group owner can cancel it. A group's "next
    // session" is derived as the soonest upcoming one. Auto-maps to
    // study_groups.study_group_sessions via reflection discovery.
    [Index(nameof(StudyGroupId))]
    [Index(nameof(StartsAt))]
    public class StudyGroupSession : IEntityTimestamps
    {
        public long Id { get; set; }

        public long StudyGroupId { get; set; }

        // identity.users.id of whoever scheduled it.
        public string CreatedByUserId { get; set; } = "";

        public string Title { get; set; } = "";

        public DateTime StartsAt { get; set; }

        public int DurationMinutes { get; set; } = 60;

        // Free-form: a room, a place, or a meeting link.
        public string Location { get; set; } = "";

        // Set once the pre-session reminder has been fired to members, so the
        // background poller never double-notifies.
        public bool RemindersSent { get; set; }
        public DateTime? RemindersSentAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
