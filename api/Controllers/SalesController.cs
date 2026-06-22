using System.Text.Json.Serialization;
using Aptiverse.Api.Data;
using Aptiverse.Core.Services;
using Aptiverse.Sales.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Sales.Controllers
{
    [ApiController]
    [Route("api/sales")]
    public class SalesController(ApplicationDbContext db, IEmailSender emailSender, ILogger<SalesController> logger) : ControllerBase
    {
        private readonly ApplicationDbContext _db = db;
        private readonly IEmailSender _emailSender = emailSender;
        private readonly ILogger<SalesController> _logger = logger;

        // Public — schools fill this in before they have accounts.
        [HttpPost("school-enquiry")]
        [AllowAnonymous]
        public async Task<IActionResult> SubmitSchoolEnquiry([FromBody] FrontendSchoolEnquiryDto body)
        {
            if (string.IsNullOrWhiteSpace(body.SchoolName)) return BadRequest("School name is required.");
            if (string.IsNullOrWhiteSpace(body.ContactName)) return BadRequest("Contact name is required.");
            if (string.IsNullOrWhiteSpace(body.Email)) return BadRequest("Email is required.");

            var entry = new SchoolEnquiry
            {
                SchoolName = body.SchoolName.Trim(),
                ContactName = body.ContactName.Trim(),
                ContactRole = TrimOrNull(body.ContactRole),
                Email = body.Email.Trim(),
                Phone = TrimOrNull(body.Phone),
                Province = TrimOrNull(body.Province),
                City = TrimOrNull(body.City),
                Curricula = body.Curricula is { Count: > 0 }
                    ? string.Join(",", body.Curricula.Select(c => c.Trim()).Where(c => !string.IsNullOrEmpty(c)))
                    : null,
                LearnerCount = TrimOrNull(body.LearnerCount),
                Stage = TrimOrNull(body.Stage),
                Notes = TrimOrNull(body.Notes),
            };

            _db.Set<SchoolEnquiry>().Add(entry);
            await _db.SaveChangesAsync();

            // Best-effort email to sales. Same pattern as user registration:
            // if SMTP isn't configured we just log a warning — the row in
            // sales.school_enquiries is the source of truth.
            try
            {
                await _emailSender.SendTemplateEmailAsync(
                    "schools@aptiverse.co.za",
                    $"School enquiry: {entry.SchoolName}",
                    "school_enquiry",
                    new
                    {
                        entry.Id,
                        entry.SchoolName,
                        entry.ContactName,
                        entry.ContactRole,
                        entry.Email,
                        entry.Phone,
                        entry.Province,
                        entry.City,
                        entry.Curricula,
                        entry.LearnerCount,
                        entry.Stage,
                        entry.Notes,
                    });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "School-enquiry email send failed for {SchoolName} ({Email}) — enquiry id {Id} is saved; sales can pick it up from the admin dashboard.",
                    entry.SchoolName, entry.Email, entry.Id);
            }

            return Accepted(new { id = entry.Id });
        }

        // Admin-only — list enquiries for the sales pipeline view.
        [HttpGet("school-enquiries")]
        [Authorize(Roles = "Admin,Superuser")]
        public async Task<ActionResult<IEnumerable<FrontendSchoolEnquiryReadDto>>> ListSchoolEnquiries(
            [FromQuery] bool? contacted = null)
        {
            var query = _db.Set<SchoolEnquiry>().AsNoTracking().AsQueryable();
            if (contacted is not null) query = query.Where(e => e.Contacted == contacted);

            var rows = await query
                .OrderByDescending(e => e.SubmittedAt)
                .Select(e => new FrontendSchoolEnquiryReadDto
                {
                    Id = e.Id.ToString(),
                    SchoolName = e.SchoolName,
                    ContactName = e.ContactName,
                    ContactRole = e.ContactRole,
                    Email = e.Email,
                    Phone = e.Phone,
                    Province = e.Province,
                    City = e.City,
                    Curricula = e.Curricula,
                    LearnerCount = e.LearnerCount,
                    Stage = e.Stage,
                    Notes = e.Notes,
                    SubmittedAt = e.SubmittedAt,
                    Contacted = e.Contacted,
                    ContactedAt = e.ContactedAt,
                })
                .ToListAsync();
            return Ok(rows);
        }

        [HttpPost("school-enquiries/{id}/mark-contacted")]
        [Authorize(Roles = "Admin,Superuser")]
        public async Task<IActionResult> MarkContacted(string id)
        {
            if (!long.TryParse(id, out var enquiryId)) return NotFound();
            var entry = await _db.Set<SchoolEnquiry>().FirstOrDefaultAsync(e => e.Id == enquiryId);
            if (entry is null) return NotFound();
            entry.Contacted = true;
            entry.ContactedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        private static string? TrimOrNull(string? v) =>
            string.IsNullOrWhiteSpace(v) ? null : v.Trim();
    }

    public record FrontendSchoolEnquiryDto
    {
        [JsonPropertyName("schoolName")] public string SchoolName { get; init; } = "";
        [JsonPropertyName("contactName")] public string ContactName { get; init; } = "";
        [JsonPropertyName("contactRole")] public string? ContactRole { get; init; }
        [JsonPropertyName("email")] public string Email { get; init; } = "";
        [JsonPropertyName("phone")] public string? Phone { get; init; }
        [JsonPropertyName("province")] public string? Province { get; init; }
        [JsonPropertyName("city")] public string? City { get; init; }
        [JsonPropertyName("curricula")] public IList<string>? Curricula { get; init; }
        [JsonPropertyName("learnerCount")] public string? LearnerCount { get; init; }
        [JsonPropertyName("stage")] public string? Stage { get; init; }
        [JsonPropertyName("notes")] public string? Notes { get; init; }
    }

    public record FrontendSchoolEnquiryReadDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("schoolName")] public string SchoolName { get; init; } = "";
        [JsonPropertyName("contactName")] public string ContactName { get; init; } = "";
        [JsonPropertyName("contactRole")] public string? ContactRole { get; init; }
        [JsonPropertyName("email")] public string Email { get; init; } = "";
        [JsonPropertyName("phone")] public string? Phone { get; init; }
        [JsonPropertyName("province")] public string? Province { get; init; }
        [JsonPropertyName("city")] public string? City { get; init; }
        [JsonPropertyName("curricula")] public string? Curricula { get; init; }
        [JsonPropertyName("learnerCount")] public string? LearnerCount { get; init; }
        [JsonPropertyName("stage")] public string? Stage { get; init; }
        [JsonPropertyName("notes")] public string? Notes { get; init; }
        [JsonPropertyName("submittedAt")] public DateTime SubmittedAt { get; init; }
        [JsonPropertyName("contacted")] public bool Contacted { get; init; }
        [JsonPropertyName("contactedAt")] public DateTime? ContactedAt { get; init; }
    }
}
