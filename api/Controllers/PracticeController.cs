using System.Security.Claims;
using System.Text;
using System.Text.Json;
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
    // (via IAnthropicClient) and is metered by the practice.generate quota.
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

        private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);

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

        // Generate a private practice test with Claude, metered by the
        // practice.generate quota. Seeded from the topics the client passes
        // (typically the student's weakest, from the mastery view).
        //
        //   200 OK  FrontendPracticeTestDto   — the new private test
        //   402                               — generation quota exhausted
        //   503                               — AI not configured
        //   502                               — generator failed / unusable
        [HttpPost("tests/generate")]
        public async Task<IActionResult> GenerateTest(
            [FromBody] GenerateTestInput input, CancellationToken ct = default)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (string.IsNullOrWhiteSpace(input.SubjectId))
                return BadRequest(new { message = "subjectId is required." });

            if (!_anthropic.IsConfigured)
                return StatusCode(503, new
                {
                    error = "ai_not_configured",
                    message = "AI generation isn't configured on this environment.",
                });

            // Meter first (atomic check-and-increment). No refund on failure,
            // matching the help bot; the verify pass keeps failures rare.
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

            var count = Math.Clamp(input.QuestionCount ?? 8, 3, 15);
            var difficulty = NormaliseDifficulty(input.Difficulty);
            var topics = (input.Topics ?? [])
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Select(t => t.Trim())
                .Distinct()
                .Take(6)
                .ToList();

            // subjectId is either a CAPS subject slug (HS) or a course practice
            // key "institutionId:slug" (tertiary). Resolve the display name from
            // whichever it is.
            string subjectName;
            if (input.SubjectId.Contains(':'))
            {
                var parts = input.SubjectId.Split(':', 2);
                subjectName = await _db.Set<Course>().AsNoTracking()
                    .Where(c => c.InstitutionId == parts[0] && c.Slug == parts[1])
                    .Select(c => c.Name)
                    .FirstOrDefaultAsync(ct) ?? input.SubjectId;
            }
            else
            {
                subjectName = await _db.Set<Subject>().AsNoTracking()
                    .Where(s => s.Id == input.SubjectId)
                    .Select(s => s.Name)
                    .FirstOrDefaultAsync(ct) ?? input.SubjectId;
            }

            // The subject's existing topic vocabulary — fed to Claude so it
            // reuses established labels instead of inventing synonyms.
            var existingTopics = await _db.Set<Topic>().AsNoTracking()
                .Where(t => t.SubjectId == input.SubjectId)
                .Select(t => t.Name)
                .ToListAsync(ct);

            List<GenQuestion> questions;
            try
            {
                questions = await GenerateQuestionsAsync(subjectName, topics, existingTopics, difficulty, count, ct);
                if (NeedsAnswerVerification(input.SubjectId, subjectName) && questions.Count > 0)
                    questions = await VerifyKeysAsync(subjectName, questions, ct);
            }
            catch (AnthropicException ex)
            {
                _logger.LogWarning(ex, "Practice generation failed for {UserId}", userId);
                return StatusCode(ex.StatusCode ?? 502, new
                {
                    error = "generation_failed",
                    message = "The generator had trouble. Please try again.",
                });
            }

            if (questions.Count == 0)
                return StatusCode(502, new
                {
                    error = "generation_empty",
                    message = "The generator returned no usable questions. Please try again.",
                });

            // Fold each question's topic into the subject's canonical vocabulary
            // (reuse an existing label or register a new one) so per-topic
            // mastery stays consistent. New topics persist with the test below.
            await CanonicaliseTopicsAsync(input.SubjectId, questions, ct);

            var derivedTopics = topics.Count > 0
                ? topics
                : questions
                    .Select(q => q.Topic)
                    .Where(t => !string.IsNullOrWhiteSpace(t))
                    .Select(t => t!)
                    .Distinct()
                    .ToList();

            var test = new PracticeTest
            {
                OwnerStudentId = userId,
                SubjectId = input.SubjectId,
                Title = topics.Count > 0
                    ? $"{subjectName}: {string.Join(", ", topics.Take(2))}{(topics.Count > 2 ? " +" : "")}"
                    : $"{subjectName} practice",
                Topics = derivedTopics.Count > 0 ? derivedTopics : [subjectName],
                Difficulty = difficulty,
                DurationMinutes = Math.Max(5, (int)Math.Round(questions.Count * 1.5)),
                AiGenerated = true,
                Questions = questions.Select((q, i) => new PracticeQuestion
                {
                    Id = $"q{i + 1}",
                    Question = q.Question,
                    Options = q.Options,
                    AnswerIdx = q.AnswerIdx,
                    Explanation = q.Explanation,
                    Topic = string.IsNullOrWhiteSpace(q.Topic)
                        ? (derivedTopics.FirstOrDefault() ?? subjectName)
                        : q.Topic,
                }).ToList(),
            };

            _db.Set<PracticeTest>().Add(test);
            await _db.SaveChangesAsync(ct);

            var dto = await _practice.GetTestAsync(test.Id, userId, ct);
            return Ok(dto);
        }

        // ── generation helpers ───────────────────────────────────────────

        private static string NormaliseDifficulty(string? d) =>
            d is "foundation" or "core" or "challenge" ? d : "core";

        private static readonly HashSet<string> StemSubjects = new(StringComparer.OrdinalIgnoreCase)
        {
            "math", "mathlit", "physci", "lifesci", "techmath", "techsci",
            "agrisci", "compsci", "it", "egd", "accounting",
        };

        // Keyword hit on the subject/course name — catches tertiary courses
        // (whose id is an institution-scoped slug, not a CAPS slug).
        private static readonly string[] StemKeywords =
        {
            "math", "calc", "algebra", "geometry", "trig", "statistic", "physic", "chemistr",
            "biolog", "science", "engineer", "account", "econom", "financ", "comput", "program",
            "data", "informatic", "actuar", "quantit",
        };

        private static bool NeedsAnswerVerification(string subjectId, string subjectName)
        {
            if (StemSubjects.Contains(subjectId)) return true;
            var n = subjectName.ToLowerInvariant();
            return StemKeywords.Any(k => n.Contains(k));
        }

        private static bool IsUsable(GenQuestion q) =>
            !string.IsNullOrWhiteSpace(q.Question) &&
            q.Options is { Count: 4 } &&
            q.Options.All(o => !string.IsNullOrWhiteSpace(o)) &&
            q.AnswerIdx >= 0 &&
            q.AnswerIdx < 4;

        private async Task<List<GenQuestion>> GenerateQuestionsAsync(
            string subjectName, List<string> topics, IReadOnlyList<string> existingTopics,
            string difficulty, int count, CancellationToken ct)
        {
            var topicLine = topics.Count > 0
                ? $"Focus specifically on these topics: {string.Join("; ", topics)}."
                : "Cover a representative spread of core topics for the subject.";
            var vocabLine = existingTopics.Count > 0
                ? " When you set each question's \"topic\", reuse one of these existing labels where it fits: "
                    + $"{string.Join("; ", existingTopics.Take(40))}. Only invent a new topic label if none apply."
                : "";

            const string system =
                "You are an expert South African CAPS/NSC examiner who writes fair, unambiguous " +
                "multiple-choice questions for Grade 10-12 learners. Every question has exactly four " +
                "options and exactly one correct option. Difficulty: foundation = recall/basic " +
                "application; core = standard exam; challenge = multi-step analysis. Return ONLY a JSON " +
                "object, no prose, no markdown fences.";

            var user =
                $"Write {count} multiple-choice questions.\n" +
                $"Subject: {subjectName}\n" +
                $"Difficulty: {difficulty}\n" +
                $"{topicLine}{vocabLine}\n\n" +
                "Return this exact JSON shape:\n" +
                "{\"questions\":[{\"question\":\"...\",\"options\":[\"...\",\"...\",\"...\",\"...\"]," +
                "\"answerIdx\":0,\"explanation\":\"one sentence on why it is correct\",\"topic\":\"the topic tested\"}]}\n\n" +
                "Rules: exactly one correct option; answerIdx is 0-based; plausible distractors; maths in " +
                "plain text (no LaTeX); no images or diagrams; South African context where natural.";

            var res = await _anthropic.ChatAsync(new AnthropicChatRequest
            {
                Model = "claude-opus-4-8",
                SystemPrompt = system,
                Messages = [new AnthropicMessage { Role = "user", Content = user }],
                MaxTokens = 4096,
                Temperature = 0.7,
            }, ct);

            return ParseQuestions(res.Text).Where(IsUsable).Take(count).ToList();
        }

        // Independent second solve. Where the fresh solve disagrees with the
        // generated key we trust the dedicated marker and correct the key,
        // rather than risk shipping a wrong answer.
        private async Task<List<GenQuestion>> VerifyKeysAsync(
            string subjectName, List<GenQuestion> questions, CancellationToken ct)
        {
            var items = JsonSerializer.Serialize(
                questions.Select((q, i) => new { index = i, question = q.Question, options = q.Options }),
                JsonOpts);

            const string system =
                "You are a meticulous marker. Re-solve each multiple-choice question independently and " +
                "return the 0-based index of the single correct option. Return ONLY JSON.";
            var user =
                $"Subject: {subjectName}. Solve each item yourself and return the correct option index.\n" +
                $"Items: {items}\n" +
                "Return: {\"answers\":[{\"index\":0,\"correctAnswerIdx\":0}]}";

            AnthropicResponse res;
            try
            {
                res = await _anthropic.ChatAsync(new AnthropicChatRequest
                {
                    Model = "claude-opus-4-8",
                    SystemPrompt = system,
                    Messages = [new AnthropicMessage { Role = "user", Content = user }],
                    MaxTokens = 1024,
                    Temperature = 0.0,
                }, ct);
            }
            catch (AnthropicException ex)
            {
                _logger.LogWarning(ex, "Answer-key verification failed; keeping generated keys");
                return questions;
            }

            var verdicts = ParseVerdicts(res.Text);
            for (var i = 0; i < questions.Count; i++)
            {
                if (verdicts.TryGetValue(i, out var v) && v >= 0 && v < questions[i].Options.Count)
                    questions[i].AnswerIdx = v;
            }
            return questions;
        }

        private static List<GenQuestion> ParseQuestions(string text)
        {
            var json = ExtractJson(text);
            if (json is null) return [];
            try
            {
                return JsonSerializer.Deserialize<GenResponse>(json, JsonOpts)?.Questions ?? [];
            }
            catch (JsonException)
            {
                return [];
            }
        }

        private static Dictionary<int, int> ParseVerdicts(string text)
        {
            var map = new Dictionary<int, int>();
            var json = ExtractJson(text);
            if (json is null) return map;
            try
            {
                foreach (var a in JsonSerializer.Deserialize<VerifyResponse>(json, JsonOpts)?.Answers ?? [])
                    map[a.Index] = a.CorrectAnswerIdx;
            }
            catch (JsonException)
            {
                // fall through — empty map means "keep generated keys"
            }
            return map;
        }

        // Claude is told to return raw JSON, but strip any stray prose or
        // ```json fences by slicing to the outermost braces.
        private static string? ExtractJson(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return null;
            var start = text.IndexOf('{');
            var end = text.LastIndexOf('}');
            return start >= 0 && end > start ? text[start..(end + 1)] : null;
        }

        // Reconcile each question's topic against the subject's canonical topic
        // vocabulary: reuse an existing label when the slug matches, otherwise
        // register the new topic. Mutates q.Topic to the canonical spelling and
        // queues any new Topic rows on the tracked DbContext (saved with the
        // test). This is what keeps mastery buckets from fragmenting.
        private async Task CanonicaliseTopicsAsync(
            string subjectId, List<GenQuestion> questions, CancellationToken ct)
        {
            var existing = await _db.Set<Topic>()
                .Where(t => t.SubjectId == subjectId)
                .ToListAsync(ct);
            var bySlug = existing.ToDictionary(t => t.Slug, t => t, StringComparer.Ordinal);

            foreach (var q in questions)
            {
                if (string.IsNullOrWhiteSpace(q.Topic)) continue;
                var name = q.Topic.Trim();
                var slug = Slugify(name);
                if (bySlug.TryGetValue(slug, out var canonical))
                {
                    q.Topic = canonical.Name;
                }
                else
                {
                    var topic = new Topic { SubjectId = subjectId, Slug = slug, Name = name };
                    _db.Set<Topic>().Add(topic);
                    bySlug[slug] = topic; // dedupe within this batch too
                    q.Topic = name;
                }
            }
        }

        private static string Slugify(string s)
        {
            var sb = new StringBuilder(s.Length);
            var prevDash = false;
            foreach (var ch in s.Trim().ToLowerInvariant())
            {
                if (char.IsLetterOrDigit(ch))
                {
                    sb.Append(ch);
                    prevDash = false;
                }
                else if (!prevDash && sb.Length > 0)
                {
                    sb.Append('-');
                    prevDash = true;
                }
            }
            var slug = sb.ToString().Trim('-');
            return slug.Length == 0 ? "general" : slug;
        }

        private sealed class GenResponse
        {
            [JsonPropertyName("questions")] public List<GenQuestion> Questions { get; set; } = [];
        }

        private sealed class GenQuestion
        {
            [JsonPropertyName("question")] public string Question { get; set; } = "";
            [JsonPropertyName("options")] public List<string> Options { get; set; } = [];
            [JsonPropertyName("answerIdx")] public int AnswerIdx { get; set; }
            [JsonPropertyName("explanation")] public string? Explanation { get; set; }
            [JsonPropertyName("topic")] public string? Topic { get; set; }
        }

        private sealed class VerifyResponse
        {
            [JsonPropertyName("answers")] public List<Verdict> Answers { get; set; } = [];
        }

        private sealed class Verdict
        {
            [JsonPropertyName("index")] public int Index { get; set; }
            [JsonPropertyName("correctAnswerIdx")] public int CorrectAnswerIdx { get; set; }
        }

        // Past-papers endpoint removed — the UI now links directly to the
        // Department of Basic Education's official archive at
        // https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx
        // rather than hosting or indexing papers ourselves.
    }

    // Body for POST /api/practice/tests/generate. Topics are optional — the
    // mastery view passes the student's weakest; omitted means a general test.
    public record GenerateTestInput
    {
        [JsonPropertyName("subjectId")] public string SubjectId { get; init; } = "";
        [JsonPropertyName("topics")] public IList<string>? Topics { get; init; }
        [JsonPropertyName("difficulty")] public string? Difficulty { get; init; }
        [JsonPropertyName("questionCount")] public int? QuestionCount { get; init; }
    }
}
