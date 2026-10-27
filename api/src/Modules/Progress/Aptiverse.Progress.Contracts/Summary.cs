namespace Aptiverse.Progress.Contracts;

/// <summary>
/// A compact read of one student's practice results and open goals for other modules (Family's parent views). Values
/// come from the student's own graded work only. Another user's id simply returns nothing.
/// </summary>
public interface IProgressSummary
{
    /// <summary>Graded practice since <paramref name="since"/>: the count, the mean score and the latest <paramref name="take"/> (1 to 20) results.</summary>
    Task<PracticeSummary> GetPracticeAsync(Guid userId, DateTimeOffset since, int take, CancellationToken cancellationToken);

    /// <summary>The student's open goals (active or at risk) in the student's order, at most <paramref name="take"/> (1 to 20).</summary>
    Task<IReadOnlyList<ActiveGoalSummary>> GetActiveGoalsAsync(Guid userId, int take, CancellationToken cancellationToken);
}

/// <param name="Completed">Graded attempts in the window.</param>
/// <param name="AverageScorePercent">Mean score of fully graded attempts in the window; null when there are none.</param>
/// <param name="Recent">The latest results, newest first.</param>
public sealed record PracticeSummary(int Completed, decimal? AverageScorePercent, IReadOnlyList<PracticeResultSummary> Recent);

/// <param name="AttemptId">The graded attempt.</param>
/// <param name="StudyUnitId">The unit the test belongs to.</param>
/// <param name="ScorePercent">0 to 100 over the marked part.</param>
/// <param name="PartiallyGraded">True while some answers still await marking.</param>
/// <param name="GradedAt">When the attempt was graded.</param>
public sealed record PracticeResultSummary(Guid AttemptId, Guid StudyUnitId, decimal ScorePercent, bool PartiallyGraded, DateTimeOffset GradedAt);

/// <param name="GoalId">The goal.</param>
/// <param name="StudyUnitId">The unit the goal measures.</param>
/// <param name="Title">The title the student wrote.</param>
/// <param name="CriteriaType">One of the five verifiable goal types.</param>
/// <param name="Status">"active" or "at_risk".</param>
/// <param name="TargetValue">The target.</param>
/// <param name="CurrentValue">Measured from evidence; null before any evidence.</param>
/// <param name="DueAt">When the goal is due.</param>
public sealed record ActiveGoalSummary(
    Guid GoalId,
    Guid StudyUnitId,
    string Title,
    string CriteriaType,
    string Status,
    decimal TargetValue,
    decimal? CurrentValue,
    DateTimeOffset DueAt);
