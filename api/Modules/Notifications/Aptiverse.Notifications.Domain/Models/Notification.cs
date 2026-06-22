using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Notifications.Domain.Models
{
    // One in-app notification for a user. Created by other parts of
    // the system (assessment-due reminders, celebration on goal
    // completion, wellbeing alerts when stress trends up) and read
    // back by the bell icon + /dashboard/notifications page.
    //
    // No global broadcast notifications in this entity — every row is
    // user-scoped. Broadcast-style "everyone gets it" would be a
    // separate Announcement entity; out of scope for v1.
    [Index(nameof(UserId), nameof(Time))]
    [Index(nameof(UserId), nameof(Read))]
    [Index(nameof(UserId), nameof(Kind))]
    public class Notification : IEntityTimestamps
    {
        public long Id { get; set; }

        // Recipient — identity.users.id. The controller filters every
        // query by the JWT user; cross-user reads are impossible.
        public required string UserId { get; set; }

        // "celebration" / "reminder" / "alert" / "info" — drives the
        // emoji + accent colour on the frontend KIND_AVATAR map. Kept
        // as free-text rather than an enum so a producer can introduce
        // a new kind without a migration.
        public required string Kind { get; set; }

        public required string Title { get; set; }
        public required string Body { get; set; }

        // The displayed "when". Producers set this to the moment the
        // notification's underlying event happened (goal completed at
        // 4pm), not when the row was inserted (which might be batched
        // a few minutes later). Lets the UI show "2h ago" honestly.
        public DateTime Time { get; set; } = DateTime.UtcNow;

        public bool Read { get; set; }

        // Optional deep link the "View" button on the notification
        // row navigates to. Null when the notification is purely
        // informational with nowhere meaningful to go.
        public string? ActionHref { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Bumped automatically by AuditableEntityInterceptor on every
        // update (e.g. when Read flips false -> true via mark-as-read).
        // CreatedAt is protected from being overwritten on update.
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
