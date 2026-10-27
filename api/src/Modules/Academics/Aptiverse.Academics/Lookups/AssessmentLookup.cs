using Aptiverse.Academics.Contracts;
using Aptiverse.Academics.Domain;
using Aptiverse.Academics.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Academics.Lookups;

/// <summary>Every query filters by the user id first, so another user's assessment is never returned.</summary>
internal sealed class AssessmentLookup(AcademicsDbContext db, ITopicRegistry topics) : IAssessmentLookup
{
    private const int OpenLimit = 100;

    public async Task<IReadOnlyList<OpenAssessment>> GetOpenForUserAsync(Guid userId, CancellationToken cancellationToken) =>
        await (from a in db.Assessments.AsNoTracking()
               join e in db.Enrolments.AsNoTracking() on a.EnrolmentId equals e.Id
               join u in db.StudyUnits.AsNoTracking() on e.StudyUnitId equals u.Id
               where a.UserId == userId && e.UserId == userId && e.Status == EnrolmentStatuses.Active
                   && AssessmentStates.Open.Contains(a.State)
               orderby a.DueAt, a.Id
               select new OpenAssessment(a.Id, a.Title, u.Id, u.Name, a.DueAt))
            .Take(OpenLimit)
            .ToListAsync(cancellationToken);

    public async Task<AssessmentContext?> GetForUserAsync(Guid userId, Guid assessmentId, CancellationToken cancellationToken)
    {
        var row = await (from a in db.Assessments.AsNoTracking()
                         join e in db.Enrolments.AsNoTracking() on a.EnrolmentId equals e.Id
                         join u in db.StudyUnits.AsNoTracking() on e.StudyUnitId equals u.Id
                         where a.Id == assessmentId && a.UserId == userId && e.UserId == userId
                             && e.Status != EnrolmentStatuses.StageMismatch
                         select new { a.Id, UnitId = u.Id, UnitName = u.Name, a.Title, a.AssessmentType, a.State, a.DueAt })
            .SingleOrDefaultAsync(cancellationToken);
        if (row is null)
        {
            return null;
        }

        var unitTopics = await topics.ListAsync(row.UnitId, cancellationToken);
        return new AssessmentContext(row.Id, row.UnitId, row.UnitName, row.Title, row.AssessmentType, row.State, row.DueAt, unitTopics);
    }
}
