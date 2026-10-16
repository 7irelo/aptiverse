using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Aptiverse.AI.Core;
using Aptiverse.Practice.Application.Frontend.Dtos;
using Aptiverse.Practice.Domain.Models.Practice;
using Aptiverse.Practice.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Practice.Application.Practice.Services
{
    // The practice engine. Reads tests, persists attempts, scores them
    // against the embedded answer key, and writes the per-topic correctness
    // rollup that mastery later consumes.
    //
    // Manual mapping (no AutoMapper) — the projections are small, explicit,
    // and keep the answer key from leaking into the wrong DTO.
    public class PracticeService(
        IRepository<PracticeTest> tests,
        IRepository<PracticeAttempt> attempts,
        IAnthropicClient anthropic,
        ILogger<PracticeService> logger) : IPracticeService
    {
        private readonly IRepository<PracticeTest> _tests = tests;
        private readonly IRepository<PracticeAttempt> _attempts = attempts;
        private readonly IAnthropicClient _anthropic = anthropic;
        private readonly ILogger<PracticeService> _logger = logger;

        public async Task<IReadOnlyList<FrontendPracticeTestDto>> GetTestsAsync(
            string studentId,
            string? subjectId = null,
            string? difficulty = null,
            CancellationToken cancellationToken = default)
        {
            var testRows = (await _tests.GetManyAsync(
                predicate: t =>
                    (string.IsNullOrEmpty(subjectId) || t.SubjectId == subjectId) &&
                    (string.IsNullOrEmpty(difficulty) || t.Difficulty == difficulty) &&
                    (t.OwnerStudentId == null || t.OwnerStudentId == studentId),
                orderBy: q => q.OrderBy(t => t.SubjectId).ThenBy(t => t.Title),
                cancellationToken: cancellationToken)).ToList();

            if (testRows.Count == 0)
                return [];

            // Pull this student's submitted attempts once, then roll up
            // per-test attempt counts + best score in memory.
            var testIds = testRows.Select(t => t.Id).ToHashSet();
            var studentAttempts = await _attempts.GetManyAsync(
                predicate: a =>
                    a.StudentId == studentId &&
                    a.Status == AttemptStatus.Submitted &&
                    testIds.Contains(a.TestId),
                cancellationToken: cancellationToken);

            var byTest = studentAttempts
                .GroupBy(a => a.TestId)
                .ToDictionary(
                    g => g.Key,
                    g => (Count: g.Count(), Best: g.Max(a => a.Score ?? 0)));

            return testRows
                .Select(t =>
                {
                    byTest.TryGetValue(t.Id, out var stats);
                    return MapTest(t, attempts: stats.Count, bestScore: stats.Count > 0 ? stats.Best : (int?)null);
                })
                .ToList();
        }

        public async Task<FrontendPracticeTestDto?> GetTestAsync(
            long testId,
            string studentId,
            CancellationToken cancellationToken = default)
        {
            var test = await _tests.GetAsync(
                t => t.Id == testId && (t.OwnerStudentId == null || t.OwnerStudentId == studentId),
                cancellationToken: cancellationToken);
            if (test is null)
                return null;

            var studentAttempts = await _attempts.GetManyAsync(
                predicate: a =>
                    a.StudentId == studentId &&
                    a.TestId == testId &&
                    a.Status == AttemptStatus.Submitted,
                cancellationToken: cancellationToken);

            var list = studentAttempts.ToList();
            int? best = list.Count > 0 ? list.Max(a => a.Score ?? 0) : null;
            return MapTest(test, attempts: list.Count, bestScore: best);
        }

        // What the marker returns for one written answer.
        private sealed record MarkedAnswer(string QuestionId, int Marks, string Feedback);

        // A question a person has to write an answer to, rather than pick one.
        // "long" is the exam paper's extended-response kind; "short" is the
        // existing short-answer kind, which on an exam gets a real marker
        // instead of a string compare.
        private static bool IsWritten(PracticeQuestion q) =>
            string.Equals(q.Kind, "short", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(q.Kind, "long", StringComparison.OrdinalIgnoreCase);

        // Mark the written answers on an exam paper.
        //
        // This is the difference between a quiz and a paper. Short answers were
        // scored by ShortAnswerMatches, a case- and punctuation-insensitive
        // string compare against one expected string, which works for "1789" and
        // falls apart on anything a student writes in a sentence: "because the
        // bonds released more energy than they absorbed" scores zero against an
        // expected answer phrased any other way. It has no notion of half marks,
        // and half marks are most of what an exam is.
        //
        // One call for the whole paper rather than one per question: the marker
        // sees the script the way a human marker does, it is a single billable
        // request instead of fifteen, and a student is not waiting on fifteen
        // round trips after they hit submit.
        //
        // Returns an empty map when nothing needs marking, when AI is not
        // configured, or when the call fails. Callers must treat a missing
        // question as unmarked rather than as zero: see SubmitAttemptAsync.
        private async Task<Dictionary<string, MarkedAnswer>> MarkWrittenAnswersAsync(
            PracticeTest test,
            IReadOnlyList<(PracticeQuestion Question, string? Answer)> written,
            CancellationToken ct)
        {
            var empty = new Dictionary<string, MarkedAnswer>(StringComparer.OrdinalIgnoreCase);
            if (written.Count == 0) return empty;

            if (!_anthropic.IsConfigured)
            {
                _logger.LogWarning(
                    "Written answers on test {TestId} were not marked: ANTHROPIC_API_KEY is not configured.",
                    test.Id);
                return empty;
            }

            var script = new StringBuilder();
            foreach (var (q, answer) in written)
            {
                script.AppendLine($"--- Question {q.Id} ({q.Marks} mark{(q.Marks == 1 ? "" : "s")}) ---");
                script.AppendLine($"Question: {q.Question}");
                script.AppendLine($"Marking memo: {q.MarkingMemo ?? q.ExpectedAnswer ?? "(no memo: mark on subject correctness)"}");
                script.AppendLine(string.IsNullOrWhiteSpace(answer)
                    ? "Student answer: (left blank)"
                    : $"Student answer: {answer}");
                script.AppendLine();
            }

            var system =
                "You are an experienced South African examiner marking a student's script. Mark strictly " +
                "against the memo and award part marks the way a real marker does: credit each point the " +
                "student actually makes, ignore spelling and phrasing unless the question is testing them, " +
                "and never award marks for a point that is not there. A blank answer scores 0. Never award " +
                "more than the marks available for a question. Return ONLY a JSON object, no prose, no " +
                "markdown fences.";

            var user =
                $"Subject: {test.Title}\n\n" +
                $"Mark every question below.\n\n{script}\n" +
                "Return this exact JSON shape:\n" +
                "{\"marked\":[{\"id\":\"the question id\",\"marks\":0,\"feedback\":\"one or two sentences: " +
                "where the marks went and what was missing, addressed to the student as 'you'\"}]}\n\n" +
                "Rules: one entry per question, ids exactly as given; marks is an integer from 0 to that " +
                "question's marks; feedback is specific to what they wrote, never generic encouragement; " +
                "write any mathematical expression in the feedback as inline LaTeX between single dollar " +
                "signs (e.g. $f'(x)=3x^2$), the same way the question is written, rather than ASCII like " +
                "x^{-3} or 1/(2*sqrt(x)); the output is JSON, so escape LaTeX backslashes as valid JSON " +
                "(write \\\\frac, not \\frac).";

            try
            {
                var res = await _anthropic.ChatAsync(new AnthropicChatRequest
                {
                    Model = "claude-opus-4-8",
                    SystemPrompt = system,
                    Messages = [new AnthropicMessage { Role = "user", Content = user }],
                    MaxTokens = 4096,
                }, ct);

                var parsed = ParseMarked(res.Text);
                if (parsed.Count == 0)
                {
                    _logger.LogWarning("Marker returned no usable JSON for test {TestId}.", test.Id);
                    return empty;
                }

                // Clamp to what the paper offers. The marker is told the maximum
                // and generally respects it, but a student must never be handed
                // 7/5 because a model added up wrong.
                var byId = written.ToDictionary(w => w.Question.Id, w => w.Question, StringComparer.OrdinalIgnoreCase);
                var result = new Dictionary<string, MarkedAnswer>(StringComparer.OrdinalIgnoreCase);
                foreach (var m in parsed)
                {
                    if (!byId.TryGetValue(m.QuestionId, out var q)) continue;
                    result[m.QuestionId] = m with { Marks = Math.Clamp(m.Marks, 0, Math.Max(0, q.Marks)) };
                }

                return result;
            }
            catch (Exception ex)
            {
                // A marking failure must not lose the attempt. The student's
                // answers are already captured; the paper comes back with the
                // written questions unmarked rather than silently zeroed, and
                // zeroing someone's essay because an HTTP call failed would be
                // the worst possible way to handle this.
                _logger.LogError(ex, "Marking failed for test {TestId}. Written answers left unmarked.", test.Id);
                return empty;
            }
        }

        private static List<MarkedAnswer> ParseMarked(string raw)
        {
            var text = raw.Trim();

            // Models occasionally fence JSON despite being told not to.
            var start = text.IndexOf('{');
            var end = text.LastIndexOf('}');
            if (start < 0 || end <= start) return [];
            text = text[start..(end + 1)];

            try
            {
                using var doc = JsonDocument.Parse(text);
                if (!doc.RootElement.TryGetProperty("marked", out var arr) || arr.ValueKind != JsonValueKind.Array)
                    return [];


                var list = new List<MarkedAnswer>();
                foreach (var el in arr.EnumerateArray())
                {
                    var id = el.TryGetProperty("id", out var idEl) ? idEl.GetString() : null;
                    if (string.IsNullOrWhiteSpace(id)) continue;

                    var marks = el.TryGetProperty("marks", out var mEl) && mEl.TryGetInt32(out var mi) ? mi : 0;
                    var fb = el.TryGetProperty("feedback", out var fEl) ? fEl.GetString() ?? "" : "";

                    list.Add(new MarkedAnswer(id!, marks, FixLatex(fb)));
                }
                return list;
            }
            catch (JsonException)
            {
                return [];
            }
        }

        // A model writing LaTeX inside JSON sometimes escapes the backslash
        // twice, leaving "\\frac" after the decode. KaTeX reads that "\\" as a
        // line break and prints "frac" as letters. A doubled backslash right
        // before a letter is never a line break, so collapsing it is safe.
        private static readonly Regex DoubledLatexCommand = new(@"\\\\(?=[a-zA-Z])", RegexOptions.Compiled);

        private static string FixLatex(string s) =>
            string.IsNullOrEmpty(s) ? s : DoubledLatexCommand.Replace(s, @"\");

        public async Task<DeleteTestResult> DeleteTestAsync(
            long testId,
            string studentId,
            CancellationToken cancellationToken = default)
        {
            // disableTracking: false matters, and the reason is not obvious.
            //
            // ApplicationDbContext gives every entity Postgres's xmin system
            // column as an optimistic concurrency token. xmin is a shadow
            // property: it lives in the change tracker, not on the CLR object.
            // GetAsync defaults to AsNoTracking, so a test fetched that way comes
            // back with no xmin anywhere, and Remove() on the detached entity
            // attaches it with xmin defaulted to 0. EF then issues
            // DELETE ... WHERE id = @id AND xmin = 0, which matches no row, and
            // reports the zero rows affected as a DbUpdateConcurrencyException.
            // The row is fine; the WHERE clause is asking for a version that
            // cannot exist. Tracking the read populates xmin and the delete
            // targets the row it actually loaded.
            var test = await _tests.GetAsync(
                t => t.Id == testId,
                disableTracking: false,
                cancellationToken: cancellationToken);
            if (test is null)
                return DeleteTestResult.NotFound;

            // Shared tests (OwnerStudentId == null) are seeded or teacher-authored
            // and everyone sees them, so one student deleting one would delete it
            // for the whole platform. Someone else's private test is not visible
            // here in the first place, so it reads as NotFound to this student.
            if (test.OwnerStudentId is null)
                return DeleteTestResult.Forbidden;
            if (test.OwnerStudentId != studentId)
                return DeleteTestResult.NotFound;

            // Attempts first. They carry the mastery rollup and are keyed by
            // TestId with no cascade configured, so deleting the test alone would
            // orphan them: rows pointing at an id that no longer resolves, which
            // then feed a mastery calculation for a test the student cannot open.
            // Their own attempts only, though the owner check above means there
            // should be no others.
            await _attempts.DeleteAsync(
                a => a.TestId == testId && a.StudentId == studentId,
                cancellationToken);

            // DeleteAsync saves internally, so there is no explicit
            // SaveChangesAsync here: a second one would be a no-op at best.
            await _tests.DeleteAsync(test, cancellationToken);

            return DeleteTestResult.Deleted;
        }

        // The questions for a test, with the answer key attached only once the
        // student has finished with it.
        //
        // This endpoint used to return AnswerIdx, ExpectedAnswer,
        // AcceptableAnswers and Explanation to anyone who asked, on a test they
        // had not attempted. The taking UI calls it to render the questions, so
        // every answer was sitting in the network tab before the student picked
        // one. That made the rest of the integrity work (one attempt only, a
        // countdown, tab-focus monitoring) theatre: it watched for someone
        // alt-tabbing to Google while handing them the memo in the response.
        //
        // The endpoint serves two jobs, taking and reviewing, and only the
        // second needs the key. So the key is gated on a submitted attempt by
        // this student, and a flashcard deck is exempt: its Back IS the content,
        // there is nothing to cheat at, and withholding it would leave a deck
        // with blank cards.
        public async Task<IReadOnlyList<FrontendQuestionDto>?> GetQuestionsAsync(
            long testId,
            string studentId,
            CancellationToken cancellationToken = default)
        {
            var test = await _tests.GetAsync(t => t.Id == testId, cancellationToken: cancellationToken);
            if (test is null)
                return null;

            // A private test belonging to somebody else is not theirs to read.
            if (test.OwnerStudentId is not null && test.OwnerStudentId != studentId)
                return null;

            var isFlashcards = string.Equals(test.Format, "flashcards", StringComparison.OrdinalIgnoreCase);

            var hasSubmitted = isFlashcards || await _attempts.ExistsAsync(
                a => a.TestId == testId && a.StudentId == studentId && a.Status == AttemptStatus.Submitted,
                cancellationToken);

            return test.Questions
                .Select(q => new FrontendQuestionDto
                {
                    Id = q.Id,
                    Question = q.Question,
                    Kind = string.IsNullOrWhiteSpace(q.Kind) ? "mc" : q.Kind,
                    Options = q.Options.ToList(),
                    // -1 rather than 0: a withheld key must not read as "option
                    // A is correct" to a client that forgets to check.
                    AnswerIdx = hasSubmitted ? q.AnswerIdx : -1,
                    ExpectedAnswer = hasSubmitted ? q.ExpectedAnswer : null,
                    AcceptableAnswers = hasSubmitted ? q.AcceptableAnswers.ToList() : [],
                    Back = hasSubmitted ? q.Back : null,
                    Explanation = hasSubmitted ? q.Explanation : null,
                    Topic = q.Topic,
                    // The memo is never sent at all, submitted or not: the
                    // marker reads it server-side, and the student gets the
                    // examiner's per-question feedback instead, which is the
                    // useful half.
                    Marks = q.Marks,
                    Section = q.Section,
                })
                .ToList();
        }

        public async Task<FrontendAttemptDto?> StartAttemptAsync(
            long testId,
            string studentId,
            CancellationToken cancellationToken = default)
        {
            var exists = await _tests.ExistsAsync(t => t.Id == testId, cancellationToken);
            if (!exists)
                return null;

            // A graded test is taken once. If the student already has a
            // submitted attempt, don't create a second one — hand back the
            // existing graded attempt so the client shows results, not a
            // fresh run. This is the server-side guard behind the UI gate.
            var priorSubmitted = await _attempts.GetManyAsync(
                predicate: a =>
                    a.StudentId == studentId &&
                    a.TestId == testId &&
                    a.Status == AttemptStatus.Submitted,
                orderBy: q => q.OrderByDescending(a => a.SubmittedAt),
                include: q => q.Include(a => a.Items).Include(a => a.ScoreSummary),
                cancellationToken: cancellationToken);
            var existingAttempt = priorSubmitted.FirstOrDefault();
            if (existingAttempt is not null)
                return MapAttempt(existingAttempt, existingAttempt.ScoreSummary);

            var attempt = new PracticeAttempt
            {
                TestId = testId,
                StudentId = studentId,
                StartedAt = DateTime.UtcNow,
                Status = AttemptStatus.InProgress,
            };

            await _attempts.AddAsync(attempt, cancellationToken);
            return MapAttempt(attempt, summary: null);
        }

        public async Task<FrontendAttemptDto?> GetLatestAttemptAsync(
            long testId,
            string studentId,
            CancellationToken cancellationToken = default)
        {
            var submitted = await _attempts.GetManyAsync(
                predicate: a =>
                    a.StudentId == studentId &&
                    a.TestId == testId &&
                    a.Status == AttemptStatus.Submitted,
                orderBy: q => q.OrderByDescending(a => a.SubmittedAt),
                include: q => q.Include(a => a.Items).Include(a => a.ScoreSummary),
                cancellationToken: cancellationToken);
            var attempt = submitted.FirstOrDefault();
            return attempt is null ? null : MapAttempt(attempt, attempt.ScoreSummary);
        }

        public async Task<FrontendAttemptDto?> SubmitAttemptAsync(
            long attemptId,
            string studentId,
            FrontendAttemptDto submission,
            CancellationToken cancellationToken = default)
        {
            // Track the attempt (disableTracking: false) so the same context
            // persists the items + summary we attach below in one SaveChanges.
            var attempt = await _attempts.GetAsync(
                predicate: a => a.Id == attemptId && a.StudentId == studentId,
                include: q => q
                    .Include(a => a.Items)
                    .Include(a => a.ScoreSummary),
                disableTracking: false,
                cancellationToken: cancellationToken);

            if (attempt is null)
                return null;

            // Already-submitted attempts are immutable — a resubmit returns the
            // existing graded state rather than appending duplicate items
            // (the unique (AttemptId, QuestionId) index would reject them
            // anyway). This keeps submit idempotent from the client's POV.
            if (attempt.Status == AttemptStatus.Submitted)
            {
                return MapAttempt(attempt, attempt.ScoreSummary);
            }

            var test = await _tests.GetAsync(t => t.Id == attempt.TestId, cancellationToken: cancellationToken);
            if (test is null)
                return null;

            // Asked BEFORE this attempt is flipped to Submitted, so the answer
            // is "had they practised before today", not "have they practised".
            // One indexed existence check on the submit path only.
            var isFirstEverSubmission = !await _attempts.AnyAsync(
                a => a.StudentId == studentId && a.Status == AttemptStatus.Submitted,
                cancellationToken);

            var questions = test.Questions;
            var fallbackTopic = test.Topics.FirstOrDefault() ?? "General";

            // Normalise the submission into one selection per question. Prefer
            // the rich answerItems (carries timing); fall back to the flat
            // answers[] aligned to question order.
            var selections = BuildSelections(submission, questions);

            // An exam is marked by an examiner and scored out of marks; every
            // other format keeps the answer-key path exactly as it was.
            var isExam = string.Equals(test.Format, "exam", StringComparison.OrdinalIgnoreCase);

            // Mark the written answers up front, in one call, so the loop below
            // can score each question against what the marker awarded.
            var marked = isExam
                ? await MarkWrittenAnswersAsync(
                    test,
                    questions
                        .Where(IsWritten)
                        .Select(q => (q, selections.TryGetValue(q.Id, out var s) ? s.Text : null))
                        .ToList(),
                    cancellationToken)
                : new Dictionary<string, MarkedAnswer>(StringComparer.OrdinalIgnoreCase);

            var submissions = new List<AnswerSubmission>();
            var items = new List<PracticeAttemptItem>();
            var perTopic = new Dictionary<string, (int Correct, int Total)>(StringComparer.OrdinalIgnoreCase);

            int correct = 0, incorrect = 0, unanswered = 0, totalTimeMs = 0;
            int marksAwarded = 0, marksTotal = 0;

            foreach (var q in questions)
            {
                var hasSel = selections.TryGetValue(q.Id, out var sel);
                var timeMs = hasSel ? sel.TimeMs : 0;
                var topic = string.IsNullOrWhiteSpace(q.Topic) ? fallbackTopic : q.Topic!;
                var isShort = string.Equals(q.Kind, "short", StringComparison.OrdinalIgnoreCase);

                // Short-answer questions carry a typed answer marked by
                // normalized string match; multiple-choice carry an index
                // compared to the answer key. Flashcard/essay formats never
                // reach a scored attempt.
                int selectedIdx;
                string? textAnswer;
                bool isAnswered;
                bool isCorrect;

                // Marks for this question. Only an exam tracks them; elsewhere
                // they stay null and nothing downstream changes.
                int? qMarksAwarded = null;
                int? qMarksAvailable = null;
                string? feedback = null;

                if (isExam && IsWritten(q))
                {
                    selectedIdx = -1;
                    textAnswer = hasSel ? sel.Text : null;
                    isAnswered = !string.IsNullOrWhiteSpace(textAnswer);
                    qMarksAvailable = q.Marks;

                    if (marked.TryGetValue(q.Id, out var m))
                    {
                        qMarksAwarded = m.Marks;
                        feedback = m.Feedback;
                        // Full marks is the only thing mastery can honestly call
                        // correct. Three of five is neither, but per-topic
                        // mastery counts questions, so it has to land somewhere,
                        // and "not yet correct" is the truthful side.
                        isCorrect = m.Marks >= q.Marks && q.Marks > 0;
                    }
                    else
                    {
                        // Unmarked: the marker was unavailable or skipped it.
                        // Leave MarksAwarded null so the paper reads "not
                        // marked" rather than claiming a zero the student did
                        // not earn, and keep it out of the marks total below.
                        isCorrect = false;
                        feedback = isAnswered
                            ? "This answer could not be marked automatically. Your answer is saved."
                            : null;
                    }
                }
                else if (isShort)
                {
                    selectedIdx = -1;
                    textAnswer = hasSel ? sel.Text : null;
                    isAnswered = !string.IsNullOrWhiteSpace(textAnswer);
                    isCorrect = isAnswered && ShortAnswerMatches(textAnswer!, q);
                }
                else
                {
                    selectedIdx = hasSel ? sel.SelectedIdx : -1;
                    textAnswer = null;
                    isAnswered = selectedIdx >= 0;
                    isCorrect = isAnswered && selectedIdx == q.AnswerIdx;

                    if (isExam)
                    {
                        // Multiple choice on an exam is still worth its marks:
                        // all of them or none, decided by the answer key.
                        qMarksAvailable = q.Marks;
                        qMarksAwarded = isCorrect ? q.Marks : 0;
                    }
                }

                if (isExam)
                {
                    marksTotal += q.Marks;
                    marksAwarded += qMarksAwarded ?? 0;
                }

                if (!isAnswered) unanswered++;
                else if (isCorrect) correct++;
                else incorrect++;
                totalTimeMs += timeMs;

                var rollup = perTopic.TryGetValue(topic, out var cur) ? cur : (0, 0);
                perTopic[topic] = (rollup.Item1 + (isCorrect ? 1 : 0), rollup.Item2 + 1);

                var sub = new AnswerSubmission
                {
                    QuestionId = q.Id,
                    SelectedIdx = selectedIdx,
                    TextAnswer = textAnswer,
                    TimeMs = timeMs,
                };
                submissions.Add(sub);

                var written = isExam && IsWritten(q);

                items.Add(new PracticeAttemptItem
                {
                    QuestionId = q.Id,
                    Topic = topic,
                    GivenAnswerIdx = selectedIdx,
                    CorrectAnswerIdx = isShort || written ? -1 : q.AnswerIdx,
                    GivenAnswerText = textAnswer,
                    ExpectedAnswerText = written ? (q.MarkingMemo ?? q.ExpectedAnswer) : (isShort ? q.ExpectedAnswer : null),
                    IsCorrect = isCorrect,
                    MarksAwarded = qMarksAwarded,
                    MarksAvailable = qMarksAvailable,
                    Feedback = feedback,
                    TimeMs = timeMs,
                    AnswerSubmission = sub,   // EF wires AnswerSubmissionId on save
                });
            }

            var totalQuestions = questions.Count;

            // On an exam the percentage comes from marks, not from question
            // count: a five-mark question has to weigh five times a one-mark
            // one, or a student who nails the essay and fumbles two MCQs reads
            // as worse than they are. Everything else scores as it always did.
            var scorePercent = isExam
                ? (marksTotal > 0 ? (int)Math.Round(100.0 * marksAwarded / marksTotal) : 0)
                : (totalQuestions > 0 ? (int)Math.Round(100.0 * correct / totalQuestions) : 0);

            var summary = new AttemptScoreSummary
            {
                TotalQuestions = totalQuestions,
                CorrectCount = correct,
                IncorrectCount = incorrect,
                UnansweredCount = unanswered,
                ScorePercent = scorePercent,
                MarksAwarded = isExam ? marksAwarded : null,
                MarksTotal = isExam ? marksTotal : null,
                TotalTimeMs = totalTimeMs,
                PerTopic = perTopic
                    .Select(kv => new TopicScore
                    {
                        Topic = kv.Key,
                        Correct = kv.Value.Correct,
                        Total = kv.Value.Total,
                        Percent = kv.Value.Total > 0
                            ? (int)Math.Round(100.0 * kv.Value.Correct / kv.Value.Total)
                            : 0,
                    })
                    .OrderBy(t => t.Topic)
                    .ToList(),
            };

            // Attach children through navigations so a single SaveChanges on
            // the tracked attempt cascades inserts (items + submissions +
            // summary). Replacing ScoreSummary on re-score is handled by EF
            // because the existing one (if any) is tracked and overwritten.
            foreach (var s in submissions)
                s.Attempt = attempt;
            foreach (var it in items)
                attempt.Items.Add(it);

            summary.Attempt = attempt;
            attempt.ScoreSummary = summary;

            attempt.Status = AttemptStatus.Submitted;
            attempt.SubmittedAt = DateTime.UtcNow;
            attempt.Score = scorePercent;
            // Proctoring signal from the client — clamp to non-negative.
            attempt.FocusLossCount = Math.Max(0, submission.FocusLossCount);

            await _attempts.UpdateAsync(attempt, cancellationToken);

            return MapAttempt(attempt, summary) with { FirstSubmittedAttempt = isFirstEverSubmission };
        }

        // --- mapping / helpers -------------------------------------------------

        private static Dictionary<string, (int SelectedIdx, string? Text, int TimeMs)> BuildSelections(
            FrontendAttemptDto submission,
            List<PracticeQuestion> questions)
        {
            var map = new Dictionary<string, (int, string?, int)>(StringComparer.Ordinal);

            if (submission.AnswerItems is { Count: > 0 })
            {
                foreach (var ai in submission.AnswerItems)
                {
                    if (!string.IsNullOrEmpty(ai.QuestionId))
                        map[ai.QuestionId] = (ai.SelectedIdx, ai.TextAnswer, ai.TimeMs);
                }
                return map;
            }

            // Flat answers[] path — positionally aligned to question order.
            for (var i = 0; i < questions.Count && i < submission.Answers.Count; i++)
            {
                map[questions[i].Id] = (submission.Answers[i], null, 0);
            }
            return map;
        }

        // Short-answer marking: a case/whitespace/punctuation-insensitive match
        // of the typed answer against the expected answer or any acceptable
        // alternate. Deterministic, no AI, no OCR — a fair fit for recall-style
        // short answers without pretending to grade free prose.
        private static bool ShortAnswerMatches(string given, PracticeQuestion q)
        {
            var g = NormalizeAnswer(given);
            if (g.Length == 0) return false;
            if (!string.IsNullOrWhiteSpace(q.ExpectedAnswer) && NormalizeAnswer(q.ExpectedAnswer) == g)
                return true;
            foreach (var alt in q.AcceptableAnswers)
                if (!string.IsNullOrWhiteSpace(alt) && NormalizeAnswer(alt) == g)
                    return true;
            return false;
        }

        private static string NormalizeAnswer(string s)
        {
            var sb = new StringBuilder(s.Length);
            var prevSpace = false;
            foreach (var ch in s.Trim().ToLowerInvariant())
            {
                if (char.IsLetterOrDigit(ch))
                {
                    sb.Append(ch);
                    prevSpace = false;
                }
                else if (!prevSpace && sb.Length > 0)
                {
                    sb.Append(' ');
                    prevSpace = true;
                }
            }
            return sb.ToString().Trim();
        }

        private static FrontendPracticeTestDto MapTest(PracticeTest t, int attempts, int? bestScore) =>
            new()
            {
                Id = t.Id.ToString(),
                SubjectId = t.SubjectId,
                Title = t.Title,
                Format = string.IsNullOrWhiteSpace(t.Format) ? "multiple_choice" : t.Format,
                Topics = t.Topics.ToList(),
                QuestionCount = t.Questions.Count,
                Difficulty = t.Difficulty,
                DurationMinutes = t.DurationMinutes,
                Passage = t.Passage,
                Prompt = t.Prompt,
                Criteria = t.Criteria.ToList(),
                BestScore = bestScore,
                Attempts = attempts,
                AssessmentId = t.AssessmentId,
                AiGenerated = t.AiGenerated,
            };

        private static FrontendAttemptDto MapAttempt(PracticeAttempt a, AttemptScoreSummary? summary) =>
            new()
            {
                Id = a.Id.ToString(),
                TestId = a.TestId.ToString(),
                StudentId = a.StudentId,
                Status = StatusToWire(a.Status),
                StartedAt = a.StartedAt,
                SubmittedAt = a.SubmittedAt,
                FocusLossCount = a.FocusLossCount,
                Score = a.Score,
                Answers = a.Items
                    .OrderBy(i => i.Id)
                    .Select(i => i.GivenAnswerIdx)
                    .ToList(),
                AnswerItems = a.Items
                    .OrderBy(i => i.Id)
                    .Select(i => new FrontendAnswerItemDto
                    {
                        QuestionId = i.QuestionId,
                        SelectedIdx = i.GivenAnswerIdx,
                        TextAnswer = i.GivenAnswerText,
                        TimeMs = i.TimeMs,
                    })
                    .ToList(),
                Summary = summary is null ? null : MapSummary(summary, a.Items),
            };

        // Takes the items as well as the summary, because the marked script is
        // per-question and the totals alone cannot carry it.
        private static FrontendScoreSummaryDto MapSummary(
            AttemptScoreSummary s,
            ICollection<PracticeAttemptItem> items) =>
            new()
            {
                TotalQuestions = s.TotalQuestions,
                CorrectCount = s.CorrectCount,
                IncorrectCount = s.IncorrectCount,
                UnansweredCount = s.UnansweredCount,
                ScorePercent = s.ScorePercent,
                MarksAwarded = s.MarksAwarded,
                MarksTotal = s.MarksTotal,
                TotalTimeMs = s.TotalTimeMs,
                PerTopic = s.PerTopic
                    .Select(t => new FrontendTopicScoreDto
                    {
                        Topic = t.Topic,
                        Correct = t.Correct,
                        Total = t.Total,
                        Percent = t.Percent,
                    })
                    .ToList(),
                // Only the questions that carry marks: on a question-scored test
                // this is empty and the review UI falls back to correct/wrong.
                MarkedAnswers = items
                    .Where(i => i.MarksAvailable is not null)
                    .OrderBy(i => i.Id)
                    .Select(i => new FrontendMarkedAnswerDto
                    {
                        QuestionId = i.QuestionId,
                        MarksAwarded = i.MarksAwarded,
                        MarksAvailable = i.MarksAvailable,
                        Feedback = i.Feedback,
                        GivenAnswerText = i.GivenAnswerText,
                    })
                    .ToList(),
            };

        private static string StatusToWire(AttemptStatus status) => status switch
        {
            AttemptStatus.InProgress => "in_progress",
            AttemptStatus.Submitted => "submitted",
            AttemptStatus.Abandoned => "abandoned",
            _ => "in_progress",
        };
    }
}
