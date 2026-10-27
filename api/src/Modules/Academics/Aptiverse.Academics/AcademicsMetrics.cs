using System.Diagnostics.Metrics;

namespace Aptiverse.Academics;

/// <summary>Counters for academics writes. Tags are low-cardinality values only, never ids or marks.</summary>
internal static class AcademicsMetrics
{
    public const string MeterName = "Aptiverse.Academics";

    private static readonly Meter Meter = new(MeterName);

    private static readonly Counter<long> EnrolmentsCreated =
        Meter.CreateCounter<long>("aptiverse.academics.enrolments.created", description: "Enrolments created");

    private static readonly Counter<long> EnrolmentsRemoved =
        Meter.CreateCounter<long>("aptiverse.academics.enrolments.removed", description: "Enrolments removed");

    private static readonly Counter<long> AssessmentsCreated =
        Meter.CreateCounter<long>("aptiverse.academics.assessments.created", description: "Assessments created");

    private static readonly Counter<long> AssessmentsDeleted =
        Meter.CreateCounter<long>("aptiverse.academics.assessments.deleted", description: "Assessments deleted");

    private static readonly Counter<long> Transitions =
        Meter.CreateCounter<long>("aptiverse.academics.assessments.transitions", description: "Assessment lifecycle transitions");

    private static readonly Counter<long> MarksRecorded =
        Meter.CreateCounter<long>("aptiverse.academics.marks.recorded", description: "Assessment marks recorded");

    public static void EnrolmentCreated(string kind, bool shared) =>
        EnrolmentsCreated.Add(1, new KeyValuePair<string, object?>("kind", kind), new KeyValuePair<string, object?>("shared", shared));

    public static void EnrolmentRemoved(string kind) => EnrolmentsRemoved.Add(1, new KeyValuePair<string, object?>("kind", kind));

    public static void AssessmentCreated(string type, string kind) =>
        AssessmentsCreated.Add(1, new KeyValuePair<string, object?>("type", type), new KeyValuePair<string, object?>("kind", kind));

    public static void AssessmentDeleted(bool wasGraded) => AssessmentsDeleted.Add(1, new KeyValuePair<string, object?>("was_graded", wasGraded));

    public static void Transitioned(string from, string to) =>
        Transitions.Add(1, new KeyValuePair<string, object?>("from", from), new KeyValuePair<string, object?>("to", to));

    public static void MarkRecorded(string type) => MarksRecorded.Add(1, new KeyValuePair<string, object?>("type", type));
}
