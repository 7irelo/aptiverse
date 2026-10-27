using Aptiverse.Academics.Contracts;
using Aptiverse.Academics.Domain;
using Aptiverse.Academics.Features.Common;
using Aptiverse.Academics.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Academics.Features.CreateAssessment;

internal sealed class CreateAssessmentHandler(
    IDbContextOutbox<AcademicsDbContext> outbox,
    UnitStore units,
    AssessmentQueries queries,
    IClock clock,
    IOptions<AcademicsOptions> options)
{
    private AcademicsDbContext Db => outbox.DbContext;

    public async Task<Result<AssessmentView>> HandleAsync(Guid userId, CreateAssessmentRequest request, CancellationToken cancellationToken)
    {
        var owned = await units.LoadOwnedAsync(userId, request.EnrolmentId, cancellationToken);
        if (owned is null || owned.Enrolment.Status != EnrolmentStatuses.Active)
        {
            return AcademicsErrors.UnitNotFound;
        }

        var (enrolment, unit) = owned;
        if (request.Term is not null && unit.Kind != StudyUnitKinds.CapsSubject)
        {
            return AcademicsErrors.TermNotAllowed;
        }

        var max = options.Value.MaxAssessmentsPerEnrolment;
        if (await Db.Assessments.CountAsync(a => a.EnrolmentId == enrolment.Id && a.UserId == userId, cancellationToken) >= max)
        {
            return AcademicsErrors.TooManyAssessments(max);
        }

        var assessment = Assessment.Create(
            enrolment,
            request.Title!,
            request.Type!,
            request.WeightPercent,
            (short?)request.Term,
            request.DueAt!.Value,
            request.PredictedPercent,
            request.Notes);
        Db.Assessments.Add(assessment);

        var now = clock.UtcNow;
        await outbox.PublishAsync(new AssessmentCreated(userId, assessment.Id, unit.Id, assessment.Title, assessment.AssessmentType, assessment.DueAt, now));
        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);

        AcademicsMetrics.AssessmentCreated(assessment.AssessmentType, unit.Kind);
        return await queries.ToViewAsync(new OwnedAssessment(assessment, enrolment, unit), cancellationToken);
    }
}
