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

        // False for custom goals: the client uses this to decide whether to
        // offer a manual progress control, so self-reporting can never leak
        // onto a goal the system is meant to check.
        [JsonPropertyName("autoVerified")] public bool AutoVerified { get; init; }

        [JsonPropertyName("allowance")] public FrontendAllowanceDto? Allowance { get; init; }
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

    public record FrontendAllowanceDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("goalId")] public string GoalId { get; init; } = "";
        [JsonPropertyName("goalTitle")] public string GoalTitle { get; init; } = "";
        [JsonPropertyName("studentId")] public string StudentId { get; init; } = "";
        [JsonPropertyName("studentName")] public string StudentName { get; init; } = "";
        [JsonPropertyName("sponsorName")] public string SponsorName { get; init; } = "";
        [JsonPropertyName("amountZar")] public decimal AmountZar { get; init; }
        [JsonPropertyName("status")] public string Status { get; init; } = "pledged";
        [JsonPropertyName("earnedAt")] public DateTime? EarnedAt { get; init; }
        [JsonPropertyName("paidAt")] public DateTime? PaidAt { get; init; }
        [JsonPropertyName("note")] public string? Note { get; init; }
        [JsonPropertyName("goalProgress")] public int GoalProgress { get; init; }
        [JsonPropertyName("goalTarget")] public string GoalTarget { get; init; } = "";
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
