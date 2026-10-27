namespace Aptiverse.Progress.Contracts;

// Integration events published by Progress through the transactional outbox. Progress values in them always come
// from the student's own graded work; nothing here carries points or rewards (decision 6).

public sealed record GoalCreated(Guid GoalId, Guid UserId, string CriteriaType, DateTimeOffset DueAt, DateTimeOffset OccurredAt);

/// <param name="GoalId">The goal.</param>
/// <param name="UserId">The student.</param>
/// <param name="Title">The goal title the student wrote.</param>
/// <param name="AchievedAt">When the evidence that achieved it was produced.</param>
/// <param name="EvidenceIds">The goal evidence rows behind the achievement.</param>
public sealed record GoalAchieved(Guid GoalId, Guid UserId, string Title, DateTimeOffset AchievedAt, IReadOnlyList<Guid> EvidenceIds);

public sealed record GoalMilestoneReached(Guid GoalId, Guid UserId, int Position, string Title, DateTimeOffset OccurredAt);

public sealed record GoalAbandoned(Guid GoalId, Guid UserId, DateTimeOffset OccurredAt);

public sealed record GoalExpired(Guid GoalId, Guid UserId, DateTimeOffset OccurredAt);

/// <summary>A topic's mastery band changed. <paramref name="Topic"/> is empty for the whole-unit mark row.</summary>
public sealed record MasteryUpdated(
    Guid UserId,
    Guid StudyUnitId,
    string Topic,
    decimal? Score,
    string? Band,
    string? PreviousBand,
    DateTimeOffset OccurredAt);
