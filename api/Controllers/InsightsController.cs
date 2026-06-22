using Aptiverse.Insights.Application.Frontend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Insights.Controllers
{
    [ApiController]
    [Route("api/insights")]
    [Authorize]
    public class InsightsController : ControllerBase
    {
        [HttpGet("live-activity")]
        public ActionResult<IEnumerable<FrontendLiveActivityDto>> GetLiveActivity([FromQuery] int take = 30)
            => Ok(Array.Empty<FrontendLiveActivityDto>());

        // SSE stream — keeps the connection open with periodic heartbeats
        // so the UI's EventSource doesn't reconnect-loop, but emits no
        // synthetic events. Real events land here once Insights is wired
        // to actual user activity (audit log + diary + practice attempts).
        [HttpGet("live-activity/stream")]
        public async Task LiveActivityStream(CancellationToken ct)
        {
            Response.Headers["Content-Type"] = "text/event-stream";
            Response.Headers["Cache-Control"] = "no-cache";
            Response.Headers["Connection"] = "keep-alive";

            while (!ct.IsCancellationRequested)
            {
                await Response.WriteAsync(": heartbeat\n\n", ct);
                await Response.Body.FlushAsync(ct);
                try { await Task.Delay(15000, ct); } catch (TaskCanceledException) { break; }
            }
        }

        [HttpGet("gaps")]
        [Authorize(Roles = "Teacher,SchoolAdmin,Admin,Superuser")]
        public ActionResult<IEnumerable<FrontendGapDto>> GetGaps()
            => Ok(Array.Empty<FrontendGapDto>());

        [HttpGet("differentiation")]
        [Authorize(Roles = "Teacher,SchoolAdmin,Admin,Superuser")]
        public ActionResult<IEnumerable<FrontendDifferentiationTierDto>> GetDifferentiation()
            => Ok(Array.Empty<FrontendDifferentiationTierDto>());
    }
}
