using System.Text.Json.Serialization;

namespace Aptiverse.Wellbeing.Application.Frontend.Dtos
{
    public record FrontendDiaryEntryDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("date")] public DateTime Date { get; init; }
        [JsonPropertyName("mood")] public int Mood { get; init; } // 1-5
        [JsonPropertyName("content")] public string Content { get; init; } = "";
        [JsonPropertyName("tags")] public IList<string> Tags { get; init; } = [];
    }

    public record FrontendCreateDiaryEntryInput
    {
        [JsonPropertyName("mood")] public int Mood { get; init; }
        [JsonPropertyName("content")] public string Content { get; init; } = "";
        [JsonPropertyName("tags")] public IList<string>? Tags { get; init; }
    }

    public record FrontendMoodPointDto
    {
        [JsonPropertyName("date")] public DateTime Date { get; init; }
        [JsonPropertyName("mood")] public double Mood { get; init; }
    }

    public record FrontendCreateMoodInput
    {
        // 1-5 mood score, matching the diary mood scale used by the UI.
        [JsonPropertyName("mood")] public int Mood { get; init; }
        [JsonPropertyName("energyLevel")] public string? EnergyLevel { get; init; }
        [JsonPropertyName("stressLevel")] public string? StressLevel { get; init; }
        [JsonPropertyName("sleepQuality")] public string? SleepQuality { get; init; }
        [JsonPropertyName("sleepHours")] public double? SleepHours { get; init; }
        [JsonPropertyName("notes")] public string? Notes { get; init; }
    }

    public record FrontendCounsellorDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("specialisation")] public string Specialisation { get; init; } = "";
        [JsonPropertyName("rating")] public double Rating { get; init; }
        [JsonPropertyName("online")] public bool Online { get; init; }
        [JsonPropertyName("avatarColor")] public string AvatarColor { get; init; } = "#1F8079";
    }

    public record FrontendWellbeingSummaryDto
    {
        [JsonPropertyName("moodAvg7d")] public double MoodAvg7d { get; init; }
        [JsonPropertyName("checkinStreakDays")] public int CheckinStreakDays { get; init; }
        [JsonPropertyName("stressSignal")] public string StressSignal { get; init; } = "low";
        [JsonPropertyName("sleepHours")] public double SleepHours { get; init; }
    }
}
