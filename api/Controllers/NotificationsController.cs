using System.Security.Claims;
using System.Text.Json.Serialization;
using Aptiverse.Api.Data;
using Aptiverse.Notifications.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Notifications.Controllers
{
    [ApiController]
    [Route("api/notifications")]
    [Authorize]
    public class NotificationsController(ApplicationDbContext db) : ControllerBase
    {
        private readonly ApplicationDbContext _db = db;

        private string? CurrentUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value;

        // List the signed-in user's notifications, newest first. Capped
        // at 50 — the page UI doesn't paginate yet and we don't want
        // to ship five years of history in one response.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FrontendNotificationDto>>> Get(CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var rows = await _db.Set<Notification>()
                .AsNoTracking()
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.Time)
                .Take(50)
                .Select(n => new FrontendNotificationDto
                {
                    Id = n.Id.ToString(),
                    Kind = n.Kind,
                    Title = n.Title,
                    Body = n.Body,
                    Time = n.Time,
                    Read = n.Read,
                    ActionHref = n.ActionHref,
                })
                .ToListAsync(ct);

            return Ok(rows);
        }

        // Lightweight count for the navbar bell badge. Separate from
        // GET so the badge can refresh on a tighter interval without
        // re-shipping the entire list.
        [HttpGet("unread-count")]
        public async Task<ActionResult<UnreadCountDto>> GetUnreadCount(CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var count = await _db.Set<Notification>()
                .Where(n => n.UserId == userId && !n.Read)
                .CountAsync(ct);

            return Ok(new UnreadCountDto { Count = count });
        }

        // Mark a single notification as read. 404 when the user
        // doesn't own that id, not 403 — anti-enumeration.
        [HttpPatch("{id:long}/read")]
        public async Task<IActionResult> MarkRead(long id, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var row = await _db.Set<Notification>()
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId, ct);
            if (row is null) return NotFound();

            if (!row.Read)
            {
                row.Read = true;
                await _db.SaveChangesAsync(ct);
            }
            return NoContent();
        }

        // Mark every unread notification as read in one shot — drives
        // the "Mark all read" button on the page header.
        [HttpPost("mark-all-read")]
        public async Task<ActionResult<MarkAllReadDto>> MarkAllRead(CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            // EF Core 9 supports ExecuteUpdateAsync for set-based updates —
            // one round-trip instead of n.
            var marked = await _db.Set<Notification>()
                .Where(n => n.UserId == userId && !n.Read)
                .ExecuteUpdateAsync(s => s.SetProperty(n => n.Read, true), ct);

            return Ok(new MarkAllReadDto { Marked = marked });
        }
    }

    public record FrontendNotificationDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("kind")] public string Kind { get; init; } = "info";
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("body")] public string Body { get; init; } = "";
        [JsonPropertyName("time")] public DateTime Time { get; init; }
        [JsonPropertyName("read")] public bool Read { get; init; }
        [JsonPropertyName("actionHref")] public string? ActionHref { get; init; }
    }

    public record UnreadCountDto
    {
        [JsonPropertyName("count")] public int Count { get; init; }
    }

    public record MarkAllReadDto
    {
        [JsonPropertyName("marked")] public int Marked { get; init; }
    }
}
