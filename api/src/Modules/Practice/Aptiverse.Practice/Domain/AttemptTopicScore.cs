using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Practice.Domain;

/// <summary>Accuracy on one topic in one graded attempt. Feeds the weakest topic choice and the graded event.</summary>
internal sealed class AttemptTopicScore : Entity
{
    private AttemptTopicScore()
    {
    }

    public Guid AttemptId { get; private set; }

    public Guid UserId { get; private set; }

    public Guid StudyUnitId { get; private set; }

    public string Topic { get; private set; } = string.Empty;

    public int QuestionsTotal { get; private set; }

    public int QuestionsCorrect { get; private set; }

    /// <summary>Excludes answers not marked yet.</summary>
    public int MarksAvailable { get; private set; }

    public int MarksAwarded { get; private set; }

    public static AttemptTopicScore From(Attempt attempt, TopicTally tally)
    {
        ArgumentNullException.ThrowIfNull(attempt);
        ArgumentNullException.ThrowIfNull(tally);
        return new()
        {
            AttemptId = attempt.Id,
            UserId = attempt.UserId,
            StudyUnitId = attempt.StudyUnitId,
            Topic = tally.Topic,
            QuestionsTotal = tally.QuestionsTotal,
            QuestionsCorrect = tally.QuestionsCorrect,
            MarksAvailable = tally.MarksAvailable,
            MarksAwarded = tally.MarksAwarded,
        };
    }
}
