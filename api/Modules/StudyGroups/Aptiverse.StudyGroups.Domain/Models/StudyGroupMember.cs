using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.StudyGroups.Domain.Models
{
    // A student's membership of a StudyGroup. The (StudyGroupId, UserId) pair is
    // unique so a student can't join twice. Auto-maps to
    // study_groups.study_group_members via reflection discovery.
    [Index(nameof(StudyGroupId))]
    [Index(nameof(UserId))]
    [Index(nameof(StudyGroupId), nameof(UserId), IsUnique = true)]
    public class StudyGroupMember : IEntityTimestamps
    {
        public long Id { get; set; }

        public long StudyGroupId { get; set; }

        // identity.users.id of the member.
        public string UserId { get; set; } = "";

        // owner | member
        public string Role { get; set; } = "member";

        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
