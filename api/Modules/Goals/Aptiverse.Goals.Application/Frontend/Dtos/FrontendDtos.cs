using System.Text.Json.Serialization;

namespace Aptiverse.Goals.Application.Frontend.Dtos
{
    public record FrontendGoalDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("subjectId")] public string? SubjectId { get; init; }
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("description")] public string Description { get; init; } = "";
        [JsonPropertyName("target")] public string Target { get; init; } = "";
        [JsonPropertyName("progress")] public int Progress { get; init; }
        [JsonPropertyName("status")] public string Status { get; init; } = "active";
        [JsonPropertyName("dueDate")] public DateTime DueDate { get; init; }
        [JsonPropertyName("category")] public string Category { get; init; } = "academic";
        [JsonPropertyName("reward")] public string? Reward { get; init; }

        // What proves it, and how far along the evidence says they are. The UI
        // shows current/target directly ("3 of 5 tests") rather than only a
        // percentage, because the raw count is what a student can act on.
        [JsonPropertyName("kind")] public string Kind { get; init; } = "custom";
        [JsonPropertyName("targetValue")] public int? TargetValue { get; init; }
        [JsonPropertyName("currentValue")] public int CurrentValue { get; init; }
        [JsonPropertyName("topicFilter")] public string? TopicFilter { get; init; }
        [JsonPropertyName("rewardPoints")] public int RewardPoints { get; init; }
        [JsonPropertyName("achievedAt")] public DateTime? AchievedAt { get; init; }

        // Where the student stood when they set the goal, in TargetValue's
        // unit. The card is unreadable without it: "68%" means nothing until
        // you know they started at 45%, and the points were paid for the gap.
        // Null for kinds with no baseline (custom, streaks, counts).
        [JsonPropertyName("baselineValue")] public int? BaselineValue { get; init; }

        // Hardest difficulty cleared on a qualifying attempt, set at
        // verification: "foundation", "core", "challenge". It is the
        // multiplier on the payout, so it is what explains the final figure.
        [JsonPropertyName("achievedDifficulty")] public string? AchievedDifficulty { get; init; }

        // The assessment this goal is preparing for, when there is one.
        [JsonPropertyName("assessmentId")] public long? AssessmentId { get; init; }

        // False for custom goals: the client uses this to decide whether to
        // offer a manual progress control, so self-reporting can never leak
        // onto a goal the system is meant to check.
        [JsonPropertyName("autoVerified")] public bool AutoVerified { get; init; }

        // Whether this kind pays points at all. Measurable and rewarded are
        // different questions (GoalKinds.Rewarded), and the client must not
        // imply a payout that never arrives, so the server states it rather
        // than letting the UI re-derive a list it will forget to update.
        [JsonPropertyName("rewarded")] public bool Rewarded { get; init; }
    }

    // What a student would be measured against if they set this goal right
    // now, answered before the goal exists.
    //
    // This endpoint exists so the target input is not a guessing game. A
    // rewarded goal is rejected outright when the target is at or below the
    // baseline, so without showing the baseline first the student meets that
    // 400 blind, having already typed everything else.
    public record FrontendGoalBaselineDto
    {
        [JsonPropertyName("kind")] public string Kind { get; init; } = "";

        // True when this kind pays points. False means the rest of this
        // response is informational: there is no baseline gate and no payout.
        [JsonPropertyName("rewarded")] public bool Rewarded { get; init; }

        // Where they stand today, in the goal's unit. Null when the kind has
        // no baseline to speak of.
        [JsonPropertyName("baseline")] public int? Baseline { get; init; }

        // The lowest target the server will accept: baseline + 1. Null when
        // nothing is gated.
        [JsonPropertyName("minimumTarget")] public int? MinimumTarget { get; init; }

        // What the supplied target would pay if they landed exactly on it.
        // The floor, not a promise: the real figure is settled at
        // verification against the gain actually made. Null when no target
        // was supplied or the kind pays nothing.
        [JsonPropertyName("projectedPoints")] public int? ProjectedPoints { get; init; }
    }

    // What a student has earned. Every number here is computed from real
    // events, which is why there is no "available rewards" catalogue: we don't
    // sell prizes we can't hand over.
    public record FrontendStudentPointsDto
    {
        [JsonPropertyName("studentId")] public string StudentId { get; init; } = "";
        [JsonPropertyName("balance")] public int Balance { get; init; }
        [JsonPropertyName("totalEarned")] public int TotalEarned { get; init; }
        [JsonPropertyName("level")] public int Level { get; init; } = 1;
        [JsonPropertyName("rank")] public string Rank { get; init; } = "Getting started";
        [JsonPropertyName("pointsIntoLevel")] public int PointsIntoLevel { get; init; }
        [JsonPropertyName("pointsPerLevel")] public int PointsPerLevel { get; init; }
        [JsonPropertyName("checkinStreakDays")] public int CheckinStreakDays { get; init; }
        [JsonPropertyName("practiceStreakDays")] public int PracticeStreakDays { get; init; }
        [JsonPropertyName("goalsVerified")] public int GoalsVerified { get; init; }
        [JsonPropertyName("testsSubmitted")] public int TestsSubmitted { get; init; }
    }

    public record FrontendPointsEntryDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("points")] public int Points { get; init; }
        [JsonPropertyName("description")] public string Description { get; init; } = "";
        [JsonPropertyName("source")] public string Source { get; init; } = "";
        [JsonPropertyName("date")] public DateTime Date { get; init; }
    }

    // Achievements are derived on read from real counters rather than stored,
    // so they can never drift out of step with the facts they claim.
    public record FrontendAchievementDto
    {
        [JsonPropertyName("code")] public string Code { get; init; } = "";
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("description")] public string Description { get; init; } = "";
        [JsonPropertyName("earned")] public bool Earned { get; init; }
        [JsonPropertyName("progress")] public int Progress { get; init; }
        [JsonPropertyName("target")] public int Target { get; init; }
    }

    // The reward catalogue: time-boxed top-ups on metered features. Everything
    // here is deliverable the moment it is redeemed, because it is a number the
    // meter already enforces, raised for a while.
    public record FrontendRewardDto
    {
        [JsonPropertyName("code")] public string Code { get; init; } = "";
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("description")] public string Description { get; init; } = "";
        [JsonPropertyName("quotaKey")] public string QuotaKey { get; init; } = "";
        [JsonPropertyName("bonus")] public int Bonus { get; init; }
        [JsonPropertyName("days")] public int Days { get; init; }
        [JsonPropertyName("costPoints")] public int CostPoints { get; init; }
        [JsonPropertyName("affordable")] public bool Affordable { get; init; }
    }

    // A top-up the student is currently holding.
    public record FrontendGrantDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("rewardCode")] public string RewardCode { get; init; } = "";
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("quotaKey")] public string QuotaKey { get; init; } = "";
        [JsonPropertyName("bonus")] public int Bonus { get; init; }
        [JsonPropertyName("pointsSpent")] public int PointsSpent { get; init; }
        [JsonPropertyName("grantedAt")] public DateTime GrantedAt { get; init; }
        [JsonPropertyName("expiresAt")] public DateTime ExpiresAt { get; init; }
    }

    public record FrontendVerificationDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("student")] public string Student { get; init; } = "";
        [JsonPropertyName("goal")] public string Goal { get; init; } = "";
        [JsonPropertyName("value")] public string Value { get; init; } = "";
        [JsonPropertyName("date")] public DateTime Date { get; init; }
        [JsonPropertyName("reward")] public string Reward { get; init; } = "";
    }
}
