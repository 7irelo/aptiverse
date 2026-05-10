using System.Text.Json.Serialization;

namespace Aptiverse.Api.Application.Frontend.Dtos
{
    public record FrontendSubscriptionDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("customer")] public string Customer { get; init; } = "";
        [JsonPropertyName("plan")] public string Plan { get; init; } = "Free";
        [JsonPropertyName("amount")] public int Amount { get; init; }
        [JsonPropertyName("status")] public string Status { get; init; } = "active";
        [JsonPropertyName("renewsAt")] public DateTime RenewsAt { get; init; }
    }

    public record FrontendFeatureDto
    {
        [JsonPropertyName("key")] public string Key { get; init; } = "";
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("enabled")] public bool Enabled { get; init; }
        [JsonPropertyName("plan")] public string Plan { get; init; } = "free";
    }

    public record FrontendChildDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("grade")] public int Grade { get; init; }
        [JsonPropertyName("school")] public string School { get; init; } = "";
        [JsonPropertyName("weeklyMinutes")] public int WeeklyMinutes { get; init; }
        [JsonPropertyName("predictedAverage")] public int PredictedAverage { get; init; }
        [JsonPropertyName("trend")] public int Trend { get; init; }
        [JsonPropertyName("isStudyingNow")] public bool IsStudyingNow { get; init; }
        [JsonPropertyName("currentActivity")] public string? CurrentActivity { get; init; }
        [JsonPropertyName("moodAvg")] public double MoodAvg { get; init; }
    }
}
