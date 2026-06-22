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
                new FrontendFaqDto { Id = "f1", Q = "How does AI generate practice tests?", A = "We use your subject, current mastery and upcoming SBAs to generate aligned questions, then mark them with rubric-aware feedback.", Category = "ai" },
                new FrontendFaqDto { Id = "f2", Q = "Is my diary private?", A = "Yes. Your diary is end-to-end encrypted by default. Even Aptiverse staff cannot read it.", Category = "privacy" },
                new FrontendFaqDto { Id = "f3", Q = "How do rewards get verified?", A = "Your school confirms with one click via an email — no paperwork on the teacher.", Category = "rewards" },
                new FrontendFaqDto { Id = "f4", Q = "Can I use Aptiverse offline?", A = "Yes. Practice tests, diary entries and goal modules work offline and sync when you're back online.", Category = "general" },
            });
        }
    }
}
