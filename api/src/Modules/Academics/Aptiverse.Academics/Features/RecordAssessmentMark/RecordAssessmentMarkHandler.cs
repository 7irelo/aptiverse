using Aptiverse.Academics.Contracts;
using Aptiverse.Academics.Features.Common;
using Aptiverse.Academics.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Academics.Features.RecordAssessmentMark;

/// <summary>
/// Records or changes the mark and grades the assessment. The same mark again changes nothing and publishes no
/// event; a different mark republishes AssessmentGraded with the new values.
/// </summary>
internal sealed class RecordAssessmentMarkHandler(IDbContextOutbox<AcademicsDbContext> outbox, AssessmentQueries queries, IClock clock)
{
    public async Task<Result<AssessmentView>> HandleAsync(
        Guid userId,
        Guid assessmentId,
        RecordAssessmentMarkRequest request,
        CancellationToken cancellationToken)
    {
        var owned = await queries.LoadOwnedAsync(userId, assessmentId, cancellationToken);
        if (owned is null)
        {
            return AcademicsErrors.AssessmentNotFound;
        }

        var (assessment, _, unit) = owned;
        var (obtained, total) = request.Percent is { } percent ? (percent, 100) : (request.MarkObtained!.Value, request.MarkTotal!.Value);
        var now = clock.UtcNow;

        if (assessment.RecordMark(obtained, total, now))
        {
            await outbox.PublishAsync(new AssessmentGraded(
                userId,
                assessment.Id,
                unit.Id,
                assessment.AssessmentType,
                assessment.Percent!.Value,
                assessment.WeightPercent,
                assessment.PredictedPercent,
                assessment.GradedAt!.Value,
                now));

            try
            {
                await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
            }
            catch (DbUpdateConcurrencyException)
            {
                return AcademicsErrors.ConcurrencyConflict;
            }

            AcademicsMetrics.MarkRecorded(assessment.AssessmentType);
        }

        return await queries.ToViewAsync(owned, cancellationToken);
    }
}
