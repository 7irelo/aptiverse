using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Practice.Domain;

/// <summary>
/// One generated question. The answer key (answer index, expected answer, memo and explanation) is stored here and
/// leaves the API only in results, after the attempt is submitted.
/// </summary>
internal sealed class Question : Entity
{
    public const int KindMaxLength = 16;
    public const int StemMaxLength = 4000;
    public const int OptionMaxLength = 600;
    public const int MinOptions = 2;
    public const int MaxOptions = 6;
    public const int ExpectedAnswerMaxLength = 2000;
    public const int MemoMaxLength = 6000;
    public const int ExplanationMaxLength = 4000;
    public const int TopicMaxLength = 120;
    public const int SectionMaxLength = 80;
    public const int CognitiveLevelMaxLength = 24;
    public const int MinMarks = 1;
    public const int MaxMarks = 50;

    private Question()
    {
    }

    public Guid TestId { get; private set; }

    public int Position { get; private set; }

    public string Kind { get; private set; } = QuestionKinds.Mcq;

    public string Stem { get; private set; } = string.Empty;

    public List<string> Options { get; private set; } = [];

    public int? AnswerIndex { get; private set; }

    /// <summary>The final answer; for a flashcard, the back of the card.</summary>
    public string? ExpectedAnswer { get; private set; }

    public string Memo { get; private set; } = string.Empty;

    public string Explanation { get; private set; } = string.Empty;

    public string Topic { get; private set; } = string.Empty;

    public string? CognitiveLevel { get; private set; }

    public int Marks { get; private set; }

    public string? Section { get; private set; }

    public static Question Create(
        Guid testId,
        int position,
        string kind,
        string stem,
        IReadOnlyList<string> options,
        int? answerIndex,
        string? expectedAnswer,
        string memo,
        string explanation,
        string topic,
        string? cognitiveLevel,
        int marks,
        string? section)
    {
        ArgumentNullException.ThrowIfNull(options);
        return new()
        {
            TestId = testId,
            Position = position,
            Kind = kind,
            Stem = stem,
            Options = [.. options],
            AnswerIndex = answerIndex,
            ExpectedAnswer = expectedAnswer,
            Memo = memo,
            Explanation = explanation,
            Topic = topic,
            CognitiveLevel = cognitiveLevel,
            Marks = marks,
            Section = section,
        };
    }
}
