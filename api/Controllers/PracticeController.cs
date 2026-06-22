using System.Security.Claims;
using Aptiverse.Practice.Application.Frontend.Dtos;
using Aptiverse.Practice.Application.Practice.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Practice.Controllers
{
    // The practice engine — the #1 ML signal source. Tests + attempts are now
    // backed by real persistence (IPracticeService -> ApplicationDbContext),
    // not mock echoes. Routes stay under /api/practice so the frontend hooks
    // (usePracticeTests, usePracticeTest) resolve.
    [ApiController]
    [Route("api/practice")]
    [Authorize]
    public class PracticeController(IPracticeService practice) : ControllerBase
    {
        private readonly IPracticeService _practice = practice;

        private string? CurrentUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value;

        [HttpGet("tests")]
        public async Task<ActionResult<IEnumerable<FrontendPracticeTestDto>>> GetTests(
            [FromQuery] string? subjectId = null,
            [FromQuery] string? difficulty = null,
            CancellationToken ct = default)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var rows = await _practice.GetTestsAsync(userId, subjectId, difficulty, ct);
            return Ok(rows);
        }

        [HttpGet("tests/{id}")]
        public async Task<ActionResult<FrontendPracticeTestDto>> GetTest(string id, CancellationToken ct = default)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var testId)) return NotFound();

            var test = await _practice.GetTestAsync(testId, userId, ct);
            return test is null ? NotFound() : Ok(test);
        }

        [HttpGet("tests/{id}/questions")]
        public async Task<ActionResult<IEnumerable<FrontendQuestionDto>>> GetQuestions(string id, CancellationToken ct = default)
        {
            if (!long.TryParse(id, out var testId)) return NotFound();

            var questions = await _practice.GetQuestionsAsync(testId, ct);
            return questions is null ? NotFound() : Ok(questions);
        }

        [HttpPost("tests/{id}/attempts")]
        public async Task<ActionResult<FrontendAttemptDto>> StartAttempt(string id, CancellationToken ct = default)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var testId)) return NotFound();

            var attempt = await _practice.StartAttemptAsync(testId, userId, ct);
            return attempt is null ? NotFound() : Ok(attempt);
        }

        [HttpPatch("attempts/{attemptId}")]
        public async Task<ActionResult<FrontendAttemptDto>> SubmitAttempt(
            string attemptId,
            [FromBody] FrontendAttemptDto submission,
            CancellationToken ct = default)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(attemptId, out var id)) return NotFound();

            var result = await _practice.SubmitAttemptAsync(id, userId, submission, ct);
            return result is null ? NotFound() : Ok(result);
        }

        // Past-papers endpoint removed — the UI now links directly to the
        // Department of Basic Education's official archive at
        // https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx
        // rather than hosting or indexing papers ourselves.
    }
}
