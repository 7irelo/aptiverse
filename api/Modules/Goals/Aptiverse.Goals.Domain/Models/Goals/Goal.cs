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

        // Points credited when this goal is achieved, priced at creation from
        // Kind + TargetValue. Stored so the payout can't move under a student
        // who is already working toward it.
        public int RewardPoints { get; set; }

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
    }
}
