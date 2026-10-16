using System.Security.Claims;
using Aptiverse.Support.Application.Frontend.Dtos;
using Aptiverse.Support.Application.Frontend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Support.Controllers
{
    [ApiController]
    [Route("api/support")]
    [Authorize]
    public class SupportController(IFrontendSupportService support) : ControllerBase
    {
        private readonly IFrontendSupportService _support = support;

        private string? CurrentUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value;

        private string CurrentUserName()
            => User.Identity?.Name
            ?? User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirst("email")?.Value
            ?? "";

        private string CurrentUserRole()
            => User.FindFirstValue(ClaimTypes.Role)
            ?? User.FindFirst("role")?.Value
            ?? "Student";

        [HttpGet("tickets")]
        public async Task<ActionResult<IEnumerable<FrontendSupportTicketDto>>> GetTickets(CancellationToken cancellationToken)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var tickets = await _support.ListTicketsForUserAsync(userId, cancellationToken);
            return Ok(tickets);
        }

        [HttpPost("tickets")]
        public async Task<ActionResult<FrontendSupportTicketDto>> CreateTicket(
            [FromBody] FrontendCreateTicketInput input, CancellationToken cancellationToken)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (string.IsNullOrWhiteSpace(input.Subject)) return BadRequest("Subject is required.");

            var dto = await _support.CreateTicketAsync(userId, CurrentUserName(), input, cancellationToken);
            return CreatedAtAction(nameof(GetTicket), new { id = dto.Id }, dto);
        }

        [HttpGet("tickets/{id}")]
        public async Task<ActionResult<FrontendSupportTicketDto>> GetTicket(string id, CancellationToken cancellationToken)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var ticketId)) return NotFound();

            var dto = await _support.GetTicketForUserAsync(userId, ticketId, cancellationToken);
            return dto is null ? NotFound() : Ok(dto);
        }

        [HttpGet("tickets/{id}/messages")]
        public async Task<ActionResult<IEnumerable<FrontendSupportMessageDto>>> GetMessages(string id, CancellationToken cancellationToken)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var ticketId)) return NotFound();

            var messages = await _support.ListMessagesForUserAsync(userId, ticketId, cancellationToken);
            return messages is null ? NotFound() : Ok(messages);
        }

        [HttpPost("tickets/{id}/messages")]
        public async Task<ActionResult<FrontendSupportMessageDto>> AddMessage(
            string id, [FromBody] FrontendCreateMessageInput input, CancellationToken cancellationToken)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var ticketId)) return NotFound();
            if (string.IsNullOrWhiteSpace(input.Content)) return BadRequest("Content is required.");

            var dto = await _support.AddMessageForUserAsync(userId, CurrentUserRole(), ticketId, input, cancellationToken);
            return dto is null ? NotFound() : Ok(dto);
        }

        // FAQs are product content (not user data) so they stay populated.
        // Move to a CMS or Markdown sources once that pipeline exists.
        [HttpGet("faqs")]
        [AllowAnonymous]
        public ActionResult<IEnumerable<FrontendFaqDto>> GetFaqs()
        {
            return Ok(new[]
            {
                new FrontendFaqDto { Id = "f1", Q = "How does AI generate practice tests?", A = "We use the subject or course you pick, the topics you choose, and your existing topic vocabulary to generate aligned questions, then mark them with feedback.", Category = "ai" },
                // This answered "is my diary private" with "end-to-end encrypted,
                // even staff cannot read it". Neither half was true.
                // DiaryEntry.Content is a plain string, and the same row carries
                // SentimentAnalysis and SentimentScore, which the server computes
                // by reading the entry. End-to-end encryption is not merely absent
                // here, it is impossible while the mood trend exists: we cannot
                // analyse text we cannot read. A student decides what to confide
                // based on this answer, so it is the last place to overclaim.
                new FrontendFaqDto { Id = "f2", Q = "Is my diary private?", A = "Your entries are yours: no parent, teacher or other student can see them. Two things you should know honestly. They are stored on our servers, not end-to-end encrypted, so treat it as private rather than sealed. And our AI reads each entry to work out the mood trend on your wellbeing page.", Category = "privacy" },
                new FrontendFaqDto { Id = "f3", Q = "How do rewards get verified?", A = "Measurable goals verify themselves from your own work: your logged marks and your practice results. There is nobody to ask and nothing to submit.", Category = "rewards" },
                // There is no offline support to speak of: no service worker, no
                // PWA config, no workbox, nothing in next.config. The previous
                // answer promised offline practice, diary and goals plus
                // background sync, none of which exists. Worth being blunt about
                // rather than vague, because a student on limited data who
                // believes this will lose work.
                new FrontendFaqDto { Id = "f4", Q = "Can I use Aptiverse offline?", A = "Not yet. Aptiverse needs a connection: practice tests are generated on demand, and your work saves to your account as you go. If you lose signal mid-test, finish the question you are on and wait for the connection before submitting.", Category = "general" },
            });
        }
    }
}
