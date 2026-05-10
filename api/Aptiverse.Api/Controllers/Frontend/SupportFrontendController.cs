using Aptiverse.Support.Application.Frontend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Support.Controllers
{
    [ApiController]
    [Route("api/frontend")]
    [Authorize]
    public class FrontendController : ControllerBase
    {
        [HttpGet("tickets")]
        public ActionResult<IEnumerable<FrontendSupportTicketDto>> GetTickets()
        {
            var now = DateTime.UtcNow;
            return Ok(new[]
            {
                new FrontendSupportTicketDto { Id = "tk-1", Subject = "Can't sync Google Calendar", Body = "When I connect my Google Calendar, sessions show but reminders aren't pushed.", Status = "open", Priority = "normal", CreatedAt = now.AddHours(-3), UpdatedAt = now.AddHours(-3), Requester = "thandi@example.com" },
                new FrontendSupportTicketDto { Id = "tk-2", Subject = "Voice diary not transcribing isiZulu", Body = "Audio recorded but transcript stays blank.", Status = "pending", Priority = "high", CreatedAt = now.AddDays(-1), UpdatedAt = now.AddHours(-6), Requester = "lerato@example.com" },
                new FrontendSupportTicketDto { Id = "tk-3", Subject = "School plan invoice missing PO", Body = "Need PO field on school invoices for our finance system.", Status = "resolved", Priority = "low", CreatedAt = now.AddDays(-3), UpdatedAt = now.AddDays(-2), Requester = "admin@school.example" },
            });
        }

        [HttpPost("tickets")]
        public ActionResult<FrontendSupportTicketDto> CreateTicket([FromBody] FrontendCreateTicketInput input)
        {
            return Ok(new FrontendSupportTicketDto
            {
                Id = $"tk-{Guid.NewGuid():N}",
                Subject = input.Subject,
                Body = input.Body,
                Priority = input.Priority ?? "normal",
                Status = "open",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Requester = User?.Identity?.Name ?? "",
            });
        }

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
