using System.Diagnostics.Metrics;

namespace Aptiverse.Progress;

/// <summary>Progress counters. Tags are low-cardinality values only, never ids, topics or scores.</summary>
internal static class ProgressMetrics
{
    public const string MeterName = "Aptiverse.Progress";

    private static readonly Meter Meter = new(MeterName);

    private static readonly Counter<long> GoalsCreated =
        Meter.CreateCounter<long>("aptiverse.progress.goals.created", description: "Goals created");

    private static readonly Counter<long> GoalsAchieved =
        Meter.CreateCounter<long>("aptiverse.progress.goals.achieved", description: "Goals achieved from evidence");

    private static readonly Counter<long> GoalsAbandoned =
        Meter.CreateCounter<long>("aptiverse.progress.goals.abandoned", description: "Goals abandoned");

    private static readonly Counter<long> BaselineRefusals =
        Meter.CreateCounter<long>("aptiverse.progress.baseline_refusals", description: "Targets refused by the baseline rule");

    private static readonly Counter<long> BaselineLookups =
        Meter.CreateCounter<long>("aptiverse.progress.goals.baseline_lookups", description: "Baseline lookups from the goal form");

    private static readonly Counter<long> Recomputed =
        Meter.CreateCounter<long>("aptiverse.progress.mastery.recomputed", description: "Topic mastery rows that changed");

    private static readonly Histogram<double> Lag =
        Meter.CreateHistogram<double>("aptiverse.progress.event_lag_seconds", unit: "s", description: "Event occurred to projected");

    public static void GoalCreated(string criteriaType) => GoalsCreated.Add(1, new KeyValuePair<string, object?>("criteria_type", criteriaType));

    public static void GoalAchieved(string criteriaType) => GoalsAchieved.Add(1, new KeyValuePair<string, object?>("criteria_type", criteriaType));

    public static void GoalAbandoned() => GoalsAbandoned.Add(1);

    public static void BaselineRefused() => BaselineRefusals.Add(1);

    public static void BaselineLookup(string criteriaType) => BaselineLookups.Add(1, new KeyValuePair<string, object?>("criteria_type", criteriaType));

    public static void MasteryRecomputed(int count)
    {
        if (count > 0)
        {
            Recomputed.Add(count);
        }
    }

    public static void EventLag(TimeSpan lag) => Lag.Record(Math.Max(0, lag.TotalSeconds));
}
