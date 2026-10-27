using Aptiverse.Academics.Domain;
using Aptiverse.Academics.Features.Common;
using Aptiverse.Academics.Persistence;
using Aptiverse.SharedKernel.Paging;
using Aptiverse.SharedKernel.Time;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Academics.Features.ListMyAssessments;

internal sealed class ListMyAssessmentsHandler(AcademicsDbContext db, IClock clock)
{
    public async Task<PagedResult<AssessmentListItem>> HandleAsync(Guid userId, ListMyAssessmentsRequest request, CancellationToken cancellationToken)
    {
        var page = new PageRequest(request.Page, request.PageSize);
        var rows = from a in db.Assessments.AsNoTracking()
                   join e in db.Enrolments.AsNoTracking() on a.EnrolmentId equals e.Id
                   join u in db.StudyUnits.AsNoTracking() on e.StudyUnitId equals u.Id
                   where a.UserId == userId && e.UserId == userId && e.Status != EnrolmentStatuses.StageMismatch
                   select new { a, UnitName = u.Name };

        if (request.EnrolmentId is { } enrolmentId)
        {
            rows = rows.Where(r => r.a.EnrolmentId == enrolmentId);
        }

        if (request.State is { Length: > 0 } states)
        {
            rows = rows.Where(r => states.Contains(r.a.State));
        }

        if (request.Type is { } type)
        {
            rows = rows.Where(r => r.a.AssessmentType == type);
        }

        if (request.From is { } from)
        {
            var start = Sast.StartOfDay(from).ToUniversalTime();
            rows = rows.Where(r => r.a.DueAt >= start);
        }

        if (request.To is { } to)
        {
            var end = Sast.StartOfDay(to.AddDays(1)).ToUniversalTime();
            rows = rows.Where(r => r.a.DueAt < end);
        }

        var total = await rows.LongCountAsync(cancellationToken);
        var ordered = request.Sort == "due_desc"
            ? rows.OrderByDescending(r => r.a.DueAt).ThenByDescending(r => r.a.Id)
            : rows.OrderBy(r => r.a.DueAt).ThenBy(r => r.a.Id);

        var pageRows = await ordered
            .Skip(page.Skip)
            .Take(page.NormalizedPageSize)
            .ToListAsync(cancellationToken);

        var now = clock.UtcNow;
        var items = pageRows
            .Select(r => new AssessmentListItem(
                r.a.Id, r.a.EnrolmentId, r.UnitName, r.a.Title, r.a.AssessmentType, r.a.State, r.a.DueAt, r.a.WeightPercent, r.a.Percent, r.a.PredictedPercent, r.a.IsOverdue(now)))
            .ToList();

        return new PagedResult<AssessmentListItem>(items, page.NormalizedPage, page.NormalizedPageSize, total);
    }
}
