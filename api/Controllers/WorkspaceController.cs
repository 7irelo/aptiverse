using System.Security.Claims;
using System.Text.Json.Serialization;
using Aptiverse.Api.Data;
using Aptiverse.Workspace.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Workspace.Controllers
{
    // The student workspace's per-SBA draft store. The frontend's
    // /dashboard/workspace page autosaves Notes / Essay / Scratchpad
    // content for whichever SBA is currently active.
    //
    // Endpoints:
    //   GET  /api/workspace/drafts/{assessmentId}        — all panels (flat object)
    //   PUT  /api/workspace/drafts/{assessmentId}        — upsert one panel
    [ApiController]
    [Route("api/workspace")]
    [Authorize]
    public class WorkspaceController(ApplicationDbContext db) : ControllerBase
    {
        private readonly ApplicationDbContext _db = db;

        // Panels the workspace UI supports today. Lets the controller
        // reject typos before they reach the DB and surface as silent
        // "draft never reloaded" bugs for the user.
        private static readonly HashSet<string> AllowedPanels =
            new(StringComparer.Ordinal) { "notes", "essay", "scratchpad" };

        private string? CurrentUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value;

        // Returns every panel's content for the given assessment, plus
        // each panel's UpdatedAt. Missing panels come back as empty
        // strings — first-time visitors don't have to deal with 404s
        // for "no draft yet".
        [HttpGet("drafts/{assessmentId:long}")]
        public async Task<ActionResult<FrontendWorkspaceDraftsDto>> Get(long assessmentId)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var rows = await _db.Set<WorkspaceDraft>()
                .AsNoTracking()
                .Where(d => d.UserId == userId && d.AssessmentId == assessmentId)
                .ToListAsync();

            var byPanel = rows.ToDictionary(r => r.PanelKey, r => r, StringComparer.Ordinal);
            return Ok(new FrontendWorkspaceDraftsDto
            {
                AssessmentId = assessmentId,
                Notes = MapPanel(byPanel, "notes"),
                Essay = MapPanel(byPanel, "essay"),
                Scratchpad = MapPanel(byPanel, "scratchpad"),
            });
        }

        private static FrontendDraftPanelDto MapPanel(Dictionary<string, WorkspaceDraft> byPanel, string key) =>
            byPanel.TryGetValue(key, out var row)
                ? new FrontendDraftPanelDto { Content = row.Content, UpdatedAt = row.UpdatedAt }
                : new FrontendDraftPanelDto();

        // Upsert a single panel. Body: { panel: "notes"|"essay"|"scratchpad", content: "..." }.
        // We could expose a batched "all-panels" PUT — but the autosave
        // debounce is per-textfield, so one-panel-at-a-time matches the
        // frontend's actual call pattern and minimises DB writes.
        [HttpPut("drafts/{assessmentId:long}")]
        public async Task<ActionResult<FrontendDraftPanelDto>> Put(long assessmentId, [FromBody] FrontendDraftUpdateDto body)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var panel = (body.Panel ?? "").Trim().ToLowerInvariant();
            if (!AllowedPanels.Contains(panel))
            {
                return BadRequest(new { error = "unknown_panel", panel, allowed = AllowedPanels });
            }
            // 1 MB is generous for a 5-page essay; protects us from a
            // runaway textarea pushing megabytes of garbage.
            var content = body.Content ?? "";
            if (content.Length > 1_000_000)
            {
                return BadRequest(new { error = "content_too_large", maxChars = 1_000_000 });
            }

            var existing = await _db.Set<WorkspaceDraft>()
                .FirstOrDefaultAsync(d =>
                    d.UserId == userId &&
                    d.AssessmentId == assessmentId &&
                    d.PanelKey == panel);

            if (existing is null)
            {
                existing = new WorkspaceDraft
                {
                    UserId = userId,
                    AssessmentId = assessmentId,
                    PanelKey = panel,
                    Content = content,
                    UpdatedAt = DateTime.UtcNow,
                };
                _db.Set<WorkspaceDraft>().Add(existing);
            }
            else
            {
                existing.Content = content;
                existing.UpdatedAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync();

            return Ok(new FrontendDraftPanelDto
            {
                Content = existing.Content,
                UpdatedAt = existing.UpdatedAt,
            });
        }
    }

    public record FrontendWorkspaceDraftsDto
    {
        [JsonPropertyName("assessmentId")] public long AssessmentId { get; init; }
        [JsonPropertyName("notes")] public FrontendDraftPanelDto Notes { get; init; } = new();
        [JsonPropertyName("essay")] public FrontendDraftPanelDto Essay { get; init; } = new();
        [JsonPropertyName("scratchpad")] public FrontendDraftPanelDto Scratchpad { get; init; } = new();
    }

    public record FrontendDraftPanelDto
    {
        [JsonPropertyName("content")] public string Content { get; init; } = "";
        // null when the panel has never been saved (empty string content).
        // Frontend treats null as "no save yet" for the autosave indicator.
        [JsonPropertyName("updatedAt")] public DateTime? UpdatedAt { get; init; }
    }

    public record FrontendDraftUpdateDto
    {
        [JsonPropertyName("panel")] public string? Panel { get; init; }
        [JsonPropertyName("content")] public string? Content { get; init; }
    }

}
