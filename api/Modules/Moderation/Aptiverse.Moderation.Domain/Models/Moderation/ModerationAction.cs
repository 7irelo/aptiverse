using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Moderation.Domain.Models.Moderation
{
    // Actions taken against a report. Looked up by the report they
    // belong to (FK), by the moderator who took them, and by action
    // type when auditing a moderator's activity.
    [Index(nameof(ContentReportId))]
    [Index(nameof(ModeratorUserId))]
    [Index(nameof(ActionType))]
    public class ModerationAction : IEntityTimestamps
    {
        public long Id { get; set; }
        public long ContentReportId { get; set; }
        public string ModeratorUserId { get; set; }

        // Action taken (dismiss/warn/suspend/remove). The Frontend input
        // DTO documents these as lowercase values, while the domain has
        // no default to confirm casing, so this is intentionally kept as
        // a free-text string — converting to an enum cannot guarantee
        // the stored string values would remain identical.
        public string ActionType { get; set; }

        public string Reason { get; set; }
        public string Notes { get; set; }
        public bool IsAutomated { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Added so updates (UpdateAsync exists on the service) are
        // audited. Bumped automatically by AuditableEntityInterceptor;
        // additive new column.
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual ContentReport ContentReport { get; set; }
    }
}
