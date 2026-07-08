using System.Text.Json.Serialization;

namespace Aptiverse.Marketplace.Application.Frontend.Dtos
{
    // Student-facing tutor discovery. Id is the tutor's identity user id, which
    // is what connect/review actions key on. No hourly rate or online status:
    // Aptiverse doesn't facilitate the tutoring, so those aren't tracked.
    public record FrontendTutorDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("subjects")] public IList<string> Subjects { get; init; } = [];
        [JsonPropertyName("qualification")] public string Qualification { get; init; } = "";
        [JsonPropertyName("specialization")] public string Specialization { get; init; } = "";
        [JsonPropertyName("bio")] public string Bio { get; init; } = "";
        [JsonPropertyName("yearsOfExperience")] public int YearsOfExperience { get; init; }
        [JsonPropertyName("teachingStyle")] public string TeachingStyle { get; init; } = "";
        [JsonPropertyName("rating")] public double Rating { get; init; }
        [JsonPropertyName("reviewCount")] public int ReviewCount { get; init; }
        [JsonPropertyName("verified")] public bool Verified { get; init; }
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
