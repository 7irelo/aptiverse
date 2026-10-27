namespace Aptiverse.Academics.Domain;

// Closed value sets. Each one backs a check constraint and a validator rule, so the database and the API reject
// the same values.

internal static class Curricula
{
    public const string Nsc = "nsc";
    public const string Ieb = "ieb";

    public static IReadOnlyList<string> All { get; } = [Nsc, Ieb];
}

internal static class SubjectCategories
{
    public static IReadOnlyList<string> All { get; } =
    [
        "language", "mathematics", "natural_science", "commerce", "humanities", "services", "technical", "arts", "life_orientation",
    ];
}

internal static class LanguageTypes
{
    public static IReadOnlyList<string> All { get; } = ["home", "first_additional", "second_additional"];
}

internal static class InstitutionTypes
{
    public static IReadOnlyList<string> All { get; } =
    [
        "university", "university_of_technology", "comprehensive_university", "tvet", "private_college",
    ];
}

internal static class Provinces
{
    public static IReadOnlyList<string> All { get; } =
    [
        "eastern_cape", "free_state", "gauteng", "kwazulu_natal", "limpopo", "mpumalanga", "northern_cape", "north_west", "western_cape",
    ];
}

internal static class StudyUnitKinds
{
    public const string CapsSubject = "caps_subject";
    public const string TertiaryCourse = "tertiary_course";

    public static IReadOnlyList<string> All { get; } = [CapsSubject, TertiaryCourse];
}

internal static class Stages
{
    // Matches the Identity student profile stage values.
    public const string HighSchool = "high_school";
    public const string University = "university";

    public static string For(string kind) => kind == StudyUnitKinds.CapsSubject ? HighSchool : University;
}

/// <summary>Study level of a tertiary course (decision 19): first year to PhD, no NQF levels.</summary>
internal static class TertiaryLevels
{
    public static IReadOnlyList<string> All { get; } =
    [
        "first_year", "second_year", "third_year", "fourth_year", "honours", "masters", "phd",
    ];

    /// <summary>The default level for a year of study from the profile, when it maps to one.</summary>
    public static string? FromYearOfStudy(int? year) => year switch
    {
        1 => "first_year",
        2 => "second_year",
        3 => "third_year",
        4 => "fourth_year",
        _ => null,
    };
}

internal static class EnrolmentStatuses
{
    public const string Active = "active";
    public const string Completed = "completed";
    public const string Dropped = "dropped";
    public const string StageMismatch = "stage_mismatch";

    public static IReadOnlyList<string> All { get; } = [Active, Completed, Dropped, StageMismatch];
}

internal static class Durations
{
    public const string Semester = "semester";
    public const string FullYear = "full_year";

    public static IReadOnlyList<string> All { get; } = [Semester, FullYear];
}

/// <summary>Design token names a student may pick for a unit chip.</summary>
internal static class ColourTokens
{
    public static IReadOnlyList<string> All { get; } =
    [
        "citron", "graphite", "sky", "mint", "rose", "amber", "violet", "teal", "coral", "slate",
    ];
}

internal static class TopicSources
{
    public const string Generation = "generation";
    public const string Student = "student";
    public const string Admin = "admin";
    public const string Migration = "migration";

    public static IReadOnlyList<string> All { get; } = [Generation, Student, Admin, Migration];
}

internal static class AssessmentTypes
{
    // The offered subset per stage is a client concern; the server rejects only unknown values.
    public static IReadOnlyList<string> All { get; } =
    [
        "test", "essay", "investigation", "practical", "exam", "project", "oral", "assignment", "class_test", "tutorial",
        "lab_report", "midterm", "presentation",
    ];
}

internal static class AssessmentStates
{
    public const string Scheduled = "scheduled";
    public const string InProgress = "in_progress";
    public const string Submitted = "submitted";
    public const string Graded = "graded";

    public static IReadOnlyList<string> All { get; } = [Scheduled, InProgress, Submitted, Graded];

    public static IReadOnlyList<string> Open { get; } = [Scheduled, InProgress];
}

internal static class TransitionActions
{
    public const string Start = "start";
    public const string Submit = "submit";
    public const string Reopen = "reopen";
    public const string RemoveMark = "remove_mark";

    /// <summary>Not a transition request value: recording a mark has its own route, but it is an allowed action.</summary>
    public const string Mark = "mark";

    public static IReadOnlyList<string> All { get; } = [Start, Submit, Reopen, RemoveMark];
}
