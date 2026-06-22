using System.Text.Json.Serialization;

namespace Aptiverse.Marketplace.Application.Frontend.Dtos
{
    public record FrontendTutorDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("subjects")] public IList<string> Subjects { get; init; } = [];
        [JsonPropertyName("rating")] public double Rating { get; init; }
        [JsonPropertyName("reviewCount")] public int ReviewCount { get; init; }
        [JsonPropertyName("hourlyRate")] public int HourlyRate { get; init; }
        [JsonPropertyName("bio")] public string Bio { get; init; } = "";
        [JsonPropertyName("city")] public string City { get; init; } = "";
        [JsonPropertyName("verified")] public bool Verified { get; init; }
        [JsonPropertyName("online")] public bool Online { get; init; }
        [JsonPropertyName("avatarColor")] public string AvatarColor { get; init; } = "#1F8079";
    }

    public record FrontendCourseDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("tutorId")] public string TutorId { get; init; } = "";
        [JsonPropertyName("subjectId")] public string SubjectId { get; init; } = "";
        [JsonPropertyName("duration")] public string Duration { get; init; } = "";
        [JsonPropertyName("lessons")] public int Lessons { get; init; }
        [JsonPropertyName("rating")] public double Rating { get; init; }
        [JsonPropertyName("enrolled")] public int Enrolled { get; init; }
        [JsonPropertyName("price")] public int Price { get; init; }
        [JsonPropertyName("level")] public string Level { get; init; } = "intermediate";
        [JsonPropertyName("description")] public string Description { get; init; } = "";
    }

    public record FrontendReviewDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("student")] public string Student { get; init; } = "";
        [JsonPropertyName("rating")] public int Rating { get; init; }
        [JsonPropertyName("body")] public string Body { get; init; } = "";
        [JsonPropertyName("when")] public DateTime When { get; init; }
    }
}
