using Aptiverse.Audit.Application.Frontend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Audit.Controllers
{
    [ApiController]
    [Route("api/frontend")]
    [Authorize(Roles = "Admin,Superuser,SchoolAdmin")]
    public class FrontendController : ControllerBase
    {
        [HttpGet("audit-logs")]
        public ActionResult<IEnumerable<FrontendAuditLogDto>> GetAuditLogs([FromQuery] int take = 30)
        {
            var actors = new[] { "admin@aptiverse", "naidoo@school.example", "kabelo@aptiverse", "support@aptiverse" };
            var actions = new[] { "user.update", "tutor.verify", "course.approve", "payment.refund", "flag.toggle", "school.create", "user.suspend" };
            var resources = new[] { "user/u-1042", "tutor/t1", "course/c3", "charge/ch_4711", "flag/voice_diary", "school/sch-12", "user/u-2204" };
            var ips = new[] { "196.211.42.18", "165.73.12.4", "41.114.93.21" };

            var now = DateTime.UtcNow;
            var rows = Enumerable.Range(0, Math.Clamp(take, 1, 200)).Select(i => new FrontendAuditLogDto
            {
                Id = $"evt-{i}",
                Ts = now.AddMinutes(-i * 17),
                Actor = actors[i % actors.Length],
                Action = actions[i % actions.Length],
                Resource = resources[i % resources.Length],
                Ip = ips[i % ips.Length],
                Severity = i % 6 == 0 ? "high" : "info",
            });
            return Ok(rows);
        }
    }
}
