using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Practice.Domain;

/// <summary>
/// A practice test generated for one of the student's assessments. The study unit, its level and stage are
/// snapshots taken from the assessment at generation time, so a later change in Academics never rewrites a test.
/// Only its owner ever reads it; another user's id is a 404.
/// </summary>
internal sealed class PracticeTest : Entity
{
    public const int TitleMaxLength = 160;
    public const int SubjectMaxLength = 160;
    public const int LevelMaxLength = 40;
    public const int CodeMaxLength = 16;
    public const int TopicMaxLength = 80;
    public const int MaxTopics = 8;
    public const int MaxQuestions = 60;
    public const int MinDurationMinutes = 5;
    public const int MaxDurationMinutes = 180;

    private PracticeTest()
    {
    }

    public Guid UserId { get; private set; }

    public Guid StudyUnitId { get; private set; }

    public Guid AssessmentId { get; private set; }

    /// <summary>The unit's name at generation time; sent to the grader as the subject.</summary>
    public string SubjectSnapshot { get; private set; } = string.Empty;

    /// <summary>The unit's level key at generation time, for example "grade_12" or "first_year".</summary>
    public string LevelSnapshot { get; private set; } = string.Empty;

    public string StageSnapshot { get; private set; } = Stages.HighSchool;

    public string Title { get; private set; } = string.Empty;

    public string Format { get; private set; } = PracticeFormats.Quiz;

    public string Mode { get; private set; } = PracticeModes.Untimed;

    public int? DurationMinutes { get; private set; }

    public string Status { get; private set; } = TestStatuses.Generating;

    public string Source { get; private set; } = TestSources.Ai;

    public List<string> Topics { get; private set; } = [];

    public int QuestionCount { get; private set; }

    public string Difficulty { get; private set; } = Difficulties.Core;

    public bool FocusOnWeakest { get; private set; }

    public int TotalMarks { get; private set; }

    public bool IsTimed => Mode == PracticeModes.Timed;

    /// <summary>Flashcards are self-rated and never scored.</summary>
    public bool IsScored => Format != PracticeFormats.Flashcards;

    public static PracticeTest CreateGenerating(
        Guid userId,
        Guid studyUnitId,
        Guid assessmentId,
        string subject,
        string level,
        string stage,
        string title,
        string format,
        string mode,
        int? durationMinutes,
        IReadOnlyList<string> topics,
        string difficulty,
        bool focusOnWeakest)
    {
        ArgumentNullException.ThrowIfNull(topics);
        return new()
        {
            UserId = userId,
            StudyUnitId = studyUnitId,
            AssessmentId = assessmentId,
            SubjectSnapshot = Truncate(subject, SubjectMaxLength),
            LevelSnapshot = Truncate(level, LevelMaxLength),
            StageSnapshot = stage,
            Title = Truncate(title, TitleMaxLength),
            Format = format,
            Mode = mode,
            DurationMinutes = mode == PracticeModes.Timed ? durationMinutes : null,
            Status = TestStatuses.Generating,
            Source = TestSources.Ai,
            Topics = [.. topics.Take(MaxTopics).Select(t => Truncate(t, TopicMaxLength))],
            Difficulty = difficulty,
            FocusOnWeakest = focusOnWeakest,
        };
    }

    public void MarkReady(int questionCount, int totalMarks)
    {
        QuestionCount = questionCount;
        TotalMarks = totalMarks;
        Status = TestStatuses.Ready;
    }

    public void MarkFailed() => Status = TestStatuses.Failed;

    public void Archive() => Status = TestStatuses.Archived;

    private static string Truncate(string value, int max) => value.Length <= max ? value : value[..max];
}
