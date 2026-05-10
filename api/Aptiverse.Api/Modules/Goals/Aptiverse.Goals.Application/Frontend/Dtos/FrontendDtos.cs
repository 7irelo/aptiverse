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
    }

    public record FrontendRewardDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("description")] public string Description { get; init; } = "";
        [JsonPropertyName("cost")] public int Cost { get; init; }
        [JsonPropertyName("category")] public string Category { get; init; } = "feature";
        [JsonPropertyName("imageColor")] public string ImageColor { get; init; } = "#1F8079";
        [JsonPropertyName("available")] public bool Available { get; init; }
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

    public record FrontendStudentPointsDto
    {
        [JsonPropertyName("studentId")] public string StudentId { get; init; } = "";
        [JsonPropertyName("balance")] public int Balance { get; init; }
        [JsonPropertyName("streakDays")] public int StreakDays { get; init; }
        [JsonPropertyName("badgeCount")] public int BadgeCount { get; init; }
    }
}
