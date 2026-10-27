using Aptiverse.Progress.Features.Common;

namespace Aptiverse.Progress.Features.GetDashboard;

/// <param name="ActiveAttempt">Your practice test in progress, or null.</param>
/// <param name="NextAssessments">Up to 3 upcoming assessments, soonest first.</param>
/// <param name="ActiveGoals">Up to 3 open goals in your order.</param>
/// <param name="WeakestTopics">Up to 3 topics with evidence, weakest first.</param>
/// <param name="MasteryScore">Evidence-weighted mastery over all your subjects, 0 to 1; null without evidence.</param>
/// <param name="RecentPractice">Graded practice in the last 7 days.</param>
/// <param name="ActivityLast7Days">One entry per day (South African time), oldest first.</param>
internal sealed record DashboardView(
    DashboardAttempt? ActiveAttempt,
    IReadOnlyList<DashboardAssessment> NextAssessments,
    IReadOnlyList<GoalSummary> ActiveGoals,
    IReadOnlyList<DashboardTopic> WeakestTopics,
    decimal? MasteryScore,
    RecentPracticeView RecentPractice,
    IReadOnlyList<ActivityDay> ActivityLast7Days);

internal sealed record DashboardAttempt(Guid AttemptId, Guid TestId, DateTimeOffset? DeadlineAt, bool Paused);

internal sealed record DashboardAssessment(Guid AssessmentId, string Title, Guid StudyUnitId, string UnitName, DateTimeOffset DueAt);

/// <param name="StudyUnitId">The subject or course.</param>
/// <param name="Topic">The topic.</param>
/// <param name="Score">0 to 1.</param>
/// <param name="Band">The band of the score.</param>
/// <param name="EarlyRead">Fewer than 5 questions behind the score.</param>
/// <param name="EvidenceQuestions">Questions behind the score.</param>
internal sealed record DashboardTopic(Guid StudyUnitId, string Topic, decimal? Score, string? Band, bool EarlyRead, int EvidenceQuestions);

/// <param name="AttemptsGraded">Practice attempts graded in the last 7 days.</param>
/// <param name="AverageScorePercent">Mean of fully graded attempts; null when there are none.</param>
/// <param name="BestScorePercent">Best fully graded attempt; null when there are none.</param>
/// <param name="MinutesOnTask">Minutes of practice, pauses excluded.</param>
internal sealed record RecentPracticeView(int AttemptsGraded, decimal? AverageScorePercent, decimal? BestScorePercent, int MinutesOnTask);

/// <param name="Day">The calendar day in South African time.</param>
/// <param name="PracticeMinutes">Minutes on graded practice submitted that day.</param>
/// <param name="AttemptsGraded">Practice attempts submitted that day.</param>
internal sealed record ActivityDay(DateOnly Day, int PracticeMinutes, int AttemptsGraded);
