using Aptiverse.Academics.Domain;
using Aptiverse.Academics.Features.Common;
using Aptiverse.Academics.Persistence;
using Aptiverse.SharedKernel.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Academics.Features.UpdateMyUnit;

internal sealed class UpdateMyUnitHandler(AcademicsDbContext db, UnitStore units, UnitQueries queries, IClock clock)
{
    public async Task<Result<(UnitSummary Unit, string ETag)>> HandleAsync(
        Guid userId,
        Guid enrolmentId,
        UpdateMyUnitRequest request,
        string? ifMatch,
        CancellationToken cancellationToken)
    {
        var owned = await units.LoadOwnedAsync(userId, enrolmentId, cancellationToken);
        if (owned is null)
        {
            return AcademicsErrors.UnitNotFound;
        }

        var (enrolment, unit) = owned;
        if (request.Duration is not null && unit.Kind != StudyUnitKinds.TertiaryCourse)
        {
            return AcademicsErrors.DurationNotAllowed;
        }

        if (!ETags.ApplyIfMatch(db, enrolment, ifMatch))
        {
            return AcademicsErrors.ConcurrencyConflict;
        }

        if (request.TeacherName is not null)
        {
            enrolment.SetTeacherName(request.TeacherName);
        }

        if (request.StartedOn is not null || request.Duration is not null)
        {
            enrolment.SetSchedule(request.StartedOn ?? enrolment.StartedOn, request.Duration ?? enrolment.Duration);
        }

        if (request.ColourToken is not null)
        {
            enrolment.SetColourToken(request.ColourToken);
        }

        if (request.DisplayOrder is { } order)
        {
            enrolment.SetDisplayOrder((short)order);
        }

        switch (request.Completed)
        {
            case true:
                enrolment.Complete(clock.UtcNow);
                break;
            case false:
                enrolment.Reopen();
                break;
            default:
                break;
        }

        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            return AcademicsErrors.ConcurrencyConflict;
        }

        var etag = ETags.Format(db.Entry(enrolment).Property<uint>(ModuleDbContext.ConcurrencyTokenProperty).CurrentValue);
        return ((await queries.GetAsync(userId, enrolmentId, cancellationToken))!, etag);
    }
}
