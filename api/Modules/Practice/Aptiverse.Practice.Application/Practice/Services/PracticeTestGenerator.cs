using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning;
using Aptiverse.AI.Core;
using Aptiverse.Api.Data;
using Aptiverse.Practice.Domain.Models.Practice;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Practice.Application.Practice.Services
{
    // Runs the Anthropic calls that turn a queued PracticeGenerationJob into a
    // PracticeTest row.
    //
    // This used to live inside PracticeController.GenerateTest, which meant
    // four to six model round trips happened on the request thread while the
    // browser held the connection open. On the production box (one t3.micro,
    // two burstable vCPUs, 1 GiB shared with Redis) that starved every other
    // request for the length of a generation. The code below is the same
    // generator, moved off the request path; PracticeGenerationWorker is the
    // only thing that calls it.
    public interface IPracticeTestGenerator
    {
        // Runs the job's generation and persists the resulting PracticeTest,
        // returning its id.
        //
        // Throws AnthropicException when the model call itself fails, and
        // PracticeGenerationFailedException when it returns nothing usable.
        // Both are caught by the worker and recorded on the job.
        Task<long> GenerateAsync(PracticeGenerationJob job, CancellationToken ct = default);
    }

    // The generator ran but produced nothing a student could sit. Distinct from
    // AnthropicException, which means the call did not complete at all.
    public sealed class PracticeGenerationFailedException(string message) : Exception(message);

    public class PracticeTestGenerator(
        IAnthropicClient anthropic,
        ApplicationDbContext db,
        ILogger<PracticeTestGenerator> logger) : IPracticeTestGenerator
    {
        private readonly IAnthropicClient _anthropic = anthropic;
        private readonly ApplicationDbContext _db = db;
        private readonly ILogger<PracticeTestGenerator> _logger = logger;

        private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);

        public async Task<long> GenerateAsync(PracticeGenerationJob job, CancellationToken ct = default)
        {
            var userId = job.StudentId;
            var subjectId = job.SubjectId;
            var count = job.QuestionCount;
            var totalMarks = job.TotalMarks;
            var difficulty = job.Difficulty;
            var format = job.Format;
            var topics = job.Topics.ToList();

            // subjectId is either a CAPS subject slug (HS) or a course practice
            // key "institutionId:slug" (tertiary). The colon is the discriminator
            // for both the display-name lookup and the level the generator pitches
            // at: a CAPS slug never contains one.
            var isTertiary = subjectId.Contains(':');

            string subjectName;
            // For a tertiary course, the student's own study level (first-year,
            // honours, etc.) so the generator pitches questions at the right
            // year rather than a generic tertiary default.
            string? levelHint = null;
            if (isTertiary)
            {
                var parts = subjectId.Split(':', 2);
                var course = await _db.Set<Course>().AsNoTracking()
                    .Where(c => c.InstitutionId == parts[0] && c.Slug == parts[1])
                    .Select(c => new { c.Id, c.Name })
                    .FirstOrDefaultAsync(ct);
                subjectName = course?.Name ?? subjectId;
                if (course is not null)
                {
                    var level = await _db.Set<StudentCourse>().AsNoTracking()
                        .Where(sc => sc.StudentId == userId && sc.CourseId == course.Id)
                        .Select(sc => sc.Level)
                        .FirstOrDefaultAsync(ct);
                    levelHint = LevelHint(level);
                }
            }
            else
            {
                subjectName = await _db.Set<Subject>().AsNoTracking()
                    .Where(s => s.Id == subjectId)
                    .Select(s => s.Name)
                    .FirstOrDefaultAsync(ct) ?? subjectId;
            }

            // The subject's existing topic vocabulary — fed to Claude so it
            // reuses established labels instead of inventing synonyms.
            var existingTopics = await _db.Set<Topic>().AsNoTracking()
                .Where(t => t.SubjectId == subjectId)
                .Select(t => t.Name)
                .ToListAsync(ct);

            List<PracticeQuestion> questions;
            string? passage = null;
            string? prompt = null;
            List<string> criteria = [];

            switch (format)
            {
                case "exam":
                {
                    questions = await GenerateExamAsync(
                        subjectName, topics, existingTopics, difficulty, totalMarks, isTertiary, levelHint, ct);
                    break;
                }
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
                    var gen = await GenerateQuestionsAsync(subjectName, topics, existingTopics, difficulty, count, isTertiary, levelHint, ct);
                    if (NeedsAnswerVerification(subjectId, subjectName) && gen.Count > 0)
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

            // Essay is prompt-only; every other format needs usable questions.
            if (format == "essay")
            {
                if (string.IsNullOrWhiteSpace(prompt))
                    throw new PracticeGenerationFailedException(
                        "The generator returned no usable prompt. Please try again.");
            }
            else if (questions.Count == 0)
            {
                throw new PracticeGenerationFailedException(
                    "The generator returned no usable questions. Please try again.");
            }

            // Fold each question's topic into the subject's canonical vocabulary
            // (reuse an existing label or register a new one) so per-topic
            // mastery stays consistent. Essay has no per-question topics.
            if (questions.Count > 0)
                await CanonicaliseTopicsAsync(subjectId, questions, ct);

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
                SubjectId = subjectId,
                AssessmentId = job.AssessmentId.ToString(),
                Format = format,
                Title = BuildTitle(format, subjectName, topics),
                Topics = derivedTopics,
                Difficulty = difficulty,
                // An exam is timed off its marks, not its question count: South
                // African papers run at roughly a minute a mark, which is the
                // pressure the student is actually training for. Read from the
                // paper that came back rather than from what was asked for, so a
                // model that lands on 48 of 50 marks is timed for the paper that
                // exists.
                DurationMinutes = format == "exam"
                    ? Math.Max(15, questions.Sum(q => q.Marks))
                    : EstimateDuration(format, questions.Count),
                Passage = passage,
                Prompt = prompt,
                Criteria = criteria,
                AiGenerated = true,
                Questions = questions,
            };

            _db.Set<PracticeTest>().Add(test);
            await _db.SaveChangesAsync(ct);

            return test.Id;
        }

        // ── generation helpers ───────────────────────────────────────────

        // Turns a stored course level into a phrase the generator can pitch at.
        // Null (unset or unknown) leaves the prompt on its generic tertiary line.
        private static string? LevelHint(string? level) => level switch
        {
            "first_year" => "first-year (100-level) university",
            "second_year" => "second-year (200-level) university",
            "third_year" => "third-year (300-level) university",
            "fourth_year" => "fourth-year, final-year (400-level) university",
            "honours" => "postgraduate honours",
            "masters" => "postgraduate master's",
            "phd" => "doctoral (PhD)",
            _ => null,
        };

        private static string BuildTitle(string format, string subjectName, List<string> topics)
        {
            // An exam is named for the paper, never for two topics: "English:
            // Idioms, Spelling" is a drill's name, and the whole point of a
            // paper is that it does not tell you what is coming.
            if (format == "exam")
                return $"{subjectName} exam paper";

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

        // Build a full exam paper: sections, mark allocations, and a memo for
        // every written question.
        //
        // Not just "a longer test". A paper has a shape a student recognises
        // from every exam they have sat: a block of multiple-choice to open,
        // short answers in the middle, something extended at the end, with the
        // marks printed next to each question so they can budget the hour. That
        // shape is most of what makes sitting one feel like the real thing,
        // which is the entire point of a simulator.
        //
        // The memo matters as much as the question. It is what the marker reads
        // when it awards part marks later, so it is written here, at generation
        // time, by the same model that set the question and knows what it was
        // testing. Marking against a memo invented after the fact would be
        // marking against a guess.
        private async Task<List<PracticeQuestion>> GenerateExamAsync(
            string subjectName, List<string> topics, IReadOnlyList<string> existingTopics,
            string difficulty, int totalMarks, bool isTertiary, string? levelHint, CancellationToken ct)
        {
            var topicLine = topics.Count > 0
                ? $"Examine these topics: {string.Join("; ", topics)}."
                : "Cover a representative spread of the course's core topics, the way a real paper does.";
            var vocabLine = existingTopics.Count > 0
                ? " Tag each question's \"topic\" with one of these existing labels where it fits: "
                    + $"{string.Join("; ", existingTopics.Take(40))}. Only invent a new label if none apply."
                    + (isTertiary
                        ? " Those labels only group questions for progress tracking, and some were written" +
                          " for a school-level version of this subject: reuse the label, ignore the level it" +
                          " implies."
                        : "")
                : "";

            var tertiaryLevel = levelHint is not null
                ? $"a {levelHint} course in {subjectName} at a South African institution"
                : $"a university or college course in {subjectName} at a South African institution";
            var levelLine = isTertiary
                ? $"Level: {tertiaryLevel}. Assume school-level treatment of these topics is already behind the " +
                  $"student, and examine at that {(levelHint is not null ? "exact year of study" : "tertiary level")}. " +
                  $"Never write a question that would appear on a Grade 10-12 paper."
                : "Level: South African Grade 10-12 (FET phase), NSC/CAPS style.";

            var system =
                "You are an experienced South African examiner setting a full paper. Return ONLY a JSON " +
                "object, no prose, no markdown fences.";

            var user =
                $"Set a {totalMarks}-mark {subjectName} paper.\n" +
                $"{levelLine}\n" +
                $"Overall difficulty: {difficulty}\n" +
                $"{topicLine}{vocabLine}\n\n" +
                "Structure it like a real paper:\n" +
                "- Section A: multiple-choice, 1 mark each, roughly 30% of the total.\n" +
                "- Section B: short answers needing a sentence or a worked step, 2 to 4 marks each, " +
                "roughly 45% of the total.\n" +
                "- Section C: one or two extended questions, 6 to 12 marks each, the rest of the total.\n\n" +
                $"The marks must add up to exactly {totalMarks}.\n\n" +
                "Return this exact JSON shape:\n" +
                "{\"questions\":[{\"section\":\"A\",\"kind\":\"mc\",\"question\":\"...\",\"marks\":1," +
                "\"options\":[\"...\",\"...\",\"...\",\"...\"],\"answerIdx\":0,\"memo\":\"\"," +
                "\"explanation\":\"one sentence on why it is correct\",\"topic\":\"the topic tested\"}]}\n\n" +
                "Rules:\n" +
                "- kind is \"mc\" for Section A, \"short\" for Section B, \"long\" for Section C.\n" +
                "- mc questions: exactly four options, exactly one correct, answerIdx 0-based, plausible " +
                "distractors, and memo empty.\n" +
                "- short and long questions: options empty, answerIdx 0, and memo is the marking memo. The " +
                "memo must say what earns each mark, as a list of points, so a marker can award part marks " +
                "against it. A 5-mark question needs 5 identifiable marks in its memo.\n" +
                "- Write every mathematical expression as inline LaTeX between single dollar signs " +
                "(e.g. $\\frac{x^2-4}{x-2}$, $\\sqrt{7}$) rather than ASCII, so it renders as proper " +
                "notation; the output is JSON, so escape LaTeX backslashes as valid JSON (write " +
                "\\\\frac, not \\frac).\n" +
                "- No images or diagrams. South African context where it is natural.";

            var res = await _anthropic.ChatAsync(new AnthropicChatRequest
            {
                Model = "claude-opus-4-8",
                SystemPrompt = system,
                Messages = [new AnthropicMessage { Role = "user", Content = user }],
                // A full paper plus a memo per question is a lot of output. An
                // exam truncated halfway through Section C is worthless, so this
                // is sized well above the longest plausible paper.
                MaxTokens = 16000,
                // The one call in here worth thinking time: the marks have to
                // add up, the sections have to balance, and each memo has to
                // decompose into as many marks as its question offers.
                Thinking = true,
            }, ct);

            return ParseExam(res.Text);
        }

        // A model asked for LaTeX inside JSON sometimes escapes the backslash
        // twice, so "\\sqrt{7}" survives the JSON decode and KaTeX reads the
        // "\\" as a line break and prints "sqrt{7}" as plain letters. A doubled
        // backslash immediately before a letter is never a line break, so it is
        // always this mistake and is safe to collapse. \\ before anything else
        // (a row break in a matrix, say) is left alone.
        private static readonly Regex DoubledLatexCommand = new(@"\\\\(?=[a-zA-Z])", RegexOptions.Compiled);

        private static string? FixLatex(string? s) =>
            string.IsNullOrEmpty(s) ? s : DoubledLatexCommand.Replace(s, @"\");

        private static List<PracticeQuestion> ParseExam(string raw)
        {
            var text = raw.Trim();
            var start = text.IndexOf('{');
            var end = text.LastIndexOf('}');
            if (start < 0 || end <= start) return [];
            text = text[start..(end + 1)];

            List<GenExamQuestion> parsed;
            try
            {
                var doc = JsonSerializer.Deserialize<GenExamResponse>(text, JsonOpts);
                parsed = doc?.Questions ?? [];
            }
            catch (JsonException)
            {
                return [];
            }

            var outQuestions = new List<PracticeQuestion>();
            var n = 0;
            foreach (var q in parsed)
            {
                if (string.IsNullOrWhiteSpace(q.Question)) continue;

                var kind = q.Kind?.ToLowerInvariant() switch
                {
                    "short" => "short",
                    "long" => "long",
                    _ => "mc",
                };

                // A multiple-choice question without four options and a key in
                // range is not answerable, so it is dropped rather than shipped
                // broken. Written questions have no key to validate.
                if (kind == "mc" && (q.Options.Count != 4 || q.AnswerIdx < 0 || q.AnswerIdx > 3))
                    continue;

                n++;
                outQuestions.Add(new PracticeQuestion
                {
                    Id = $"q{n}",
                    Kind = kind,
                    Question = FixLatex(q.Question)!,
                    Options = kind == "mc" ? [.. q.Options.Select(o => FixLatex(o)!)] : [],
                    AnswerIdx = kind == "mc" ? q.AnswerIdx : 0,
                    // Marks below 1 would let a question be worth nothing and
                    // still take a student's time.
                    Marks = Math.Max(1, q.Marks),
                    Section = string.IsNullOrWhiteSpace(q.Section) ? null : q.Section!.Trim().ToUpperInvariant(),
                    MarkingMemo = kind == "mc" ? null : (string.IsNullOrWhiteSpace(q.Memo) ? null : FixLatex(q.Memo)),
                    Explanation = FixLatex(q.Explanation),
                    Topic = q.Topic,
                });
            }

            return outQuestions;
        }

        private async Task<List<GenQuestion>> GenerateQuestionsAsync(
            string subjectName, List<string> topics, IReadOnlyList<string> existingTopics,
            string difficulty, int count, bool isTertiary, string? levelHint, CancellationToken ct)
        {
            var topicLine = topics.Count > 0
                ? $"Focus specifically on these topics: {string.Join("; ", topics)}."
                : "Cover a representative spread of core topics for the subject.";

            // The vocabulary anchor needs a leash on the tertiary path.
            //
            // Swapping the system persona alone did not fix the level: a fresh
            // generation for a university English course still returned "identify
            // the figure of speech in 'the wind whispered through the trees'".
            // The reason is right here. existingTopics is the course's emergent
            // topic registry, and for any course whose topics were first written
            // under the old CAPS persona, that registry is full of matric labels.
            // Handing the model "reuse these labels" pulls it straight back to
            // school-level content, because a topic label implies a level far more
            // strongly than a persona sentence does. The labels are still worth
            // reusing (they keep mastery tracking coherent instead of splintering
            // across synonyms), so the fix is to say plainly what they are for.
            var vocabLine = existingTopics.Count > 0
                ? " When you set each question's \"topic\", reuse one of these existing labels where it fits: "
                    + $"{string.Join("; ", existingTopics.Take(40))}. Only invent a new topic label if none apply."
                    + (isTertiary
                        ? " These labels only group questions for progress tracking. Several were written for a" +
                          " school-level version of this subject, so treat them as naming the area to examine and" +
                          " not the level to pitch at: reuse the label, ignore the level it implies."
                        : "")
                : "";

            // Pitch the paper at the level the student is actually studying at.
            // The CAPS/NSC examiner persona writes Grade 10-12 questions, which is
            // simply wrong for a university course: a second-year Calculus module
            // is not a matric topic, and a uni student asking for practice on it
            // was getting school-level questions back.
            var system = isTertiary
                ? "You are an expert examiner for South African university and college courses who writes fair, " +
                  "unambiguous multiple-choice questions pitched at the level the named course is actually taught " +
                  "at. Every question has exactly four options and exactly one correct option. Difficulty: " +
                  "foundation = recall/basic application; core = standard assessment; challenge = multi-step " +
                  "analysis. Return ONLY a JSON object, no prose, no markdown fences."
                : "You are an expert South African CAPS/NSC examiner who writes fair, unambiguous " +
                  "multiple-choice questions for Grade 10-12 learners. Every question has exactly four " +
                  "options and exactly one correct option. Difficulty: foundation = recall/basic " +
                  "application; core = standard exam; challenge = multi-step analysis. Return ONLY a JSON " +
                  "object, no prose, no markdown fences.";

            // State the level in the user turn too, not just the system persona.
            // "Subject: English" is ambiguous between a matric subject and a
            // university course, and left to guess the model picks school, which
            // is where the training mass sits for a topic like "figures of
            // speech".
            var tertiaryLevel = levelHint is not null
                ? $"a {levelHint} course in {subjectName}, studied at a South African institution"
                : $"a university or college course in {subjectName}, studied at a South African institution";
            var levelLine = isTertiary
                ? $"Level: {tertiaryLevel}. Assume the student has already covered any school-level treatment of " +
                  $"these topics and is being examined at that {(levelHint is not null ? "exact year of study" : "tertiary level")}. " +
                  $"Never write a question that would appear on a Grade 10-12 paper.\n"
                : "Level: South African Grade 10-12 (FET phase).\n";

            var user =
                $"Write {count} multiple-choice questions.\n" +
                $"Subject: {subjectName}\n" +
                levelLine +
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

        private sealed class GenExamResponse
        {
            [JsonPropertyName("questions")] public List<GenExamQuestion> Questions { get; set; } = [];
        }

        private sealed class GenExamQuestion
        {
            [JsonPropertyName("section")] public string? Section { get; set; }
            [JsonPropertyName("kind")] public string? Kind { get; set; }
            [JsonPropertyName("question")] public string Question { get; set; } = "";
            [JsonPropertyName("marks")] public int Marks { get; set; } = 1;
            [JsonPropertyName("options")] public List<string> Options { get; set; } = [];
            [JsonPropertyName("answerIdx")] public int AnswerIdx { get; set; }
            [JsonPropertyName("memo")] public string? Memo { get; set; }
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
}
