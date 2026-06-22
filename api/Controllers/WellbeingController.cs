using Aptiverse.Wellbeing.Application.Frontend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Wellbeing.Controllers
{
    // Clean-slate stubs. Diary creation is intentionally non-persistent
    // here — the in-memory echo lets the UI flow work but the entry is
    // not stored. Wire to ApplicationDbContext + a DiaryEntry entity when
    // the Wellbeing module is promoted to first-class persistence.
    [ApiController]
    [Route("api/wellbeing")]
    [Authorize]
    public class WellbeingController : ControllerBase
    {
        [HttpGet("diary")]
        public ActionResult<IEnumerable<FrontendDiaryEntryDto>> GetDiaryEntries()
            => Ok(Array.Empty<FrontendDiaryEntryDto>());

        [HttpPost("diary")]
        public ActionResult<FrontendDiaryEntryDto> CreateDiaryEntry([FromBody] FrontendCreateDiaryEntryInput input)
        {
            return Ok(new FrontendDiaryEntryDto
            {
                Id = $"d-{Guid.NewGuid():N}",
                Date = DateTime.UtcNow,
                Mood = Math.Clamp(input.Mood, 1, 5),
                Content = input.Content,
                Tags = input.Tags ?? [],
            });
        }

        [HttpGet("mood-trend")]
        public ActionResult<IEnumerable<FrontendMoodPointDto>> GetMoodTrend([FromQuery] int days = 14)
            => Ok(Array.Empty<FrontendMoodPointDto>());

        [HttpGet("counsellors")]
        public ActionResult<IEnumerable<FrontendCounsellorDto>> GetCounsellors()
            => Ok(Array.Empty<FrontendCounsellorDto>());

        [HttpGet("summary")]
        public ActionResult<FrontendWellbeingSummaryDto> GetSummary()
        {
            return Ok(new FrontendWellbeingSummaryDto
            {
                MoodAvg7d = 0,
                CheckinStreakDays = 0,
                StressSignal = "none",
                SleepHours = 0,
            });
        }
    }
}
