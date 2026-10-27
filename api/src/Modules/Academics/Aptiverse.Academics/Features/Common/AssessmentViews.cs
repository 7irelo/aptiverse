using Aptiverse.Academics.Domain;
using Aptiverse.Academics.Persistence;
using Aptiverse.SharedKernel.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Academics.Features.Common;

/// <summary>One of the caller's assessments in full.</summary>
/// <param name="Id">The id.</param>
/// <param name="EnrolmentId">Your enrolment the item belongs to.</param>
/// <param name="UnitId">The study unit, shared by every student enrolled in it.</param>
/// <param name="UnitName">The unit display name.</param>
/// <param name="Title">2 to 160 characters.</param>
/// <param name="Type">One of the assessment types, for example "test" or "lab_report".</param>
/// <param name="WeightPercent">Weight toward the unit result, 0 to 100.</param>
/// <param name="Term">School term 1 to 4 (high school only).</param>
/// <param name="DueAt">When it is due, with an offset.</param>
/// <param name="State">"scheduled", "in_progress", "submitted" or "graded".</param>
/// <param name="PredictedPercent">Your own prediction, 0 to 100.</param>
/// <param name="MarkObtained">Whole-number mark obtained, null until graded.</param>
/// <param name="MarkTotal">Whole-number mark total, null until graded.</param>
/// <param name="Percent">Computed from the mark, rounded to two decimals; null until graded.</param>
/// <param name="Notes">Your private notes.</param>
/// <param name="StartedAt">Set when it moved to in progress.</param>
/// <param name="SubmittedAt">Set when it was submitted.</param>
/// <param name="GradedAt">Set when the mark was recorded.</param>
/// <param name="IsOverdue">Not submitted or graded, and the due time has passed.</param>
/// <param name="AllowedActions">What the student can do next: "start", "submit", "reopen", "remove_mark", "mark".</param>
/// <param name="UnitWeighting">The unit's weighting including this assessment.</param>
/// <param name="CreatedAt">Created, in UTC.</param>
/// <param name="UpdatedAt">Last changed, in UTC.</param>
internal sealed record AssessmentView(
    Guid Id,
    Guid EnrolmentId,
    Guid UnitId,
    string UnitName,
    string Title,
    string Type,
    decimal? WeightPercent,
    int? Term,
    DateTimeOffset DueAt,
    string State,
    decimal? PredictedPercent,
    int? MarkObtained,
    int? MarkTotal,
    decimal? Percent,
    string? Notes,
    DateTimeOffset? StartedAt,
    DateTimeOffset? SubmittedAt,
    DateTimeOffset? GradedAt,
    bool IsOverdue,
    IReadOnlyList<string> AllowedActions,
    WeightingView UnitWeighting,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

/// <summary>An assessment in a list. Notes and marks stay on the detail view.</summary>
internal sealed record AssessmentListItem(
    Guid Id,
    Guid EnrolmentId,
    string UnitName,
    string Title,
    string Type,
    string State,
    DateTimeOffset DueAt,
    decimal? WeightPercent,
    decimal? Percent,
    decimal? PredictedPercent,
    bool IsOverdue);

/// <summary>An assessment the caller owns, loaded for a change, with its enrolment and unit.</summary>
internal sealed record OwnedAssessment(Assessment Assessment, Enrolment Enrolment, StudyUnit Unit);

internal sealed class AssessmentQueries(AcademicsDbContext db, IClock clock)
{
    /// <summary>Tracked load for writes. Null for a missing, deleted or someone else's assessment.</summary>
    public async Task<OwnedAssessment?> LoadOwnedAsync(Guid userId, Guid assessmentId, CancellationToken cancellationToken)
    {
        var row = await (from a in db.Assessments
                         join e in db.Enrolments on a.EnrolmentId equals e.Id
                         join u in db.StudyUnits on e.StudyUnitId equals u.Id
                         where a.Id == assessmentId && a.UserId == userId && e.UserId == userId
                             && e.Status != EnrolmentStatuses.StageMismatch
                         select new { a, e, u })
            .SingleOrDefaultAsync(cancellationToken);

        return row is null ? null : new OwnedAssessment(row.a, row.e, row.u);
    }

    public async Task<AssessmentView> ToViewAsync(OwnedAssessment owned, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(owned);
        var (assessment, enrolment, unit) = owned;

        var siblings = await db.Assessments.AsNoTracking()
            .Where(a => a.EnrolmentId == enrolment.Id && a.UserId == assessment.UserId && a.Id != assessment.Id)
            .Select(a => new WeightedItem(a.WeightPercent, a.State == AssessmentStates.Graded, a.Percent, a.PredictedPercent))
            .ToListAsync(cancellationToken);

        // The tracked assessment may hold unsaved or just saved values; it counts once, as it is now.
        var items = siblings;
        if (!assessment.IsDeleted)
        {
            items.Add(new WeightedItem(assessment.WeightPercent, assessment.IsGraded, assessment.Percent, assessment.PredictedPercent));
        }

        return new AssessmentView(
            assessment.Id,
            enrolment.Id,
            unit.Id,
            unit.Name,
            assessment.Title,
            assessment.AssessmentType,
            assessment.WeightPercent,
            assessment.Term,
            assessment.DueAt,
            assessment.State,
            assessment.PredictedPercent,
            assessment.MarkObtained,
            assessment.MarkTotal,
            assessment.Percent,
            assessment.Notes,
            assessment.StartedAt,
            assessment.SubmittedAt,
            assessment.GradedAt,
            assessment.IsOverdue(clock.UtcNow),
            assessment.AllowedActions(),
            WeightingView.From(UnitWeighting.Compute(items)),
            assessment.CreatedAt,
            assessment.UpdatedAt);
    }

    /// <summary>The xmin row version, as an ETag value.</summary>
    public string ETagOf(Assessment assessment) =>
        ETags.Format(db.Entry(assessment).Property<uint>(ModuleDbContext.ConcurrencyTokenProperty).CurrentValue);

    /// <summary>
    /// Makes the next save fail with a concurrency conflict unless the row still has the version the client saw.
    /// Returns false when the If-Match value is not a version this API issued.
    /// </summary>
    public bool ApplyIfMatch(object entity, string? ifMatch) => ETags.ApplyIfMatch(db, entity, ifMatch);
}

/// <summary>Strong ETags over the xmin row version, for optimistic concurrency on PATCH (If-Match).</summary>
internal static class ETags
{
    public static string Format(uint version) => $"\"{version.ToString(System.Globalization.CultureInfo.InvariantCulture)}\"";

    public static bool ApplyIfMatch(DbContext db, object entity, string? ifMatch)
    {
        ArgumentNullException.ThrowIfNull(db);
        if (string.IsNullOrWhiteSpace(ifMatch))
        {
            return true;
        }

        var value = ifMatch.Trim();
        if (value.StartsWith("W/", StringComparison.Ordinal))
        {
            value = value[2..];
        }

        if (value.Length < 3 || value[0] != '"' || value[^1] != '"'
            || !uint.TryParse(value.AsSpan(1, value.Length - 2), System.Globalization.NumberStyles.None, System.Globalization.CultureInfo.InvariantCulture, out var version))
        {
            return false;
        }

        db.Entry(entity).Property(ModuleDbContext.ConcurrencyTokenProperty).OriginalValue = version;
        return true;
    }
}
