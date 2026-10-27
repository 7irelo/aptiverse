namespace Aptiverse.Academics.Contracts;

/// <summary>
/// A student's study units for other modules (AiTutor, Practice, Progress). High school CAPS subjects and
/// tertiary courses sit behind one study unit id, so callers never branch on the stage to find a unit.
/// </summary>
public interface IStudyUnitLookup
{
    /// <summary>The user's active enrolments, ordered as the student ordered them. Empty when there are none.</summary>
    Task<IReadOnlyList<StudyUnitContext>> GetForUserAsync(Guid userId, CancellationToken cancellationToken);

    /// <summary>Null when the unit does not exist or the user has no active enrolment in it.</summary>
    Task<StudyUnitContext?> GetAsync(Guid studyUnitId, Guid userId, CancellationToken cancellationToken);
}

/// <param name="StudyUnitId">The unit, shared by every student enrolled in it.</param>
/// <param name="Kind">"caps_subject" or "tertiary_course".</param>
/// <param name="Stage">"high_school" or "university", matching the Identity student profile stage.</param>
/// <param name="Name">The CAPS subject name, or the course name the first student entered.</param>
/// <param name="Level">"grade_8" to "grade_12" for CAPS subjects; "first_year" to "phd" for courses.</param>
/// <param name="Curriculum">The exam body ("nsc" or "ieb") for CAPS subjects, otherwise null.</param>
/// <param name="KnownTopics">Up to 50 canonical topic names of the unit, sorted by name.</param>
/// <param name="EnrolmentId">This student's enrolment in the unit.</param>
/// <param name="OpenAssessments">Up to 20 scheduled or in progress assessments, soonest due first.</param>
public sealed record StudyUnitContext(
    Guid StudyUnitId,
    string Kind,
    string Stage,
    string Name,
    string Level,
    string? Curriculum,
    IReadOnlyList<string> KnownTopics,
    Guid EnrolmentId,
    IReadOnlyList<OpenAssessmentRef> OpenAssessments);

public sealed record OpenAssessmentRef(Guid AssessmentId, string Title, DateTimeOffset DueAt);
