using Aptiverse.Calendar.Application.Frontend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Calendar.Controllers
{
    [ApiController]
    [Route("api/calendar")]
    [Authorize]
    public class CalendarController : ControllerBase
    {
        [HttpGet("events")]
        public ActionResult<IEnumerable<FrontendCalendarEventDto>> GetEvents(
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null)
            => Ok(Array.Empty<FrontendCalendarEventDto>());

        [HttpGet("reminders")]
        public ActionResult<IEnumerable<FrontendReminderDto>> GetReminders()
            => Ok(Array.Empty<FrontendReminderDto>());
    }
}
