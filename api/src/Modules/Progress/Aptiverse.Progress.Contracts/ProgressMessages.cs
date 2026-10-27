namespace Aptiverse.Progress.Contracts;

// Work messages that only the Progress module sends and handles. They live here because Wolverine handlers must be
// public and the architecture rules allow a public handler only for a Contracts message. Other modules must never
// send them.

/// <summary>Progress only: expire a goal that reached its due date without being achieved.</summary>
public sealed record ExpireProgressGoal(Guid GoalId, DateTimeOffset DueAt);
