using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Goals.Domain.Models.Goals
{
    // A goal the system can check for itself.
    //
    // This entity used to carry only a display string ("75% mastery") and a
    // Progress int that nothing ever wrote, which made every goal a note to
    // self: it opened at 0% and stayed there forever, and "verified" was a
    // status no code path could reach. Kind + TargetValue put the target back
    // in machine-readable form so GoalEvaluator can measure it against real
    // evidence the student cannot fake: submitted practice attempts, graded
    // marks, mastery computed from actual answers, check-in streaks.
    //
    // Target survives as the human label, but it is now derived from
    // Kind/TargetValue rather than typed by hand, so the words and the
    // measurement can never disagree.
    [Index(nameof(StudentId))]
    [Index(nameof(SubjectId))]
    [Index(nameof(Status))]
    [Index(nameof(Category))]
    [Index(nameof(Kind))]
    [Index(nameof(StudentId), nameof(Status))]
    public class Goal : IEntityTimestamps
    {
        public long Id { get; set; }

        // Owner of the goal — identity.users.id. Populated from the JWT's
        // NameIdentifier on insert. Nullable on the column so the migration
        // doesn't blow up on legacy rows (those are wiped during the
        // AddGoalStudentId migration), but new inserts always set it.
        public string? StudentId { get; set; }

        // Optional link to a study unit. Holds the same slug an assessment's
        // SubjectId holds: a subject slug for high-school, a course practice
        // key for tertiary. Scopes evidence for the academic kinds.
        public string? SubjectId { get; set; }

        public string Title { get; set; } = "";
        public string Description { get; set; } = "";

        // What evidence proves this goal. See GoalKinds.
        public string Kind { get; set; } = GoalKinds.Custom;

        // The number to reach, read according to Kind: a count of tests, a
        // percentage, a run of days. Null only for Custom.
        public int? TargetValue { get; set; }

        // Last measured value, in the same unit as TargetValue. Written by
        // GoalEvaluator, never by the client.
        public int CurrentValue { get; set; }

        // Narrows TopicMastery to one topic. Null means the whole unit.
        public string? TopicFilter { get; set; }

        // Human label ("Best score 75%", "5 practice tests"). Derived from
        // Kind + TargetValue on write; kept on the row so the label a student
        // agreed to cannot drift if we reword the generator later.
        public string Target { get; set; } = "";

        // 0-100 percent. Persisted rather than derived: a Custom goal has no
        // evidence to measure, so the student's own PATCH is the only source.
        // For every other Kind the evaluator overwrites it from real data.
        public int Progress { get; set; }

        // active | at_risk | completed | verified
        //
        // completed = the student says so (Custom only).
        // verified  = the system checked the evidence itself. Only the
        //             evaluator sets this, and only for a measurable Kind.
        public string Status { get; set; } = "active";

        public DateTime DueDate { get; set; }

        // academic | wellbeing | habit | career
        public string Category { get; set; } = "academic";

        // Optional free-text note about what the student gets out of it.
        // Points are the system's own reward; this is theirs.
        public string? Reward { get; set; }

        // Points credited when this goal is achieved. Zero for every kind that
        // is not measured from practice, and not final until the goal verifies:
        // the payout is a function of how far the student beat their own
        // baseline, so it cannot be known when the goal is written. Before that
        // it holds the projected payout for hitting TargetValue exactly, which
        // is the floor, not the promise.
        public int RewardPoints { get; set; }

        // Where the student already was, in TargetValue's unit, at the moment
        // they set the goal.
        //
        // This is what makes the reward mean anything. Points are paid on
        // (achieved - baseline), so a student at 80% who sets a 60% target earns
        // nothing for clearing it: they have not outdone themselves, they have
        // described themselves. It also gates creation, since a target at or
        // below the baseline is rejected outright rather than accepted and
        // silently priced at zero.
        //
        // Null for kinds with no baseline to speak of (custom, streaks).
        public int? BaselineValue { get; set; }

        // The assessment this goal is preparing for, when there is one.
        //
        // The path that matters: a student logs a real assessment, generates
        // practice for its subject, then sets a goal on that practice. The link
        // is what lets the goal say "for your Maths SBA on the 14th" instead of
        // floating free of the thing that actually motivated it. Practice in
        // the assessment's subject is what counts toward the goal.
        //
        // Not a navigation property: Assessment lives in AcademicPlanning and
        // Goals cannot reference it without the two modules referencing each
        // other. The host resolves it.
        public long? AssessmentId { get; set; }

        // Hardest difficulty the student has actually cleared on a qualifying
        // attempt, captured when the goal verifies: "core", "challenge".
        // Recorded so the payout can be re-explained later without re-reading
        // every attempt.
        public string? AchievedDifficulty { get; set; }

        // When Progress first reached 100. Also the trigger guard: points are
        // credited exactly once, when this flips from null.
        public DateTime? AchievedAt { get; set; }

        // Manual priority rank within the student's list (lower = higher up).
        // Drag-to-reorder on the goals page writes this; defaults to 0 so
        // existing rows keep their date ordering until the student reorders.
        public int SortOrder { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<GoalMilestone> Milestones { get; set; } = [];
    }

    // The kinds of evidence a goal can be measured against. Each maps to a
    // real table the student writes by doing the work, never by self-report.
    public static class GoalKinds
    {
        // No evidence source. The student marks their own progress. This is
        // the honest home for "read three chapters", not a loophole.
        public const string Custom = "custom";

        // Count of submitted practice attempts. Scoped to SubjectId if set.
        public const string PracticeTests = "practice_tests";

        // Best score across submitted practice attempts, as a percentage.
        public const string PracticeScore = "practice_score";

        // Mastery percentage, computed from real answers per topic. Scoped by
        // SubjectId, and to one topic when TopicFilter is set.
        public const string TopicMastery = "topic_mastery";

        // Best actual mark across graded assessments, as a percentage.
        public const string AssessmentMark = "assessment_mark";

        // Consecutive days with a mood check-in.
        public const string CheckinStreak = "checkin_streak";

        // Consecutive days with at least one submitted practice attempt.
        public const string PracticeStreak = "practice_streak";

        public static readonly string[] All =
        [
            Custom, PracticeTests, PracticeScore, TopicMastery,
            AssessmentMark, CheckinStreak, PracticeStreak,
        ];

        // Everything except Custom is checked by the system.
        public static bool IsMeasurable(string kind) => kind != Custom && All.Contains(kind);

        // The only kinds that pay points.
        //
        // Measurable and rewarded are different questions, and collapsing them
        // was the mistake in the first cut. Plenty of goals are worth setting
        // and worth checking without being worth paying for.
        //
        // Rewards ride on practice performance alone because practice is the
        // only signal that is generated, adaptive, and impossible to inflate.
        // The test scales to the student's demonstrated level, so a good score
        // is evidence of ability rather than evidence of choosing an easy test.
        //
        // Everything else is excluded for a reason worth keeping:
        //   PracticeTests   — a count measures attendance, not learning. Paying
        //                     for it buys twenty abandoned tests.
        //   AssessmentMark  — the mark is typed in by the student. Paying for a
        //                     self-reported number is paying for typing.
        //   Streaks         — paying for consecutive days pays the student who
        //                     opens the app at 23:58 to keep a number alive.
        //                     Streaks are shown because they motivate, not
        //                     because they are worth money.
        //   Custom          — nothing to check.
        public static readonly string[] Rewarded = [PracticeScore, TopicMastery];

        public static bool IsRewarded(string kind) => Rewarded.Contains(kind);

        // Kinds where beating your own baseline is the whole point, so a target
        // at or below it is refused at creation.
        public static bool NeedsBaseline(string kind) => IsRewarded(kind);
    }
}
