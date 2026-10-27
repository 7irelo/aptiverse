using Aptiverse.AiTutor.Contracts;
using Aptiverse.Practice.Domain;

namespace Aptiverse.Practice.Generation;

/// <summary>
/// Turns a generated paper into question rows. Generated output is untrusted: a question with an unknown type,
/// marks out of range, an empty stem, or multiple choice options that do not have exactly one correct answer is
/// dropped, and text is trimmed to the column limits. At most <see cref="PracticeTest.MaxQuestions"/> are kept.
/// </summary>
internal static class PaperMapper
{
    public const string DefaultTopic = "General";

    public static IReadOnlyList<Question> Map(Guid testId, GeneratedPaper paper)
    {
        ArgumentNullException.ThrowIfNull(paper);
        var questions = new List<Question>();
        foreach (var section in paper.Sections ?? [])
        {
            foreach (var generated in section?.Questions ?? [])
            {
                if (questions.Count >= PracticeTest.MaxQuestions)
                {
                    return questions;
                }

                if (generated is not null && TryMap(testId, questions.Count + 1, section!.Name, generated) is { } question)
                {
                    questions.Add(question);
                }
            }
        }

        return questions;
    }

    private static Question? TryMap(Guid testId, int position, string? sectionName, GeneratedQuestion q)
    {
        var kind = q.Type?.Trim() ?? string.Empty;
        var stem = Clean(q.Stem, Question.StemMaxLength);
        if (!QuestionKinds.All.Contains(kind) || q.Marks is < Question.MinMarks or > Question.MaxMarks || stem.Length == 0)
        {
            return null;
        }

        var answer = Clean(q.Answer, Question.ExpectedAnswerMaxLength);
        var memo = Clean(q.Memo, Question.MemoMaxLength);
        var explanation = Clean(q.Explanation, Question.ExplanationMaxLength);
        var topic = Clean(q.Topic, Question.TopicMaxLength);
        var section = Clean(sectionName, Question.SectionMaxLength);
        var cognitive = Clean(q.CognitiveLevel, Question.CognitiveLevelMaxLength);

        List<string> options = [];
        int? answerIndex = null;
        string? expected = answer.Length == 0 ? null : answer;

        switch (kind)
        {
            case QuestionKinds.Mcq:
                var raw = q.Options ?? [];
                if (raw.Count is < Question.MinOptions or > Question.MaxOptions || raw.Count(o => o is { Correct: true }) != 1)
                {
                    return null;
                }

                options = raw.Select(o => Clean(o?.Text, Question.OptionMaxLength)).ToList();
                if (options.Any(o => o.Length == 0))
                {
                    return null;
                }

                answerIndex = raw.ToList().FindIndex(o => o is { Correct: true });
                break;

            case QuestionKinds.Flashcard:
                // The back of the card: the answer, or the memo when the generator put it there.
                expected ??= memo.Length == 0 ? null : Clean(memo, Question.ExpectedAnswerMaxLength);
                if (expected is null)
                {
                    return null;
                }

                break;

            case QuestionKinds.Numeric when expected is null:
                return null;

            default:
                // A written answer cannot be marked without a memo.
                if (memo.Length == 0 && expected is null)
                {
                    return null;
                }

                break;
        }

        return Question.Create(
            testId,
            position,
            kind,
            stem,
            options,
            answerIndex,
            expected,
            memo,
            explanation,
            topic.Length == 0 ? DefaultTopic : topic,
            cognitive.Length == 0 ? null : cognitive,
            q.Marks,
            section.Length == 0 ? null : section);
    }

    private static string Clean(string? text, int max)
    {
        var trimmed = text?.Trim() ?? string.Empty;
        return trimmed.Length <= max ? trimmed : trimmed[..max].TrimEnd();
    }
}
