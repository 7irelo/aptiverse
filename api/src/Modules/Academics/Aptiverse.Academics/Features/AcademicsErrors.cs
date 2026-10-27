using Aptiverse.SharedKernel.Results;

namespace Aptiverse.Academics.Features;

internal static class AcademicsErrors
{
    // Same answer for "does not exist" and "belongs to someone else", so ids cannot be probed.
    public static readonly Error UnitNotFound =
        Error.NotFound("academics.unit_not_found", "The study unit was not found.");

    public static readonly Error AssessmentNotFound =
        Error.NotFound("academics.assessment_not_found", "The assessment was not found.");

    public static readonly Error SubjectNotFound =
        Error.NotFound("academics.subject_not_found", "One or more subjects are not offered for your curriculum and grade.");

    public static readonly Error HighSchoolOnly = Error.Forbidden(
        "academics.stage_mismatch",
        "Only high school students who have finished onboarding can add CAPS subjects.");

    public static readonly Error TertiaryOnly = Error.Forbidden(
        "academics.stage_mismatch",
        "Only university students who have finished onboarding can add courses.");

    public static readonly Error AlreadyEnrolled =
        Error.Conflict("academics.already_enrolled", "You are already enrolled in this course.");

    public static readonly Error ConcurrencyConflict = Error.Conflict(
        "academics.concurrency_conflict",
        "This item changed since you loaded it. Reload it and try again.");

    public static readonly Error DurationNotAllowed = Error.Validation(
        "academics.duration_not_allowed",
        "Duration applies to university courses only.",
        new Dictionary<string, string[]> { ["duration"] = ["Duration applies to university courses only."] });

    public static readonly Error TermNotAllowed = Error.Validation(
        "academics.term_not_allowed",
        "Term applies to high school subjects only.",
        new Dictionary<string, string[]> { ["term"] = ["Term applies to high school subjects only."] });

    public static readonly Error LevelRequired = Error.Validation(
        "academics.level_required",
        "Choose the level of this course.",
        new Dictionary<string, string[]> { ["level"] = ["Choose the level of this course."] });

    public static Error TooManyUnits(int max) =>
        Error.Conflict("academics.too_many_units", $"You can have at most {max} active subjects or courses.");

    public static Error TooManyAssessments(int max) =>
        Error.Conflict("academics.too_many_assessments", $"A subject or course can have at most {max} assessments.");

    public static Error UnitHasMarks(int gradedCount) => Error.Conflict(
        "academics.unit_has_marks",
        $"This unit has {gradedCount} marked assessments that will be deleted with it. Confirm to remove it.");
}
