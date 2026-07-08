using System.Security.Claims;
using System.Text.Json.Serialization;
using Aptiverse.Api.Data;
using Aptiverse.StudyGroups.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.StudyGroups.Controllers
{
    // Peer study groups. Students create groups scoped to an academic unit,
    // then join open ones. Membership lives in study_group_members; a group's
    // member count and the caller's own membership are computed per request.
    [ApiController]
    [Route("api/study-groups")]
    [Authorize]
    public class StudyGroupsController(ApplicationDbContext db) : ControllerBase
    {
        private readonly ApplicationDbContext _db = db;

        private string? CurrentUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value;

        // Groups the caller can see: every open group, plus any (including
        // invite-only) that they already belong to.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FrontendStudyGroupDto>>> GetStudyGroups(CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var myGroupIds = await _db.Set<StudyGroupMember>().AsNoTracking()
                .Where(m => m.UserId == uid)
                .Select(m => m.StudyGroupId)
                .ToListAsync(ct);
            var mine = myGroupIds.ToHashSet();

            var groups = await _db.Set<StudyGroup>().AsNoTracking()
                .Where(g => g.Privacy == "open" || mine.Contains(g.Id))
                .OrderByDescending(g => g.CreatedAt)
                .ToListAsync(ct);

            var ids = groups.Select(g => g.Id).ToList();
            var counts = (await _db.Set<StudyGroupMember>().AsNoTracking()
                .Where(m => ids.Contains(m.StudyGroupId))
                .GroupBy(m => m.StudyGroupId)
                .Select(grp => new { Id = grp.Key, Count = grp.Count() })
                .ToListAsync(ct))
                .ToDictionary(x => x.Id, x => x.Count);

            // Each group's "next session" is the soonest upcoming scheduled one.
            var now = DateTime.UtcNow;
            var nextSessions = (await _db.Set<StudyGroupSession>().AsNoTracking()
                .Where(s => ids.Contains(s.StudyGroupId) && s.StartsAt >= now)
                .GroupBy(s => s.StudyGroupId)
                .Select(grp => new { Id = grp.Key, Next = grp.Min(x => x.StartsAt) })
                .ToListAsync(ct))
                .ToDictionary(x => x.Id, x => x.Next);

            return Ok(groups.Select(g => ToDto(
                g,
                counts.TryGetValue(g.Id, out var c) ? c : 0,
                isMember: mine.Contains(g.Id),
                isOwner: g.OwnerId == uid,
                nextSession: nextSessions.TryGetValue(g.Id, out var n) ? n : null)));
        }

        [HttpPost]
        public async Task<ActionResult<FrontendStudyGroupDto>> Create([FromBody] CreateStudyGroupDto body, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var name = (body.Name ?? "").Trim();
            if (name.Length < 2) return BadRequest("Give the group a name.");
            var subjectId = (body.SubjectId ?? "").Trim();
            if (subjectId.Length == 0) return BadRequest("Pick a subject or course for the group.");

            var group = new StudyGroup
            {
                OwnerId = uid,
                Name = name,
                SubjectId = subjectId,
                Description = (body.Description ?? "").Trim(),
                Privacy = body.Privacy == "invite" ? "invite" : "open",
            };
            _db.Add(group);
            await _db.SaveChangesAsync(ct);

            _db.Add(new StudyGroupMember { StudyGroupId = group.Id, UserId = uid, Role = "owner" });
            await _db.SaveChangesAsync(ct);

            return Ok(ToDto(group, members: 1, isMember: true, isOwner: true, nextSession: null));
        }

        [HttpPost("{id:long}/join")]
        public async Task<IActionResult> Join(long id, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var group = await _db.Set<StudyGroup>().FirstOrDefaultAsync(g => g.Id == id, ct);
            if (group is null) return NotFound();
            if (group.Privacy != "open") return Forbid();

            var already = await _db.Set<StudyGroupMember>()
                .AnyAsync(m => m.StudyGroupId == id && m.UserId == uid, ct);
            if (!already)
            {
                _db.Add(new StudyGroupMember { StudyGroupId = id, UserId = uid, Role = "member" });
                await _db.SaveChangesAsync(ct);
            }
            return NoContent();
        }

        [HttpPost("{id:long}/leave")]
        public async Task<IActionResult> Leave(long id, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var membership = await _db.Set<StudyGroupMember>()
                .FirstOrDefaultAsync(m => m.StudyGroupId == id && m.UserId == uid, ct);
            if (membership is null) return NoContent(); // not a member; idempotent

            var wasOwner = membership.Role == "owner";
            _db.Remove(membership);
            await _db.SaveChangesAsync(ct);

            var remaining = await _db.Set<StudyGroupMember>()
                .Where(m => m.StudyGroupId == id)
                .OrderBy(m => m.JoinedAt)
                .ToListAsync(ct);

            if (remaining.Count == 0)
            {
                // Empty group: clean it up.
                var group = await _db.Set<StudyGroup>().FirstOrDefaultAsync(g => g.Id == id, ct);
                if (group is not null) _db.Remove(group);
                await _db.SaveChangesAsync(ct);
            }
            else if (wasOwner)
            {
                // Hand ownership to the longest-standing remaining member.
                var next = remaining[0];
                next.Role = "owner";
                var group = await _db.Set<StudyGroup>().FirstOrDefaultAsync(g => g.Id == id, ct);
                if (group is not null) group.OwnerId = next.UserId;
                await _db.SaveChangesAsync(ct);
            }

            return NoContent();
        }

        // ---- Sessions -----------------------------------------------------

        private Task<bool> IsMemberAsync(long groupId, string uid, CancellationToken ct)
            => _db.Set<StudyGroupMember>().AnyAsync(m => m.StudyGroupId == groupId && m.UserId == uid, ct);

        [HttpGet("{id:long}/sessions")]
        public async Task<ActionResult<IEnumerable<StudyGroupSessionDto>>> GetSessions(long id, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var group = await _db.Set<StudyGroup>().AsNoTracking().FirstOrDefaultAsync(g => g.Id == id, ct);
            if (group is null) return NotFound();
            if (!await IsMemberAsync(id, uid, ct)) return Forbid();

            // Upcoming sessions plus a short grace window for ones happening now.
            var cutoff = DateTime.UtcNow.AddHours(-2);
            var sessions = await _db.Set<StudyGroupSession>().AsNoTracking()
                .Where(s => s.StudyGroupId == id && s.StartsAt >= cutoff)
                .OrderBy(s => s.StartsAt)
                .ToListAsync(ct);

            return Ok(sessions.Select(s => new StudyGroupSessionDto
            {
                Id = s.Id.ToString(),
                Title = s.Title,
                StartsAt = s.StartsAt,
                DurationMinutes = s.DurationMinutes,
                Location = s.Location,
                CanManage = s.CreatedByUserId == uid || group.OwnerId == uid,
            }));
        }

        [HttpPost("{id:long}/sessions")]
        public async Task<ActionResult<StudyGroupSessionDto>> ScheduleSession(long id, [FromBody] ScheduleSessionDto body, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var group = await _db.Set<StudyGroup>().AsNoTracking().FirstOrDefaultAsync(g => g.Id == id, ct);
            if (group is null) return NotFound();
            if (!await IsMemberAsync(id, uid, ct)) return Forbid();

            var title = (body.Title ?? "").Trim();
            if (title.Length < 2) return BadRequest("Give the session a title.");
            if (body.StartsAt <= DateTime.UtcNow) return BadRequest("Pick a time in the future.");
            var duration = body.DurationMinutes is > 0 and <= 600 ? body.DurationMinutes.Value : 60;

            var session = new StudyGroupSession
            {
                StudyGroupId = id,
                CreatedByUserId = uid,
                Title = title,
                StartsAt = body.StartsAt.ToUniversalTime(),
                DurationMinutes = duration,
                Location = (body.Location ?? "").Trim(),
            };
            _db.Add(session);
            await _db.SaveChangesAsync(ct);

            return Ok(new StudyGroupSessionDto
            {
                Id = session.Id.ToString(),
                Title = session.Title,
                StartsAt = session.StartsAt,
                DurationMinutes = session.DurationMinutes,
                Location = session.Location,
                CanManage = true,
            });
        }

        [HttpDelete("{id:long}/sessions/{sessionId:long}")]
        public async Task<IActionResult> CancelSession(long id, long sessionId, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var session = await _db.Set<StudyGroupSession>()
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.StudyGroupId == id, ct);
            if (session is null) return NotFound();

            var group = await _db.Set<StudyGroup>().AsNoTracking().FirstOrDefaultAsync(g => g.Id == id, ct);
            var canManage = session.CreatedByUserId == uid || (group is not null && group.OwnerId == uid);
            if (!canManage) return Forbid();

            _db.Remove(session);
            await _db.SaveChangesAsync(ct);
            return NoContent();
        }

        private static FrontendStudyGroupDto ToDto(StudyGroup g, int members, bool isMember, bool isOwner, DateTime? nextSession) => new()
        {
            Id = g.Id.ToString(),
            Name = g.Name,
            SubjectId = g.SubjectId,
            Members = members,
            Privacy = g.Privacy,
            Description = g.Description,
            NextSession = nextSession,
            IsMember = isMember,
            IsOwner = isOwner,
        };
    }

    public record FrontendStudyGroupDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("subjectId")] public string SubjectId { get; init; } = "";
        [JsonPropertyName("members")] public int Members { get; init; }
        [JsonPropertyName("privacy")] public string Privacy { get; init; } = "open";
        [JsonPropertyName("description")] public string Description { get; init; } = "";
        [JsonPropertyName("nextSession")] public DateTime? NextSession { get; init; }
        [JsonPropertyName("isMember")] public bool IsMember { get; init; }
        [JsonPropertyName("isOwner")] public bool IsOwner { get; init; }
    }

    public record CreateStudyGroupDto
    {
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("subjectId")] public string SubjectId { get; init; } = "";
        [JsonPropertyName("description")] public string Description { get; init; } = "";
        [JsonPropertyName("privacy")] public string Privacy { get; init; } = "open";
    }

    public record StudyGroupSessionDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("startsAt")] public DateTime StartsAt { get; init; }
        [JsonPropertyName("durationMinutes")] public int DurationMinutes { get; init; }
        [JsonPropertyName("location")] public string Location { get; init; } = "";
        [JsonPropertyName("canManage")] public bool CanManage { get; init; }
    }

    public record ScheduleSessionDto
    {
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("startsAt")] public DateTime StartsAt { get; init; }
        [JsonPropertyName("durationMinutes")] public int? DurationMinutes { get; init; }
        [JsonPropertyName("location")] public string Location { get; init; } = "";
    }
}
