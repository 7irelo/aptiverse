using System.Text.Json.Serialization;

namespace Aptiverse.Booking.Application.Frontend.Dtos
{
    public record FrontendBookingDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("studentId")] public string StudentId { get; init; } = "";
        [JsonPropertyName("student")] public string Student { get; init; } = "";
        [JsonPropertyName("tutorId")] public string TutorId { get; init; } = "";
        [JsonPropertyName("tutor")] public string Tutor { get; init; } = "";
        [JsonPropertyName("subject")] public string Subject { get; init; } = "";
        [JsonPropertyName("start")] public DateTime Start { get; init; }
        [JsonPropertyName("duration")] public int Duration { get; init; }
        [JsonPropertyName("fee")] public int Fee { get; init; }
        [JsonPropertyName("status")] public string Status { get; init; } = "scheduled";
    }

    public record FrontendAvailabilitySlotDto
    {
        [JsonPropertyName("tutorId")] public string TutorId { get; init; } = "";
        [JsonPropertyName("dayOfWeek")] public int DayOfWeek { get; init; }
        [JsonPropertyName("startMinutes")] public int StartMinutes { get; init; }
        [JsonPropertyName("endMinutes")] public int EndMinutes { get; init; }
        [JsonPropertyName("recurring")] public bool Recurring { get; init; } = true;
    }
}
