using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Workspace.Domain.Models
{
    // A free-text draft that the student is editing in /dashboard/workspace.
    // One row per (user, assessment, panel) — the panels are independent
    // text streams ("notes" / "essay" / "scratchpad") that all hang off
    // the same active SBA.
    //
    // The frontend autosaves on a 1.5s debounce so the row is written
    // continuously while the student types. Plenty cheap — a 2KB upsert
    // through Npgsql + RDS via tunnel is well under 50ms in practice.
    //
    // No FK navigation to Assessment yet — that lives in a sibling module
    // (academic-planning) and crossing the boundary just for a navigation
    // property buys us nothing the controller scope-by-user-id already
    // gives us. Orphans on assessment delete are acceptable for v1; a
    // sweep job can prune them later.
    [Index(nameof(UserId), nameof(AssessmentId), nameof(PanelKey), IsUnique = true)]
    public class WorkspaceDraft : IEntityTimestamps
    {
        public long Id { get; set; }

        // Owner — identity.users.id. Populated from the JWT NameIdentifier
        // claim on insert. Drafts are strictly user-scoped; the controller
        // never returns rows it doesn't own.
        public required string UserId { get; set; }

        // The SBA / assessment this draft is keyed to. Free-text "active
        // assessment" without a draft yet → no row, return defaults.
        public required long AssessmentId { get; set; }

        // "notes" / "essay" / "scratchpad". Free-text rather than an enum
        // so the frontend can add a new panel without a migration.
        public required string PanelKey { get; set; }

        public string Content { get; set; } = "";

        // Set once on insert by AuditableEntityInterceptor and protected
        // from being overwritten on subsequent autosave updates. Additive
        // column — the row was previously tracked only by UpdatedAt.
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Bumped automatically by AuditableEntityInterceptor on every
        // autosave update. Previously set manually by the upsert path;
        // the interceptor now keeps it current with zero wiring.
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
