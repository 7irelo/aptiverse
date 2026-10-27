namespace Aptiverse.Progress.Domain;

// Closed value sets. Each one backs a check constraint and a validator rule, so the database and the API reject
// the same values.

/// <summary>The five verifiable goal types of v1 (decision 20). No custom or streak goals.</summary>
internal static class CriteriaTypes
{
    public const string PracticeTestsCompleted = "practice_tests_completed";
    public const string PracticeScoreBest = "practice_score_best";
    public const string MasteryThreshold = "mastery_threshold";
    public const string AssessmentsSubmitted = "assessments_submitted";
    public const string AssessmentMarkThreshold = "assessment_mark_threshold";

    public static IReadOnlyList<string> All { get; } =
        [PracticeTestsCompleted, PracticeScoreBest, MasteryThreshold, AssessmentsSubmitted, AssessmentMarkThreshold];

    /// <summary>Count goals count from creation, so their baseline is 0 by construction (decision 20).</summary>
    public static bool IsCount(string criteriaType) => criteriaType is PracticeTestsCompleted or AssessmentsSubmitted;
}

internal static class GoalStatuses
{
    public const string Active = "active";
    public const string AtRisk = "at_risk";
    public const string Achieved = "achieved";
    public const string Expired = "expired";
    public const string Abandoned = "abandoned";

    public static IReadOnlyList<string> All { get; } = [Active, AtRisk, Achieved, Expired, Abandoned];

    /// <summary>Goals still collecting evidence.</summary>
    public static IReadOnlyList<string> Open { get; } = [Active, AtRisk];

    /// <summary>Values the list filter accepts; at_risk is listed with active.</summary>
    public static IReadOnlyList<string> Filters { get; } = [Active, Achieved, Expired, Abandoned];
}

/// <summary>What caused a change in a goal's value. The pair (goal, source type, source id) is unique.</summary>
internal static class EvidenceSources
{
    public const string PracticeAttempt = "practice_attempt";
    public const string AssessmentSubmitted = "assessment_submitted";
    public const string AssessmentGraded = "assessment_graded";
    public const string MasteryUpdate = "mastery_update";
    public const string Regrade = "regrade";

    public static IReadOnlyList<string> All { get; } = [PracticeAttempt, AssessmentSubmitted, AssessmentGraded, MasteryUpdate, Regrade];
}

/// <summary>Where a mastery observation came from.</summary>
internal static class ObservationSources
{
    public const string PracticeAttempt = "practice_attempt";
    public const string AssessmentGraded = "assessment_graded";

    public static IReadOnlyList<string> All { get; } = [PracticeAttempt, AssessmentGraded];
}

/// <summary>
/// Which model wrote a topic_mastery row. v1 writes only the explainable aggregate; a later ML model writes its own
/// rows beside it and the API keeps reading the first until a switch flips.
/// </summary>
internal static class MasteryModels
{
    public const string RecencyWeightedV1 = "recency_weighted_v1";
    public const string BktV1 = "bkt_v1";

    public static IReadOnlyList<string> All { get; } = [RecencyWeightedV1, BktV1];
}

internal static class MasteryBands
{
    public const string Emerging = "emerging";
    public const string Developing = "developing";
    public const string Secure = "secure";
    public const string Mastered = "mastered";

    public static IReadOnlyList<string> All { get; } = [Emerging, Developing, Secure, Mastered];

    public static int Rank(string? band) => band switch
    {
        Emerging => 1,
        Developing => 2,
        Secure => 3,
        Mastered => 4,
        _ => 0,
    };
}

internal static class JourneyKinds
{
    public const string PracticeCompleted = "practice_completed";
    public const string AssessmentGraded = "assessment_graded";
    public const string GoalCreated = "goal_created";
    public const string GoalAchieved = "goal_achieved";
    public const string MilestoneReached = "milestone_reached";
    public const string TopicBandUp = "topic_band_up";

    public static IReadOnlyList<string> All { get; } =
        [PracticeCompleted, AssessmentGraded, GoalCreated, GoalAchieved, MilestoneReached, TopicBandUp];
}

/// <summary>Topic names as keys: whitespace collapsed and case folded, so "Algebra " and "algebra" are one topic.</summary>
internal static class TopicKeys
{
    public const int MaxLength = 120;

    /// <summary>The key of the whole-unit row, fed by assessment marks, which carry no topic.</summary>
    public const string WholeUnit = "";

    public static string Display(string topic)
    {
        ArgumentNullException.ThrowIfNull(topic);
        var clean = string.Join(' ', topic.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries));
        return clean.Length <= MaxLength ? clean : clean[..MaxLength].TrimEnd();
    }

    public static string Key(string topic) => Display(topic).ToLowerInvariant();
}

/// <summary>
/// Postgres timestamptz keeps microseconds. Event times are trimmed to that on the way in, so a value read back
/// compares equal to the same event delivered again (replay checks and deterministic evidence keys depend on it).
/// </summary>
internal static class StoredTime
{
    public static DateTimeOffset Of(DateTimeOffset value)
    {
        var utc = value.ToUniversalTime();
        return utc.AddTicks(-(utc.Ticks % 10));
    }
}

/// <summary>South African time has no daylight saving, so the day boundary is a fixed offset.</summary>
internal static class Sast
{
    public static readonly TimeSpan Offset = TimeSpan.FromHours(2);

    public static DateOnly Day(DateTimeOffset instant) => DateOnly.FromDateTime(instant.ToOffset(Offset).DateTime);

    /// <summary>Npgsql only accepts UTC offsets for timestamptz, so the SAST midnight is returned in UTC.</summary>
    public static DateTimeOffset StartOf(DateOnly day) => new DateTimeOffset(day.ToDateTime(TimeOnly.MinValue), Offset).ToUniversalTime();
}
