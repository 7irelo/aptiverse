using Aptiverse.Academics.Contracts;
using Aptiverse.Academics.Domain;
using Aptiverse.Academics.Features.Common;
using Aptiverse.Academics.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Academics.Features.UpdateMyAssessment;

/// <summary>Edits details; moving the due date publishes AssessmentDueChanged in the same transaction.</summary>
internal sealed class UpdateMyAssessmentHandler(IDbContextOutbox<AcademicsDbContext> outbox, AssessmentQueries queries, IClock clock)
{
    public async Task<Result<(AssessmentView View, string ETag)>> HandleAsync(
        Guid userId,
        Guid assessmentId,
        UpdateMyAssessmentRequest request,
        string? ifMatch,
        CancellationToken cancellationToken)
    {
        var owned = await queries.LoadOwnedAsync(userId, assessmentId, cancellationToken);
        if (owned is null)
        {
            return AcademicsErrors.AssessmentNotFound;
        }

        var (assessment, _, unit) = owned;
        if (request.Term is not null && unit.Kind != StudyUnitKinds.CapsSubject)
        {
            return AcademicsErrors.TermNotAllowed;
        }

        if (!queries.ApplyIfMatch(assessment, ifMatch))
        {
            return AcademicsErrors.ConcurrencyConflict;
        }

        if (request.Title is not null)
        {
            assessment.Rename(request.Title);
        }

        if (request.Type is not null)
        {
            assessment.SetType(request.Type);
        }

        if (request.WeightPercent is not null || request.ClearWeightPercent)
        {
            assessment.SetWeight(request.WeightPercent);
        }

        if (request.Term is not null || request.ClearTerm)
        {
            assessment.SetTerm((short?)request.Term);
        }

        if (request.PredictedPercent is not null || request.ClearPredictedPercent)
        {
            assessment.SetPredicted(request.PredictedPercent);
        }

        if (request.Notes is not null)
        {
            assessment.SetNotes(request.Notes);
        }

        if (request.DueAt is { } dueAt && assessment.Reschedule(dueAt))
        {
            await outbox.PublishAsync(new AssessmentDueChanged(userId, assessment.Id, assessment.DueAt, clock.UtcNow));
        }

        try
        {
            await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            return AcademicsErrors.ConcurrencyConflict;
        }

        return (await queries.ToViewAsync(owned, cancellationToken), queries.ETagOf(assessment));
    }
}
