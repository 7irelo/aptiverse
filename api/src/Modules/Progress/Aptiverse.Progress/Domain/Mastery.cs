using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Progress.Domain;

/// <summary>
/// One piece of mastery evidence: a topic's questions in one graded practice attempt, or one recorded assessment
/// mark for the whole unit. Append-only: a changed or removed mark supersedes its row instead of editing it, so
/// every score can be rebuilt from the rows that were live at the time.
/// </summary>
internal sealed class MasteryObservation : Entity
{
    public const int SourceMaxLength = 24;

    private MasteryObservation()
    {
    }

    public Guid UserId { get; private set; }

    public Guid StudyUnitId { get; private set; }

    /// <summary>Normalised key; <see cref="TopicKeys.WholeUnit"/> for an assessment mark.</summary>
    public string TopicKey { get; private set; } = string.Empty;

    public string Topic { get; private set; } = string.Empty;

    public string SourceType { get; private set; } = string.Empty;

    public Guid SourceId { get; private set; }

    public int QuestionsTotal { get; private set; }

    /// <summary>Fractional for marks: a mark of 65% over 10 question-equivalents is 6.5 correct.</summary>
    public decimal QuestionsCorrect { get; private set; }

    /// <summary>When the student produced the evidence (attempt submitted, mark recorded); drives recency.</summary>
    public DateTimeOffset ObservedAt { get; private set; }

    /// <summary>Event time of the message that wrote the row; orders re-marks delivered out of order.</summary>
    public DateTimeOffset SourceEventAt { get; private set; }

    public DateTimeOffset? SupersededAt { get; private set; }

    public Guid? SupersededById { get; private set; }

    public bool IsLive => SupersededAt is null;

    public static MasteryObservation ForPractice(
        Guid userId,
        Guid studyUnitId,
        string topic,
        Guid attemptId,
        int questionsTotal,
        int questionsCorrect,
        DateTimeOffset submittedAt,
        DateTimeOffset eventAt) => new()
        {
            UserId = userId,
            StudyUnitId = studyUnitId,
            TopicKey = TopicKeys.Key(topic),
            Topic = TopicKeys.Display(topic),
            SourceType = ObservationSources.PracticeAttempt,
            SourceId = attemptId,
            QuestionsTotal = questionsTotal,
            QuestionsCorrect = Math.Clamp(questionsCorrect, 0, questionsTotal),
            ObservedAt = StoredTime.Of(submittedAt),
            SourceEventAt = StoredTime.Of(eventAt),
        };

    public static MasteryObservation ForMark(
        Guid userId,
        Guid studyUnitId,
        Guid assessmentId,
        decimal percent,
        int questionEquivalents,
        DateTimeOffset recordedAt) => new()
        {
            UserId = userId,
            StudyUnitId = studyUnitId,
            TopicKey = TopicKeys.WholeUnit,
            Topic = TopicKeys.WholeUnit,
            SourceType = ObservationSources.AssessmentGraded,
            SourceId = assessmentId,
            QuestionsTotal = questionEquivalents,
            QuestionsCorrect = Math.Round(Math.Clamp(percent, 0m, 100m) * questionEquivalents / 100m, 3, MidpointRounding.AwayFromZero),
            ObservedAt = StoredTime.Of(recordedAt),
            SourceEventAt = StoredTime.Of(recordedAt),
        };

    public void Supersede(DateTimeOffset now, Guid? byId)
    {
        SupersededAt ??= now;
        SupersededById ??= byId;
    }
}

/// <summary>
/// The projection the app reads: one row per (user, unit, topic, model). <see cref="Score"/> is null when there is
/// no live evidence, never zero.
/// </summary>
internal sealed class TopicMastery : Entity
{
    public const int CodeMaxLength = 32;

    private TopicMastery()
    {
    }

    public Guid UserId { get; private set; }

    public Guid StudyUnitId { get; private set; }

    public string TopicKey { get; private set; } = string.Empty;

    public string Topic { get; private set; } = string.Empty;

    public string Model { get; private set; } = MasteryModels.RecencyWeightedV1;

    public decimal? Score { get; private set; }

    public string? Band { get; private set; }

    public int EvidenceQuestions { get; private set; }

    public int ObservationCount { get; private set; }

    public bool EarlyRead { get; private set; }

    public decimal? PreviousScore { get; private set; }

    public DateTimeOffset? LastEvidenceAt { get; private set; }

    public bool IsWholeUnit => TopicKey.Length == 0;

    public static TopicMastery Create(Guid userId, Guid studyUnitId, string topicKey, string topic) => new()
    {
        UserId = userId,
        StudyUnitId = studyUnitId,
        TopicKey = topicKey,
        Topic = topic,
        Model = MasteryModels.RecencyWeightedV1,
    };

    /// <summary>Writes a freshly computed value. Returns true when anything visible changed.</summary>
    public bool Apply(MasteryValue value, string topic)
    {
        ArgumentNullException.ThrowIfNull(value);
        var changed = Score != value.Score || EvidenceQuestions != value.EvidenceQuestions || ObservationCount != value.ObservationCount
            || LastEvidenceAt != value.LastEvidenceAt || Topic != topic;
        if (Score != value.Score)
        {
            PreviousScore = Score;
        }

        Topic = topic;
        Score = value.Score;
        Band = value.Band;
        EvidenceQuestions = value.EvidenceQuestions;
        ObservationCount = value.ObservationCount;
        EarlyRead = value.EarlyRead;
        LastEvidenceAt = value.LastEvidenceAt;
        return changed;
    }
}
