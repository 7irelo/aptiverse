using Aptiverse.Academics.Domain;
using Aptiverse.Academics.Features.Common;
using Aptiverse.Academics.Features.ListUnitTopics;
using Aptiverse.Academics.Persistence;
using Aptiverse.SharedKernel.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Academics.Features.GetMyUnit;

internal sealed class GetMyUnitHandler(AcademicsDbContext db, UnitQueries queries, IClock clock)
{
    private const int TopicLimit = 50;

    public async Task<Result<(UnitDetailResponse Detail, string ETag)>> HandleAsync(Guid userId, Guid enrolmentId, CancellationToken cancellationToken)
    {
        var summary = await queries.GetAsync(userId, enrolmentId, cancellationToken);
        if (summary is null || summary.Status == EnrolmentStatuses.StageMismatch)
        {
            return AcademicsErrors.UnitNotFound;
        }

        var version = await db.Enrolments.AsNoTracking()
            .Where(e => e.Id == enrolmentId && e.UserId == userId)
            .Select(e => EF.Property<uint>(e, ModuleDbContext.ConcurrencyTokenProperty))
            .SingleAsync(cancellationToken);

        var now = clock.UtcNow;
        var assessments = await db.Assessments.AsNoTracking()
            .Where(a => a.UserId == userId && a.EnrolmentId == enrolmentId)
            .OrderBy(a => a.DueAt)
            .ThenBy(a => a.Id)
            .ToListAsync(cancellationToken);

        var topics = await db.Topics.AsNoTracking()
            .Where(t => t.StudyUnitId == summary.UnitId && t.MergedIntoTopicId == null)
            .OrderBy(t => t.Name)
            .ThenBy(t => t.Id)
            .Take(TopicLimit)
            .Select(t => new TopicView(t.Id, t.Name, t.Slug))
            .ToListAsync(cancellationToken);

        var items = assessments
            .Select(a => new AssessmentListItem(
                a.Id, a.EnrolmentId, summary.Name, a.Title, a.AssessmentType, a.State, a.DueAt, a.WeightPercent, a.Percent, a.PredictedPercent, a.IsOverdue(now)))
            .ToList();

        return (new UnitDetailResponse(summary, items, topics), ETags.Format(version));
    }
}
