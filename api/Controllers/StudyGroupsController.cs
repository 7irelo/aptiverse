using System.Security.Claims;
using System.Text.Json.Serialization;
using Aptiverse.Api.Data;
using Aptiverse.Calendar.Domain.Models.Calendar;
using Aptiverse.Domain.Models;
using Aptiverse.Notifications.Application.Services;
using Aptiverse.StudyGroups.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.StudyGroups.Controllers
{
    // Peer study groups: small coordination spaces scoped to an academic unit.
    // The group is not a chat room; members meet in person or over video on
    // their own. What lives here is a shared task board: a member adds a task,
    // everyone is notified, and each person can sync a dated task into their own
    // upcoming list. The owner sets the member ceiling and the group's
    // preferences, and (with any admins they appoint) moderates the roster.
    [ApiController]
    [Route("api/study-groups")]
    [Authorize]
    public class StudyGroupsController(ApplicationDbContext db, INotificationService notifications) : ControllerBase
    {
        private readonly ApplicationDbContext _db = db;
        private readonly INotificationService _notifications = notifications;

        // The owner may never widen a group past this; keeps rooms studyable.
        private const int MaxMemberCapacity = 50;
        private const int MinMemberCapacity = 2;

        // Marks calendar events synced from a group task, so they can be found
        // and cleaned up.
        private const string TaskEventType = "study_group_task";

        private string? CurrentUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value;

        // The caller's role in a group: "owner" | "admin" | "member", or null if
        // they aren't a member.
        private Task<string?> RoleAsync(long groupId, string uid, CancellationToken ct)
            => _db.Set<StudyGroupMember>().AsNoTracking()
                .Where(m => m.StudyGroupId == groupId && m.UserId == uid)
                .Select(m => m.Role)
                .FirstOrDefaultAsync(ct)!;

        private static bool CanModerate(string? role) => role is "owner" or "admin";

        private static bool CanAddTasks(string? role, string whoCanAdd)
            => role is not null && (whoCanAdd != "admins" || CanModerate(role));

        // Groups the caller can see: every open group, plus any (including
        // invite-only) that they already belong to.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FrontendStudyGroupDto>>> GetStudyGroups(CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var myRoles = await _db.Set<StudyGroupMember>().AsNoTracking()
                .Where(m => m.UserId == uid)
                .Select(m => new { m.StudyGroupId, m.Role })
                .ToListAsync(ct);
            var roleByGroup = myRoles.ToDictionary(x => x.StudyGroupId, x => x.Role);
            var mine = roleByGroup.Keys.ToHashSet();

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

            // A group's "open tasks" is the count of shared tasks not yet done.
            var openTasks = (await _db.Set<StudyGroupTask>().AsNoTracking()
                .Where(t => ids.Contains(t.StudyGroupId) && !t.Done)
                .GroupBy(t => t.StudyGroupId)
                .Select(grp => new { Id = grp.Key, Count = grp.Count() })
                .ToListAsync(ct))
                .ToDictionary(x => x.Id, x => x.Count);

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
                role: roleByGroup.GetValueOrDefault(g.Id),
                nextSession: nextSessions.TryGetValue(g.Id, out var n) ? n : null,
                openTasks: openTasks.TryGetValue(g.Id, out var ot) ? ot : 0)));
        }

        // A single group's detail, for the group workspace page. Open groups are
        // visible to anyone; invite-only groups only to members.
        [HttpGet("{id:long}")]
        public async Task<ActionResult<FrontendStudyGroupDto>> GetStudyGroup(long id, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var group = await _db.Set<StudyGroup>().AsNoTracking().FirstOrDefaultAsync(g => g.Id == id, ct);
            if (group is null) return NotFound();

            var role = await RoleAsync(id, uid, ct);
            if (group.Privacy != "open" && role is null) return Forbid();

            var members = await _db.Set<StudyGroupMember>().AsNoTracking().CountAsync(m => m.StudyGroupId == id, ct);
            var openTasks = await _db.Set<StudyGroupTask>().AsNoTracking().CountAsync(t => t.StudyGroupId == id && !t.Done, ct);
            var next = await _db.Set<StudyGroupSession>().AsNoTracking()
                .Where(s => s.StudyGroupId == id && s.StartsAt >= DateTime.UtcNow)
                .OrderBy(s => s.StartsAt).Select(s => (DateTime?)s.StartsAt).FirstOrDefaultAsync(ct);

            return Ok(ToDto(group, members, role, next, openTasks));
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
                MemberCapacity = ClampCapacity(body.MemberCapacity ?? 12),
            };
            _db.Add(group);
            await _db.SaveChangesAsync(ct);

            _db.Add(new StudyGroupMember { StudyGroupId = group.Id, UserId = uid, Role = "owner" });
            await _db.SaveChangesAsync(ct);

            return Ok(ToDto(group, members: 1, role: "owner", nextSession: null, openTasks: 0));
        }

        // Owner-only: rename, re-describe, flip privacy, resize, or change the
        // group's task preferences.
        [HttpPatch("{id:long}")]
        public async Task<ActionResult<FrontendStudyGroupDto>> Update(long id, [FromBody] UpdateStudyGroupDto body, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var group = await _db.Set<StudyGroup>().FirstOrDefaultAsync(g => g.Id == id, ct);
            if (group is null) return NotFound();
            if (await RoleAsync(id, uid, ct) != "owner") return Forbid();

            if (body.Name is not null)
            {
                var name = body.Name.Trim();
                if (name.Length < 2) return BadRequest("Give the group a name.");
                group.Name = name;
            }
            if (body.Description is not null) group.Description = body.Description.Trim();
            if (body.Privacy is not null) group.Privacy = body.Privacy == "invite" ? "invite" : "open";
            if (body.MemberCapacity is int cap)
            {
                var headcount = await _db.Set<StudyGroupMember>().CountAsync(m => m.StudyGroupId == id, ct);
                var clamped = ClampCapacity(cap);
                if (clamped < headcount)
                    return BadRequest($"The group already has {headcount} members. Remove some before shrinking it.");
                group.MemberCapacity = clamped;
            }
            if (body.TasksWhoCanAdd is not null)
                group.TasksWhoCanAdd = body.TasksWhoCanAdd == "admins" ? "admins" : "everyone";
            if (body.NotifyOnNewTask is bool notify) group.NotifyOnNewTask = notify;
            if (body.AutoSyncTasks is bool autosync) group.AutoSyncTasks = autosync;
            group.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);

            var members = await _db.Set<StudyGroupMember>().CountAsync(m => m.StudyGroupId == id, ct);
            var openTasks = await _db.Set<StudyGroupTask>().CountAsync(t => t.StudyGroupId == id && !t.Done, ct);
            var next = await _db.Set<StudyGroupSession>().AsNoTracking()
                .Where(s => s.StudyGroupId == id && s.StartsAt >= DateTime.UtcNow)
                .OrderBy(s => s.StartsAt).Select(s => (DateTime?)s.StartsAt).FirstOrDefaultAsync(ct);
            return Ok(ToDto(group, members, "owner", next, openTasks));
        }

        // Owner-only: disband the group, taking its members, sessions, tasks and
        // any synced calendar events with it.
        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(long id, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var group = await _db.Set<StudyGroup>().FirstOrDefaultAsync(g => g.Id == id, ct);
            if (group is null) return NoContent();
            if (await RoleAsync(id, uid, ct) != "owner") return Forbid();

            var taskIds = await _db.Set<StudyGroupTask>().Where(t => t.StudyGroupId == id).Select(t => t.Id).ToListAsync(ct);
            await ClearTaskEventsAsync(taskIds, ct);
            await _db.Set<StudyGroupTask>().Where(t => t.StudyGroupId == id).ExecuteDeleteAsync(ct);
            await _db.Set<StudyGroupSession>().Where(s => s.StudyGroupId == id).ExecuteDeleteAsync(ct);
            await _db.Set<StudyGroupMember>().Where(m => m.StudyGroupId == id).ExecuteDeleteAsync(ct);
            _db.Remove(group);
            await _db.SaveChangesAsync(ct);
            return NoContent();
        }

        [HttpPost("{id:long}/join")]
        public async Task<IActionResult> Join(long id, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var group = await _db.Set<StudyGroup>().AsNoTracking().FirstOrDefaultAsync(g => g.Id == id, ct);
            if (group is null) return NotFound();
            if (group.Privacy != "open") return Forbid();

            var already = await _db.Set<StudyGroupMember>()
                .AnyAsync(m => m.StudyGroupId == id && m.UserId == uid, ct);
            if (!already)
            {
                var headcount = await _db.Set<StudyGroupMember>().CountAsync(m => m.StudyGroupId == id, ct);
                if (headcount >= group.MemberCapacity)
                    return Conflict("This group is full.");
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

            // A member who leaves takes their own synced task events with them.
            var groupTaskIds = await _db.Set<StudyGroupTask>().Where(t => t.StudyGroupId == id).Select(t => t.Id).ToListAsync(ct);
            await _db.Set<CalendarEvent>()
                .Where(e => e.StudentId == uid && e.EventType == TaskEventType
                    && e.RelatedEntityId != null && groupTaskIds.Contains(e.RelatedEntityId.Value))
                .ExecuteDeleteAsync(ct);

            var remaining = await _db.Set<StudyGroupMember>()
                .Where(m => m.StudyGroupId == id)
                .OrderBy(m => m.JoinedAt)
                .ToListAsync(ct);

            if (remaining.Count == 0)
            {
                // Empty group: clean it up with its tasks and sessions.
                await ClearTaskEventsAsync(groupTaskIds, ct);
                await _db.Set<StudyGroupTask>().Where(t => t.StudyGroupId == id).ExecuteDeleteAsync(ct);
                await _db.Set<StudyGroupSession>().Where(s => s.StudyGroupId == id).ExecuteDeleteAsync(ct);
                var group = await _db.Set<StudyGroup>().FirstOrDefaultAsync(g => g.Id == id, ct);
                if (group is not null) _db.Remove(group);
                await _db.SaveChangesAsync(ct);
            }
            else if (wasOwner)
            {
                var next = remaining.FirstOrDefault(m => m.Role == "admin") ?? remaining[0];
                next.Role = "owner";
                var group = await _db.Set<StudyGroup>().FirstOrDefaultAsync(g => g.Id == id, ct);
                if (group is not null) group.OwnerId = next.UserId;
                await _db.SaveChangesAsync(ct);
            }

            return NoContent();
        }

        // ---- Members / roster ---------------------------------------------

        [HttpGet("{id:long}/members")]
        public async Task<ActionResult<IEnumerable<StudyGroupMemberDto>>> GetMembers(long id, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var group = await _db.Set<StudyGroup>().AsNoTracking().FirstOrDefaultAsync(g => g.Id == id, ct);
            if (group is null) return NotFound();
            var myRole = await RoleAsync(id, uid, ct);
            if (group.Privacy != "open" && myRole is null) return Forbid();

            var rows = await (from m in _db.Set<StudyGroupMember>().AsNoTracking()
                              where m.StudyGroupId == id
                              join u in _db.Set<User>().AsNoTracking() on m.UserId equals u.Id into gj
                              from u in gj.DefaultIfEmpty()
                              orderby m.JoinedAt
                              select new { m.UserId, m.Role, m.JoinedAt, u.FirstName, u.LastName })
                              .ToListAsync(ct);

            var iModerate = CanModerate(myRole);
            return Ok(rows.Select(r => new StudyGroupMemberDto
            {
                UserId = r.UserId,
                Name = $"{r.FirstName} {r.LastName}".Trim() is { Length: > 0 } n ? n : "Member",
                Role = r.Role,
                JoinedAt = r.JoinedAt,
                IsYou = r.UserId == uid,
                CanRemove = r.UserId != uid && (myRole == "owner" ? r.Role != "owner" : iModerate && r.Role == "member"),
                CanPromote = myRole == "owner" && r.UserId != uid && r.Role != "owner",
            }));
        }

        [HttpDelete("{id:long}/members/{userId}")]
        public async Task<IActionResult> RemoveMember(long id, string userId, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();
            if (userId == uid) return BadRequest("Use leave to remove yourself.");

            var myRole = await RoleAsync(id, uid, ct);
            if (!CanModerate(myRole)) return Forbid();

            var target = await _db.Set<StudyGroupMember>()
                .FirstOrDefaultAsync(m => m.StudyGroupId == id && m.UserId == userId, ct);
            if (target is null) return NoContent();
            if (target.Role == "owner") return Forbid();
            if (target.Role == "admin" && myRole != "owner") return Forbid();

            _db.Remove(target);
            await _db.SaveChangesAsync(ct);
            return NoContent();
        }

        [HttpPost("{id:long}/members/{userId}/role")]
        public async Task<IActionResult> SetMemberRole(long id, string userId, [FromBody] SetRoleDto body, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();
            if (await RoleAsync(id, uid, ct) != "owner") return Forbid();

            var role = (body.Role ?? "").Trim().ToLowerInvariant();
            if (role is not ("admin" or "member" or "owner")) return BadRequest("Unknown role.");

            var target = await _db.Set<StudyGroupMember>()
                .FirstOrDefaultAsync(m => m.StudyGroupId == id && m.UserId == userId, ct);
            if (target is null) return NotFound();
            if (target.UserId == uid) return BadRequest("You already own this group.");

            if (role == "owner")
            {
                var me = await _db.Set<StudyGroupMember>()
                    .FirstOrDefaultAsync(m => m.StudyGroupId == id && m.UserId == uid, ct);
                if (me is not null) me.Role = "admin";
                target.Role = "owner";
                var group = await _db.Set<StudyGroup>().FirstOrDefaultAsync(g => g.Id == id, ct);
                if (group is not null) group.OwnerId = target.UserId;
            }
            else
            {
                target.Role = role;
            }
            await _db.SaveChangesAsync(ct);
            return NoContent();
        }

        // ---- Shared tasks -------------------------------------------------

        [HttpGet("{id:long}/tasks")]
        public async Task<ActionResult<IEnumerable<StudyGroupTaskDto>>> GetTasks(long id, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var myRole = await RoleAsync(id, uid, ct);
            if (myRole is null) return Forbid();

            var tasks = await _db.Set<StudyGroupTask>().AsNoTracking()
                .Where(t => t.StudyGroupId == id)
                .OrderBy(t => t.Done)
                .ThenBy(t => t.DueDate ?? DateTime.MaxValue)
                .ThenByDescending(t => t.Id)
                .ToListAsync(ct);

            // Which of these the caller has already synced into their calendar.
            var taskIds = tasks.Select(t => t.Id).ToList();
            var syncedIds = await _db.Set<CalendarEvent>().AsNoTracking()
                .Where(e => e.StudentId == uid && e.EventType == TaskEventType
                    && e.RelatedEntityId != null && taskIds.Contains(e.RelatedEntityId.Value))
                .Select(e => e.RelatedEntityId!.Value)
                .ToListAsync(ct);
            var syncedSet = syncedIds.ToHashSet();
            var iModerate = CanModerate(myRole);

            return Ok(tasks.Select(t => new StudyGroupTaskDto
            {
                Id = t.Id.ToString(),
                Title = t.Title,
                Notes = t.Notes,
                DueDate = t.DueDate,
                Done = t.Done,
                CreatedBy = t.CreatedByName,
                IsMine = t.CreatedByUserId == uid,
                Synced = syncedSet.Contains(t.Id),
                CanManage = t.CreatedByUserId == uid || iModerate,
            }));
        }

        [HttpPost("{id:long}/tasks")]
        public async Task<ActionResult<StudyGroupTaskDto>> AddTask(long id, [FromBody] AddTaskDto body, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var group = await _db.Set<StudyGroup>().AsNoTracking().FirstOrDefaultAsync(g => g.Id == id, ct);
            if (group is null) return NotFound();
            var myRole = await RoleAsync(id, uid, ct);
            if (!CanAddTasks(myRole, group.TasksWhoCanAdd)) return Forbid();

            var title = (body.Title ?? "").Trim();
            if (title.Length < 2) return BadRequest("Give the task a title.");

            var me = await _db.Set<User>().AsNoTracking().FirstOrDefaultAsync(u => u.Id == uid, ct);
            var myName = me is null ? "A member" : $"{me.FirstName} {me.LastName}".Trim();
            if (myName.Length == 0) myName = "A member";

            var task = new StudyGroupTask
            {
                StudyGroupId = id,
                CreatedByUserId = uid,
                CreatedByName = myName,
                Title = title,
                Notes = (body.Notes ?? "").Trim(),
                DueDate = body.DueDate?.ToUniversalTime(),
            };
            _db.Add(task);
            await _db.SaveChangesAsync(ct);

            var members = await _db.Set<StudyGroupMember>().AsNoTracking()
                .Where(m => m.StudyGroupId == id)
                .Select(m => m.UserId)
                .ToListAsync(ct);
            var others = members.Where(m => m != uid).ToList();

            // Notify the rest of the group, if the group wants it.
            if (group.NotifyOnNewTask)
            {
                foreach (var m in others)
                {
                    await _notifications.EnqueueAsync(
                        m, "reminder",
                        $"New task in {group.Name}",
                        $"{myName} added \"{title}\"" + (task.DueDate is DateTime d ? $", due {d:d MMM}." : "."),
                        $"/dashboard/study-groups/{id}",
                        ct);
                }
            }

            // Auto-sync a dated task into every member's upcoming list, if the
            // group prefers that over each person opting in.
            if (group.AutoSyncTasks && task.DueDate is not null)
            {
                foreach (var m in members)
                    _db.Add(BuildTaskEvent(m, task, group.Name));
                await _db.SaveChangesAsync(ct);
            }

            return Ok(new StudyGroupTaskDto
            {
                Id = task.Id.ToString(),
                Title = task.Title,
                Notes = task.Notes,
                DueDate = task.DueDate,
                Done = false,
                CreatedBy = myName,
                IsMine = true,
                Synced = group.AutoSyncTasks && task.DueDate is not null,
                CanManage = true,
            });
        }

        // Toggle the shared done state. Any member can tick the group's task off.
        [HttpPatch("{id:long}/tasks/{taskId:long}")]
        public async Task<IActionResult> ToggleTask(long id, long taskId, [FromBody] ToggleTaskDto body, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();
            if (await RoleAsync(id, uid, ct) is null) return Forbid();

            var task = await _db.Set<StudyGroupTask>().FirstOrDefaultAsync(t => t.Id == taskId && t.StudyGroupId == id, ct);
            if (task is null) return NotFound();

            task.Done = body.Done;
            task.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);
            return NoContent();
        }

        [HttpDelete("{id:long}/tasks/{taskId:long}")]
        public async Task<IActionResult> DeleteTask(long id, long taskId, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var task = await _db.Set<StudyGroupTask>().FirstOrDefaultAsync(t => t.Id == taskId && t.StudyGroupId == id, ct);
            if (task is null) return NoContent();

            var myRole = await RoleAsync(id, uid, ct);
            if (task.CreatedByUserId != uid && !CanModerate(myRole)) return Forbid();

            await ClearTaskEventsAsync([taskId], ct);
            _db.Remove(task);
            await _db.SaveChangesAsync(ct);
            return NoContent();
        }

        // The caller pulls a dated task into their own upcoming list.
        [HttpPost("{id:long}/tasks/{taskId:long}/sync")]
        public async Task<IActionResult> SyncTask(long id, long taskId, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();
            if (await RoleAsync(id, uid, ct) is null) return Forbid();

            var group = await _db.Set<StudyGroup>().AsNoTracking().FirstOrDefaultAsync(g => g.Id == id, ct);
            var task = await _db.Set<StudyGroupTask>().AsNoTracking().FirstOrDefaultAsync(t => t.Id == taskId && t.StudyGroupId == id, ct);
            if (group is null || task is null) return NotFound();
            if (task.DueDate is null) return BadRequest("Only a task with a due date can go on your calendar.");

            var exists = await _db.Set<CalendarEvent>()
                .AnyAsync(e => e.StudentId == uid && e.EventType == TaskEventType && e.RelatedEntityId == taskId, ct);
            if (!exists)
            {
                _db.Add(BuildTaskEvent(uid, task, group.Name));
                await _db.SaveChangesAsync(ct);
            }
            return NoContent();
        }

        [HttpDelete("{id:long}/tasks/{taskId:long}/sync")]
        public async Task<IActionResult> UnsyncTask(long id, long taskId, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            await _db.Set<CalendarEvent>()
                .Where(e => e.StudentId == uid && e.EventType == TaskEventType && e.RelatedEntityId == taskId)
                .ExecuteDeleteAsync(ct);
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

        // ---- helpers ------------------------------------------------------

        private static int ClampCapacity(int cap) => Math.Clamp(cap, MinMemberCapacity, MaxMemberCapacity);

        // A calendar event mirroring a group task into one member's upcoming
        // list. RelatedEntity links it back so it can be found and removed.
        private static CalendarEvent BuildTaskEvent(string userId, StudyGroupTask task, string groupName)
        {
            var start = task.DueDate ?? DateTime.UtcNow;
            return new CalendarEvent
            {
                StudentId = userId,
                Title = task.Title,
                Description = string.IsNullOrWhiteSpace(task.Notes) ? $"Shared task from {groupName}." : task.Notes,
                EventType = TaskEventType,
                StartTime = start,
                EndTime = start,
                IsAllDay = true,
                Location = "",
                RecurrenceRule = "",
                Color = "",
                Status = "Scheduled",
                RelatedEntityId = task.Id,
                RelatedEntityType = TaskEventType,
            };
        }

        private async Task ClearTaskEventsAsync(IReadOnlyCollection<long> taskIds, CancellationToken ct)
        {
            if (taskIds.Count == 0) return;
            await _db.Set<CalendarEvent>()
                .Where(e => e.EventType == TaskEventType && e.RelatedEntityId != null && taskIds.Contains(e.RelatedEntityId.Value))
                .ExecuteDeleteAsync(ct);
        }

        private static FrontendStudyGroupDto ToDto(StudyGroup g, int members, string? role, DateTime? nextSession, int openTasks) => new()
        {
            Id = g.Id.ToString(),
            Name = g.Name,
            SubjectId = g.SubjectId,
            Members = members,
            MemberCapacity = g.MemberCapacity,
            Privacy = g.Privacy,
            Description = g.Description,
            NextSession = nextSession,
            OpenTasks = openTasks,
            Role = role ?? "",
            IsMember = role is not null,
            IsOwner = role == "owner",
            CanManage = CanModerate(role),
            CanAddTasks = CanAddTasks(role, g.TasksWhoCanAdd),
            IsFull = members >= g.MemberCapacity,
            TasksWhoCanAdd = g.TasksWhoCanAdd,
            NotifyOnNewTask = g.NotifyOnNewTask,
            AutoSyncTasks = g.AutoSyncTasks,
        };
    }

    public record FrontendStudyGroupDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("subjectId")] public string SubjectId { get; init; } = "";
        [JsonPropertyName("members")] public int Members { get; init; }
        [JsonPropertyName("memberCapacity")] public int MemberCapacity { get; init; }
        [JsonPropertyName("privacy")] public string Privacy { get; init; } = "open";
        [JsonPropertyName("description")] public string Description { get; init; } = "";
        [JsonPropertyName("nextSession")] public DateTime? NextSession { get; init; }
        [JsonPropertyName("openTasks")] public int OpenTasks { get; init; }
        [JsonPropertyName("role")] public string Role { get; init; } = "";
        [JsonPropertyName("isMember")] public bool IsMember { get; init; }
        [JsonPropertyName("isOwner")] public bool IsOwner { get; init; }
        [JsonPropertyName("canManage")] public bool CanManage { get; init; }
        [JsonPropertyName("canAddTasks")] public bool CanAddTasks { get; init; }
        [JsonPropertyName("isFull")] public bool IsFull { get; init; }
        [JsonPropertyName("tasksWhoCanAdd")] public string TasksWhoCanAdd { get; init; } = "everyone";
        [JsonPropertyName("notifyOnNewTask")] public bool NotifyOnNewTask { get; init; }
        [JsonPropertyName("autoSyncTasks")] public bool AutoSyncTasks { get; init; }
    }

    public record CreateStudyGroupDto
    {
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("subjectId")] public string SubjectId { get; init; } = "";
        [JsonPropertyName("description")] public string Description { get; init; } = "";
        [JsonPropertyName("privacy")] public string Privacy { get; init; } = "open";
        [JsonPropertyName("memberCapacity")] public int? MemberCapacity { get; init; }
    }

    public record UpdateStudyGroupDto
    {
        [JsonPropertyName("name")] public string? Name { get; init; }
        [JsonPropertyName("description")] public string? Description { get; init; }
        [JsonPropertyName("privacy")] public string? Privacy { get; init; }
        [JsonPropertyName("memberCapacity")] public int? MemberCapacity { get; init; }
        [JsonPropertyName("tasksWhoCanAdd")] public string? TasksWhoCanAdd { get; init; }
        [JsonPropertyName("notifyOnNewTask")] public bool? NotifyOnNewTask { get; init; }
        [JsonPropertyName("autoSyncTasks")] public bool? AutoSyncTasks { get; init; }
    }

    public record StudyGroupMemberDto
    {
        [JsonPropertyName("userId")] public string UserId { get; init; } = "";
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("role")] public string Role { get; init; } = "member";
        [JsonPropertyName("joinedAt")] public DateTime JoinedAt { get; init; }
        [JsonPropertyName("isYou")] public bool IsYou { get; init; }
        [JsonPropertyName("canRemove")] public bool CanRemove { get; init; }
        [JsonPropertyName("canPromote")] public bool CanPromote { get; init; }
    }

    public record SetRoleDto
    {
        [JsonPropertyName("role")] public string Role { get; init; } = "";
    }

    public record StudyGroupTaskDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("notes")] public string Notes { get; init; } = "";
        [JsonPropertyName("dueDate")] public DateTime? DueDate { get; init; }
        [JsonPropertyName("done")] public bool Done { get; init; }
        [JsonPropertyName("createdBy")] public string CreatedBy { get; init; } = "";
        [JsonPropertyName("isMine")] public bool IsMine { get; init; }
        [JsonPropertyName("synced")] public bool Synced { get; init; }
        [JsonPropertyName("canManage")] public bool CanManage { get; init; }
    }

    public record AddTaskDto
    {
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("notes")] public string? Notes { get; init; }
        [JsonPropertyName("dueDate")] public DateTime? DueDate { get; init; }
    }

    public record ToggleTaskDto
    {
        [JsonPropertyName("done")] public bool Done { get; init; }
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
