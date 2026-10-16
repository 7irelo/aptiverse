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

                    // Settle the payout now, against what actually happened.
                    // RewardPoints held a projection until this moment; the
                    // student may have blown past their target, and the reward
                    // is for the distance travelled, not for clearing a bar.
                    if (GoalKinds.IsRewarded(goal.Kind))
                    {
                        goal.AchievedDifficulty = HardestDifficultyFor(goal, evidence);
                        goal.RewardPoints = PointsFor(
                            goal.Kind,
                            current,
                            goal.BaselineValue ?? 0,
                            goal.AchievedDifficulty);
                    }
                    else
                    {
                        goal.RewardPoints = 0;
                    }

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
            Dictionary<long, string> TestDifficultyByTestId,
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
            var testDifficulty = new Dictionary<long, string>();

            if (needsAttempts)
            {
                attempts = await _db.Set<PracticeAttempt>()
                    .Where(a => a.StudentId == studentId && a.Status == AttemptStatus.Submitted)
                    .ToListAsync(ct);

                var testIds = attempts.Select(a => a.TestId).Distinct().ToList();
                var tests = await _db.Set<PracticeTest>()
                    .Where(t => testIds.Contains(t.Id))
                    .Select(t => new { t.Id, t.SubjectId, t.Difficulty })
                    .ToListAsync(ct);
                testSubjects = tests.ToDictionary(t => t.Id, t => t.SubjectId);
                testDifficulty = tests.ToDictionary(t => t.Id, t => t.Difficulty);

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

            return new Evidence(attempts, summaries, testSubjects, testDifficulty, gradedAssessments, checkinDays);
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

            // Points are the whole reward. They buy time-boxed top-ups on
            // metered features from RewardCatalog, which the student chooses
            // themselves on /dashboard/rewards.
            //
            // Nothing is auto-granted here on purpose. A reward the student
            // picks is a reward they wanted; one the system picks is a
            // notification. It also keeps this method free of any opinion about
            // what a given goal is "worth" beyond its points.
        }

        // ── pricing + levels ──────────────────────────────────────────────

        // Prices a goal at creation. Deliberately blunt and public: a student
        // should be able to predict what a goal is worth before they commit to
        // it, and nothing here rewards gaming (you cannot farm points by
        // setting a 1-test goal twenty times, because twenty goals is twenty
        // pieces of real work).
        // Where the student stands right now, in the goal's own unit.
        //
        // Called once, at creation, and frozen onto the row. Practice score
        // baselines off their recent best rather than their all-time best: a
        // student who peaked at 90% eight months ago and now sits at 60% is a
        // 60% student today, and making them beat their own history from a
        // different year would just make the feature useless to them.
        public async Task<int> BaselineForAsync(
            string studentId, string kind, string? subjectId, string? topicFilter, CancellationToken ct)
        {
            if (kind == GoalKinds.PracticeScore)
            {
                var since = DateTime.UtcNow.AddDays(-60);
                var q = _db.Set<PracticeAttempt>()
                    .AsNoTracking()
                    .Where(a => a.StudentId == studentId
                             && a.Status == AttemptStatus.Submitted
                             && a.Score != null
                             && a.SubmittedAt >= since);

                if (!string.IsNullOrWhiteSpace(subjectId))
                {
                    var testIds = _db.Set<PracticeTest>()
                        .AsNoTracking()
                        .Where(t => t.SubjectId == subjectId)
                        .Select(t => t.Id);
                    q = q.Where(a => testIds.Contains(a.TestId));
                }

                // Best of the last 60 days. Best, not average: the baseline is
                // "what you have shown you can do", and beating your own best is
                // the bar that cannot be cleared by having had a bad week.
                return await q.MaxAsync(a => (int?)a.Score, ct) ?? 0;
            }

            if (kind == GoalKinds.TopicMastery)
            {
                var goals = new List<Goal>
                {
                    new() { Kind = GoalKinds.TopicMastery, SubjectId = subjectId, TopicFilter = topicFilter },
                };
                var evidence = await LoadEvidenceAsync(studentId, goals, ct);
                return MeasureMastery(goals[0], evidence);
            }

            return 0;
        }

        // The hardest paper the student actually cleared while working on this
        // goal, which sets the difficulty multiplier.
        //
        // Hardest, not most recent: a student who clears a challenge paper has
        // shown that level, and a later foundation attempt does not un-show it.
        private static string HardestDifficultyFor(Goal goal, Evidence ev)
        {
            var rank = new Dictionary<string, int>
            {
                ["foundation"] = 0,
                ["core"] = 1,
                ["challenge"] = 2,
            };

            var relevant = ev.Attempts
                .Where(a => a.Score is not null && a.SubmittedAt >= goal.CreatedAt)
                .Where(a => string.IsNullOrEmpty(goal.SubjectId)
                            || (ev.TestSubjectByTestId.TryGetValue(a.TestId, out var s) && s == goal.SubjectId))
                .Select(a => ev.TestDifficultyByTestId.GetValueOrDefault(a.TestId, "core"))
                .ToList();

            if (relevant.Count == 0) return "core";

            return relevant
                .OrderByDescending(d => rank.GetValueOrDefault(d, 1))
                .First();
        }

        // What a goal is projected to pay, shown at creation.
        //
        // This is the floor: the payout for landing exactly on the target and
        // no further. The real figure is settled at verification by PointsFor,
        // because the reward is a function of how far past their own baseline
        // the student actually got, and nobody knows that in advance.
        //
        // Unrewarded kinds return 0, and the UI says so rather than implying a
        // payout that never arrives.
        public static int ProjectedPoints(string kind, int? targetValue, int? baselineValue)
        {
            if (!GoalKinds.IsRewarded(kind)) return 0;
            var target = targetValue ?? 0;
            var baseline = baselineValue ?? 0;
            return PointsFor(kind, target, baseline, null);
        }

        // The payout, settled against what the student actually did.
        //
        // Paying on the gain rather than the score is the whole design. A
        // student sitting at 80% who clears a 60% target has demonstrated
        // nothing, and paying them for it would teach exactly the wrong lesson:
        // that the way to earn is to aim at where you already are. A student who
        // drags themselves from 45% to 62% has done the harder thing, and the
        // points say so, even though 62 is the smaller number.
        //
        // The gain is squashed rather than linear. Early progress off a low base
        // is where the real work is, and the last few points before 100 are
        // partly luck, so a straight multiplier would overpay a student who was
        // already close to the ceiling.
        public static int PointsFor(string kind, int achieved, int baseline, string? difficulty)
        {
            if (!GoalKinds.IsRewarded(kind)) return 0;

            var gain = achieved - baseline;
            if (gain <= 0) return 0;   // you did not outdo yourself.

            // 12 points per percentage point gained, tapering above 20 points of
            // gain: a 40-point jump is remarkable but not twice as remarkable as
            // a 20-point one, and paying it linearly would make one lucky test
            // worth more than a term of work.
            var flat = Math.Min(gain, 20) * 12;
            var taper = Math.Max(0, gain - 20) * 5;
            var raw = flat + taper;

            // Difficulty multiplier. The tests scale to the student, so clearing
            // a challenge paper is a harder thing than clearing a foundation one
            // and should not pay the same.
            var multiplier = difficulty switch
            {
                "challenge" => 1.5,
                "foundation" => 0.6,
                _ => 1.0,           // "core", and the projection case.
            };

            return Math.Clamp((int)Math.Round(raw * multiplier), 0, 900);
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
