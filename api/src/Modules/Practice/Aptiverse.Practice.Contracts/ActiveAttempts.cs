namespace Aptiverse.Practice.Contracts;

/// <summary>
/// Answers "is this student in the middle of a practice test" for other modules. AiTutor refuses tutor help while
/// this returns an attempt, so the tutor cannot be used to answer a test in progress.
/// </summary>
public interface IActiveAttemptLookup
{
    /// <summary>
    /// The student's in progress or paused attempt, or null. A timed attempt past its deadline plus the network
    /// grace, or an untimed attempt idle for longer than the configured window, no longer counts as active.
    /// </summary>
    Task<ActiveAttempt?> GetActiveAttemptAsync(Guid userId, CancellationToken cancellationToken);
}

public sealed record ActiveAttempt(Guid AttemptId, Guid TestId, DateTimeOffset? DeadlineAt, bool Paused);
