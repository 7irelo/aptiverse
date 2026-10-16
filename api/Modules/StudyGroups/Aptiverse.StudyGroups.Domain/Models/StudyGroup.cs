using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.StudyGroups.Domain.Models
{
    // A small peer study room, scoped to an academic unit (a subject slug for
    // high-school, a course practiceKey for tertiary, same id assessments and
    // practice use). Membership lives in StudyGroupMember. Auto-maps to
    // study_groups.study_groups via reflection discovery.
    [Index(nameof(SubjectId))]
    [Index(nameof(OwnerId))]
    public class StudyGroup : IEntityTimestamps
    {
        public long Id { get; set; }

        // identity.users.id of the creator (also the initial owner member).
        public string OwnerId { get; set; } = "";

        public string Name { get; set; } = "";

        // Academic unit id the group studies. Free-form so it works for both
        // high-school subjects and tertiary courses.
        public string SubjectId { get; set; } = "";

        public string Description { get; set; } = "";

        // open  = anyone can join
        // invite = only members can add others (join is blocked)
        public string Privacy { get; set; } = "open";

        // Hard ceiling on membership, set by the owner. Join is refused once the
        // roster reaches it. A small default keeps groups intimate; the owner can
        // widen it up to the enforced maximum.
        public int MemberCapacity { get; set; } = 12;

        // ---- Group preferences (owner-set) ----

        // Who may add a shared task: "everyone" (any member) or "admins" (owner
        // + admins only).
        public string TasksWhoCanAdd { get; set; } = "everyone";

        // Notify the rest of the group in-app when a task is added.
        public bool NotifyOnNewTask { get; set; } = true;

        // Automatically drop a new dated task into every member's upcoming list,
        // rather than leaving each member to sync it themselves.
        public bool AutoSyncTasks { get; set; }

        public DateTime? NextSession { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
