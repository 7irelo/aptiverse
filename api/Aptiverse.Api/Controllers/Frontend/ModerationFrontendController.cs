using Aptiverse.Moderation.Application.Frontend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Moderation.Controllers
{
    [ApiController]
    [Route("api/frontend")]
    [Authorize(Roles = "Admin,Superuser,SchoolAdmin")]
    public class FrontendController : ControllerBase
    {
        [HttpGet("moderation-queue")]
        public ActionResult<IEnumerable<FrontendModerationFlagDto>> GetQueue()
        {
            var now = DateTime.UtcNow;
            return Ok(new[]
            {
                new FrontendModerationFlagDto { Id = "f1", Reason = "Inappropriate language", Target = "Study group: Calculus Crew", Reporter = "Mandla T.", Excerpt = "Some swearing in chat at 8:42pm.", Severity = "low", CreatedAt = now.AddHours(-3) },
                new FrontendModerationFlagDto { Id = "f2", Reason = "Plagiarised essay", Target = "Essay submission #821", Reporter = "AI auto-flag", Excerpt = "Three paragraphs match a 2022 NSC paper >85%.", Severity = "high", CreatedAt = now.AddHours(-7) },
                new FrontendModerationFlagDto { Id = "f3", Reason = "Tutor advert outside platform", Target = "Tutor: Brent O'R.", Reporter = "Aisha M.", Excerpt = "Mentioned WhatsApp number in profile.", Severity = "medium", CreatedAt = now.AddHours(-22) },
            });
        }

        [HttpPost("moderation-queue/{id}/action")]
        public IActionResult TakeAction(string id, [FromBody] FrontendModerationActionInput input)
        {
            return Ok(new { id, input.Action, success = true });
        }
    }
}
