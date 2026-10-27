using Aptiverse.Academics.Contracts;
using Aptiverse.Academics.Domain;
using Aptiverse.Academics.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Academics.Lookups;

/// <summary>Active enrolments only; a unit the user is not actively enrolled in is null.</summary>
internal sealed class StudyUnitLookup(AcademicsDbContext db) : IStudyUnitLookup
{
    private const int TopicLimit = 50;
    private const int OpenAssessmentLimit = 20;

    public async Task<IReadOnlyList<StudyUnitContext>> GetForUserAsync(Guid userId, CancellationToken cancellationToken) =>
        await BuildAsync(userId, studyUnitId: null, cancellationToken);

    public async Task<StudyUnitContext?> GetAsync(Guid studyUnitId, Guid userId, CancellationToken cancellationToken) =>
        (await BuildAsync(userId, studyUnitId, cancellationToken)).SingleOrDefault();

    private async Task<IReadOnlyList<StudyUnitContext>> BuildAsync(Guid userId, Guid? studyUnitId, CancellationToken cancellationToken)
    {
        var rows = await (from e in db.Enrolments.AsNoTracking()
                          join u in db.StudyUnits.AsNoTracking() on e.StudyUnitId equals u.Id
                          where e.UserId == userId && e.Status == EnrolmentStatuses.Active
                              && (studyUnitId == null || u.Id == studyUnitId)
                          orderby e.DisplayOrder, u.Name
                          select new { EnrolmentId = e.Id, Unit = u })
            .ToListAsync(cancellationToken);
        if (rows.Count == 0)
        {
            return [];
        }

        var unitIds = rows.Select(r => r.Unit.Id).ToList();
        var enrolmentIds = rows.Select(r => r.EnrolmentId).ToList();

        var topics = await db.Topics.AsNoTracking()
            .Where(t => unitIds.Contains(t.StudyUnitId) && t.MergedIntoTopicId == null)
            .OrderBy(t => t.Name)
            .Select(t => new { t.StudyUnitId, t.Name })
            .ToListAsync(cancellationToken);
        var topicsByUnit = topics.ToLookup(t => t.StudyUnitId, t => t.Name);

        var open = await db.Assessments.AsNoTracking()
            .Where(a => a.UserId == userId && enrolmentIds.Contains(a.EnrolmentId) && AssessmentStates.Open.Contains(a.State))
            .OrderBy(a => a.DueAt)
            .Select(a => new { a.EnrolmentId, a.Id, a.Title, a.DueAt })
            .ToListAsync(cancellationToken);
        var openByEnrolment = open.ToLookup(a => a.EnrolmentId);

        return rows
            .Select(r => new StudyUnitContext(
                r.Unit.Id,
                r.Unit.Kind,
                Stages.For(r.Unit.Kind),
                r.Unit.Name,
                r.Unit.LevelKey,
                r.Unit.CurriculumCode,
                topicsByUnit[r.Unit.Id].Take(TopicLimit).ToList(),
                r.EnrolmentId,
                openByEnrolment[r.EnrolmentId].Take(OpenAssessmentLimit).Select(a => new OpenAssessmentRef(a.Id, a.Title, a.DueAt)).ToList()))
            .ToList();
    }
}
