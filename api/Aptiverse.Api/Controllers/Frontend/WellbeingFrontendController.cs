using Aptiverse.Wellbeing.Application.Frontend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Wellbeing.Controllers
{
    [ApiController]
    [Route("api/frontend")]
    [Authorize]
    public class FrontendController : ControllerBase
    {
        [HttpGet("diary")]
        public ActionResult<IEnumerable<FrontendDiaryEntryDto>> GetDiaryEntries()
        {
            var now = DateTime.UtcNow;
            return Ok(new[]
            {
                new FrontendDiaryEntryDto
                {
                    Id = "d1",
                    Date = now,
                    Mood = 4,
                    Content = "Got through the calculus practice set faster than last week. Stuck on chain rule when functions are nested twice though. Going to ask Sipho about it tomorrow.",
                    Tags = ["maths", "progress"],
                },
                new FrontendDiaryEntryDto
                {
                    Id = "d2",
                    Date = now.AddDays(-1),
                    Mood = 2,
                    Content = "Stressed about the chemistry SBA. Feels like I'm learning the same thing over and over without it sticking. Did a 5 min breathing exercise after.",
                    Tags = ["stress", "chemistry"],
                },
                new FrontendDiaryEntryDto
                {
                    Id = "d3",
                    Date = now.AddDays(-3),
                    Mood = 5,
                    Content = "Wrote my best essay yet. Mom said she's proud. Saved a copy in my workspace.",
                    Tags = ["essay", "win"],
                },
                new FrontendDiaryEntryDto
                {
                    Id = "d4",
                    Date = now.AddDays(-5),
                    Mood = 3,
                    Content = "Average day. Did two practice tests. Ate lunch with friends.",
                    Tags = [],
                },
            });
        }

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
        {
            var rnd = new Random(42);
            var rows = Enumerable.Range(0, Math.Clamp(days, 7, 60))
                .Select(i => new FrontendMoodPointDto
                {
                    Date = DateTime.UtcNow.Date.AddDays(-i),
                    Mood = Math.Round(2.5 + rnd.NextDouble() * 2.0, 1),
                })
                .Reverse();
            return Ok(rows);
        }

        [HttpGet("counsellors")]
        public ActionResult<IEnumerable<FrontendCounsellorDto>> GetCounsellors()
        {
            return Ok(new[]
            {
                new FrontendCounsellorDto { Id = "c1", Name = "Dr. Lerato Mahlangu", Title = "Clinical Psychologist", Specialisation = "Anxiety, exam stress", Rating = 4.9, Online = true, AvatarColor = "#1F8079" },
                new FrontendCounsellorDto { Id = "c2", Name = "Sarah Naidoo", Title = "Counselling Psychologist", Specialisation = "Relationships, family", Rating = 4.8, Online = false, AvatarColor = "#F25C2E" },
                new FrontendCounsellorDto { Id = "c3", Name = "Khanya Dlamini", Title = "Educational Psychologist", Specialisation = "Career & focus", Rating = 5.0, Online = true, AvatarColor = "#3D9762" },
            });
        }

        [HttpGet("summary")]
        public ActionResult<FrontendWellbeingSummaryDto> GetSummary()
        {
            return Ok(new FrontendWellbeingSummaryDto
            {
                MoodAvg7d = 3.8,
                CheckinStreakDays = 12,
                StressSignal = "low",
                SleepHours = 7.2,
            });
        }
    }
}
