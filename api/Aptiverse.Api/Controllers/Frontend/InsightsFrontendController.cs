using Aptiverse.Insights.Application.Frontend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Aptiverse.Insights.Controllers
{
    [ApiController]
    [Route("api/frontend")]
    [Authorize]
    public class FrontendController : ControllerBase
    {
        private static readonly string[] Actions =
        [
            "Started practice test", "Submitted assessment draft", "Completed wellbeing check-in",
            "Asked AI tutor", "Joined study group", "Paused for a break", "Marked goal complete",
            "Read past paper",
        ];
        private static readonly string[] Subjects =
            ["Mathematics", "English HL", "Physical Sciences", "Life Sciences", "Geography", "Afrikaans FAL"];
        private static readonly string[] Students =
            ["Thabo M.", "Naledi K.", "Lerato P.", "Sipho D.", "Aisha M.", "Mandla T.", "Khanya N.", "Tumi B."];

        [HttpGet("live-activity")]
        public ActionResult<IEnumerable<FrontendLiveActivityDto>> GetLiveActivity([FromQuery] int take = 30)
        {
            var rnd = new Random();
            var now = DateTime.UtcNow;
            return Ok(Enumerable.Range(0, Math.Clamp(take, 1, 100)).Select(i => new FrontendLiveActivityDto
            {
                Id = $"la-{i}",
                StudentId = $"s-{i}",
                Student = Students[rnd.Next(Students.Length)],
                Action = Actions[rnd.Next(Actions.Length)],
                Subject = rnd.NextDouble() > 0.4 ? Subjects[rnd.Next(Subjects.Length)] : null,
                Ts = now.AddSeconds(-i * 30),
            }));
        }

        // Server-Sent Events stream for the realtime UI panels.
        // Frontend can subscribe via EventSource('/api/frontend/live-activity/stream').
        [HttpGet("live-activity/stream")]
        public async Task LiveActivityStream(CancellationToken ct)
        {
            Response.Headers["Content-Type"] = "text/event-stream";
            Response.Headers["Cache-Control"] = "no-cache";
            Response.Headers["Connection"] = "keep-alive";

            var rnd = new Random();
            var i = 0;
            while (!ct.IsCancellationRequested)
            {
                var item = new FrontendLiveActivityDto
                {
                    Id = $"la-stream-{Guid.NewGuid():N}",
                    StudentId = $"s-{i}",
                    Student = Students[rnd.Next(Students.Length)],
                    Action = Actions[rnd.Next(Actions.Length)],
                    Subject = rnd.NextDouble() > 0.4 ? Subjects[rnd.Next(Subjects.Length)] : null,
                    Ts = DateTime.UtcNow,
                };
                var json = JsonSerializer.Serialize(item);
                await Response.WriteAsync($"data: {json}\n\n", ct);
                await Response.Body.FlushAsync(ct);
                i++;
                try { await Task.Delay(3000, ct); } catch (TaskCanceledException) { break; }
            }
        }

        [HttpGet("gaps")]
        [Authorize(Roles = "Teacher,SchoolAdmin,Admin,Superuser")]
        public ActionResult<IEnumerable<FrontendGapDto>> GetGaps()
        {
            return Ok(new[]
            {
                new FrontendGapDto { Topic = "Calculus chain rule", ClassName = "12A Maths", StrugglingPct = 64, Sample = 28 },
                new FrontendGapDto { Topic = "Chemical Equilibrium", ClassName = "12B PhSci", StrugglingPct = 70, Sample = 26 },
                new FrontendGapDto { Topic = "Poetry analysis", ClassName = "11A English", StrugglingPct = 52, Sample = 30 },
                new FrontendGapDto { Topic = "Evolution & speciation", ClassName = "12A LSci", StrugglingPct = 48, Sample = 24 },
            });
        }

        [HttpGet("differentiation")]
        [Authorize(Roles = "Teacher,SchoolAdmin,Admin,Superuser")]
        public ActionResult<IEnumerable<FrontendDifferentiationTierDto>> GetDifferentiation()
        {
            return Ok(new[]
            {
                new FrontendDifferentiationTierDto { Label = "Foundation", Count = 6, Suggestion = "Run a 20-min algebra warmup before Friday's lesson" },
                new FrontendDifferentiationTierDto { Label = "Core", Count = 18, Suggestion = "Use today's lesson plan as-is" },
                new FrontendDifferentiationTierDto { Label = "Challenge", Count = 4, Suggestion = "Stretch problem set ready in your library" },
            });
        }
    }
}
