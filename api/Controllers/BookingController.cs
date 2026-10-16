using System.Security.Claims;
using System.Text.Json.Serialization;
using Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning;
using Aptiverse.Api.Data;
using Aptiverse.Api.Data.Notifications;
using Aptiverse.Booking.Application.Frontend.Dtos;
using Aptiverse.Booking.Domain.Models.Booking;
using Aptiverse.Domain.Models;
using Aptiverse.Goals.Domain.Models.Goals;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Booking.Controllers
{
    [ApiController]
    [Route("api/booking")]
    [Authorize]
    public class BookingController(ApplicationDbContext db, TutorNotifier notifier) : ControllerBase
    {
        private readonly ApplicationDbContext _db = db;
        private readonly TutorNotifier _notifier = notifier;

        private string? CurrentUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value;

        [HttpGet("bookings")]
        public ActionResult<IEnumerable<FrontendBookingDto>> GetBookings([FromQuery] string? scope = null)
            => Ok(Array.Empty<FrontendBookingDto>());

        [HttpGet("tutors/{tutorId}/availability")]
        public ActionResult<IEnumerable<FrontendAvailabilitySlotDto>> GetAvailability(string tutorId)
            => Ok(Array.Empty<FrontendAvailabilitySlotDto>());

        // The logged-in tutor's connections: students who have asked to work with
        // them (pending), plus the ones they've taken on (active/paused). A
        // request waits for the tutor to accept before any academic context is
        // shared. Aptiverse does not facilitate the tutoring itself or take a
        // fee; any arrangement happens directly between them.
        [HttpGet("connections")]
        public async Task<ActionResult<IEnumerable<FrontendConnectionDto>>> GetConnections(CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var connections = await _db.Set<TutorConnection>()
                .AsNoTracking()
                .Where(c => c.TutorUserId == userId && c.Status != "declined")
                .OrderByDescending(c => c.ConnectedAt)
                .Select(c => new FrontendConnectionDto
                {
                    Id = c.Id.ToString(),
                    StudentId = c.StudentId,
                    Student = c.StudentName,
                    Subject = c.Subject,
                    Status = c.Status,
                    ConnectedAt = c.ConnectedAt,
                })
                .ToListAsync(ct);

            return Ok(connections);
        }

        // A student or parent asks to connect with a tutor. Creates the request
        // as "pending" (or revives a previously declined one) and notifies the
        // tutor: always in-app, plus email if their preference is on. The tutor
        // must accept before the connection becomes active.
        [HttpPost("connections")]
        public async Task<ActionResult<FrontendConnectionDto>> CreateConnection(
            [FromBody] CreateConnectionDto body, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (string.IsNullOrWhiteSpace(body.TutorUserId)) return BadRequest("tutorUserId is required.");
            if (body.TutorUserId == userId) return BadRequest("You can't connect with yourself.");

            var student = await _db.Set<User>().AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, ct);
            var studentName = student is null
                ? "A student"
                : $"{student.FirstName} {student.LastName}".Trim();
            if (string.IsNullOrWhiteSpace(studentName)) studentName = "A student";

            var connection = await _db.Set<TutorConnection>()
                .FirstOrDefaultAsync(c => c.TutorUserId == body.TutorUserId && c.StudentId == userId, ct);
            var shouldNotify = false;
            if (connection is null)
            {
                connection = new TutorConnection
                {
                    TutorUserId = body.TutorUserId,
                    StudentId = userId,
                    StudentName = studentName,
                    Subject = body.Subject?.Trim() ?? "",
                    Status = "pending",
                    ConnectedAt = DateTime.UtcNow,
                };
                _db.Set<TutorConnection>().Add(connection);
                await _db.SaveChangesAsync(ct);
                shouldNotify = true;
            }
            else if (connection.Status == "declined")
            {
                // Let the student ask again after a decline.
                connection.Status = "pending";
                connection.StudentName = studentName;
                if (!string.IsNullOrWhiteSpace(body.Subject)) connection.Subject = body.Subject.Trim();
                connection.ConnectedAt = DateTime.UtcNow;
                connection.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync(ct);
                shouldNotify = true;
            }

            if (shouldNotify)
            {
                await _notifier.NotifyConnectionAsync(body.TutorUserId, studentName, connection.Subject, ct);
            }

            return Ok(ToDto(connection));
        }

        // The tutor moves a connection through its lifecycle: accept or decline a
        // pending request, or pause and resume an active student.
        [HttpPatch("connections/{id:long}")]
        public async Task<ActionResult<FrontendConnectionDto>> UpdateConnection(
            long id, [FromBody] UpdateConnectionDto body, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var connection = await _db.Set<TutorConnection>()
                .FirstOrDefaultAsync(c => c.Id == id && c.TutorUserId == userId, ct);
            if (connection is null) return NotFound();

            var next = (body.Status ?? "").Trim().ToLowerInvariant();
            var ok = (connection.Status, next) switch
            {
                ("pending", "active") => true,   // accept
                ("pending", "declined") => true, // decline
                ("active", "paused") => true,    // pause
                ("paused", "active") => true,    // resume
                _ => false,
            };
            if (!ok) return BadRequest($"Can't move a {connection.Status} connection to {next}.");

            connection.Status = next;
            connection.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);

            return Ok(ToDto(connection));
        }

        // A read-only window into a linked student's academics, so the tutor can
        // prepare. Only the tutor on an ACTIVE connection may see it; a pending,
        // paused, or declined connection returns nothing.
        [HttpGet("connections/{id:long}/student-context")]
        public async Task<ActionResult<StudentContextDto>> GetStudentContext(long id, CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var connection = await _db.Set<TutorConnection>().AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id && c.TutorUserId == userId, ct);
            if (connection is null) return NotFound();
            if (connection.Status != "active") return Forbid();

            var sid = connection.StudentId;

            // Curriculum (high-school) subjects, resolved to their catalog name.
            var subjects = await _db.Set<StudentSubject>().AsNoTracking()
                .Where(ss => ss.StudentId == sid)
                .Join(_db.Set<CurriculumSubject>().AsNoTracking(), ss => ss.CurriculumSubjectId, cs => cs.Id, (ss, cs) => new { ss, cs })
                .Join(_db.Set<Subject>().AsNoTracking(), x => x.cs.SubjectId, s => s.Id, (x, s) => new StudentUnitDto
                {
                    Name = s.Name,
                    Detail = x.ss.Grade > 0 ? $"Grade {x.ss.Grade}" : "",
                })
                .ToListAsync(ct);

            // Student-created (tertiary) subjects.
            var owned = await _db.Set<Subject>().AsNoTracking()
                .Where(s => s.OwnerStudentId == sid)
                .Select(s => new StudentUnitDto { Name = s.Name, Detail = s.Code ?? "" })
                .ToListAsync(ct);

            // Tertiary courses.
            var courses = await _db.Set<StudentCourse>().AsNoTracking()
                .Where(sc => sc.StudentId == sid)
                .Join(_db.Set<Course>().AsNoTracking(), sc => sc.CourseId, c => c.Id, (sc, c) => new StudentUnitDto
                {
                    Name = c.Name,
                    Detail = c.Code ?? "",
                })
                .ToListAsync(ct);

            var units = subjects.Concat(owned).Concat(courses)
                .GroupBy(u => u.Name)
                .Select(g => g.First())
                .OrderBy(u => u.Name)
                .ToList();

            // Upcoming assessments (and ones that are due but not yet graded).
            var cutoff = DateTime.UtcNow.AddDays(-1);
            var rawAssessments = await _db.Set<Assessment>().AsNoTracking()
                .Where(a => a.StudentId == sid && a.DueDate >= cutoff && a.Status != "graded")
                .OrderBy(a => a.DueDate)
                .Take(12)
                .Select(a => new { a.Title, a.Type, a.SubjectId, a.Weight, a.DueDate, a.Status, a.PredictedMark })
                .ToListAsync(ct);

            // Resolve assessment subject slugs to names where we can.
            var slugs = rawAssessments.Select(a => a.SubjectId).Distinct().ToList();
            var nameBySlug = await _db.Set<Subject>().AsNoTracking()
                .Where(s => slugs.Contains(s.Id))
                .ToDictionaryAsync(s => s.Id, s => s.Name, ct);

            var assessments = rawAssessments.Select(a => new StudentAssessmentDto
            {
                Title = a.Title,
                Type = a.Type,
                Subject = nameBySlug.TryGetValue(a.SubjectId, out var n) ? n : Prettify(a.SubjectId),
                Weight = a.Weight,
                DueDate = a.DueDate,
                Status = a.Status,
                PredictedMark = a.PredictedMark,
            }).ToList();

            // Active goals.
            var goals = await _db.Set<Goal>().AsNoTracking()
                .Where(g => g.StudentId == sid && (g.Status == "active" || g.Status == "at_risk"))
                .OrderBy(g => g.DueDate)
                .Take(12)
                .Select(g => new StudentGoalDto
                {
                    Title = g.Title,
                    Target = g.Target,
                    Progress = g.Progress,
                    Status = g.Status,
                    Category = g.Category,
                    DueDate = g.DueDate,
                })
                .ToListAsync(ct);

            return Ok(new StudentContextDto
            {
                StudentId = sid,
                StudentName = connection.StudentName,
                Subject = connection.Subject,
                Units = units,
                Assessments = assessments,
                Goals = goals,
            });
        }

        private static FrontendConnectionDto ToDto(TutorConnection c) => new()
        {
            Id = c.Id.ToString(),
            StudentId = c.StudentId,
            Student = c.StudentName,
            Subject = c.Subject,
            Status = c.Status,
            ConnectedAt = c.ConnectedAt,
        };

        private static string Prettify(string slug)
        {
            if (string.IsNullOrWhiteSpace(slug)) return "Subject";
            var last = slug.Contains(':') ? slug[(slug.LastIndexOf(':') + 1)..] : slug;
            var words = last.Replace('_', ' ').Replace('-', ' ').Trim();
            return words.Length == 0 ? "Subject" : char.ToUpperInvariant(words[0]) + words[1..];
        }
    }

    public record CreateConnectionDto
    {
        [JsonPropertyName("tutorUserId")] public string TutorUserId { get; init; } = "";
        [JsonPropertyName("subject")] public string? Subject { get; init; }
    }

    public record UpdateConnectionDto
    {
        [JsonPropertyName("status")] public string Status { get; init; } = "";
    }

    public record StudentContextDto
    {
        [JsonPropertyName("studentId")] public string StudentId { get; init; } = "";
        [JsonPropertyName("studentName")] public string StudentName { get; init; } = "";
        [JsonPropertyName("subject")] public string Subject { get; init; } = "";
        [JsonPropertyName("units")] public IList<StudentUnitDto> Units { get; init; } = [];
        [JsonPropertyName("assessments")] public IList<StudentAssessmentDto> Assessments { get; init; } = [];
        [JsonPropertyName("goals")] public IList<StudentGoalDto> Goals { get; init; } = [];
    }

    public record StudentUnitDto
    {
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("detail")] public string Detail { get; init; } = "";
    }

    public record StudentAssessmentDto
    {
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("type")] public string Type { get; init; } = "";
        [JsonPropertyName("subject")] public string Subject { get; init; } = "";
        [JsonPropertyName("weight")] public int Weight { get; init; }
        [JsonPropertyName("dueDate")] public DateTime DueDate { get; init; }
        [JsonPropertyName("status")] public string Status { get; init; } = "";
        [JsonPropertyName("predictedMark")] public int? PredictedMark { get; init; }
    }

    public record StudentGoalDto
    {
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("target")] public string Target { get; init; } = "";
        [JsonPropertyName("progress")] public int Progress { get; init; }
        [JsonPropertyName("status")] public string Status { get; init; } = "";
        [JsonPropertyName("category")] public string Category { get; init; } = "";
        [JsonPropertyName("dueDate")] public DateTime DueDate { get; init; }
    }
}
