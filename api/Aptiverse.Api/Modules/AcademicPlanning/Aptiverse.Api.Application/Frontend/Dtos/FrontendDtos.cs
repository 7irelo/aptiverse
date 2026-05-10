// Frontend-shaped read DTOs that match the UI's TypeScript types in
// ui/src/lib/mockData.ts. Returned by FrontendController endpoints under
// /api/frontend/*. Keep field names camelCase to match JSON output.
//
// These are deliberately decoupled from the canonical service DTOs so that
// internal refactors don't break the UI contract.

using System.Text.Json.Serialization;

namespace Aptiverse.AcademicPlanning.Application.Frontend.Dtos
{
    public record FrontendTopicMastery
    {
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("mastery")] public int Mastery { get; init; }
    }

    public record FrontendTermAverage
    {
        [JsonPropertyName("term")] public string Term { get; init; } = "";
        [JsonPropertyName("mark")] public int Mark { get; init; }
    }

    public record FrontendSubjectDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("code")] public string Code { get; init; } = "";
        [JsonPropertyName("level")] public string Level { get; init; } = "core";
        [JsonPropertyName("paper")] public string? Paper { get; init; }
        [JsonPropertyName("predictedNextTerm")] public int PredictedNextTerm { get; init; }
        [JsonPropertyName("currentAverage")] public int CurrentAverage { get; init; }
        [JsonPropertyName("trend")] public string Trend { get; init; } = "flat";
        [JsonPropertyName("termAverages")] public IList<FrontendTermAverage> TermAverages { get; init; } = [];
        [JsonPropertyName("topics")] public IList<FrontendTopicMastery> Topics { get; init; } = [];
        [JsonPropertyName("upcomingSBA")] public int UpcomingSBA { get; init; }
        [JsonPropertyName("teacher")] public string Teacher { get; init; } = "";
    }

    public record FrontendRubricCriterion
    {
        [JsonPropertyName("criterion")] public string Criterion { get; init; } = "";
        [JsonPropertyName("weight")] public int Weight { get; init; }
        [JsonPropertyName("description")] public string Description { get; init; } = "";
    }

    public record FrontendAssessmentDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("subjectId")] public string SubjectId { get; init; } = "";
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("type")] public string Type { get; init; } = "Test";
        [JsonPropertyName("weight")] public int Weight { get; init; }
        [JsonPropertyName("dueDate")] public DateTime DueDate { get; init; }
        [JsonPropertyName("status")] public string Status { get; init; } = "scheduled";
        [JsonPropertyName("predictedMark")] public int? PredictedMark { get; init; }
        [JsonPropertyName("actualMark")] public int? ActualMark { get; init; }
        [JsonPropertyName("rubric")] public IList<FrontendRubricCriterion>? Rubric { get; init; }
        [JsonPropertyName("tasks")] public IList<string>? Tasks { get; init; }
    }

    public record FrontendClassRecordDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("grade")] public int Grade { get; init; }
        [JsonPropertyName("subject")] public string Subject { get; init; } = "";
        [JsonPropertyName("studentCount")] public int StudentCount { get; init; }
        [JsonPropertyName("averageMastery")] public int AverageMastery { get; init; }
        [JsonPropertyName("trend")] public int Trend { get; init; }
        [JsonPropertyName("strugglingTopics")] public IList<string> StrugglingTopics { get; init; } = [];
    }
}
