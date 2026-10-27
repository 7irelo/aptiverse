namespace Aptiverse.Academics.Contracts;

/// <summary>A student's assessments for other modules. Another user's assessment is always null or absent.</summary>
public interface IAssessmentLookup
{
    /// <summary>The user's scheduled or in progress assessments in active enrolments, soonest due first (at most 100).</summary>
    Task<IReadOnlyList<OpenAssessment>> GetOpenForUserAsync(Guid userId, CancellationToken cancellationToken);

    /// <summary>Null when the assessment does not exist or belongs to someone else.</summary>
    Task<AssessmentContext?> GetForUserAsync(Guid userId, Guid assessmentId, CancellationToken cancellationToken);
}

public sealed record OpenAssessment(Guid AssessmentId, string Title, Guid StudyUnitId, string UnitName, DateTimeOffset DueAt);

/// <param name="AssessmentId">The assessment.</param>
/// <param name="StudyUnitId">The unit the assessment belongs to.</param>
/// <param name="UnitName">The unit's display name.</param>
/// <param name="Title">The title the student gave it.</param>
/// <param name="Type">The assessment type, for example "test" or "lab_report".</param>
/// <param name="State">"scheduled", "in_progress", "submitted" or "graded".</param>
/// <param name="DueAt">When it is due, in UTC.</param>
/// <param name="UnitTopics">The unit's canonical topics, sorted by name (at most 200).</param>
public sealed record AssessmentContext(
    Guid AssessmentId,
    Guid StudyUnitId,
    string UnitName,
    string Title,
    string Type,
    string State,
    DateTimeOffset DueAt,
    IReadOnlyList<TopicRef> UnitTopics);
