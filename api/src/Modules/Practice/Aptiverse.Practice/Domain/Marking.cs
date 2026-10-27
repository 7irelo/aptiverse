using System.Globalization;

namespace Aptiverse.Practice.Domain;

/// <summary>One question's outcome for tallying. Pending answers are not marked yet and never count as zero.</summary>
internal sealed record MarkedQuestion(string Topic, int Marks, bool IsCorrect, int Awarded, bool Pending);

/// <summary>Per-topic totals of one attempt.</summary>
internal sealed record TopicTally(string Topic, int QuestionsTotal, int QuestionsCorrect, int MarksAvailable, int MarksAwarded);

/// <summary>Pure marking rules: objective questions, per-topic totals, percentages and time on task.</summary>
internal static class Marking
{
    public const string NoAnswerFeedback = "No answer was given.";
    public const string CorrectFeedback = "Correct.";

    /// <summary>Marks a multiple choice question by exact option index.</summary>
    public static (bool Correct, int Awarded, string Feedback) MarkChoice(Question question, int? selectedIndex)
    {
        ArgumentNullException.ThrowIfNull(question);
        if (selectedIndex is null)
        {
            return (false, 0, NoAnswerFeedback);
        }

        var correct = question.AnswerIndex is { } key && key == selectedIndex;
        return correct
            ? (true, question.Marks, CorrectFeedback)
            : (false, 0, $"The correct option is {OptionLabel(question.AnswerIndex ?? 0)}.");
    }

    public static string OptionLabel(int index) => ((char)('A' + Math.Clamp(index, 0, 25))).ToString(CultureInfo.InvariantCulture);

    /// <summary>
    /// Totals per topic in first-seen order. Pending answers count towards the question total but not towards marks
    /// available, so a mark that failed is "not marked yet" rather than zero.
    /// </summary>
    public static IReadOnlyList<TopicTally> Tally(IEnumerable<MarkedQuestion> questions)
    {
        ArgumentNullException.ThrowIfNull(questions);
        return questions
            .GroupBy(q => q.Topic, StringComparer.Ordinal)
            .Select(g => new TopicTally(
                g.Key,
                g.Count(),
                g.Count(q => !q.Pending && q.IsCorrect),
                g.Where(q => !q.Pending).Sum(q => q.Marks),
                g.Where(q => !q.Pending).Sum(q => Math.Clamp(q.Awarded, 0, q.Marks))))
            .ToList();
    }

    /// <summary>Two decimals, half away from zero; 0 when nothing was available.</summary>
    public static decimal Percent(int awarded, int available) =>
        available <= 0 ? 0m : Math.Round(Math.Clamp(awarded, 0, available) * 100m / available, 2, MidpointRounding.AwayFromZero);

    /// <summary>Elapsed time minus paused time, never negative, capped at the duration for timed attempts.</summary>
    public static int SecondsOnTask(Attempt attempt, int? durationMinutes)
    {
        ArgumentNullException.ThrowIfNull(attempt);
        if (attempt.SubmittedAt is not { } submittedAt)
        {
            return 0;
        }

        var seconds = (long)Math.Floor((submittedAt - attempt.StartedAt).TotalSeconds) - attempt.PausedSecondsTotal;
        if (attempt.IsTimed && durationMinutes is { } minutes)
        {
            seconds = Math.Min(seconds, minutes * 60L);
        }

        return (int)Math.Clamp(seconds, 0, int.MaxValue);
    }
}
