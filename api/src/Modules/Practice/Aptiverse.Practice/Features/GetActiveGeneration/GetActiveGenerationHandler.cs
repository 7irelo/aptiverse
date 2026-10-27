using Aptiverse.Practice.Domain;
using Aptiverse.Practice.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Practice.Features.GetActiveGeneration;

/// <summary>The caller's queued or running generation, for recovery on another device.</summary>
internal sealed class GetActiveGenerationHandler(PracticeDbContext db)
{
    public async Task<ActiveGenerationResponse?> HandleAsync(Guid userId, CancellationToken cancellationToken) =>
        await (from j in db.GenerationJobs.AsNoTracking()
               join t in db.Tests.AsNoTracking() on j.TestId equals t.Id
               where j.UserId == userId && t.UserId == userId && JobStatuses.Active.Contains(j.Status)
               select new ActiveGenerationResponse(j.Id, t.Id, t.AssessmentId, t.Format, j.Status, j.CreatedAt))
            .FirstOrDefaultAsync(cancellationToken);
}
