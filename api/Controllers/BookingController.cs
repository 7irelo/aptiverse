using System.Security.Claims;
using System.Text.Json.Serialization;
using Aptiverse.Api.Data;
using Aptiverse.Api.Data.Notifications;
using Aptiverse.Booking.Application.Frontend.Dtos;
using Aptiverse.Booking.Domain.Models.Booking;
using Aptiverse.Domain.Models;
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

        // The logged-in tutor's connections: students and parents they've
        // connected with. Aptiverse does not facilitate the tutoring itself or
        // take a fee; any arrangement happens directly between them.
        [HttpGet("connections")]
        public async Task<ActionResult<IEnumerable<FrontendConnectionDto>>> GetConnections(CancellationToken ct)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var connections = await _db.Set<TutorConnection>()
                .AsNoTracking()
                .Where(c => c.TutorUserId == userId)
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

        // A student or parent connects with a tutor. Creates the link (or
        // returns the existing one) and, for a new connection, notifies the
        // tutor: always in-app, plus email if their preference is on.
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
            var isNew = connection is null;
            if (connection is null)
            {
                connection = new TutorConnection
                {
                    TutorUserId = body.TutorUserId,
                    StudentId = userId,
                    StudentName = studentName,
                    Subject = body.Subject?.Trim() ?? "",
                    Status = "active",
                    ConnectedAt = DateTime.UtcNow,
                };
                _db.Set<TutorConnection>().Add(connection);
                await _db.SaveChangesAsync(ct);
            }

            if (isNew)
            {
                await _notifier.NotifyConnectionAsync(body.TutorUserId, studentName, connection.Subject, ct);
            }

            return Ok(new FrontendConnectionDto
            {
                Id = connection.Id.ToString(),
                StudentId = connection.StudentId,
                Student = connection.StudentName,
                Subject = connection.Subject,
                Status = connection.Status,
                ConnectedAt = connection.ConnectedAt,
            });
        }
    }

    public record CreateConnectionDto
    {
        [JsonPropertyName("tutorUserId")] public string TutorUserId { get; init; } = "";
        [JsonPropertyName("subject")] public string? Subject { get; init; }
    }
}
