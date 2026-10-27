namespace Aptiverse.Progress.Contracts;

/// <summary>
/// A student's topic mastery for other modules (AiTutor context, later Family). Every value comes from the
/// student's own graded work; a topic without evidence has a null score, never zero. Another user's id simply
/// returns nothing.
/// </summary>
public interface IMasterySnapshot
{
    /// <summary>
    /// The student's weakest topics across their units, at most <paramref name="take"/> (1 to 20). Topics with at
    /// least 5 questions of evidence come first, then early reads; within each group the lowest score first.
    /// Topics without evidence are never listed.
    /// </summary>
    Task<IReadOnlyList<TopicMasteryView>> GetWeakestTopicsAsync(Guid userId, int take, CancellationToken cancellationToken);

    /// <summary>The student's mastery per topic in one unit, by topic name. Empty when there is no evidence.</summary>
    Task<IReadOnlyList<TopicMasteryView>> GetForUnitAsync(Guid userId, Guid studyUnitId, CancellationToken cancellationToken);
}

/// <param name="StudyUnitId">The study unit the topic belongs to.</param>
/// <param name="Topic">The topic as first written.</param>
/// <param name="Score">Recency-weighted accuracy, 0 to 1 with four decimals; null without evidence.</param>
/// <param name="Band">"emerging", "developing", "secure" or "mastered"; null with a null score.</param>
/// <param name="EvidenceQuestions">Questions behind the score.</param>
/// <param name="ObservationCount">Graded attempts (or marks) behind the score.</param>
/// <param name="EarlyRead">True while fewer than 5 questions back the score.</param>
/// <param name="LastEvidenceAt">When the latest evidence was produced.</param>
public sealed record TopicMasteryView(
    Guid StudyUnitId,
    string Topic,
    decimal? Score,
    string? Band,
    int EvidenceQuestions,
    int ObservationCount,
    bool EarlyRead,
    DateTimeOffset? LastEvidenceAt);
