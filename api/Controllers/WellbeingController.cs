using System.Security.Claims;
using Aptiverse.Wellbeing.Application.Frontend.Dtos;
using Aptiverse.Wellbeing.Application.Frontend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Wellbeing.Controllers
{
    // Persistence-backed Wellbeing surface. Diary and mood check-ins are
    // stored against the caller's Student projection (resolved from the
    // string UserId). AI sentiment fields on DiaryEntry are left null for the
    // Python diary_nlp service to backfill.
    [ApiController]
    [Route("api/wellbeing")]
    [Authorize]
    public class WellbeingController(IFrontendWellbeingService wellbeing) : ControllerBase
    {
        private string? CurrentUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value;

        [HttpGet("diary")]
        public async Task<ActionResult<IEnumerable<FrontendDiaryEntryDto>>> GetDiaryEntries(CancellationToken cancellationToken)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var entries = await wellbeing.GetDiaryEntriesAsync(userId, cancellationToken);
            return Ok(entries);
        }

        [HttpPost("diary")]
        public async Task<ActionResult<FrontendDiaryEntryDto>> CreateDiaryEntry(
            [FromBody] FrontendCreateDiaryEntryInput input, CancellationToken cancellationToken)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (string.IsNullOrWhiteSpace(input.Content)) return BadRequest("Content is required.");

            var dto = await wellbeing.CreateDiaryEntryAsync(userId, input, cancellationToken);
            return CreatedAtAction(nameof(GetDiaryEntries), new { id = dto.Id }, dto);
        }

        [HttpGet("mood-trend")]
        public async Task<ActionResult<IEnumerable<FrontendMoodPointDto>>> GetMoodTrend(
            [FromQuery] int days = 14, CancellationToken cancellationToken = default)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var trend = await wellbeing.GetMoodTrendAsync(userId, days, cancellationToken);
            return Ok(trend);
        }

        [HttpPost("mood")]
        public async Task<ActionResult<FrontendMoodPointDto>> CreateMood(
            [FromBody] FrontendCreateMoodInput input, CancellationToken cancellationToken)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var dto = await wellbeing.CreateMoodAsync(userId, input, cancellationToken);
            return Ok(dto);
        }

        [HttpGet("counsellors")]
        public ActionResult<IEnumerable<FrontendCounsellorDto>> GetCounsellors()
            => Ok(Array.Empty<FrontendCounsellorDto>());

        [HttpGet("summary")]
        public async Task<ActionResult<FrontendWellbeingSummaryDto>> GetSummary(CancellationToken cancellationToken)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var summary = await wellbeing.GetSummaryAsync(userId, cancellationToken);
            return Ok(summary);
        }
    }
}
