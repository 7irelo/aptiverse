using Aptiverse.Practice.Domain;
using Aptiverse.Practice.Persistence;
using Aptiverse.SharedKernel.Paging;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Practice.Features.ListTests;

/// <summary>The caller's tests, newest first, with each test's one attempt from a single left join (no N+1).</summary>
internal sealed class ListPracticeTestsHandler(PracticeDbContext db)
{
    public async Task<PagedResult<PracticeTestSummary>> HandleAsync(Guid userId, ListPracticeTestsRequest request, CancellationToken cancellationToken)
    {
        var rows = from t in db.Tests.AsNoTracking()
                   join a in db.Attempts.AsNoTracking().Where(a => a.UserId == userId) on t.Id equals a.TestId into attempts
                   from a in attempts.DefaultIfEmpty()
                   where t.UserId == userId
                   select new { t, a };

        if (request.StudyUnitId is { } unitId)
        {
            rows = rows.Where(r => r.t.StudyUnitId == unitId);
        }

        if (request.Status is { } status)
        {
            rows = rows.Where(r => r.t.Status == status);
        }

        if (request.Attempted is { } attempted)
        {
            rows = attempted ? rows.Where(r => r.a != null) : rows.Where(r => r.a == null);
        }

        var total = await rows.LongCountAsync(cancellationToken);
        var page = await rows
            .OrderByDescending(r => r.t.CreatedAt)
            .ThenByDescending(r => r.t.Id)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(r => new PracticeTestSummary(
                r.t.Id,
                r.t.Title,
                r.t.StudyUnitId,
                r.t.AssessmentId,
                r.t.Format,
                r.t.Mode,
                r.t.DurationMinutes,
                r.t.QuestionCount,
                r.t.TotalMarks,
                r.t.Status,
                r.t.CreatedAt,
                r.a == null
                    ? null
                    : new AttemptSummary(
                        r.a.Id,
                        r.a.Status,
                        r.a.Status == AttemptStatuses.Graded && !r.a.PartiallyGraded ? r.a.ScorePercent : null,
                        r.a.SubmittedAt)))
            .ToListAsync(cancellationToken);

        return new PagedResult<PracticeTestSummary>(page, request.Page, request.PageSize, total);
    }
}
