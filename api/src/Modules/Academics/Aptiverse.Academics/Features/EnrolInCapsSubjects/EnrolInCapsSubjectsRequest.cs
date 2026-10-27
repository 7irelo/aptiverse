using Aptiverse.Academics.Features.Common;

namespace Aptiverse.Academics.Features.EnrolInCapsSubjects;

/// <summary>The subjects to add. Grade and curriculum come from your profile, never from the request.</summary>
/// <param name="Subjects">1 to 12 distinct catalog subjects offered for your curriculum and grade.</param>
internal sealed record EnrolInCapsSubjectsRequest(IReadOnlyList<CapsSubjectChoice>? Subjects);

/// <param name="SubjectId">A catalog subject id from getSubjectCatalog.</param>
/// <param name="TeacherName">Optional, at most 120 characters.</param>
internal sealed record CapsSubjectChoice(Guid SubjectId, string? TeacherName);

internal sealed record EnrolInCapsSubjectsResponse(IReadOnlyList<EnrolledUnit> Enrolments);

/// <param name="AlreadyEnrolled">True when you were already enrolled; the enrolment is returned unchanged.</param>
/// <param name="Unit">The enrolment and its unit.</param>
internal sealed record EnrolledUnit(bool AlreadyEnrolled, UnitSummary Unit);
