using Aptiverse.Support.Application.Frontend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Support.Controllers
{
    [ApiController]
    [Route("api/support")]
    [Authorize]
    public class SupportController : ControllerBase
    {
        [HttpGet("tickets")]
        public ActionResult<IEnumerable<FrontendSupportTicketDto>> GetTickets()
            => Ok(Array.Empty<FrontendSupportTicketDto>());

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
