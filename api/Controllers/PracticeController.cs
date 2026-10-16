using System.Security.Claims;
using System.Text.Json.Serialization;
using Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning;
using Aptiverse.AI.Core;
using Aptiverse.Api.Data;
using Aptiverse.Entitlements.Application.Services;
using Aptiverse.Practice.Application.Frontend.Dtos;
using Aptiverse.Practice.Application.Practice.Services;
using Aptiverse.Practice.Domain.Models.Practice;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Practice.Controllers
{
    // The practice engine — the #1 ML signal source. Tests + attempts are now
    // backed by real persistence (IPracticeService -> ApplicationDbContext),
    // not mock echoes. Routes stay under /api/practice so the frontend hooks
    // (usePracticeTests, usePracticeTest) resolve. Test generation calls Claude
    // (via IAnthropicClient) and is metered by the practice.generate quota,
    // but the model calls themselves run on PracticeGenerationWorker: this
    // controller only queues them and reports on the queue.
    [ApiController]
    [Route("api/practice")]
    [Authorize]
    public class PracticeController(
        IPracticeService practice,
        IAnthropicClient anthropic,
        IUsageMeter usage,
        ApplicationDbContext db,
        ILogger<PracticeController> logger) : ControllerBase
    {
        private readonly IPracticeService _practice = practice;
        private readonly IAnthropicClient _anthropic = anthropic;
        private readonly IUsageMeter _usage = usage;
        private readonly ApplicationDbContext _db = db;
        private readonly ILogger<PracticeController> _logger = logger;

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

        // The answer key rides on this response only after the student has
        // submitted; see PracticeService.GetQuestionsAsync. It needs the caller's
        // id to know that, which this action was not even asking for.
        [HttpGet("tests/{id}/questions")]
        public async Task<ActionResult<IEnumerable<FrontendQuestionDto>>> GetQuestions(string id, CancellationToken ct = default)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var testId)) return NotFound();

            var questions = await _practice.GetQuestionsAsync(testId, userId, ct);
            return questions is null ? NotFound() : Ok(questions);
        }

        // Delete a test the student generated for themselves.
        //
        // There was no delete at all: DELETE returned 405, so every generated
        // test lived forever on the practice page and the list only ever grew.
        [HttpDelete("tests/{id}")]
        public async Task<IActionResult> DeleteTest(string id, CancellationToken ct = default)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var testId)) return NotFound();

            var result = await _practice.DeleteTestAsync(testId, userId, ct);

            return result switch
            {
                DeleteTestResult.Deleted => NoContent(),
                DeleteTestResult.Forbidden => Forbid(),
                _ => NotFound(),
            };
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

        [HttpGet("tests/{id}/attempts/latest")]
        public async Task<ActionResult<FrontendAttemptDto>> GetLatestAttempt(string id, CancellationToken ct = default)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var testId)) return NotFound();

            var attempt = await _practice.GetLatestAttemptAsync(testId, userId, ct);
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
        // Queue a private practice test for Claude to write, metered by the
        // practice.generate quota. Seeded from the topics the client passes
        // (typically the student's weakest, from the mastery view).
        //
        // This used to do the generating itself: four to six Anthropic calls,
        // inline, holding a request thread for anything up to a minute. On the
        // production box (one t3.micro, two burstable vCPUs, 1 GiB shared with
        // Redis) that starved every other request for the duration and ate the
        // CPU credits that keep the instance responsive. So the request now
        // does only what a request should: validate, meter, enqueue, return.
        // PracticeGenerationWorker does the work, one job at a time, and the
        // client polls GET generations/{id}.
        //
        // The quota is consumed HERE and nowhere else. A worker retry re-runs
        // the model calls without re-charging the student.
        //
        //   202 Accepted  FrontendGenerationJobDto  — queued, poll it
        //   402                                     — generation quota exhausted
        //   503                                     — AI not configured
        [HttpPost("tests/generate")]
        public async Task<IActionResult> GenerateTest(
            [FromBody] GenerateTestInput input, CancellationToken ct = default)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            // Practice is always for something. A student generates against an
            // assessment they have actually logged, which is what stops the
            // generator being a slot machine and is what makes the questions
            // worth sitting: the assessment supplies the subject, so a test can
            // never drift onto a course the student is not taking.
            if (!long.TryParse(input.AssessmentId, out var assessmentId))
                return BadRequest(new
                {
                    error = "assessment_required",
                    message = "Pick an assessment to practise for.",
                });

            var assessment = await _db.Set<Assessment>().AsNoTracking()
                .Where(a => a.Id == assessmentId && a.StudentId == userId)
                .Select(a => new { a.Id, a.SubjectId })
                .FirstOrDefaultAsync(ct);

            // Scoped to StudentId, so someone else's assessment id is a 404 and
            // not a way to discover what they are studying.
            if (assessment is null)
                return NotFound(new
                {
                    error = "assessment_not_found",
                    message = "That assessment isn't on your profile.",
                });

            var subjectId = assessment.SubjectId;
            if (string.IsNullOrWhiteSpace(subjectId))
                return BadRequest(new
                {
                    error = "assessment_has_no_subject",
                    message = "That assessment has no subject attached, so there is nothing to practise.",
                });

            if (!_anthropic.IsConfigured)
                return StatusCode(503, new
                {
                    error = "ai_not_configured",
                    message = "AI generation isn't configured on this environment.",
                });

            // One generation in flight at a time per student. The worker runs
            // them serially anyway, so a second queued job would only sit behind
            // the first while the student watched two spinners, and a double
            // submit would cost them two generations off their allowance.
            var inFlight = await _db.Set<PracticeGenerationJob>().AsNoTracking()
                .Where(j => j.StudentId == userId
                    && (j.Status == PracticeGenerationStatus.Queued
                        || j.Status == PracticeGenerationStatus.Running))
                .OrderByDescending(j => j.Id)
                .FirstOrDefaultAsync(ct);
            if (inFlight is not null)
                return Accepted(ToJobDto(inFlight));

            // Meter only once the request is known to be answerable, so a bad
            // assessment id never costs the student a generation. No refund on
            // failure after this point, matching the help bot.
            if (!await _usage.TryConsumeAsync(userId, "practice.generate", 1, ct))
            {
                var snap = await _usage.GetUsageAsync(userId, "practice.generate", ct);
                return StatusCode(402, new
                {
                    error = "quota_exhausted",
                    quotaKey = "practice.generate",
                    snap.Used,
                    snap.Limit,
                    message = "You've used this month's practice-test generations. Upgrade your plan for more.",
                });
            }

            var job = new PracticeGenerationJob
            {
                StudentId = userId,
                Status = PracticeGenerationStatus.Queued,
                AssessmentId = assessmentId,
                SubjectId = subjectId,
                Format = NormaliseFormat(input.Format),
                Difficulty = NormaliseDifficulty(input.Difficulty),
                QuestionCount = Math.Clamp(input.QuestionCount ?? 8, 3, 15),
                // Exam papers are sized by marks; every other format by questions.
                TotalMarks = Math.Clamp(input.TotalMarks ?? 50, 20, 150),
                Topics = (input.Topics ?? [])
                    .Where(t => !string.IsNullOrWhiteSpace(t))
                    .Select(t => t.Trim())
                    .Distinct()
                    .Take(6)
                    .ToList(),
            };

            _db.Set<PracticeGenerationJob>().Add(job);
            await _db.SaveChangesAsync(ct);

            _logger.LogInformation(
                "Queued practice generation {JobId} for {UserId} ({Format}, {Subject}).",
                job.Id, userId, job.Format, job.SubjectId);

            return AcceptedAtAction(nameof(GetGeneration), new { id = job.Id.ToString() }, ToJobDto(job));
        }

        // Poll a generation. Scoped to the caller, so a student can only ever
        // read their own jobs: someone else's id is a 404, not a 403, so the
        // endpoint does not confirm the job exists.
        [HttpGet("generations/{id}")]
        public async Task<ActionResult<FrontendGenerationJobDto>> GetGeneration(
            string id, CancellationToken ct = default)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!long.TryParse(id, out var jobId)) return NotFound();

            var job = await _db.Set<PracticeGenerationJob>().AsNoTracking()
                .FirstOrDefaultAsync(j => j.Id == jobId && j.StudentId == userId, ct);

            return job is null ? NotFound() : Ok(ToJobDto(job));
        }

        // The caller's most recent unfinished generation, if any.
        //
        // This is what makes leaving the page safe. A student on a slow
        // connection should not have to sit and watch a spinner to get their
        // test: they can close the tab, come back, and the app picks the job
        // back up from here rather than from anything it kept in memory.
        //
        //   200 FrontendGenerationJobDto — one is queued or running
        //   204                          — nothing in flight
        [HttpGet("generations/active")]
        public async Task<ActionResult<FrontendGenerationJobDto>> GetActiveGeneration(
            CancellationToken ct = default)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var job = await _db.Set<PracticeGenerationJob>().AsNoTracking()
                .Where(j => j.StudentId == userId
                    && (j.Status == PracticeGenerationStatus.Queued
                        || j.Status == PracticeGenerationStatus.Running))
                .OrderByDescending(j => j.Id)
                .FirstOrDefaultAsync(ct);

            return job is null ? NoContent() : Ok(ToJobDto(job));
        }

        private static FrontendGenerationJobDto ToJobDto(PracticeGenerationJob job) => new()
        {
            Id = job.Id.ToString(),
            Status = job.Status,
            Format = job.Format,
            PracticeTestId = job.PracticeTestId?.ToString(),
            Error = job.Error,
            Attempts = job.Attempts,
            CreatedAt = job.CreatedAt,
            StartedAt = job.StartedAt,
            FinishedAt = job.FinishedAt,
        };

        // Kept in the controller because it is validation, not generation: the
        // enqueue path normalises what the client sent before it is written to
        // the job row, so the worker never sees a format or difficulty it does
        // not recognise.
        private static string NormaliseDifficulty(string? d) =>
            d is "foundation" or "core" or "challenge" ? d : "core";

        private static string NormaliseFormat(string? f) => f switch
        {
            "short_answer" or "reading" or "flashcards" or "essay" or "exam" => f,
            _ => "multiple_choice",
        };

    }

    // Body for POST /api/practice/tests/generate. Topics are optional — the
    // mastery view passes the student's weakest; omitted means a general test.
    public record GenerateTestInput
    {
        // The assessment to practise for. Required, and the only way in: the
        // subject is read off the assessment rather than taken from the client,
        // so a student cannot generate for a course they are not enrolled on by
        // posting a different slug.
        [JsonPropertyName("assessmentId")] public string? AssessmentId { get; init; }
        [JsonPropertyName("topics")] public IList<string>? Topics { get; init; }
        [JsonPropertyName("difficulty")] public string? Difficulty { get; init; }
        [JsonPropertyName("questionCount")] public int? QuestionCount { get; init; }
        // multiple_choice (default) | short_answer | reading | flashcards |
        // essay | exam.
        [JsonPropertyName("format")] public string? Format { get; init; }

        // Exam papers only: what the paper is out of. Ignored by every other
        // format, which are sized by question count instead.
        //
        // A paper is defined by its marks, not by how many questions it happens
        // to contain: "50 marks, an hour" is the thing a student recognises, and
        // the question count falls out of it. Defaults to 50. Clamped to
        // 20..150 at the call site, because 150 is already a three-hour sitting
        // and there is no honest version of a longer one.
        [JsonPropertyName("totalMarks")] public int? TotalMarks { get; init; }
    }
}
