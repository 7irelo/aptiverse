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
        [JsonPropertyName("firstName")] public string FirstName { get; init; } = "";
        [JsonPropertyName("lastName")] public string LastName { get; init; } = "";
        // Read-only. The email identifies the account and is the password-reset
        // channel, so it is echoed here for display but is not accepted on the
        // update DTO below. Changing it needs a verification round-trip.
        [JsonPropertyName("email")] public string? Email { get; init; }
        [JsonPropertyName("curriculumId")] public string? CurriculumId { get; init; }
        [JsonPropertyName("grade")] public int? Grade { get; init; }
        [JsonPropertyName("school")] public string? School { get; init; }
        [JsonPropertyName("educationLevel")] public string EducationLevel { get; init; } = "highschool";
        // Tertiary only — the institution picked at signup.
        [JsonPropertyName("institutionId")] public string? InstitutionId { get; init; }
    }

    // Deliberately has no Email property: see FrontendAcademicProfileDto.Email.
    public record FrontendUpdateAcademicProfileDto
    {
        [JsonPropertyName("firstName")] public string? FirstName { get; init; }
        [JsonPropertyName("lastName")] public string? LastName { get; init; }
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

        // Study level (first_year..fourth_year, honours, masters, phd). Null on
        // courses added before this existed. Pitches AI practice generation.
        [JsonPropertyName("level")] public string? Level { get; init; }

        // How many semesters the course runs (null = ongoing / set before this
        // existed).
        [JsonPropertyName("durationSemesters")] public int? DurationSemesters { get; init; }

        // When the course is expected to end, computed from createdAt + duration.
        // Null when there is no duration to compute from. The client uses it to
        // show "ends Nov 2026" and, with isFinished, to sort past from active.
        [JsonPropertyName("finishesOn")] public DateTime? FinishesOn { get; init; }

        // True once the course is done: either marked finished by the student, or
        // its computed end has passed. The one flag the analytics UI reads to move
        // a course into the Past section.
        [JsonPropertyName("isFinished")] public bool IsFinished { get; init; }
    }

    // Body for enrolling in / creating a course (emergent, shared per institution).
    public record FrontendAddCourseDto
    {
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("code")] public string? Code { get; init; }
        [JsonPropertyName("lecturer")] public string? Lecturer { get; init; }

        // Study level, so AI practice is pitched right (first_year..fourth_year,
        // honours, masters, phd). Optional.
        [JsonPropertyName("level")] public string? Level { get; init; }

        // How long the course runs, in semesters. Optional: omitted means the
        // student did not say, and the course reads as ongoing.
        [JsonPropertyName("durationSemesters")] public int? DurationSemesters { get; init; }
    }

    // Body for PATCH /courses/{id}: mark a course finished or reopen it.
    public record FrontendUpdateCourseDto
    {
        [JsonPropertyName("finished")] public bool Finished { get; init; }
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

    // --- Admission / progression targets -----------------------------------
    //
    // Every field here is the student's own research. The server stores and
    // validates it; it never supplies a requirement of its own.

    public record FrontendAdmissionRequirementDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("unitId")] public string UnitId { get; init; } = "";
        [JsonPropertyName("minimumPercent")] public int MinimumPercent { get; init; }
        [JsonPropertyName("goalId")] public string? GoalId { get; init; }
    }

    public record FrontendAdmissionTargetDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("institution")] public string Institution { get; init; } = "";
        [JsonPropertyName("programme")] public string Programme { get; init; } = "";
        [JsonPropertyName("kind")] public string Kind { get; init; } = "";
        [JsonPropertyName("stage")] public string? Stage { get; init; }
        [JsonPropertyName("overallUnit")] public string? OverallUnit { get; init; }
        [JsonPropertyName("overallRequired")] public int? OverallRequired { get; init; }
        [JsonPropertyName("deadline")] public DateTime? Deadline { get; init; }
        [JsonPropertyName("sourceNote")] public string? SourceNote { get; init; }
        [JsonPropertyName("status")] public string Status { get; init; } = "";
        [JsonPropertyName("createdAt")] public DateTime CreatedAt { get; init; }
        [JsonPropertyName("requirements")] public IList<FrontendAdmissionRequirementDto> Requirements { get; init; } = [];
    }

    public record FrontendAdmissionRequirementInputDto
    {
        [JsonPropertyName("unitId")] public string UnitId { get; init; } = "";
        [JsonPropertyName("minimumPercent")] public int MinimumPercent { get; init; }
    }

    public record FrontendCreateAdmissionTargetDto
    {
        [JsonPropertyName("institution")] public string Institution { get; init; } = "";
        [JsonPropertyName("programme")] public string Programme { get; init; } = "";
        [JsonPropertyName("kind")] public string? Kind { get; init; }
        [JsonPropertyName("stage")] public string? Stage { get; init; }
        [JsonPropertyName("overallUnit")] public string? OverallUnit { get; init; }
        [JsonPropertyName("overallRequired")] public int? OverallRequired { get; init; }
        [JsonPropertyName("deadline")] public DateTime? Deadline { get; init; }
        [JsonPropertyName("sourceNote")] public string? SourceNote { get; init; }
        [JsonPropertyName("requirements")] public IList<FrontendAdmissionRequirementInputDto>? Requirements { get; init; }
    }

    public record FrontendUpdateAdmissionTargetDto
    {
        [JsonPropertyName("institution")] public string? Institution { get; init; }
        [JsonPropertyName("programme")] public string? Programme { get; init; }
        [JsonPropertyName("kind")] public string? Kind { get; init; }
        [JsonPropertyName("stage")] public string? Stage { get; init; }
        [JsonPropertyName("overallUnit")] public string? OverallUnit { get; init; }
        [JsonPropertyName("overallRequired")] public int? OverallRequired { get; init; }
        [JsonPropertyName("deadline")] public DateTime? Deadline { get; init; }
        [JsonPropertyName("sourceNote")] public string? SourceNote { get; init; }
        [JsonPropertyName("status")] public string? Status { get; init; }
        // Full replacement of the granular list when present. Omit to leave the
        // requirements untouched; send [] to clear them.
        [JsonPropertyName("requirements")] public IList<FrontendAdmissionRequirementInputDto>? Requirements { get; init; }
    }

    // Links a generated goal back to the requirement it came from, so
    // generating twice does not produce duplicates.
    public record FrontendLinkRequirementGoalDto
    {
        [JsonPropertyName("goalId")] public string? GoalId { get; init; }
    }
}
