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

            var format = NormaliseFormat(input.Format);

            List<PracticeQuestion> questions;
            string? passage = null;
            string? prompt = null;
            List<string> criteria = [];
            try
            {
                switch (format)
                {
                    case "essay":
                    {
                        var essay = await GenerateEssayAsync(subjectName, topics, difficulty, ct);
                        prompt = essay?.Prompt;
                        criteria = essay?.Criteria ?? [];
                        questions = [];
                        break;
                    }
                    case "flashcards":
                    {
                        var cards = await GenerateFlashcardsAsync(subjectName, topics, existingTopics, count, ct);
                        questions = cards.Select((c, i) => new PracticeQuestion
                        {
                            Id = $"q{i + 1}",
                            Kind = "flashcard",
                            Question = c.Front,
                            Back = c.Back,
                            Topic = c.Topic,
                        }).ToList();
                        break;
                    }
                    case "short_answer":
                    {
                        var shorts = await GenerateShortAsync(subjectName, topics, existingTopics, difficulty, count, ct);
                        questions = shorts.Select((s, i) => new PracticeQuestion
                        {
                            Id = $"q{i + 1}",
                            Kind = "short",
                            Question = s.Question,
                            ExpectedAnswer = s.ExpectedAnswer,
                            AcceptableAnswers = s.AcceptableAnswers ?? [],
                            Explanation = s.Explanation,
                            Topic = s.Topic,
                        }).ToList();
                        break;
                    }
                    case "reading":
                    {
                        var reading = await GenerateReadingAsync(subjectName, topics, difficulty, count, ct);
                        passage = reading?.Passage;
                        questions = (reading?.Questions ?? []).Select((rq, i) => new PracticeQuestion
                        {
                            Id = $"q{i + 1}",
                            Kind = rq.Kind == "short" ? "short" : "mc",
                            Question = rq.Question,
                            Options = rq.Options ?? [],
                            AnswerIdx = rq.AnswerIdx,
                            ExpectedAnswer = rq.ExpectedAnswer,
                            AcceptableAnswers = rq.AcceptableAnswers ?? [],
                            Explanation = rq.Explanation,
                            Topic = rq.Topic,
                        }).ToList();
                        break;
                    }
                    default: // multiple_choice
                    {
                        var gen = await GenerateQuestionsAsync(subjectName, topics, existingTopics, difficulty, count, ct);
                        if (NeedsAnswerVerification(input.SubjectId, subjectName) && gen.Count > 0)
                            gen = await VerifyKeysAsync(subjectName, gen, ct);
                        questions = gen.Select((q, i) => new PracticeQuestion
                        {
                            Id = $"q{i + 1}",
                            Kind = "mc",
                            Question = q.Question,
                            Options = q.Options,
                            AnswerIdx = q.AnswerIdx,
                            Explanation = q.Explanation,
                            Topic = q.Topic,
                        }).ToList();
                        break;
                    }
                }
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

            // Essay is prompt-only; every other format needs usable questions.
            if (format == "essay")
            {
                if (string.IsNullOrWhiteSpace(prompt))
                    return StatusCode(502, new
                    {
                        error = "generation_empty",
                        message = "The generator returned no usable prompt. Please try again.",
                    });
            }
            else if (questions.Count == 0)
            {
                return StatusCode(502, new
                {
                    error = "generation_empty",
                    message = "The generator returned no usable questions. Please try again.",
                });
            }

            // Fold each question's topic into the subject's canonical vocabulary
            // (reuse an existing label or register a new one) so per-topic
            // mastery stays consistent. Essay has no per-question topics.
            if (questions.Count > 0)
                await CanonicaliseTopicsAsync(input.SubjectId, questions, ct);

            var derivedTopics = topics.Count > 0
                ? topics
                : questions
                    .Select(q => q.Topic)
                    .Where(t => !string.IsNullOrWhiteSpace(t))
                    .Select(t => t!)
                    .Distinct()
                    .ToList();
            if (derivedTopics.Count == 0)
                derivedTopics = [subjectName];

            // Backfill any blank per-question topic to the test's first topic.
            foreach (var q in questions)
                if (string.IsNullOrWhiteSpace(q.Topic))
                    q.Topic = derivedTopics[0];

            var test = new PracticeTest
            {
                OwnerStudentId = userId,
                SubjectId = input.SubjectId,
                Format = format,
                Title = BuildTitle(format, subjectName, topics),
                Topics = derivedTopics,
                Difficulty = difficulty,
                DurationMinutes = EstimateDuration(format, questions.Count),
                Passage = passage,
                Prompt = prompt,
                Criteria = criteria,
                AiGenerated = true,
                Questions = questions,
            };

            _db.Set<PracticeTest>().Add(test);
            await _db.SaveChangesAsync(ct);

            var dto = await _practice.GetTestAsync(test.Id, userId, ct);
            return Ok(dto);
        }

        // ── generation helpers ───────────────────────────────────────────

        private static string NormaliseDifficulty(string? d) =>
            d is "foundation" or "core" or "challenge" ? d : "core";

        private static string NormaliseFormat(string? f) => f switch
        {
            "short_answer" or "reading" or "flashcards" or "essay" => f,
            _ => "multiple_choice",
        };

        private static string BuildTitle(string format, string subjectName, List<string> topics)
        {
            if (topics.Count > 0)
                return $"{subjectName}: {string.Join(", ", topics.Take(2))}{(topics.Count > 2 ? " +" : "")}";
            return format switch
            {
                "essay" => $"{subjectName} essay",
                "flashcards" => $"{subjectName} flashcards",
                "reading" => $"{subjectName} reading",
                "short_answer" => $"{subjectName} short answers",
                _ => $"{subjectName} practice",
            };
        }

        private static int EstimateDuration(string format, int qCount) => format switch
        {
            "essay" => 40,
            "flashcards" => Math.Max(5, (int)Math.Round(qCount * 0.5)),
            "reading" => Math.Max(10, (int)Math.Round(qCount * 2.0) + 5),
            _ => Math.Max(5, (int)Math.Round(qCount * 1.5)),
        };

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
                "Rules: exactly one correct option; answerIdx is 0-based; plausible distractors; write every " +
                "mathematical expression as inline LaTeX between single dollar signs (e.g. $\\frac{x^2-4}{x-2}$, " +
                "$x^2$, $x \\to 2$) instead of ASCII like (x^2-4)/(x-2), so it renders as proper notation; the " +
                "output is JSON, so escape LaTeX backslashes as valid JSON (write \\\\frac, not \\frac); no images " +
                "or diagrams; South African context where natural.";

            var res = await _anthropic.ChatAsync(new AnthropicChatRequest
            {
                Model = "claude-opus-4-8",
                SystemPrompt = system,
                Messages = [new AnthropicMessage { Role = "user", Content = user }],
                MaxTokens = 4096,
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

        // ── short-answer generation ──────────────────────────────────────
        private async Task<List<GenShort>> GenerateShortAsync(
            string subjectName, List<string> topics, IReadOnlyList<string> existingTopics,
            string difficulty, int count, CancellationToken ct)
        {
            var topicLine = topics.Count > 0
                ? $"Focus specifically on these topics: {string.Join("; ", topics)}."
                : "Cover a representative spread of core topics for the subject.";
            var vocabLine = existingTopics.Count > 0
                ? " When you set each question's \"topic\", reuse one of these labels where it fits: "
                    + $"{string.Join("; ", existingTopics.Take(40))}."
                : "";

            const string system =
                "You are an expert South African examiner who writes fair short-answer questions. Each question " +
                "has one short, objective correct answer (a word, name, number, date, or short phrase) that a " +
                "student can type. Return ONLY a JSON object, no prose, no markdown fences.";
            var user =
                $"Write {count} short-answer questions.\n" +
                $"Subject: {subjectName}\nDifficulty: {difficulty}\n{topicLine}{vocabLine}\n\n" +
                "Return this exact JSON shape:\n" +
                "{\"questions\":[{\"question\":\"...\",\"expectedAnswer\":\"the canonical answer\"," +
                "\"acceptableAnswers\":[\"an accepted synonym or spelling\"],\"explanation\":\"one sentence\"," +
                "\"topic\":\"the topic tested\"}]}\n\n" +
                "Rules: the answer must be short and objective (never an essay or open opinion); put common " +
                "acceptable variants in acceptableAnswers; write every mathematical expression as inline LaTeX " +
                "between single dollar signs, escaping backslashes as valid JSON (\\\\frac, not \\frac); South " +
                "African context where natural.";

            var res = await _anthropic.ChatAsync(new AnthropicChatRequest
            {
                Model = "claude-opus-4-8",
                SystemPrompt = system,
                Messages = [new AnthropicMessage { Role = "user", Content = user }],
                MaxTokens = 4096,
            }, ct);

            return ParseJson<ShortResponse>(res.Text)?.Questions?
                .Where(s => !string.IsNullOrWhiteSpace(s.Question) && !string.IsNullOrWhiteSpace(s.ExpectedAnswer))
                .Take(count).ToList() ?? [];
        }

        // ── flashcard generation ─────────────────────────────────────────
        private async Task<List<GenCard>> GenerateFlashcardsAsync(
            string subjectName, List<string> topics, IReadOnlyList<string> existingTopics,
            int count, CancellationToken ct)
        {
            var topicLine = topics.Count > 0
                ? $"Focus specifically on these topics: {string.Join("; ", topics)}."
                : "Cover a representative spread of core topics for the subject.";
            var vocabLine = existingTopics.Count > 0
                ? $" Reuse these topic labels where they fit: {string.Join("; ", existingTopics.Take(40))}."
                : "";

            const string system =
                "You write concise study flashcards for South African students. Each card has a short front " +
                "(a term, cue, or question) and a short back (the answer or definition). Return ONLY JSON.";
            var user =
                $"Write {count} flashcards.\nSubject: {subjectName}\n{topicLine}{vocabLine}\n\n" +
                "Return this exact JSON shape:\n" +
                "{\"cards\":[{\"front\":\"...\",\"back\":\"...\",\"topic\":\"the topic\"}]}\n\n" +
                "Rules: keep both sides short and self-contained; write maths as inline LaTeX between single " +
                "dollar signs, escaping backslashes as valid JSON (\\\\frac, not \\frac).";

            var res = await _anthropic.ChatAsync(new AnthropicChatRequest
            {
                Model = "claude-opus-4-8",
                SystemPrompt = system,
                Messages = [new AnthropicMessage { Role = "user", Content = user }],
                MaxTokens = 4096,
            }, ct);

            return ParseJson<CardsResponse>(res.Text)?.Cards?
                .Where(c => !string.IsNullOrWhiteSpace(c.Front) && !string.IsNullOrWhiteSpace(c.Back))
                .Take(count).ToList() ?? [];
        }

        // ── reading-comprehension generation ─────────────────────────────
        private async Task<GenReading?> GenerateReadingAsync(
            string subjectName, List<string> topics, string difficulty, int count, CancellationToken ct)
        {
            var topicLine = topics.Count > 0
                ? $"Themes/topics to lean on: {string.Join("; ", topics)}."
                : "Choose an engaging, level-appropriate theme.";

            const string system =
                "You are an expert South African examiner. Write one original reading-comprehension passage and " +
                "a set of questions that test understanding of it. Questions mix multiple-choice (exactly four " +
                "options, one correct) and short-answer (one short typed answer). Return ONLY JSON.";
            var user =
                $"Write a reading-comprehension set with {count} questions.\nSubject/context: {subjectName}\n" +
                $"Difficulty: {difficulty}\n{topicLine}\n\n" +
                "Return this exact JSON shape:\n" +
                "{\"passage\":\"the passage text\",\"questions\":[" +
                "{\"kind\":\"mc\",\"question\":\"...\",\"options\":[\"..\",\"..\",\"..\",\"..\"],\"answerIdx\":0," +
                "\"explanation\":\"..\",\"topic\":\"..\"}," +
                "{\"kind\":\"short\",\"question\":\"...\",\"expectedAnswer\":\"..\"," +
                "\"acceptableAnswers\":[\"..\"],\"explanation\":\"..\",\"topic\":\"..\"}]}\n\n" +
                "Rules: the passage is self-contained (roughly 200-400 words); every question answerable from the " +
                "passage; mix mc and short kinds; each mc has exactly four options and a 0-based answerIdx for the " +
                "single correct one; each short has a concise objective expectedAnswer; write maths as inline LaTeX " +
                "with JSON-escaped backslashes.";

            var res = await _anthropic.ChatAsync(new AnthropicChatRequest
            {
                Model = "claude-opus-4-8",
                SystemPrompt = system,
                Messages = [new AnthropicMessage { Role = "user", Content = user }],
                MaxTokens = 4096,
            }, ct);

            var parsed = ParseJson<GenReading>(res.Text);
            if (parsed is null || string.IsNullOrWhiteSpace(parsed.Passage)) return null;
            parsed.Questions = parsed.Questions.Where(IsUsableReading).Take(count).ToList();
            return parsed.Questions.Count > 0 ? parsed : null;
        }

        private static bool IsUsableReading(GenReadingQ q)
        {
            if (string.IsNullOrWhiteSpace(q.Question)) return false;
            if (q.Kind == "short") return !string.IsNullOrWhiteSpace(q.ExpectedAnswer);
            return q.Options is { Count: 4 } && q.Options.All(o => !string.IsNullOrWhiteSpace(o)) &&
                   q.AnswerIdx >= 0 && q.AnswerIdx < 4;
        }

        // ── essay generation (prompt + criteria, feedback-only) ──────────
        private async Task<GenEssay?> GenerateEssayAsync(
            string subjectName, List<string> topics, string difficulty, CancellationToken ct)
        {
            var topicLine = topics.Count > 0
                ? $"Themes/topics to lean on: {string.Join("; ", topics)}."
                : "Choose a rich, level-appropriate theme.";

            const string system =
                "You are an expert South African writing and essay examiner. Produce one essay or creative-writing " +
                "prompt with clear marking criteria the student can self-check against. Return ONLY JSON.";
            var user =
                $"Write one essay/creative-writing prompt with marking criteria.\nSubject: {subjectName}\n" +
                $"Difficulty: {difficulty}\n{topicLine}\n\n" +
                "Return this exact JSON shape:\n" +
                "{\"prompt\":\"the essay task, one short paragraph\",\"criteria\":[\"criterion 1\",\"criterion 2\"]," +
                "\"topic\":\"the topic\"}\n\n" +
                "Rules: 4 to 6 criteria covering content/argument, structure, language, and (where relevant) " +
                "originality; each criterion is a short phrase, not a mark or percentage; no scoring rubric.";

            var res = await _anthropic.ChatAsync(new AnthropicChatRequest
            {
                Model = "claude-opus-4-8",
                SystemPrompt = system,
                Messages = [new AnthropicMessage { Role = "user", Content = user }],
                MaxTokens = 1024,
            }, ct);

            var parsed = ParseJson<GenEssay>(res.Text);
            if (parsed is null || string.IsNullOrWhiteSpace(parsed.Prompt)) return null;
            parsed.Criteria = parsed.Criteria?.Where(c => !string.IsNullOrWhiteSpace(c)).ToList() ?? [];
            return parsed;
        }

        // Deserialize the outermost JSON object in a model reply into T, or null.
        private static T? ParseJson<T>(string text) where T : class
        {
            var json = ExtractJson(text);
            if (json is null) return null;
            try
            {
                return JsonSerializer.Deserialize<T>(json, JsonOpts);
            }
            catch (JsonException)
            {
                return null;
            }
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
            string subjectId, List<PracticeQuestion> questions, CancellationToken ct)
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

        private sealed class ShortResponse
        {
            [JsonPropertyName("questions")] public List<GenShort> Questions { get; set; } = [];
        }

        private sealed class GenShort
        {
            [JsonPropertyName("question")] public string Question { get; set; } = "";
            [JsonPropertyName("expectedAnswer")] public string ExpectedAnswer { get; set; } = "";
            [JsonPropertyName("acceptableAnswers")] public List<string>? AcceptableAnswers { get; set; }
            [JsonPropertyName("explanation")] public string? Explanation { get; set; }
            [JsonPropertyName("topic")] public string? Topic { get; set; }
        }

        private sealed class CardsResponse
        {
            [JsonPropertyName("cards")] public List<GenCard> Cards { get; set; } = [];
        }

        private sealed class GenCard
        {
            [JsonPropertyName("front")] public string Front { get; set; } = "";
            [JsonPropertyName("back")] public string Back { get; set; } = "";
            [JsonPropertyName("topic")] public string? Topic { get; set; }
        }

        private sealed class GenReading
        {
            [JsonPropertyName("passage")] public string Passage { get; set; } = "";
            [JsonPropertyName("questions")] public List<GenReadingQ> Questions { get; set; } = [];
        }

        private sealed class GenReadingQ
        {
            [JsonPropertyName("kind")] public string Kind { get; set; } = "mc";
            [JsonPropertyName("question")] public string Question { get; set; } = "";
            [JsonPropertyName("options")] public List<string>? Options { get; set; }
            [JsonPropertyName("answerIdx")] public int AnswerIdx { get; set; }
            [JsonPropertyName("expectedAnswer")] public string? ExpectedAnswer { get; set; }
            [JsonPropertyName("acceptableAnswers")] public List<string>? AcceptableAnswers { get; set; }
            [JsonPropertyName("explanation")] public string? Explanation { get; set; }
            [JsonPropertyName("topic")] public string? Topic { get; set; }
        }

        private sealed class GenEssay
        {
            [JsonPropertyName("prompt")] public string Prompt { get; set; } = "";
            [JsonPropertyName("criteria")] public List<string> Criteria { get; set; } = [];
            [JsonPropertyName("topic")] public string? Topic { get; set; }
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
        // multiple_choice (default) | short_answer | reading | flashcards | essay.
        [JsonPropertyName("format")] public string? Format { get; init; }
    }
}
