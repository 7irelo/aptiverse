using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Domain.Models
{
    // A parent -> student link. Invite and accepted relationship live in one
    // row: the parent creates it by inviting a student's email, and the student
    // accepts from their Connections hub, which fills StudentUserId and flips
    // Status to "accepted". The relationship is read-only for the parent, they
    // can view a linked student's progress, never change it. Auto-maps to
    // identity.parent_links via reflection discovery.
    [Index(nameof(Token), IsUnique = true)]
    [Index(nameof(ParentUserId))]
    [Index(nameof(StudentUserId))]
    [Index(nameof(StudentEmail))]
    public class ParentLink : IEntityTimestamps
    {
        public long Id { get; set; }

        // identity.users.id of the parent who sent the invite, plus their
        // display name (snapshot, so the student sees who invited them).
        public string ParentUserId { get; set; } = "";
        public string ParentName { get; set; } = "";

        // identity.users.id of the student. Null until the invite is accepted.
        public string? StudentUserId { get; set; }

        // Lowercased email the invite was addressed to. Used to match incoming
        // invites to the signed-in student.
        public string StudentEmail { get; set; } = "";

        // Opaque token carried in the invite link.
        public string Token { get; set; } = "";

        // pending | accepted | declined | revoked
        public string Status { get; set; } = "pending";

        // When the student accepted or declined.
        public DateTime? RespondedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
