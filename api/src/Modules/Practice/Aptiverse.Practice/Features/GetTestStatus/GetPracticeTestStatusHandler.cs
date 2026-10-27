using Aptiverse.Practice.Domain;
using Aptiverse.Practice.Features.GenerateTest;
using Aptiverse.Practice.Persistence;
using Aptiverse.SharedKernel.Results;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Practice.Features.GetTestStatus;

/// <summary>Maps the test and job rows to one public status. Another user's test is a 404.</summary>
internal sealed class GetPracticeTestStatusHandler(PracticeDbContext db)
{
    public async Task<Result<GenerationStatusResponse>> HandleAsync(Guid userId, Guid testId, CancellationToken cancellationToken)
    {
        var row = await (from t in db.Tests.AsNoTracking()
                         join j in db.GenerationJobs.AsNoTracking() on t.Id equals j.TestId into jobs
                         from j in jobs.DefaultIfEmpty()
                         where t.Id == testId && t.UserId == userId
                         select new
                         {
                             TestStatus = t.Status,
                             JobStatus = j == null ? null : j.Status,
                             AttemptsMade = j == null ? 0 : j.AttemptsMade,
                             ErrorCode = j == null ? null : j.LastErrorCode,
                             FinishedAt = j == null ? null : j.FinishedAt,
                         })
            .SingleOrDefaultAsync(cancellationToken);
        if (row is null)
        {
            return PracticeErrors.TestNotFound;
        }

        var status = PublicStatus.Of(row.TestStatus, row.JobStatus);
        return new GenerationStatusResponse(
            testId,
            status,
            row.AttemptsMade,
            status == "failed" ? row.ErrorCode ?? GenerationErrorCodes.Failed : null,
            status == "ready" ? row.FinishedAt : null);
    }
}
