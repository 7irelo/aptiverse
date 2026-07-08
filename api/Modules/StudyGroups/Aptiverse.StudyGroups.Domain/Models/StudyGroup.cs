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

        public DateTime? NextSession { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
