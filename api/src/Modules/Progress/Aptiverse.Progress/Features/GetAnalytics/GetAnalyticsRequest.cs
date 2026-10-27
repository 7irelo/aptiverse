using Aptiverse.Progress.Features.GetDashboard;

namespace Aptiverse.Progress.Features.GetAnalytics;

/// <param name="RangeDays">7, 28 or 90; default 28.</param>
internal sealed record GetAnalyticsRequest(int RangeDays = 28);

/// <param name="RangeDays">The range covered.</param>
/// <param name="TimeOnTask">One entry per day (South African time), oldest first.</param>
/// <param name="TotalMinutes">Minutes of graded practice in the range.</param>
/// <param name="Strengths">Up to 3 secure or mastered topics, strongest first.</param>
/// <param name="Gaps">Up to 3 lowest topics, weakest first.</param>
internal sealed record AnalyticsView(
    int RangeDays,
    IReadOnlyList<ActivityDay> TimeOnTask,
    int TotalMinutes,
    IReadOnlyList<DashboardTopic> Strengths,
    IReadOnlyList<DashboardTopic> Gaps);
