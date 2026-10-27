namespace Aptiverse.Progress.Domain;

/// <summary>One live observation as the formula sees it.</summary>
internal sealed record ObservationPoint(int QuestionsTotal, decimal QuestionsCorrect, DateTimeOffset ObservedAt);

/// <summary>A computed mastery value; every field is null or zero together when there is no evidence.</summary>
internal sealed record MasteryValue(decimal? Score, string? Band, int EvidenceQuestions, int ObservationCount, bool EarlyRead, DateTimeOffset? LastEvidenceAt)
{
    public static readonly MasteryValue None = new(null, null, 0, 0, false, null);
}

/// <summary>
/// The explainable aggregate (BE-PRG-10): recency-weighted accuracy
/// <c>score = sum(w * correct) / sum(w * total)</c> with <c>w = 0.5 ^ (age_days / 30)</c>, so evidence a month old
/// counts half as much as today's. Bands at 0.50, 0.70 and 0.85. Under 5 questions the score is an early read.
/// </summary>
internal static class MasteryMath
{
    public const double HalfLifeDays = 30;
    public const int EarlyReadBelowQuestions = 5;
    public const decimal TrendThreshold = 0.05m;

    public static MasteryValue Compute(IReadOnlyCollection<ObservationPoint> observations, DateTimeOffset now)
    {
        ArgumentNullException.ThrowIfNull(observations);
        var usable = observations.Where(o => o.QuestionsTotal > 0).ToList();
        if (usable.Count == 0)
        {
            return MasteryValue.None;
        }

        double weightedCorrect = 0;
        double weightedTotal = 0;
        foreach (var o in usable)
        {
            var ageDays = Math.Max(0, (now - o.ObservedAt).TotalDays);
            var w = Math.Pow(0.5, ageDays / HalfLifeDays);
            weightedCorrect += w * (double)Math.Clamp(o.QuestionsCorrect, 0m, o.QuestionsTotal);
            weightedTotal += w * o.QuestionsTotal;
        }

        var score = weightedTotal <= 0
            ? 0m
            : Math.Round(Math.Clamp((decimal)(weightedCorrect / weightedTotal), 0m, 1m), 4, MidpointRounding.AwayFromZero);
        var questions = usable.Sum(o => o.QuestionsTotal);
        return new MasteryValue(score, BandOf(score), questions, usable.Count, questions < EarlyReadBelowQuestions, usable.Max(o => o.ObservedAt));
    }

    public static string? BandOf(decimal? score) => score switch
    {
        null => null,
        < 0.50m => MasteryBands.Emerging,
        < 0.70m => MasteryBands.Developing,
        < 0.85m => MasteryBands.Secure,
        _ => MasteryBands.Mastered,
    };

    /// <summary>"up", "down" or "steady" against the previous score; null when either is missing.</summary>
    public static string? Trend(decimal? score, decimal? previous)
    {
        if (score is not { } now || previous is not { } before)
        {
            return null;
        }

        var change = now - before;
        return change >= TrendThreshold ? "up" : change <= -TrendThreshold ? "down" : "steady";
    }

    /// <summary>Evidence-weighted mean of rows with a score; null when none has one.</summary>
    public static (decimal? Score, int Questions) Combine(IEnumerable<(decimal? Score, int Questions)> rows)
    {
        ArgumentNullException.ThrowIfNull(rows);
        var scored = rows.Where(r => r.Score is not null && r.Questions > 0).ToList();
        if (scored.Count == 0)
        {
            return (null, 0);
        }

        var questions = scored.Sum(r => r.Questions);
        var score = scored.Sum(r => r.Score!.Value * r.Questions) / questions;
        return (Math.Round(score, 4, MidpointRounding.AwayFromZero), questions);
    }

    public static decimal? ToPercent(decimal? score) =>
        score is { } s ? Math.Round(s * 100m, 2, MidpointRounding.AwayFromZero) : null;
}
