namespace Aptiverse.Academics.Domain;

/// <summary>What the weighting needs from one assessment.</summary>
internal readonly record struct WeightedItem(decimal? WeightPercent, bool IsGraded, decimal? Percent, decimal? PredictedPercent);

/// <summary>
/// A unit's standing from its assessments. Percents are null when there is no evidence, never zero, so "no marks
/// yet" is never shown as failing.
/// </summary>
internal sealed record WeightingResult(
    decimal? CurrentPercent,
    decimal? PredictedPercent,
    decimal GradedWeightPercent,
    decimal WeightTotalPercent,
    int GradedCount,
    int AssessmentCount,
    IReadOnlyList<string> Warnings);

/// <summary>
/// The weighting toward a predicted result (high school) or a 0 to 100 projection (tertiary, no 4.0 GPA in v1).
/// Pure, so every case is unit tested.
/// </summary>
internal static class UnitWeighting
{
    public const string TotalAbove100 = "total_above_100";
    public const string MissingWeights = "missing_weights";

    public static WeightingResult Compute(IReadOnlyCollection<WeightedItem> items)
    {
        ArgumentNullException.ThrowIfNull(items);

        var graded = items.Where(i => i.IsGraded && i.Percent is not null).ToList();
        var current = Average(graded.Select(i => (i.WeightPercent, i.Percent!.Value)).ToList());

        var forecast = graded.Select(i => (i.WeightPercent, i.Percent!.Value))
            .Concat(items.Where(i => !i.IsGraded && i.PredictedPercent is not null).Select(i => (i.WeightPercent, i.PredictedPercent!.Value)))
            .ToList();
        var predicted = Average(forecast);

        var weightTotal = items.Sum(i => i.WeightPercent ?? 0m);
        var gradedWeight = graded.Sum(i => i.WeightPercent ?? 0m);

        var warnings = new List<string>();
        if (weightTotal > 100m)
        {
            warnings.Add(TotalAbove100);
        }

        var weighted = items.Count(i => i.WeightPercent is not null);
        if (weighted > 0 && weighted < items.Count)
        {
            warnings.Add(MissingWeights);
        }

        return new WeightingResult(current, predicted, gradedWeight, weightTotal, graded.Count, items.Count, warnings);
    }

    /// <summary>
    /// Weight-normalised average over the items that carry a positive weight; a plain average when none does.
    /// </summary>
    private static decimal? Average(List<(decimal? Weight, decimal Percent)> values)
    {
        if (values.Count == 0)
        {
            return null;
        }

        var weighted = values.Where(v => v.Weight is > 0m).ToList();
        var result = weighted.Count > 0
            ? weighted.Sum(v => v.Weight!.Value * v.Percent) / weighted.Sum(v => v.Weight!.Value)
            : values.Average(v => v.Percent);

        return Math.Round(result, 2, MidpointRounding.AwayFromZero);
    }
}
