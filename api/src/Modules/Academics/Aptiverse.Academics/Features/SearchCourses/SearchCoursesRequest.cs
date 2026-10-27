namespace Aptiverse.Academics.Features.SearchCourses;

/// <param name="Q">Course name or code, 2 to 60 characters.</param>
/// <param name="Level">Optional study level, for example "first_year".</param>
/// <param name="Limit">1 to 25 results, default 10.</param>
internal sealed record SearchCoursesRequest(string? Q, string? Level, int Limit = 10);

/// <param name="UnitId">The study unit, shared by every student enrolled in it.</param>
/// <param name="Name">The display name.</param>
/// <param name="CourseCode">The course code, if the creator gave one.</param>
/// <param name="Level">"first_year" to "phd".</param>
/// <param name="EnrolledCount">Active students, rounded down to a multiple of 5; null below 5 so a small class never reveals who takes it.</param>
internal sealed record CourseOption(Guid UnitId, string Name, string? CourseCode, string Level, int? EnrolledCount);
