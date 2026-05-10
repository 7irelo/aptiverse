using Aptiverse.Api.Application.Frontend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Api.Controllers
{
    [ApiController]
    [Route("api/frontend")]
    [Authorize]
    public class FrontendController : ControllerBase
    {
        [HttpGet("subscriptions")]
        public ActionResult<IEnumerable<FrontendSubscriptionDto>> GetSubscriptions()
        {
            var customers = new[] { "Mokoena Family", "Greenside HS", "T. Modise (tutor)", "S. Naidoo (student)" };
            var plans = new[] { "Family", "School", "Student", "Free" };
            int[] prices = [199, 0, 99, 0];
            return Ok(Enumerable.Range(0, 30).Select(i => new FrontendSubscriptionDto
            {
                Id = $"sub-{i}",
                Customer = $"{customers[i % customers.Length]} #{i + 1}",
                Plan = plans[i % plans.Length],
                Amount = prices[i % prices.Length] == 0 ? 8500 : prices[i % prices.Length],
                Status = i % 9 == 0 ? "past_due" : i % 13 == 0 ? "cancelled" : "active",
                RenewsAt = DateTime.UtcNow.AddDays(((i % 28) - 5)),
            }));
        }

        [HttpGet("features")]
        public ActionResult<IEnumerable<FrontendFeatureDto>> GetFeatures()
        {
            return Ok(new[]
            {
                new FrontendFeatureDto { Key = "ai_practice", Name = "AI practice tests", Enabled = true, Plan = "free" },
                new FrontendFeatureDto { Key = "past_papers_full", Name = "Past papers vault", Enabled = true, Plan = "student" },
                new FrontendFeatureDto { Key = "psych_video", Name = "Video chat with psychologist", Enabled = true, Plan = "family" },
                new FrontendFeatureDto { Key = "school_export", Name = "School data export", Enabled = true, Plan = "school" },
                new FrontendFeatureDto { Key = "tutor_priority", Name = "Skip-the-queue tutor", Enabled = false, Plan = "student" },
            });
        }

        [HttpGet("children")]
        [Authorize(Roles = "Parent,Admin,Superuser")]
        public ActionResult<IEnumerable<FrontendChildDto>> GetChildren()
        {
            return Ok(new[]
            {
                new FrontendChildDto { Id = "ch1", Name = "Thandi", Grade = 12, School = "Crawford College Pretoria", WeeklyMinutes = 412, PredictedAverage = 71, Trend = 4, IsStudyingNow = true, CurrentActivity = "Calculus Drill — Derivatives", MoodAvg = 3.8 },
                new FrontendChildDto { Id = "ch2", Name = "Lerato", Grade = 11, School = "Crawford College Pretoria", WeeklyMinutes = 268, PredictedAverage = 65, Trend = -1, IsStudyingNow = false, MoodAvg = 3.2 },
            });
        }
    }
}
