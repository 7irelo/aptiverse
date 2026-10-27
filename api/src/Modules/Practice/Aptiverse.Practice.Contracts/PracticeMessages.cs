namespace Aptiverse.Practice.Contracts;

// Work messages that only the Practice module sends and handles. They live here, not in the module, because
// Wolverine handlers must be public and the architecture rules allow a public handler only for a Contracts message.
// Other modules must never send them.

/// <summary>Practice only: call the ai service to start a queued generation job.</summary>
public sealed record StartPracticeGeneration(Guid JobId);

/// <summary>Practice only: read a running generation job's status from the ai service.</summary>
public sealed record PollPracticeGeneration(Guid JobId);

/// <summary>Practice only: submit a timed attempt that reached its deadline plus the network grace.</summary>
public sealed record AutoSubmitPracticeAttempt(Guid AttemptId, DateTimeOffset DeadlineAt);

/// <summary>Practice only: mark the written answers of a submitted attempt through the ai service.</summary>
public sealed record GradePracticeAttempt(Guid AttemptId);
