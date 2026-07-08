using Aptiverse.Practice.Application.Frontend.Dtos;
using Aptiverse.Practice.Domain.Models.Practice;
using Aptiverse.Practice.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

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
        IRepository<PracticeAttempt> attempts) : IPracticeService
    {
        private readonly IRepository<PracticeTest> _tests = tests;
        private readonly IRepository<PracticeAttempt> _attempts = attempts;

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

        public async Task<IReadOnlyList<FrontendQuestionDto>?> GetQuestionsAsync(
            long testId,
            CancellationToken cancellationToken = default)
        {
            var test = await _tests.GetAsync(t => t.Id == testId, cancellationToken: cancellationToken);
            if (test is null)
                return null;

            return test.Questions
                .Select(q => new FrontendQuestionDto
                {
                    Id = q.Id,
                    Question = q.Question,
                    Options = q.Options.ToList(),
                    AnswerIdx = q.AnswerIdx,
                    Explanation = q.Explanation,
                    Topic = q.Topic,
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

            var questions = test.Questions;
            var fallbackTopic = test.Topics.FirstOrDefault() ?? "General";

            // Normalise the submission into one selection per question. Prefer
            // the rich answerItems (carries timing); fall back to the flat
            // answers[] aligned to question order.
            var selections = BuildSelections(submission, questions);

            var submissions = new List<AnswerSubmission>();
            var items = new List<PracticeAttemptItem>();
            var perTopic = new Dictionary<string, (int Correct, int Total)>(StringComparer.OrdinalIgnoreCase);

            int correct = 0, incorrect = 0, unanswered = 0, totalTimeMs = 0;

            foreach (var q in questions)
            {
                var hasSel = selections.TryGetValue(q.Id, out var sel);
                var selectedIdx = hasSel ? sel.SelectedIdx : -1;
                var timeMs = hasSel ? sel.TimeMs : 0;
                var topic = string.IsNullOrWhiteSpace(q.Topic) ? fallbackTopic : q.Topic!;
                var isAnswered = selectedIdx >= 0;
                var isCorrect = isAnswered && selectedIdx == q.AnswerIdx;

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
                    TimeMs = timeMs,
                };
                submissions.Add(sub);

                items.Add(new PracticeAttemptItem
                {
                    QuestionId = q.Id,
                    Topic = topic,
                    GivenAnswerIdx = selectedIdx,
                    CorrectAnswerIdx = q.AnswerIdx,
                    IsCorrect = isCorrect,
                    TimeMs = timeMs,
                    AnswerSubmission = sub,   // EF wires AnswerSubmissionId on save
                });
            }

            var totalQuestions = questions.Count;
            var scorePercent = totalQuestions > 0
                ? (int)Math.Round(100.0 * correct / totalQuestions)
                : 0;

            var summary = new AttemptScoreSummary
            {
                TotalQuestions = totalQuestions,
                CorrectCount = correct,
                IncorrectCount = incorrect,
                UnansweredCount = unanswered,
                ScorePercent = scorePercent,
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

            await _attempts.UpdateAsync(attempt, cancellationToken);

            return MapAttempt(attempt, summary);
        }

        // --- mapping / helpers -------------------------------------------------

        private static Dictionary<string, (int SelectedIdx, int TimeMs)> BuildSelections(
            FrontendAttemptDto submission,
            List<PracticeQuestion> questions)
        {
            var map = new Dictionary<string, (int, int)>(StringComparer.Ordinal);

            if (submission.AnswerItems is { Count: > 0 })
            {
                foreach (var ai in submission.AnswerItems)
                {
                    if (!string.IsNullOrEmpty(ai.QuestionId))
                        map[ai.QuestionId] = (ai.SelectedIdx, ai.TimeMs);
                }
                return map;
            }

            // Flat answers[] path — positionally aligned to question order.
            for (var i = 0; i < questions.Count && i < submission.Answers.Count; i++)
            {
                map[questions[i].Id] = (submission.Answers[i], 0);
            }
            return map;
        }

        private static FrontendPracticeTestDto MapTest(PracticeTest t, int attempts, int? bestScore) =>
            new()
            {
                Id = t.Id.ToString(),
                SubjectId = t.SubjectId,
                Title = t.Title,
                Topics = t.Topics.ToList(),
                QuestionCount = t.Questions.Count,
                Difficulty = t.Difficulty,
                DurationMinutes = t.DurationMinutes,
                BestScore = bestScore,
                Attempts = attempts,
                AlignedSBA = t.AlignedSBA,
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
                        TimeMs = i.TimeMs,
                    })
                    .ToList(),
                Summary = summary is null ? null : MapSummary(summary),
            };

        private static FrontendScoreSummaryDto MapSummary(AttemptScoreSummary s) =>
            new()
            {
                TotalQuestions = s.TotalQuestions,
                CorrectCount = s.CorrectCount,
                IncorrectCount = s.IncorrectCount,
                UnansweredCount = s.UnansweredCount,
                ScorePercent = s.ScorePercent,
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
