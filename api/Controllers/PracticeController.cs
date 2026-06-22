using Aptiverse.Practice.Application.Frontend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aptiverse.Practice.Controllers
{
    // Aligned to /api/practice so the frontend hooks
    // (usePracticeTests, usePracticeTest) resolve. The historical
    // /api/frontend prefix was a 404 from the frontend's POV — the
    // /dashboard/practice page failed to load every list.
    [ApiController]
    [Route("api/practice")]
    [Authorize]
    public class PracticeController : ControllerBase
    {
        [HttpGet("tests")]
        public ActionResult<IEnumerable<FrontendPracticeTestDto>> GetTests(
            [FromQuery] string? subjectId = null,
            [FromQuery] string? difficulty = null)
            => Ok(Array.Empty<FrontendPracticeTestDto>());

        [HttpGet("tests/{id}")]
        public ActionResult<FrontendPracticeTestDto> GetTest(string id) => NotFound();

        [HttpGet("tests/{id}/questions")]
        public ActionResult<IEnumerable<FrontendQuestionDto>> GetQuestions(string id)
            => Ok(Array.Empty<FrontendQuestionDto>());

        [HttpPost("tests/{id}/attempts")]
        public ActionResult<FrontendAttemptDto> StartAttempt(string id)
        {
            return Ok(new FrontendAttemptDto
            {
                Id = $"att-{Guid.NewGuid():N}",
                TestId = id,
                StudentId = User?.Identity?.Name ?? "",
                StartedAt = DateTime.UtcNow,
            });
        }

        [HttpPatch("attempts/{attemptId}")]
        public ActionResult<FrontendAttemptDto> SubmitAttempt(string attemptId, [FromBody] FrontendAttemptDto submission)
        {
            return Ok(submission with
            {
                Id = attemptId,
                SubmittedAt = DateTime.UtcNow,
                Score = submission.Answers.Count > 0 ? Math.Min(100, submission.Answers.Count * 10) : 0,
            });
        }

        // Past-papers endpoint removed — the UI now links directly to the
        // Department of Basic Education's official archive at
        // https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx
        // rather than hosting or indexing papers ourselves.
    }
}
