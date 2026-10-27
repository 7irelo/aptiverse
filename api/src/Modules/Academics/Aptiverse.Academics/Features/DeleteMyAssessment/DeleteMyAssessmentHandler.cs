using Aptiverse.Academics.Contracts;
using Aptiverse.Academics.Features.Common;
using Aptiverse.Academics.Persistence;
using Aptiverse.SharedKernel.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Academics.Features.DeleteMyAssessment;

/// <summary>Soft deletes the assessment and publishes AssessmentDeleted. Deleting it again is a no-op.</summary>
internal sealed class DeleteMyAssessmentHandler(IDbContextOutbox<AcademicsDbContext> outbox, AssessmentQueries queries, IClock clock)
{
    private AcademicsDbContext Db => outbox.DbContext;

    public async Task<Result> HandleAsync(Guid userId, Guid assessmentId, CancellationToken cancellationToken)
    {
        var owned = await queries.LoadOwnedAsync(userId, assessmentId, cancellationToken);
        if (owned is null)
        {
            var deletedByOwner = await Db.Assessments
                .IgnoreQueryFilters([ModuleDbContext.SoftDeleteFilter])
                .AnyAsync(a => a.Id == assessmentId && a.UserId == userId && a.DeletedAt != null, cancellationToken);
            return deletedByOwner ? Result.Success() : AcademicsErrors.AssessmentNotFound;
        }

        var (assessment, _, unit) = owned;
        var wasGraded = assessment.IsGraded;
        Db.Assessments.Remove(assessment);
        await outbox.PublishAsync(new AssessmentDeleted(userId, assessment.Id, unit.Id, wasGraded, clock.UtcNow));
        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);

        AcademicsMetrics.AssessmentDeleted(wasGraded);
        return Result.Success();
    }
}
