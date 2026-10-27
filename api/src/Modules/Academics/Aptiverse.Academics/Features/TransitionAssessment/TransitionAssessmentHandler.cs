using Aptiverse.Academics.Contracts;
using Aptiverse.Academics.Domain;
using Aptiverse.Academics.Features.Common;
using Aptiverse.Academics.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Academics.Features.TransitionAssessment;

/// <summary>
/// Moves an assessment through its lifecycle. Asking for the state it is already in returns it unchanged with no
/// event; a refused pair is 409 academics.invalid_transition listing the allowed actions.
/// </summary>
internal sealed class TransitionAssessmentHandler(IDbContextOutbox<AcademicsDbContext> outbox, AssessmentQueries queries, IClock clock)
{
    public async Task<Result<AssessmentView>> HandleAsync(
        Guid userId,
        Guid assessmentId,
        TransitionAssessmentRequest request,
        CancellationToken cancellationToken)
    {
        var owned = await queries.LoadOwnedAsync(userId, assessmentId, cancellationToken);
        if (owned is null)
        {
            return AcademicsErrors.AssessmentNotFound;
        }

        var (assessment, _, unit) = owned;
        var from = assessment.State;
        var now = clock.UtcNow;
        var transition = assessment.Transition(request.Action!, now);
        if (transition.IsFailure)
        {
            return transition.Error!;
        }

        if (transition.Value)
        {
            if (request.Action == TransitionActions.Submit)
            {
                await outbox.PublishAsync(new AssessmentSubmitted(userId, assessment.Id, unit.Id, now));
            }
            else if (request.Action == TransitionActions.RemoveMark)
            {
                await outbox.PublishAsync(new AssessmentMarkRemoved(userId, assessment.Id, unit.Id, now));
            }

            try
            {
                await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
            }
            catch (DbUpdateConcurrencyException)
            {
                return AcademicsErrors.ConcurrencyConflict;
            }

            AcademicsMetrics.Transitioned(from, assessment.State);
        }

        return await queries.ToViewAsync(owned, cancellationToken);
    }
}
