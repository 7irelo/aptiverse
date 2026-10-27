using System.Diagnostics.Metrics;

namespace Aptiverse.Practice;

/// <summary>Practice counters. Tags are low-cardinality values only, never ids, answers or scores.</summary>
internal static class PracticeMetrics
{
    public const string MeterName = "Aptiverse.Practice";

    private static readonly Meter Meter = new(MeterName);

    private static readonly Counter<long> GenerationRequested =
        Meter.CreateCounter<long>("aptiverse.practice.generation.requested", description: "Practice tests requested");

    private static readonly Counter<long> GenerationFailures =
        Meter.CreateCounter<long>("aptiverse.practice.generation.failures", description: "Generation jobs that failed");

    private static readonly Counter<long> AttemptsStarted =
        Meter.CreateCounter<long>("aptiverse.practice.attempts.started", description: "Attempts started");

    private static readonly Counter<long> AttemptsSubmitted =
        Meter.CreateCounter<long>("aptiverse.practice.attempts.submitted", description: "Attempts submitted");

    private static readonly Counter<long> AnswersSaved =
        Meter.CreateCounter<long>("aptiverse.practice.answers.saved", description: "Answers saved");

    private static readonly Counter<long> AnswersRejectedLate =
        Meter.CreateCounter<long>("aptiverse.practice.answers.rejected_late", description: "Saves refused after the deadline plus grace");

    private static readonly Counter<long> FocusLosses =
        Meter.CreateCounter<long>("aptiverse.practice.focus_loss", description: "Focus losses counted");

    private static readonly Counter<long> TestsArchived =
        Meter.CreateCounter<long>("aptiverse.practice.tests.archived", description: "Tests archived or deleted");

    private static readonly Counter<long> GradingPendingReview =
        Meter.CreateCounter<long>("aptiverse.practice.grading.pending_review", description: "Written answers flagged for review");

    private static readonly Histogram<int> SecondsOnTask =
        Meter.CreateHistogram<int>("aptiverse.practice.attempt.seconds_on_task", unit: "s", description: "Time on task per attempt");

    public static void Requested(string mode, string stage) =>
        GenerationRequested.Add(1, new KeyValuePair<string, object?>("mode", mode), new KeyValuePair<string, object?>("stage", stage));

    public static void GenerationFailed(string code) => GenerationFailures.Add(1, new KeyValuePair<string, object?>("code", code));

    public static void Started(string mode) => AttemptsStarted.Add(1, new KeyValuePair<string, object?>("mode", mode));

    public static void Submitted(string source, int secondsOnTask)
    {
        AttemptsSubmitted.Add(1, new KeyValuePair<string, object?>("source", source));
        SecondsOnTask.Record(secondsOnTask);
    }

    public static void AnswerSaved(string kind) => AnswersSaved.Add(1, new KeyValuePair<string, object?>("kind", kind));

    public static void AnswerRejectedLate() => AnswersRejectedLate.Add(1);

    public static void FocusLost(string mode) => FocusLosses.Add(1, new KeyValuePair<string, object?>("mode", mode));

    public static void Archived(bool hadAttempt) => TestsArchived.Add(1, new KeyValuePair<string, object?>("had_attempt", hadAttempt));

    public static void PendingReview(int count) => GradingPendingReview.Add(count);
}
