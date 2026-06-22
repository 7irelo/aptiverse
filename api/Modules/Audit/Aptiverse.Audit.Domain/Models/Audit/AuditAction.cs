using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Audit.Domain.Models.Audit
{
    // Catalogue of auditable action types (e.g. "User.Login",
    // "Goal.Updated"). Rows are looked up by Category / Severity for
    // filtered admin views and joined from AuditLog via ActionId.
    //
    // Adopts IEntityTimestamps: CreatedAt is already present and is now
    // stamped + protected by the interceptor; UpdatedAt is added so
    // edits (e.g. toggling IsActive) are tracked. Both columns are
    // additive.
    [Index(nameof(Category))]
    [Index(nameof(Severity))]
    [Index(nameof(IsActive))]
    public class AuditAction : IEntityTimestamps
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        // Free-text grouping (e.g. "Authentication", "Goals"). Left as
        // a string: producers introduce new categories without a
        // migration and there is no documented closed set to map to.
        public string Category { get; set; }

        // Closed set persisted as text by the enum-as-string convention.
        // Existing rows store the PascalCase default "Info", which
        // matches AuditSeverity.Info.
        public AuditSeverity Severity { get; set; } = AuditSeverity.Info;

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<AuditLog> AuditLogs { get; set; }
    }
}
