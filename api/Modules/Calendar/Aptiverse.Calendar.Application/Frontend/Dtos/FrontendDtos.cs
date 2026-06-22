using System.Text.Json.Serialization;

namespace Aptiverse.Calendar.Application.Frontend.Dtos
{
    public record FrontendCalendarEventDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("start")] public DateTime Start { get; init; }
        [JsonPropertyName("end")] public DateTime End { get; init; }
        [JsonPropertyName("type")] public string Type { get; init; } = "study";  // study | sba | session | reminder
        [JsonPropertyName("source")] public string Source { get; init; } = "internal"; // internal | google | outlook
        [JsonPropertyName("subjectId")] public string? SubjectId { get; init; }
        [JsonPropertyName("location")] public string? Location { get; init; }
    }

    public record FrontendReminderDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("ts")] public DateTime Ts { get; init; }
        [JsonPropertyName("kind")] public string Kind { get; init; } = "reminder";
    }
}
