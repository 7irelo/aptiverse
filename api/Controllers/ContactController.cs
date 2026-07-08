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
    [Route("api/contact")]
    public class ContactController(ApplicationDbContext db, IEmailSender emailSender, ILogger<ContactController> logger) : ControllerBase
    {
        private readonly ApplicationDbContext _db = db;
        private readonly IEmailSender _emailSender = emailSender;
        private readonly ILogger<ContactController> _logger = logger;

        // Public — anyone on the marketing site can submit before they have
        // an account. Mirrors SalesController.SubmitSchoolEnquiry.
        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Submit([FromBody] FrontendContactEnquiryDto body)
        {
            if (string.IsNullOrWhiteSpace(body.FirstName)) return BadRequest("First name is required.");
            if (string.IsNullOrWhiteSpace(body.LastName)) return BadRequest("Last name is required.");
            if (string.IsNullOrWhiteSpace(body.Email)) return BadRequest("Email is required.");
            if (string.IsNullOrWhiteSpace(body.Reason)) return BadRequest("Reason is required.");
            if (string.IsNullOrWhiteSpace(body.Message)) return BadRequest("Message is required.");

            var entry = new ContactEnquiry
            {
                FirstName = body.FirstName.Trim(),
                LastName = body.LastName.Trim(),
                Email = body.Email.Trim(),
                Organisation = TrimOrNull(body.Organisation),
                Reason = body.Reason.Trim(),
                Message = body.Message.Trim(),
            };

            _db.Set<ContactEnquiry>().Add(entry);
            await _db.SaveChangesAsync();

            // Best-effort email to the support inbox. Same pattern as the
            // school enquiry: if SMTP isn't configured we just log a warning —
            // the row in sales.contact_enquiries is the source of truth.
            try
            {
                await _emailSender.SendTemplateEmailAsync(
                    "hello@aptiverse.co.za",
                    $"Contact enquiry: {entry.FirstName} {entry.LastName} ({entry.Reason})",
                    "contact_enquiry",
                    new
                    {
                        entry.Id,
                        entry.FirstName,
                        entry.LastName,
                        entry.Email,
                        entry.Organisation,
                        entry.Reason,
                        entry.Message,
                    });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Contact-enquiry email send failed for {FirstName} {LastName} ({Email}) — enquiry id {Id} is saved; support can pick it up from the admin dashboard.",
                    entry.FirstName, entry.LastName, entry.Email, entry.Id);
            }

            // Best-effort acknowledgement back to the submitter so they know the
            // message landed. Non-fatal: the enquiry is saved and the team is
            // already notified regardless of whether this send succeeds.
            try
            {
                await _emailSender.SendTemplateEmailAsync(
                    entry.Email,
                    "We got your message",
                    "contact_received",
                    new { entry.FirstName, entry.Message });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Contact-enquiry acknowledgement to {Email} failed (enquiry {Id}) — non-fatal.",
                    entry.Email, entry.Id);
            }

            return Accepted(new { id = entry.Id });
        }

        // Admin-only — list enquiries for the support/sales intake view.
        [HttpGet]
        [Authorize(Roles = "Admin,Superuser")]
        public async Task<ActionResult<IEnumerable<FrontendContactEnquiryReadDto>>> List(
            [FromQuery] bool? contacted = null)
        {
            var query = _db.Set<ContactEnquiry>().AsNoTracking().AsQueryable();
            if (contacted is not null) query = query.Where(e => e.Contacted == contacted);

            var rows = await query
                .OrderByDescending(e => e.SubmittedAt)
                .Select(e => new FrontendContactEnquiryReadDto
                {
                    Id = e.Id.ToString(),
                    FirstName = e.FirstName,
                    LastName = e.LastName,
                    Email = e.Email,
                    Organisation = e.Organisation,
                    Reason = e.Reason,
                    Message = e.Message,
                    SubmittedAt = e.SubmittedAt,
                    Contacted = e.Contacted,
                    ContactedAt = e.ContactedAt,
                })
                .ToListAsync();
            return Ok(rows);
        }

        [HttpPost("{id}/mark-contacted")]
        [Authorize(Roles = "Admin,Superuser")]
        public async Task<IActionResult> MarkContacted(string id)
        {
            if (!long.TryParse(id, out var enquiryId)) return NotFound();
            var entry = await _db.Set<ContactEnquiry>().FirstOrDefaultAsync(e => e.Id == enquiryId);
            if (entry is null) return NotFound();
            entry.Contacted = true;
            entry.ContactedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        private static string? TrimOrNull(string? v) =>
            string.IsNullOrWhiteSpace(v) ? null : v.Trim();
    }

    public record FrontendContactEnquiryDto
    {
        [JsonPropertyName("firstName")] public string FirstName { get; init; } = "";
        [JsonPropertyName("lastName")] public string LastName { get; init; } = "";
        [JsonPropertyName("email")] public string Email { get; init; } = "";
        [JsonPropertyName("organisation")] public string? Organisation { get; init; }
        [JsonPropertyName("reason")] public string Reason { get; init; } = "";
        [JsonPropertyName("message")] public string Message { get; init; } = "";
    }

    public record FrontendContactEnquiryReadDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("firstName")] public string FirstName { get; init; } = "";
        [JsonPropertyName("lastName")] public string LastName { get; init; } = "";
        [JsonPropertyName("email")] public string Email { get; init; } = "";
        [JsonPropertyName("organisation")] public string? Organisation { get; init; }
        [JsonPropertyName("reason")] public string Reason { get; init; } = "";
        [JsonPropertyName("message")] public string Message { get; init; } = "";
        [JsonPropertyName("submittedAt")] public DateTime SubmittedAt { get; init; }
        [JsonPropertyName("contacted")] public bool Contacted { get; init; }
        [JsonPropertyName("contactedAt")] public DateTime? ContactedAt { get; init; }
    }
}
