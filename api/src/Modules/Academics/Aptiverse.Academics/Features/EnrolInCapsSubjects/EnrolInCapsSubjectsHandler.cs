using Aptiverse.Academics.Contracts;
using Aptiverse.Academics.Domain;
using Aptiverse.Academics.Features.Common;
using Aptiverse.Academics.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Academics.Features.EnrolInCapsSubjects;

/// <summary>
/// Enrols a high school student in CAPS subjects through the enrolment gate: finds or creates the shared unit for
/// each (subject, curriculum, grade) and enrols once. Re-enrolling returns the existing enrolment unchanged.
/// </summary>
internal sealed class EnrolInCapsSubjectsHandler(
    IDbContextOutbox<AcademicsDbContext> outbox,
    StudentResolver students,
    ReferenceCache reference,
    UnitStore units,
    UnitQueries queries,
    IClock clock,
    IOptions<AcademicsOptions> options)
{
    private AcademicsDbContext Db => outbox.DbContext;

    public async Task<Result<(EnrolInCapsSubjectsResponse Response, bool Created)>> HandleAsync(
        Guid userId,
        EnrolInCapsSubjectsRequest request,
        CancellationToken cancellationToken)
    {
        var student = await students.ResolveAsync(userId, cancellationToken);
        if (student is not { IsHighSchool: true })
        {
            return AcademicsErrors.HighSchoolOnly;
        }

        var curriculum = student.Profile.Curriculum!;
        var grade = (short)student.Profile.Grade!.Value;
        var offered = (await reference.GetCatalogAsync(curriculum, cancellationToken))
            .Where(e => e.MinGrade <= grade && grade <= e.MaxGrade)
            .ToDictionary(e => e.SubjectId);

        var choices = request.Subjects!;
        if (choices.Any(c => !offered.ContainsKey(c.SubjectId)))
        {
            return AcademicsErrors.SubjectNotFound;
        }

        var unitsBySubject = new Dictionary<Guid, StudyUnit>();
        var keys = choices.Select(c => StudyUnit.CapsKey(offered[c.SubjectId].Slug, curriculum, grade)).ToList();
        var existingUnits = await Db.StudyUnits.Where(u => keys.Contains(u.NormalizedKey)).ToListAsync(cancellationToken);
        foreach (var choice in choices)
        {
            var entry = offered[choice.SubjectId];
            var key = StudyUnit.CapsKey(entry.Slug, curriculum, grade);
            unitsBySubject[choice.SubjectId] = existingUnits.SingleOrDefault(u => u.NormalizedKey == key)
                ?? await units.FindOrCreateAsync(StudyUnit.CreateCaps(entry.SubjectId, entry.Slug, entry.Name, curriculum, grade), cancellationToken);
        }

        if (unitsBySubject.Values.Any(u => !EnrolmentGate.CanEnrol(student, u)))
        {
            return AcademicsErrors.HighSchoolOnly;
        }

        var unitIds = unitsBySubject.Values.Select(u => u.Id).ToList();
        var existing = await Db.Enrolments
            .Where(e => e.UserId == userId && unitIds.Contains(e.StudyUnitId))
            .ToDictionaryAsync(e => e.StudyUnitId, cancellationToken);

        var toCreate = choices.Where(c => !existing.ContainsKey(unitsBySubject[c.SubjectId].Id)).ToList();
        var max = options.Value.MaxActiveUnits;
        if (toCreate.Count > 0 && await units.CountActiveAsync(userId, cancellationToken) + toCreate.Count > max)
        {
            return AcademicsErrors.TooManyUnits(max);
        }

        var now = clock.UtcNow;
        var order = await units.NextDisplayOrderAsync(userId, cancellationToken);
        var created = new HashSet<Guid>();
        foreach (var choice in toCreate)
        {
            var unit = unitsBySubject[choice.SubjectId];
            var enrolment = Enrolment.Create(userId, unit, choice.TeacherName, Sast.Today(now), duration: null, (short)order++);
            Db.Enrolments.Add(enrolment);
            existing[unit.Id] = enrolment;
            created.Add(enrolment.Id);
            await outbox.PublishAsync(new StudyUnitEnrolled(userId, unit.Id, enrolment.Id, unit.Kind, unit.Name, now));
        }

        if (created.Count > 0)
        {
            try
            {
                await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
            }
            catch (DbUpdateException ex) when (DbErrors.IsUniqueViolation(ex))
            {
                // A concurrent request enrolled in the same subject first.
                return AcademicsErrors.AlreadyEnrolled;
            }

            foreach (var _ in created)
            {
                AcademicsMetrics.EnrolmentCreated(StudyUnitKinds.CapsSubject, shared: true);
            }
        }

        var enrolmentIds = choices.Select(c => existing[unitsBySubject[c.SubjectId].Id].Id).ToList();
        var summaries = (await queries.GetManyAsync(userId, enrolmentIds, cancellationToken)).ToDictionary(s => s.EnrolmentId);
        var items = enrolmentIds.Select(id => new EnrolledUnit(!created.Contains(id), summaries[id])).ToList();

        return (new EnrolInCapsSubjectsResponse(items), created.Count > 0);
    }
}
