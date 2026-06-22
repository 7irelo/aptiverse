using Aptiverse.Moderation.Application.Frontend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Moderation.Controllers
{
    [ApiController]
    [Route("api/moderation")]
    [Authorize(Roles = "Admin,Superuser,SchoolAdmin")]
    public class ModerationController : ControllerBase
    {
        [HttpGet("queue")]
        public ActionResult<IEnumerable<FrontendModerationFlagDto>> GetQueue()
            => Ok(Array.Empty<FrontendModerationFlagDto>());

        [HttpPost("queue/{id}/action")]
        public IActionResult TakeAction(string id, [FromBody] FrontendModerationActionInput input)
        {
            return Ok(new { id, input.Action, success = true });
        }
    }
}
