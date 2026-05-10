using Aptiverse.Calendar.Application.Frontend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Calendar.Controllers
{
    [ApiController]
    [Route("api/frontend")]
    [Authorize]
    public class FrontendController : ControllerBase
    {
        [HttpGet("events")]
        public ActionResult<IEnumerable<FrontendCalendarEventDto>> GetEvents([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
        {
            var start = from ?? DateTime.UtcNow.Date;
            return Ok(new[]
            {
                new FrontendCalendarEventDto { Id = "ev1", Title = "Calculus revision", Start = start.AddHours(8), End = start.AddHours(9), Type = "study", SubjectId = "math" },
                new FrontendCalendarEventDto { Id = "ev2", Title = "Equilibrium SBA brief", Start = start.AddDays(1).AddHours(10), End = start.AddDays(1).AddHours(11), Type = "sba", SubjectId = "physci" },
                new FrontendCalendarEventDto { Id = "ev3", Title = "Tutor session — Sipho M.", Start = start.AddDays(2).AddHours(16), End = start.AddDays(2).AddHours(17), Type = "session", Source = "internal", Location = "Online" },
                new FrontendCalendarEventDto { Id = "ev4", Title = "English essay due", Start = start.AddDays(3).AddHours(23), End = start.AddDays(3).AddHours(23).AddMinutes(59), Type = "sba", SubjectId = "english" },
                new FrontendCalendarEventDto { Id = "ev5", Title = "Genetics practical", Start = start.AddDays(9).AddHours(14), End = start.AddDays(9).AddHours(15), Type = "sba", SubjectId = "lifesci", Source = "google" },
            });
        }

        [HttpGet("reminders")]
        public ActionResult<IEnumerable<FrontendReminderDto>> GetReminders()
        {
            var now = DateTime.UtcNow;
            return Ok(new[]
            {
                new FrontendReminderDto { Id = "r1", Title = "Submit chemistry SBA prep", Ts = now.AddHours(2), Kind = "reminder" },
                new FrontendReminderDto { Id = "r2", Title = "Daily study session", Ts = now.AddHours(6), Kind = "reminder" },
                new FrontendReminderDto { Id = "r3", Title = "NSFAS docs deadline", Ts = now.AddDays(7), Kind = "deadline" },
            });
        }
    }
}
