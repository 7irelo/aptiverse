using Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning;
using Aptiverse.Api.Data;
using Aptiverse.Goals.Domain.Models.Goals;
using Aptiverse.Notifications.Application.Services;
using Aptiverse.Practice.Domain.Models.Practice;
using Aptiverse.Wellbeing.Domain.Models.Wellbeing;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Api.Services.Goals
{
    // Measures a student's goals against evidence they produced by doing the
    // work, and pays out when one is met.
    //
    // Everything here reads tables the student writes only by actually
    // studying: a submitted practice attempt, a graded mark, answers that add
    // up to topic mastery, a check-in on a given day. Nothing reads a field the
    // student can simply type. That is the difference between a goal and a
    // sticky note, and it is why Status can honestly say "verified".
    //
    // It lives in the host rather than the Goals module because it has to read
    // across Practice, AcademicPlanning and Wellbeing. Module Application
    // libraries don't reference each other's domains, and shouldn't start.
    //
    // Evaluation runs on read (GET /api/goals) as well as on the write events
    // that could move a goal. Deriving on read is what makes it correct: no
    // matter which producer we forget to hook up, or which one dies halfway,
    // the next time a student opens the page the numbers are recomputed from
    // the source of truth. The event hooks are for promptness, not accuracy.
    public class GoalEvaluator(ApplicationDbContext db, INotificationService notifications)
    {
        private readonly ApplicationDbContext _db = db;
        private readonly INotificationService _notifications = notifications;

        // Recomputes every measurable goal for one student, persists what
        // changed, credits points for anything newly achieved, and flips any
        // allowance riding on it to earned.
        //
        // Returns the goals as they now stand, so a caller that just wrote
        // something doesn't have to re-query.
        public async Task<List<Goal>> EvaluateAllAsync(string studentId, CancellationToken ct = default)
        {
            var goals = await _db.Set<Goal>()
                .Where(g => g.StudentId == studentId)
                .OrderBy(g => g.SortOrder)
                .ThenByDescending(g => g.CreatedAt)
                .ToListAsync(ct);

            var measurable = goals.Where(g => GoalKinds.IsMeasurable(g.Kind)).ToList();
            if (measurable.Count == 0) return goals;

            // Load each evidence source at most once for the whole set, rather
            // than per goal. A student with eight practice goals should cost
            // one attempts query, not eight.
            var evidence = await LoadEvidenceAsync(studentId, measurable, ct);

            var achieved = new List<Goal>();
            foreach (var goal in measurable)
            {
                var current = Measure(goal, evidence);
                var target = goal.TargetValue ?? 0;
                var progress = target <= 0 ? 0 : (int)Math.Round(Math.Min(100d, 100d * current / target));

                var wasAchieved = goal.AchievedAt is not null;
                goal.CurrentValue = current;
                goal.Progress = progress;

                if (progress >= 100 && !wasAchieved)
                {
                    goal.AchievedAt = DateTime.UtcNow;
                    // "verified" rather than "completed": nobody asserted this,
                    // we checked it.
                    goal.Status = GoalStatuses.Verified;
                    achieved.Add(goal);
                }
                else if (!wasAchieved)
                {
                    // A goal is at risk when the clock is nearly out and the
                    // work isn't nearly done. Both halves matter: 20% with a
                    // month left is fine, 20% with two days left is not.
                    goal.Status = IsAtRisk(goal, progress) ? GoalStatuses.AtRisk : GoalStatuses.Active;
                }
            }

            foreach (var goal in achieved)
            {
                await AwardAsync(goal, studentId, ct);
            }

            await _db.SaveChangesAsync(ct);

            // Notify after the save: a celebration for a goal that failed to
            // persist would be a lie, and the notification service is
            // best-effort by design.
            foreach (var goal in achieved)
            {
                await _notifications.EnqueueAsync(
                    studentId,
                    "celebration",
                    $"Goal achieved: {goal.Title}",
                    $"You hit {goal.Target}. That's {goal.RewardPoints} points, verified from your own work.",
                    "/dashboard/rewards",
                    ct);
            }

            return goals;
        }

        // ── evidence ──────────────────────────────────────────────────────

        private sealed record Evidence(
            List<PracticeAttempt> Attempts,
            List<AttemptScoreSummary> Summaries,
            Dictionary<long, string> TestSubjectByTestId,
            List<Assessment> GradedAssessments,
            HashSet<DateTime> CheckinDays);

        private async Task<Evidence> LoadEvidenceAsync(string studentId, List<Goal> goals, CancellationToken ct)
        {
            var kinds = goals.Select(g => g.Kind).ToHashSet();

            var needsAttempts = kinds.Overlaps(new[]
            {
                GoalKinds.PracticeTests, GoalKinds.PracticeScore,
                GoalKinds.TopicMastery, GoalKinds.PracticeStreak,
            });

            var attempts = new List<PracticeAttempt>();
            var summaries = new List<AttemptScoreSummary>();
            var testSubjects = new Dictionary<long, string>();

            if (needsAttempts)
            {
                attempts = await _db.Set<PracticeAttempt>()
                    .Where(a => a.StudentId == studentId && a.Status == AttemptStatus.Submitted)
                    .ToListAsync(ct);

                var testIds = attempts.Select(a => a.TestId).Distinct().ToList();
                testSubjects = await _db.Set<PracticeTest>()
                    .Where(t => testIds.Contains(t.Id))
                    .Select(t => new { t.Id, t.SubjectId })
                    .ToDictionaryAsync(t => t.Id, t => t.SubjectId, ct);

                // Only mastery needs the per-topic breakdown, and it's the
                // heaviest read here (jsonb per attempt).
                if (kinds.Contains(GoalKinds.TopicMastery))
                {
                    var attemptIds = attempts.Select(a => a.Id).ToList();
                    summaries = await _db.Set<AttemptScoreSummary>()
                        .Where(s => attemptIds.Contains(s.AttemptId))
                        .ToListAsync(ct);
                }
            }

            var gradedAssessments = kinds.Contains(GoalKinds.AssessmentMark)
                ? await _db.Set<Assessment>()
                    .Where(a => a.StudentId == studentId && a.ActualMark != null)
                    .ToListAsync(ct)
                : [];

            var checkinDays = new HashSet<DateTime>();
            if (kinds.Contains(GoalKinds.CheckinStreak))
            {
                var since = DateTime.UtcNow.Date.AddDays(-365);
                var tracked = await _db.Set<MoodTracking>()
                    .Where(m => m.StudentId == studentId && m.TrackedAt >= since)
                    .Select(m => m.TrackedAt)
                    .ToListAsync(ct);
                checkinDays = tracked.Select(t => t.Date).ToHashSet();
            }

            return new Evidence(attempts, summaries, testSubjects, gradedAssessments, checkinDays);
        }

        // ── measurement ───────────────────────────────────────────────────

        private static int Measure(Goal goal, Evidence e) => goal.Kind switch
        {
            GoalKinds.PracticeTests => AttemptsFor(goal, e).Count,

            // Best, not average: a goal is a summit, and averaging punishes the
            // student for the early attempts where they were still learning.
            GoalKinds.PracticeScore => AttemptsFor(goal, e)
                .Select(a => a.Score ?? 0)
                .DefaultIfEmpty(0)
                .Max(),

            GoalKinds.AssessmentMark => e.GradedAssessments
                .Where(a => goal.SubjectId is null || a.SubjectId == goal.SubjectId)
                .Select(a => a.ActualMark ?? 0)
                .DefaultIfEmpty(0)
                .Max(),

            GoalKinds.TopicMastery => MeasureMastery(goal, e),

            GoalKinds.CheckinStreak => StreakFrom(e.CheckinDays),

            GoalKinds.PracticeStreak => StreakFrom(
                AttemptsFor(goal, e)
                    .Where(a => a.SubmittedAt != null)
                    .Select(a => a.SubmittedAt!.Value.Date)
                    .ToHashSet()),

            _ => goal.CurrentValue,
        };

        private static List<PracticeAttempt> AttemptsFor(Goal goal, Evidence e)
        {
            if (goal.SubjectId is null) return e.Attempts;
            return e.Attempts
                .Where(a => e.TestSubjectByTestId.TryGetValue(a.TestId, out var s) && s == goal.SubjectId)
                .ToList();
        }

        // Mirrors MasteryController.ComputeTopicMasteryAsync: mastery is not a
        // stored number, it's correct-over-total across every answer the
        // student has given on the topic. Recomputed here rather than read from
        // the mastery.topic_masteries table, which no C# code writes.
        private static int MeasureMastery(Goal goal, Evidence e)
        {
            var attemptIds = AttemptsFor(goal, e).Select(a => a.Id).ToHashSet();
            var perTopic = e.Summaries
                .Where(s => attemptIds.Contains(s.AttemptId))
                .SelectMany(s => s.PerTopic)
                .Where(t => goal.TopicFilter is null
                    || string.Equals(t.Topic, goal.TopicFilter, StringComparison.OrdinalIgnoreCase))
                .ToList();

            var total = perTopic.Sum(t => t.Total);
            if (total == 0) return 0;
            return (int)Math.Round(100d * perTopic.Sum(t => t.Correct) / total);
        }

        // Consecutive days ending today, or yesterday when today's isn't logged
        // yet. Same rule as the wellbeing check-in streak: a streak shouldn't
        // break at midnight for someone who studies in the evening.
        private static int StreakFrom(HashSet<DateTime> days)
        {
            if (days.Count == 0) return 0;
            var today = DateTime.UtcNow.Date;

            var cursor = days.Contains(today)
                ? today
                : days.Contains(today.AddDays(-1)) ? today.AddDays(-1) : (DateTime?)null;
            if (cursor is null) return 0;

            var streak = 0;
            while (days.Contains(cursor.Value))
            {
                streak++;
                cursor = cursor.Value.AddDays(-1);
            }
            return streak;
        }

        private static bool IsAtRisk(Goal goal, int progress)
        {
            if (progress >= 100) return false;
            var daysLeft = (goal.DueDate.Date - DateTime.UtcNow.Date).TotalDays;
            if (daysLeft < 0) return true;
            if (daysLeft > 7) return false;
            // Inside the last week, expect to be at least as far along as the
            // time spent. Three days left and under 60% done is a real warning.
            return progress < 100 - (daysLeft / 7d * 40d);
        }

        // ── payout ────────────────────────────────────────────────────────

        // Credits the goal's points to the student's ledger and marks any
        // allowance riding on this goal as earned. Guarded by AchievedAt, which
        // the caller has just set for the first time, so this runs once.
        private async Task AwardAsync(Goal goal, string studentId, CancellationToken ct)
        {
            if (goal.RewardPoints > 0)
            {
                var points = await _db.Set<StudentPoints>()
                    .FirstOrDefaultAsync(p => p.StudentId == studentId, ct);

                if (points is null)
                {
                    points = new StudentPoints { StudentId = studentId };
                    _db.Set<StudentPoints>().Add(points);
                }

                points.TotalPoints += goal.RewardPoints;
                points.AvailablePoints += goal.RewardPoints;
                points.Level = LevelFor(points.TotalPoints);
                points.CurrentRank = RankFor(points.Level);
                points.LastUpdated = DateTime.UtcNow;

                _db.Set<PointsTransaction>().Add(new PointsTransaction
                {
                    StudentPoints = points,
                    Points = goal.RewardPoints,
                    TransactionType = "earn",
                    Source = goal.Kind,
                    RelatedGoalId = goal.Id,
                    Description = $"Verified: {goal.Title}",
                    TransactionDate = DateTime.UtcNow,
                });
            }

            var allowances = await _db.Set<GoalAllowance>()
                .Where(a => a.GoalId == goal.Id && a.Status == AllowanceStatuses.Pledged)
                .ToListAsync(ct);

            foreach (var allowance in allowances)
            {
                allowance.Status = AllowanceStatuses.Earned;
                allowance.EarnedAt = DateTime.UtcNow;

                // The parent is told by the same system that did the checking,
                // so the child never has to make the case themselves.
                await _notifications.EnqueueAsync(
                    allowance.SponsorUserId,
                    "celebration",
                    "An allowance has been earned",
                    $"{goal.Title} was verified from real work. R{allowance.AmountZar:0.##} is now due.",
                    "/parent/allowances",
                    ct);
            }
        }

        // ── pricing + levels ──────────────────────────────────────────────

        // Prices a goal at creation. Deliberately blunt and public: a student
        // should be able to predict what a goal is worth before they commit to
        // it, and nothing here rewards gaming (you cannot farm points by
        // setting a 1-test goal twenty times, because twenty goals is twenty
        // pieces of real work).
        public static int PriceOf(string kind, int? targetValue)
        {
            var target = targetValue ?? 0;
            return kind switch
            {
                GoalKinds.PracticeTests => Math.Clamp(target * 15, 15, 300),
                // Percentage goals price on ambition: 60% is a start, 90% is hard.
                GoalKinds.PracticeScore => Math.Clamp(target, 20, 100),
                GoalKinds.TopicMastery => Math.Clamp((int)(target * 1.2), 20, 120),
                GoalKinds.AssessmentMark => Math.Clamp((int)(target * 1.5), 30, 150),
                // Consistency is the hardest thing to fake and the easiest to
                // break, so it pays best per unit.
                GoalKinds.CheckinStreak => Math.Clamp(target * 8, 16, 240),
                GoalKinds.PracticeStreak => Math.Clamp(target * 12, 24, 360),
                // A goal only the student can vouch for pays a token amount.
                // It is worth something; it just isn't worth the same.
                _ => 10,
            };
        }

        // 500 points a level, flattening as it climbs so a level always means
        // roughly the same amount of work.
        public static int LevelFor(int totalPoints) => Math.Max(1, (totalPoints / 500) + 1);

        public static string RankFor(int level) => level switch
        {
            <= 1 => "Getting started",
            2 => "Finding your feet",
            3 => "Building",
            4 => "Consistent",
            5 => "Sharp",
            6 => "Formidable",
            _ => "Relentless",
        };
    }

    public static class GoalStatuses
    {
        public const string Active = "active";
        public const string AtRisk = "at_risk";
        public const string Completed = "completed";
        public const string Verified = "verified";
    }
}
