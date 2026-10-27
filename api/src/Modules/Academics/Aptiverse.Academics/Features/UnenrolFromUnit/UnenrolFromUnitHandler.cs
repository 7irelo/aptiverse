using Aptiverse.Academics.Contracts;
using Aptiverse.Academics.Features.Common;
using Aptiverse.Academics.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Academics.Features.UnenrolFromUnit;

/// <summary>
/// Soft deletes the enrolment and its assessments in one transaction, with one AssessmentDeleted per assessment and
/// a StudyUnitUnenrolled. The shared unit and its topics stay for the other students. Removing it again is a no-op.
/// </summary>
internal sealed class UnenrolFromUnitHandler(IDbContextOutbox<AcademicsDbContext> outbox, UnitStore units, IClock clock)
{
    private AcademicsDbContext Db => outbox.DbContext;

    public async Task<Result> HandleAsync(Guid userId, Guid enrolmentId, UnenrolFromUnitRequest request, CancellationToken cancellationToken)
    {
        var owned = await units.LoadOwnedAsync(userId, enrolmentId, cancellationToken);
        if (owned is null)
        {
            return await units.WasDeletedByOwnerAsync(userId, enrolmentId, cancellationToken)
                ? Result.Success()
                : AcademicsErrors.UnitNotFound;
        }

        var (enrolment, unit) = owned;
        var assessments = await Db.Assessments
            .Where(a => a.EnrolmentId == enrolment.Id && a.UserId == userId)
            .ToListAsync(cancellationToken);

        var graded = assessments.Count(a => a.IsGraded);
        if (graded > 0 && !request.Confirm)
        {
            return AcademicsErrors.UnitHasMarks(graded);
        }

        var now = clock.UtcNow;
        foreach (var assessment in assessments)
        {
            Db.Assessments.Remove(assessment);
            await outbox.PublishAsync(new AssessmentDeleted(userId, assessment.Id, unit.Id, assessment.IsGraded, now));
        }

        Db.Enrolments.Remove(enrolment);
        await outbox.PublishAsync(new StudyUnitUnenrolled(userId, unit.Id, enrolment.Id, now));
        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);

        AcademicsMetrics.EnrolmentRemoved(unit.Kind);
        foreach (var assessment in assessments)
        {
            AcademicsMetrics.AssessmentDeleted(assessment.IsGraded);
        }

        return Result.Success();
    }
}
