using System.Security.Claims;
using System.Text.Json.Serialization;
using Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning;
using Aptiverse.Api.Data;
using Aptiverse.Api.Data.Email;
using Aptiverse.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Api.Controllers
{
    // Parent <-> student linking. A parent invites a student by email; the
    // student accepts from their Connections hub. Once accepted, the parent has
    // a read-only window onto the student's progress. There is no "family"
    // concept, just direct, consented parent -> student links.
    //
    //   Parent side:  POST invites, GET mine, DELETE {id}, GET students/{id}/overview
    //   Student side: GET invites/incoming, POST invites/{token}/accept|decline,
    //                 GET parents, DELETE parents/{id}
    [ApiController]
    [Route("api/parent-links")]
    [Authorize]
    public class ParentLinksController(ApplicationDbContext db, EmailQueue email) : ControllerBase
    {
        private readonly ApplicationDbContext _db = db;
        private readonly EmailQueue _email = email;

        private string? CurrentUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value;

        // ---- Parent side --------------------------------------------------

        [HttpPost("invites")]
        public async Task<ActionResult<ParentLinkDto>> Invite([FromBody] InviteStudentRequest body, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var studentEmail = (body.StudentEmail ?? "").Trim().ToLowerInvariant();
            if (studentEmail.Length == 0 || !studentEmail.Contains('@'))
                return BadRequest("A valid student email is required.");

            var parent = await _db.Set<User>().AsNoTracking().FirstOrDefaultAsync(u => u.Id == uid, ct);
            if (parent is null) return Unauthorized();
            if (string.Equals(parent.Email, studentEmail, StringComparison.OrdinalIgnoreCase))
                return BadRequest("You can't invite yourself.");

            var already = await _db.Set<ParentLink>().AnyAsync(
                l => l.ParentUserId == uid && l.StudentEmail == studentEmail
                     && (l.Status == "pending" || l.Status == "accepted"),
                ct);
            if (already) return Conflict("You already have an invite or link for that email.");

            var parentName = $"{parent.FirstName} {parent.LastName}".Trim();
            var link = new ParentLink
            {
                ParentUserId = uid,
                ParentName = parentName,
                StudentEmail = studentEmail,
                Token = Guid.NewGuid().ToString("N"),
                Status = "pending",
            };
            _db.Add(link);
            await _db.SaveChangesAsync(ct);

            // Best-effort invite email. The invite already stands in-app, so a
            // mail failure doesn't fail the request.
            try
            {
                await _email.Enqueue(new EmailJob(
                    To: studentEmail,
                    Subject: $"{parentName} invited you to connect on Aptiverse",
                    HtmlBody: null,
                    TemplateType: "parent_invite",
                    TemplateData: new Dictionary<string, string?>
                    {
                        ["ParentName"] = parentName,
                        ["Url"] = "https://aptiverse.co.za/dashboard/connections",
                    },
                    EnqueuedAt: DateTime.UtcNow), ct);
            }
            catch { /* swallow: student still sees the invite in their hub */ }

            var studentName = await ResolveStudentNameAsync(studentEmail, ct);
            return Ok(ToParentLinkDto(link, studentName));
        }

        [HttpGet("mine")]
        public async Task<ActionResult<IEnumerable<ParentLinkDto>>> Mine(CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var links = await _db.Set<ParentLink>().AsNoTracking()
                .Where(l => l.ParentUserId == uid && l.Status != "revoked" && l.Status != "declined")
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync(ct);

            var studentIds = links.Where(l => l.StudentUserId != null).Select(l => l.StudentUserId!).Distinct().ToList();
            var names = await _db.Set<User>().AsNoTracking()
                .Where(u => studentIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => $"{u.FirstName} {u.LastName}".Trim(), ct);

            return Ok(links.Select(l => ToParentLinkDto(
                l,
                l.StudentUserId != null && names.TryGetValue(l.StudentUserId, out var n) ? n : null)));
        }

        // Parent revokes a pending invite or unlinks an accepted student.
        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Remove(long id, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var link = await _db.Set<ParentLink>().FirstOrDefaultAsync(l => l.Id == id && l.ParentUserId == uid, ct);
            if (link is null) return NotFound();

            _db.Remove(link);
            await _db.SaveChangesAsync(ct);
            return NoContent();
        }

        // Read-only window onto a linked student's upcoming work. Guarded: only
        // a parent with an accepted link can read it.
        [HttpGet("students/{studentUserId}/overview")]
        public async Task<ActionResult<StudentOverviewDto>> StudentOverview(string studentUserId, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var linked = await _db.Set<ParentLink>().AsNoTracking().AnyAsync(
                l => l.ParentUserId == uid && l.StudentUserId == studentUserId && l.Status == "accepted", ct);
            if (!linked) return Forbid();

            var student = await _db.Set<User>().AsNoTracking().FirstOrDefaultAsync(u => u.Id == studentUserId, ct);
            if (student is null) return NotFound();

            var cutoff = DateTime.UtcNow.AddDays(-1);
            var upcoming = await _db.Set<Assessment>().AsNoTracking()
                .Where(a => a.StudentId == studentUserId && a.Status != "graded" && a.DueDate >= cutoff)
                .OrderBy(a => a.DueDate)
                .Take(5)
                .Select(a => new OverviewAssessmentDto
                {
                    Id = a.Id.ToString(),
                    Title = a.Title,
                    SubjectId = a.SubjectId,
                    DueDate = a.DueDate,
                    Status = a.Status,
                })
                .ToListAsync(ct);

            var upcomingCount = await _db.Set<Assessment>().AsNoTracking()
                .CountAsync(a => a.StudentId == studentUserId && a.Status != "graded" && a.DueDate >= cutoff, ct);

            return Ok(new StudentOverviewDto
            {
                StudentUserId = studentUserId,
                Name = $"{student.FirstName} {student.LastName}".Trim(),
                EducationLevel = student.EducationLevel,
                UpcomingCount = upcomingCount,
                Upcoming = upcoming,
            });
        }

        // ---- Student side -------------------------------------------------

        [HttpGet("invites/incoming")]
        public async Task<ActionResult<IEnumerable<IncomingInviteDto>>> Incoming(CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var me = await _db.Set<User>().AsNoTracking().FirstOrDefaultAsync(u => u.Id == uid, ct);
            var myEmail = me?.Email?.ToLowerInvariant();
            if (string.IsNullOrEmpty(myEmail)) return Ok(Array.Empty<IncomingInviteDto>());

            var invites = await _db.Set<ParentLink>().AsNoTracking()
                .Where(l => l.StudentEmail == myEmail && l.Status == "pending")
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new IncomingInviteDto
                {
                    Id = l.Id.ToString(),
                    Token = l.Token,
                    ParentName = l.ParentName,
                    InvitedAt = l.CreatedAt,
                })
                .ToListAsync(ct);

            return Ok(invites);
        }

        [HttpPost("invites/{token}/accept")]
        public async Task<IActionResult> Accept(string token, CancellationToken ct)
            => await Respond(token, accept: true, ct);

        [HttpPost("invites/{token}/decline")]
        public async Task<IActionResult> Decline(string token, CancellationToken ct)
            => await Respond(token, accept: false, ct);

        private async Task<IActionResult> Respond(string token, bool accept, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var me = await _db.Set<User>().AsNoTracking().FirstOrDefaultAsync(u => u.Id == uid, ct);
            var myEmail = me?.Email?.ToLowerInvariant();
            if (string.IsNullOrEmpty(myEmail)) return Unauthorized();

            var link = await _db.Set<ParentLink>().FirstOrDefaultAsync(l => l.Token == token, ct);
            if (link is null || link.Status != "pending") return NotFound();
            if (!string.Equals(link.StudentEmail, myEmail, StringComparison.Ordinal)) return Forbid();

            link.Status = accept ? "accepted" : "declined";
            link.StudentUserId = accept ? uid : link.StudentUserId;
            link.RespondedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);
            return NoContent();
        }

        [HttpGet("parents")]
        public async Task<ActionResult<IEnumerable<LinkedParentDto>>> Parents(CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var parents = await _db.Set<ParentLink>().AsNoTracking()
                .Where(l => l.StudentUserId == uid && l.Status == "accepted")
                .OrderByDescending(l => l.RespondedAt)
                .Select(l => new LinkedParentDto
                {
                    Id = l.Id.ToString(),
                    ParentName = l.ParentName,
                    Status = l.Status,
                    Since = l.RespondedAt ?? l.CreatedAt,
                })
                .ToListAsync(ct);

            return Ok(parents);
        }

        // Student removes a linked parent's access.
        [HttpDelete("parents/{id:long}")]
        public async Task<IActionResult> Unlink(long id, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var link = await _db.Set<ParentLink>().FirstOrDefaultAsync(l => l.Id == id && l.StudentUserId == uid, ct);
            if (link is null) return NotFound();

            _db.Remove(link);
            await _db.SaveChangesAsync(ct);
            return NoContent();
        }

        // ---- Helpers ------------------------------------------------------

        private async Task<string?> ResolveStudentNameAsync(string emailLower, CancellationToken ct)
        {
            var normalized = emailLower.ToUpperInvariant();
            var u = await _db.Set<User>().AsNoTracking()
                .FirstOrDefaultAsync(x => x.NormalizedEmail == normalized, ct);
            return u is null ? null : $"{u.FirstName} {u.LastName}".Trim();
        }

        private static ParentLinkDto ToParentLinkDto(ParentLink l, string? studentName) => new()
        {
            Id = l.Id.ToString(),
            StudentEmail = l.StudentEmail,
            StudentName = studentName,
            StudentUserId = l.StudentUserId,
            Status = l.Status,
            CreatedAt = l.CreatedAt,
            RespondedAt = l.RespondedAt,
        };
    }

    // ---- DTOs -------------------------------------------------------------

    public record InviteStudentRequest(
        [property: JsonPropertyName("studentEmail")] string StudentEmail);

    public record ParentLinkDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("studentEmail")] public string StudentEmail { get; init; } = "";
        [JsonPropertyName("studentName")] public string? StudentName { get; init; }
        [JsonPropertyName("studentUserId")] public string? StudentUserId { get; init; }
        [JsonPropertyName("status")] public string Status { get; init; } = "";
        [JsonPropertyName("createdAt")] public DateTime CreatedAt { get; init; }
        [JsonPropertyName("respondedAt")] public DateTime? RespondedAt { get; init; }
    }

    public record LinkedParentDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("parentName")] public string ParentName { get; init; } = "";
        [JsonPropertyName("status")] public string Status { get; init; } = "";
        [JsonPropertyName("since")] public DateTime Since { get; init; }
    }

    public record IncomingInviteDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("token")] public string Token { get; init; } = "";
        [JsonPropertyName("parentName")] public string ParentName { get; init; } = "";
        [JsonPropertyName("invitedAt")] public DateTime InvitedAt { get; init; }
    }

    public record OverviewAssessmentDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("subjectId")] public string SubjectId { get; init; } = "";
        [JsonPropertyName("dueDate")] public DateTime DueDate { get; init; }
        [JsonPropertyName("status")] public string Status { get; init; } = "";
    }

    public record StudentOverviewDto
    {
        [JsonPropertyName("studentUserId")] public string StudentUserId { get; init; } = "";
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("educationLevel")] public string EducationLevel { get; init; } = "";
        [JsonPropertyName("upcomingCount")] public int UpcomingCount { get; init; }
        [JsonPropertyName("upcoming")] public List<OverviewAssessmentDto> Upcoming { get; init; } = new();
    }
}
