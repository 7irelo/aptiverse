// Frontend-shaped read DTOs that match the UI's TypeScript types under
// web/src/lib/api/queries.ts. Field names are camelCase via JsonPropertyName.

using System.Text.Json.Serialization;

namespace Aptiverse.AcademicPlanning.Application.Frontend.Dtos
{
    // A curriculum the student can be enrolled in (NSC or IEB).
    public record FrontendCurriculumDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("shortName")] public string ShortName { get; init; } = "";
        [JsonPropertyName("description")] public string? Description { get; init; }
    }

    // A canonical subject in the catalog (what the student can pick from).
    public record FrontendCatalogSubjectDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("curriculumSubjectId")] public long CurriculumSubjectId { get; init; }
        [JsonPropertyName("code")] public string Code { get; init; } = "";
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("category")] public string Category { get; init; } = "";
        [JsonPropertyName("languageType")] public string? LanguageType { get; init; }
        [JsonPropertyName("description")] public string? Description { get; init; }
        [JsonPropertyName("isCompulsory")] public bool IsCompulsory { get; init; }
    }

    // The student's academic profile (curriculum + grade + school).
    public record FrontendAcademicProfileDto
    {
        [JsonPropertyName("curriculumId")] public string? CurriculumId { get; init; }
        [JsonPropertyName("grade")] public int? Grade { get; init; }
        [JsonPropertyName("school")] public string? School { get; init; }
        [JsonPropertyName("educationLevel")] public string EducationLevel { get; init; } = "highschool";
        // Tertiary only — the institution picked at signup.
        [JsonPropertyName("institutionId")] public string? InstitutionId { get; init; }
    }

    public record FrontendUpdateAcademicProfileDto
    {
        [JsonPropertyName("curriculumId")] public string? CurriculumId { get; init; }
        [JsonPropertyName("grade")] public int? Grade { get; init; }
        [JsonPropertyName("school")] public string? School { get; init; }
        [JsonPropertyName("educationLevel")] public string? EducationLevel { get; init; }
        [JsonPropertyName("institutionId")] public string? InstitutionId { get; init; }
    }

    // A subject the student has enrolled in. Shape is intentionally minimal
    // for now — marks / mastery / predictions come from logged SBA tasks
    // and will fill in once that module is wired.
    public record FrontendSubjectDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";        // student_subject id
        [JsonPropertyName("subjectId")] public string SubjectId { get; init; } = "";  // catalog subject slug
        [JsonPropertyName("code")] public string Code { get; init; } = "";
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("category")] public string Category { get; init; } = "";
        [JsonPropertyName("languageType")] public string? LanguageType { get; init; }
        [JsonPropertyName("grade")] public int Grade { get; init; }
        [JsonPropertyName("teacher")] public string? Teacher { get; init; }
        [JsonPropertyName("isCompulsory")] public bool IsCompulsory { get; init; }
        // True for a student-created (tertiary) subject: owned, free-text, no
        // curriculum. Drives the "custom" chip + delete affordance in the UI.
        [JsonPropertyName("isCustom")] public bool IsCustom { get; init; }
        [JsonPropertyName("createdAt")] public DateTime CreatedAt { get; init; }
    }

    public record FrontendAddSubjectDto
    {
        [JsonPropertyName("curriculumSubjectId")] public long CurriculumSubjectId { get; init; }
        [JsonPropertyName("grade")] public int? Grade { get; init; }
        [JsonPropertyName("teacher")] public string? Teacher { get; init; }
    }

    // Body for creating a student-owned (tertiary) subject/module from free
    // text — no CAPS catalog, no curriculum.
    public record FrontendCreateCustomSubjectDto
    {
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("category")] public string? Category { get; init; }
        [JsonPropertyName("teacher")] public string? Teacher { get; init; }
    }

    // A recognised SA tertiary institution (signup picker + course scoping).
    public record FrontendInstitutionDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("shortName")] public string? ShortName { get; init; }
        [JsonPropertyName("type")] public string Type { get; init; } = "";
        [JsonPropertyName("province")] public string? Province { get; init; }
    }

    // A tertiary student's enrolled course. `practiceKey` is the id practice
    // generation + mastery key on (institution-scoped).
    public record FrontendCourseDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";          // student_course id
        [JsonPropertyName("courseId")] public long CourseId { get; init; }
        [JsonPropertyName("practiceKey")] public string PracticeKey { get; init; } = "";
        [JsonPropertyName("institutionId")] public string InstitutionId { get; init; } = "";
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("code")] public string? Code { get; init; }
        [JsonPropertyName("lecturer")] public string? Lecturer { get; init; }
        [JsonPropertyName("createdAt")] public DateTime CreatedAt { get; init; }
    }

    // Body for enrolling in / creating a course (emergent, shared per institution).
    public record FrontendAddCourseDto
    {
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("code")] public string? Code { get; init; }
        [JsonPropertyName("lecturer")] public string? Lecturer { get; init; }
    }

    // Student-logged assessment (SBA task / test / essay / etc.). The
    // student creates these via POST and fills in actualMark once graded.
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
        [JsonPropertyName("notes")] public string? Notes { get; init; }
        [JsonPropertyName("tasks")] public IList<FrontendAssessmentTaskDto> Tasks { get; init; } = [];
        [JsonPropertyName("createdAt")] public DateTime CreatedAt { get; init; }
    }

    public record FrontendAssessmentTaskDto
    {
        [JsonPropertyName("label")] public string Label { get; init; } = "";
        [JsonPropertyName("done")] public bool Done { get; init; }
    }

    public record FrontendAssessmentUploadDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("filename")] public string Filename { get; init; } = "";
        [JsonPropertyName("contentType")] public string ContentType { get; init; } = "";
        [JsonPropertyName("sizeBytes")] public long SizeBytes { get; init; }
        // Pre-signed download URL the frontend can put on an <img src>
        // or <a href> directly. Always points at the API; binary is
        // streamed back with the original content-type.
        [JsonPropertyName("url")] public string Url { get; init; } = "";
        [JsonPropertyName("createdAt")] public DateTime CreatedAt { get; init; }
    }

    public record FrontendCreateAssessmentDto
    {
        [JsonPropertyName("subjectId")] public string SubjectId { get; init; } = "";
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("type")] public string Type { get; init; } = "test";
        [JsonPropertyName("weight")] public int Weight { get; init; }
        [JsonPropertyName("dueDate")] public DateTime DueDate { get; init; }
        [JsonPropertyName("status")] public string? Status { get; init; }
        [JsonPropertyName("predictedMark")] public int? PredictedMark { get; init; }
        [JsonPropertyName("actualMark")] public int? ActualMark { get; init; }
        [JsonPropertyName("notes")] public string? Notes { get; init; }
    }

    public record FrontendUpdateAssessmentDto
    {
        [JsonPropertyName("subjectId")] public string? SubjectId { get; init; }
        [JsonPropertyName("title")] public string? Title { get; init; }
        [JsonPropertyName("type")] public string? Type { get; init; }
        [JsonPropertyName("weight")] public int? Weight { get; init; }
        [JsonPropertyName("dueDate")] public DateTime? DueDate { get; init; }
        [JsonPropertyName("status")] public string? Status { get; init; }
        [JsonPropertyName("predictedMark")] public int? PredictedMark { get; init; }
        [JsonPropertyName("actualMark")] public int? ActualMark { get; init; }
        [JsonPropertyName("notes")] public string? Notes { get; init; }
        // Full-replacement of the task list when present. Send null/omit to
        // leave tasks untouched; send [] to clear; send a complete list to
        // overwrite (add/remove/reorder/check-off in one PATCH).
        [JsonPropertyName("tasks")] public IList<FrontendAssessmentTaskDto>? Tasks { get; init; }
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
