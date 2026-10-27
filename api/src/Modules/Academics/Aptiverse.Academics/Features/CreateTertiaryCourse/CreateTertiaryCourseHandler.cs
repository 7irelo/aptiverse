using Aptiverse.Academics.Contracts;
using Aptiverse.Academics.Domain;
using Aptiverse.Academics.Features.Common;
using Aptiverse.Academics.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Academics.Features.CreateTertiaryCourse;

/// <summary>
/// Adds a tertiary course through the enrolment gate. At a catalog institution the course is shared: the first
/// student creates it and the next ones with the same code (or name, without a code) and level join it.
/// </summary>
internal sealed class CreateTertiaryCourseHandler(
    IDbContextOutbox<AcademicsDbContext> outbox,
    StudentResolver students,
    UnitStore units,
    UnitQueries queries,
    IClock clock,
    IOptions<AcademicsOptions> options)
{
    private AcademicsDbContext Db => outbox.DbContext;

    public async Task<Result<UnitSummary>> HandleAsync(Guid userId, CreateTertiaryCourseRequest request, CancellationToken cancellationToken)
    {
        var student = await students.ResolveAsync(userId, cancellationToken);
        if (student is not { IsTertiary: true })
        {
            return AcademicsErrors.TertiaryOnly;
        }

        var level = request.Level ?? TertiaryLevels.FromYearOfStudy(student.Profile.YearOfStudy);
        if (level is null)
        {
            return AcademicsErrors.LevelRequired;
        }

        var max = options.Value.MaxActiveUnits;
        if (await units.CountActiveAsync(userId, cancellationToken) >= max)
        {
            return AcademicsErrors.TooManyUnits(max);
        }

        var unit = await units.FindOrCreateAsync(
            StudyUnit.CreateCourse(student.Institution, userId, request.Name!, request.CourseCode, level),
            cancellationToken);
        if (!EnrolmentGate.CanEnrol(student, unit))
        {
            return AcademicsErrors.TertiaryOnly;
        }

        if (await Db.Enrolments.AnyAsync(e => e.UserId == userId && e.StudyUnitId == unit.Id, cancellationToken))
        {
            return AcademicsErrors.AlreadyEnrolled;
        }

        var now = clock.UtcNow;
        var order = await units.NextDisplayOrderAsync(userId, cancellationToken);
        var enrolment = Enrolment.Create(userId, unit, request.LecturerName, request.StartedOn ?? Sast.Today(now), request.Duration, (short)order);
        Db.Enrolments.Add(enrolment);
        await outbox.PublishAsync(new StudyUnitEnrolled(userId, unit.Id, enrolment.Id, unit.Kind, unit.Name, now));

        try
        {
            await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (DbErrors.IsUniqueViolation(ex))
        {
            return AcademicsErrors.AlreadyEnrolled;
        }

        AcademicsMetrics.EnrolmentCreated(StudyUnitKinds.TertiaryCourse, unit.IsShared);
        return (await queries.GetAsync(userId, enrolment.Id, cancellationToken))!;
    }
}
