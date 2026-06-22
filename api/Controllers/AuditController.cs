using Aptiverse.Audit.Application.Frontend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Audit.Controllers
{
    [ApiController]
    [Route("api/audit")]
    [Authorize(Roles = "Admin,Superuser,SchoolAdmin")]
    public class AuditController : ControllerBase
    {
        [HttpGet("logs")]
        public ActionResult<IEnumerable<FrontendAuditLogDto>> GetAuditLogs([FromQuery] int take = 30)
            => Ok(Array.Empty<FrontendAuditLogDto>());
    }
}
