using System.Text.Json.Serialization;
using Aptiverse.Api.Data;
using Aptiverse.Api.Services.Audit;
using Aptiverse.Core.Services;
using Aptiverse.Sales.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Sales.Controllers
{
    [ApiController]
    [Route("api/sales")]
    public class SalesController(
        ApplicationDbContext db,
        IEmailSender emailSender,
        IAuditTrail audit,
        ILogger<SalesController> logger) : ControllerBase
    {
        private readonly ApplicationDbContext _db = db;
        private readonly IEmailSender _emailSender = emailSender;
        private readonly IAuditTrail _audit = audit;
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
                    "School-enquiry email send failed for {SchoolName} ({Email}). Enquiry id {Id} is saved; sales can pick it up from the admin dashboard.",
                    entry.SchoolName, entry.Email, entry.Id);
            }

            // Best-effort acknowledgement to the person who enquired. Non-fatal.
            try
            {
                await _emailSender.SendTemplateEmailAsync(
                    entry.Email,
                    "We got your enquiry",
                    "contact_received",
                    new
                    {
                        FirstName = entry.ContactName,
                        Message = string.IsNullOrWhiteSpace(entry.Notes)
                            ? $"Enquiry about {entry.SchoolName}"
                            : entry.Notes,
                    });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "School-enquiry acknowledgement to {Email} failed (enquiry {Id}); non-fatal.",
                    entry.Email, entry.Id);
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

        // Mark a lead contacted, or put it back in the fresh pile.
        //
        // It used to be one-way: mark-contacted with no body and no route back,
        // so a mis-click moved a live lead out of the queue permanently. The
        // body makes it a toggle, and the change is audited because who chased
        // which school and when is the whole point of a pipeline.
        [HttpPut("school-enquiries/{id}/contacted")]
        [Authorize(Roles = "Admin,Superuser")]
        public async Task<IActionResult> SetContacted(
            string id, [FromBody] FrontendSetContactedDto body, CancellationToken ct)
        {
            if (!long.TryParse(id, out var enquiryId)) return NotFound();
            var entry = await _db.Set<SchoolEnquiry>().FirstOrDefaultAsync(e => e.Id == enquiryId, ct);
            if (entry is null) return NotFound();

            var previous = entry.Contacted;
            if (previous == body.Contacted) return NoContent();

            entry.Contacted = body.Contacted;
            entry.ContactedAt = body.Contacted ? DateTime.UtcNow : null;
            await _db.SaveChangesAsync(ct);

            await _audit.RecordAsync(new AuditEntry
            {
                Action = body.Contacted ? "SchoolEnquiry.Contacted" : "SchoolEnquiry.ContactReopened",
                Category = "Sales",
                EntityType = "SchoolEnquiry",
                EntityId = entry.Id.ToString(),
                OldValues = new { contacted = previous },
                NewValues = new { contacted = body.Contacted, school = entry.SchoolName },
            }, ct);

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

    public record FrontendSetContactedDto
    {
        [JsonPropertyName("contacted")] public bool Contacted { get; init; }
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
