using Aptiverse.Academics.Domain;
using Aptiverse.Academics.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Academics.Features.Common;

/// <summary>The soonest open assessment of a unit.</summary>
internal sealed record NextDueView(Guid AssessmentId, string Title, DateTimeOffset DueAt);

/// <summary>
/// The unit's standing from its assessments. Percents are null when nothing is graded ("no marks yet"), never 0.
/// Warnings: "total_above_100" (weights add up to more than 100) and "missing_weights" (only some have a weight).
/// </summary>
internal sealed record WeightingView(
    decimal? CurrentPercent,
    decimal? PredictedPercent,
    decimal GradedWeightPercent,
    decimal WeightTotalPercent,
    int GradedCount,
    int AssessmentCount,
    IReadOnlyList<string> Warnings)
{
    public static WeightingView From(WeightingResult result)
    {
        ArgumentNullException.ThrowIfNull(result);
        return new(
            result.CurrentPercent,
            result.PredictedPercent,
            result.GradedWeightPercent,
            result.WeightTotalPercent,
            result.GradedCount,
            result.AssessmentCount,
            result.Warnings);
    }
}

/// <summary>One of the caller's enrolments with its unit.</summary>
/// <param name="EnrolmentId">The id every per-student unit route takes.</param>
/// <param name="UnitId">The study unit, shared by every student enrolled in it.</param>
/// <param name="Kind">"caps_subject" or "tertiary_course".</param>
/// <param name="Name">The display name.</param>
/// <param name="Code">The CAPS subject code or the course code.</param>
/// <param name="Level">"grade_8" to "grade_12" for subjects; "first_year" to "phd" for courses.</param>
/// <param name="Grade">8 to 12 for subjects, otherwise null.</param>
/// <param name="Curriculum">"nsc" or "ieb" for subjects, otherwise null.</param>
/// <param name="InstitutionName">The catalog institution of a shared course, otherwise null.</param>
/// <param name="IsShared">False only for a private course (institution not in the catalog).</param>
/// <param name="TeacherName">Teacher or lecturer, if you added one.</param>
/// <param name="Status">"active", "completed", "dropped" or "stage_mismatch".</param>
/// <param name="StartedOn">When you started it.</param>
/// <param name="Duration">"semester" or "full_year" for courses, otherwise null.</param>
/// <param name="ExpectedEndOn">Started on plus the duration, for courses with a duration.</param>
/// <param name="IsFinished">Completed explicitly, or past the expected end of its duration.</param>
/// <param name="ColourToken">Your chip colour token, if chosen.</param>
/// <param name="DisplayOrder">Your ordering, 0 to 99.</param>
/// <param name="NextDue">The soonest open assessment, or null.</param>
/// <param name="Weighting">The weighting summary from your assessments.</param>
/// <param name="TopicCount">Canonical topics in the unit registry.</param>
internal sealed record UnitSummary(
    Guid EnrolmentId,
    Guid UnitId,
    string Kind,
    string Name,
    string? Code,
    string Level,
    int? Grade,
    string? Curriculum,
    string? InstitutionName,
    bool IsShared,
    string? TeacherName,
    string Status,
    DateOnly StartedOn,
    string? Duration,
    DateOnly? ExpectedEndOn,
    bool IsFinished,
    string? ColourToken,
    int DisplayOrder,
    NextDueView? NextDue,
    WeightingView Weighting,
    int TopicCount);

/// <summary>
/// Builds unit summaries in three grouped queries (enrolments with units, the user's assessments in them, topic
/// counts) and computes weighting in memory. Always filtered by the caller's user id.
/// </summary>
internal sealed class UnitQueries(AcademicsDbContext db, ReferenceCache reference, IClock clock)
{
    public async Task<IReadOnlyList<UnitSummary>> ListAsync(Guid userId, IReadOnlyCollection<string> statuses, CancellationToken cancellationToken) =>
        await BuildAsync(userId, db.Enrolments.AsNoTracking().Where(e => e.UserId == userId && statuses.Contains(e.Status)), cancellationToken);

    public async Task<UnitSummary?> GetAsync(Guid userId, Guid enrolmentId, CancellationToken cancellationToken)
    {
        var summaries = await BuildAsync(
            userId,
            db.Enrolments.AsNoTracking().Where(e => e.UserId == userId && e.Id == enrolmentId),
            cancellationToken);
        return summaries.SingleOrDefault();
    }

    public async Task<IReadOnlyList<UnitSummary>> GetManyAsync(Guid userId, IReadOnlyCollection<Guid> enrolmentIds, CancellationToken cancellationToken) =>
        await BuildAsync(
            userId,
            db.Enrolments.AsNoTracking().Where(e => e.UserId == userId && enrolmentIds.Contains(e.Id)),
            cancellationToken);

    private async Task<IReadOnlyList<UnitSummary>> BuildAsync(Guid userId, IQueryable<Enrolment> enrolments, CancellationToken cancellationToken)
    {
        var rows = await enrolments
            .Join(db.StudyUnits.AsNoTracking(), e => e.StudyUnitId, u => u.Id, (e, u) => new
            {
                Enrolment = e,
                Unit = u,
                SubjectCode = db.CatalogSubjects.Where(s => s.Id == u.CatalogSubjectId).Select(s => s.Code).FirstOrDefault(),
            })
            .ToListAsync(cancellationToken);
        if (rows.Count == 0)
        {
            return [];
        }

        var enrolmentIds = rows.Select(r => r.Enrolment.Id).ToList();
        var unitIds = rows.Select(r => r.Unit.Id).Distinct().ToList();

        var assessments = await db.Assessments.AsNoTracking()
            .Where(a => a.UserId == userId && enrolmentIds.Contains(a.EnrolmentId))
            .Select(a => new { a.EnrolmentId, a.Id, a.Title, a.DueAt, a.State, a.WeightPercent, a.Percent, a.PredictedPercent })
            .ToListAsync(cancellationToken);
        var byEnrolment = assessments.ToLookup(a => a.EnrolmentId);

        var topicCounts = await db.Topics.AsNoTracking()
            .Where(t => unitIds.Contains(t.StudyUnitId) && t.MergedIntoTopicId == null)
            .GroupBy(t => t.StudyUnitId)
            .Select(g => new { UnitId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.UnitId, g => g.Count, cancellationToken);

        var institutions = (await reference.GetInstitutionsAsync(cancellationToken)).ToDictionary(i => i.Id);
        var now = clock.UtcNow;
        var today = Sast.Today(now);

        return rows
            .Select(r =>
            {
                var items = byEnrolment[r.Enrolment.Id].ToList();
                var next = items
                    .Where(a => a.State is AssessmentStates.Scheduled or AssessmentStates.InProgress && a.DueAt >= now)
                    .OrderBy(a => a.DueAt)
                    .FirstOrDefault();
                var weighting = UnitWeighting.Compute(items
                    .Select(a => new WeightedItem(a.WeightPercent, a.State == AssessmentStates.Graded, a.Percent, a.PredictedPercent))
                    .ToList());
                var institutionName = r.Unit.InstitutionId is { } id && institutions.TryGetValue(id, out var institution)
                    ? institution.Name
                    : null;

                return new UnitSummary(
                    r.Enrolment.Id,
                    r.Unit.Id,
                    r.Unit.Kind,
                    r.Unit.Name,
                    r.Unit.Kind == StudyUnitKinds.CapsSubject ? r.SubjectCode : r.Unit.CourseCode,
                    r.Unit.LevelKey,
                    r.Unit.Grade,
                    r.Unit.CurriculumCode,
                    institutionName,
                    r.Unit.IsShared,
                    r.Enrolment.TeacherName,
                    r.Enrolment.Status,
                    r.Enrolment.StartedOn,
                    r.Enrolment.Duration,
                    r.Enrolment.ExpectedEndOn,
                    r.Enrolment.IsFinished(today),
                    r.Enrolment.ColourToken,
                    r.Enrolment.DisplayOrder,
                    next is null ? null : new NextDueView(next.Id, next.Title, next.DueAt),
                    WeightingView.From(weighting),
                    topicCounts.GetValueOrDefault(r.Unit.Id));
            })
            .OrderBy(s => s.DisplayOrder)
            .ThenBy(s => s.Name, StringComparer.OrdinalIgnoreCase)
            .ThenBy(s => s.EnrolmentId)
            .ToList();
    }
}
