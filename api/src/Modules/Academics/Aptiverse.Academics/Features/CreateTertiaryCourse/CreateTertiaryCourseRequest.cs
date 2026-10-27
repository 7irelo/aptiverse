namespace Aptiverse.Academics.Features.CreateTertiaryCourse;

/// <summary>A course to add. The institution comes from your profile: a catalog institution shares the course.</summary>
/// <param name="Name">2 to 160 characters.</param>
/// <param name="CourseCode">Optional, 2 to 32 letters, digits, spaces or hyphens, for example "MAM1000W".</param>
/// <param name="Level">"first_year" to "phd"; defaults to your year of study when it maps to one.</param>
/// <param name="Duration">Optional "semester" or "full_year".</param>
/// <param name="StartedOn">Optional; within the last 6 years and at most 1 year ahead. Defaults to today.</param>
/// <param name="LecturerName">Optional, at most 120 characters.</param>
internal sealed record CreateTertiaryCourseRequest(
    string? Name,
    string? CourseCode,
    string? Level,
    string? Duration,
    DateOnly? StartedOn,
    string? LecturerName);
