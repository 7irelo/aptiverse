namespace Aptiverse.Family.Features.GetChildSummary;

/// <summary>
/// What a linked parent sees of one child. Every block says whether the child shares it; an unshared block carries no
/// data at all (its fields are null). Tutor conversations are never included, only counts when shared.
/// </summary>
/// <param name="StudentId">The child.</param>
/// <param name="DisplayName">The child's name.</param>
/// <param name="Stage">"high_school" or "university"; null before onboarding.</param>
/// <param name="Level">For example "Grade 11" or "Year 2"; null before onboarding.</param>
/// <param name="Academics">Subjects or courses and what is due in the next 14 days.</param>
/// <param name="Mastery">The weakest topics with evidence (shared with academics).</param>
/// <param name="Practice">Practice in the last 30 days.</param>
/// <param name="Goals">Open goals with verified progress.</param>
/// <param name="Tutor">Tutor use in the last 30 days, counts only.</param>
internal sealed record ChildSummary(
    Guid StudentId,
    string DisplayName,
    string? Stage,
    string? Level,
    AcademicsBlock Academics,
    MasteryBlock Mastery,
    PracticeBlock Practice,
    GoalsBlock Goals,
    TutorBlock Tutor);

internal sealed record AcademicsBlock(bool Shared, IReadOnlyList<UnitItem>? Units, IReadOnlyList<UpcomingAssessmentItem>? Upcoming)
{
    public static readonly AcademicsBlock Hidden = new(false, null, null);
}

/// <param name="StudyUnitId">The subject or course.</param>
/// <param name="Name">Its name.</param>
/// <param name="Kind">"caps_subject" or "tertiary_course".</param>
/// <param name="Level">"grade_8" to "grade_12", or "first_year" to "phd".</param>
internal sealed record UnitItem(Guid StudyUnitId, string Name, string Kind, string Level);

internal sealed record UpcomingAssessmentItem(Guid AssessmentId, string Title, string UnitName, DateTimeOffset DueAt);

internal sealed record MasteryBlock(bool Shared, IReadOnlyList<TopicItem>? WeakestTopics)
{
    public static readonly MasteryBlock Hidden = new(false, null);
}

/// <param name="StudyUnitId">The subject or course.</param>
/// <param name="Topic">The topic.</param>
/// <param name="Score">0 to 1; null without evidence.</param>
/// <param name="Band">"emerging", "developing", "secure" or "mastered".</param>
internal sealed record TopicItem(Guid StudyUnitId, string Topic, decimal? Score, string? Band);

/// <param name="Shared">Whether the child shares practice.</param>
/// <param name="CompletedLast30Days">Graded practice tests in the last 30 days.</param>
/// <param name="AverageScorePercent">Mean score of fully graded tests; null when there are none.</param>
/// <param name="Recent">The latest five results.</param>
internal sealed record PracticeBlock(bool Shared, int? CompletedLast30Days, decimal? AverageScorePercent, IReadOnlyList<PracticeItem>? Recent)
{
    public static readonly PracticeBlock Hidden = new(false, null, null, null);
}

/// <param name="StudyUnitId">The subject or course.</param>
/// <param name="UnitName">Its name; null when the child is no longer enrolled.</param>
/// <param name="ScorePercent">0 to 100.</param>
/// <param name="GradedHour">When it was graded, rounded down to the hour: a parent does not need the exact minute.</param>
internal sealed record PracticeItem(Guid StudyUnitId, string? UnitName, decimal ScorePercent, DateTimeOffset GradedHour);

internal sealed record GoalsBlock(bool Shared, IReadOnlyList<GoalItem>? Active)
{
    public static readonly GoalsBlock Hidden = new(false, null);
}

/// <param name="Title">The goal as the child wrote it.</param>
/// <param name="CriteriaType">One of the five verifiable goal types.</param>
/// <param name="Status">"active" or "at_risk".</param>
/// <param name="TargetValue">The target.</param>
/// <param name="CurrentValue">Measured from the child's work; null before any evidence.</param>
/// <param name="DueAt">When it is due.</param>
/// <param name="UnitName">The subject or course; null when the child is no longer enrolled.</param>
internal sealed record GoalItem(string Title, string CriteriaType, string Status, decimal TargetValue, decimal? CurrentValue, DateTimeOffset DueAt, string? UnitName);

/// <param name="Shared">Whether the child shares tutor activity.</param>
/// <param name="ConversationsLast30Days">Conversations with at least one question.</param>
/// <param name="QuestionsLast30Days">Questions asked.</param>
internal sealed record TutorBlock(bool Shared, int? ConversationsLast30Days, int? QuestionsLast30Days)
{
    public static readonly TutorBlock Hidden = new(false, null, null);
}
