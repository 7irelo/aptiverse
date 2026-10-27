namespace Aptiverse.Academics.Contracts;

// Integration events published by Academics through the transactional outbox. They carry ids and the few values a
// subscriber needs, never notes or other free text a student typed about themselves.

/// <summary>A student enrolled in a study unit (CAPS subject or tertiary course).</summary>
public sealed record StudyUnitEnrolled(Guid UserId, Guid StudyUnitId, Guid EnrolmentId, string Kind, string Name, DateTimeOffset OccurredAt);

/// <summary>A student removed an enrolment. Its assessments were deleted with it (one AssessmentDeleted each).</summary>
public sealed record StudyUnitUnenrolled(Guid UserId, Guid StudyUnitId, Guid EnrolmentId, DateTimeOffset OccurredAt);

public sealed record AssessmentCreated(
    Guid UserId,
    Guid AssessmentId,
    Guid StudyUnitId,
    string Title,
    string Type,
    DateTimeOffset DueAt,
    DateTimeOffset OccurredAt);

public sealed record AssessmentDueChanged(Guid UserId, Guid AssessmentId, DateTimeOffset DueAt, DateTimeOffset OccurredAt);

public sealed record AssessmentSubmitted(Guid UserId, Guid AssessmentId, Guid StudyUnitId, DateTimeOffset OccurredAt);

/// <summary>A mark was recorded or changed. Consumers treat the latest event per assessment as the truth.</summary>
public sealed record AssessmentGraded(
    Guid UserId,
    Guid AssessmentId,
    Guid StudyUnitId,
    string Type,
    decimal Percent,
    decimal? WeightPercent,
    decimal? PredictedPercent,
    DateTimeOffset GradedAt,
    DateTimeOffset OccurredAt);

public sealed record AssessmentMarkRemoved(Guid UserId, Guid AssessmentId, Guid StudyUnitId, DateTimeOffset OccurredAt);

public sealed record AssessmentDeleted(Guid UserId, Guid AssessmentId, Guid StudyUnitId, bool WasGraded, DateTimeOffset OccurredAt);

/// <summary>A new canonical topic appeared in a unit's registry. Carries no user, so it never reveals who added it.</summary>
public sealed record TopicRegistered(Guid StudyUnitId, Guid TopicId, string Name, DateTimeOffset OccurredAt);
