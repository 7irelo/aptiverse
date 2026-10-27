using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Features.GetDashboard;
using Aptiverse.Progress.Persistence;
using Aptiverse.SharedKernel.Time;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Progress.Features.GetAnalytics;

internal sealed class GetAnalyticsHandler(ProgressDbContext db, IClock clock)
{
    public const int TopicCount = 3;

    public async Task<AnalyticsView> HandleAsync(Guid userId, GetAnalyticsRequest request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var today = Sast.Day(clock.UtcNow);
        var from = Sast.StartOf(today.AddDays(1 - request.RangeDays));
        var practice = await db.PracticeResults.AsNoTracking()
            .Where(r => r.UserId == userId && r.SubmittedAt >= from)
            .Select(r => new { r.SubmittedAt, r.SecondsOnTask })
            .ToListAsync(cancellationToken);
        var byDay = practice.ToLookup(p => Sast.Day(p.SubmittedAt));
        var days = Enumerable.Range(0, request.RangeDays)
            .Select(i => today.AddDays(i + 1 - request.RangeDays))
            .Select(day => new ActivityDay(day, byDay[day].Sum(p => p.SecondsOnTask) / 60, byDay[day].Count()))
            .ToList();

        var topics = await db.TopicMastery.AsNoTracking()
            .Where(m => m.UserId == userId && m.Model == MasteryModels.RecencyWeightedV1 && m.TopicKey != TopicKeys.WholeUnit
                && m.Score != null && !m.EarlyRead)
            .Select(m => new DashboardTopic(m.StudyUnitId, m.Topic, m.Score, m.Band, m.EarlyRead, m.EvidenceQuestions))
            .ToListAsync(cancellationToken);
        var (strengths, gaps) = Select(topics);

        return new AnalyticsView(request.RangeDays, days, practice.Sum(p => p.SecondsOnTask) / 60, strengths, gaps);
    }

    /// <summary>Strengths: secure or better, highest first. Gaps: the lowest of the rest. Early reads never count.</summary>
    public static (IReadOnlyList<DashboardTopic> Strengths, IReadOnlyList<DashboardTopic> Gaps) Select(IEnumerable<DashboardTopic> topics)
    {
        ArgumentNullException.ThrowIfNull(topics);
        var eligible = topics.Where(t => t.Score is not null && !t.EarlyRead && t.EvidenceQuestions >= MasteryMath.EarlyReadBelowQuestions).ToList();
        var strengths = eligible
            .Where(t => MasteryBands.Rank(t.Band) >= MasteryBands.Rank(MasteryBands.Secure))
            .OrderByDescending(t => t.Score)
            .ThenBy(t => t.Topic, StringComparer.Ordinal)
            .Take(TopicCount)
            .ToList();
        var gaps = eligible
            .Except(strengths)
            .OrderBy(t => t.Score)
            .ThenBy(t => t.Topic, StringComparer.Ordinal)
            .Take(TopicCount)
            .ToList();
        return (strengths, gaps);
    }
}
