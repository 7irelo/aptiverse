using Aptiverse.Academics.Contracts;
using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Persistence;
using Aptiverse.SharedKernel.Results;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Progress.Features.GetMastery;

internal sealed class GetMasteryHandler(ProgressDbContext db, IStudyUnitLookup units)
{
    public async Task<Result<MasteryView>> HandleAsync(Guid userId, GetMasteryRequest request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        IReadOnlyList<StudyUnitContext> owned;
        if (request.StudyUnitId is { } unitId)
        {
            var unit = await units.GetAsync(unitId, userId, cancellationToken);
            if (unit is null)
            {
                return ProgressErrors.UnitNotFound;
            }

            owned = [unit];
        }
        else
        {
            owned = await units.GetForUserAsync(userId, cancellationToken);
        }

        var unitIds = owned.Select(u => u.StudyUnitId).ToList();
        var rows = await db.TopicMastery.AsNoTracking()
            .Where(m => m.UserId == userId && m.Model == MasteryModels.RecencyWeightedV1 && unitIds.Contains(m.StudyUnitId))
            .ToListAsync(cancellationToken);
        var byUnit = rows.ToLookup(r => r.StudyUnitId);

        return new MasteryView(owned.Select(u => Build(u, byUnit[u.StudyUnitId].ToList())).ToList());
    }

    public static UnitMasteryView Build(StudyUnitContext unit, IReadOnlyList<TopicMastery> rows)
    {
        ArgumentNullException.ThrowIfNull(unit);
        ArgumentNullException.ThrowIfNull(rows);
        var topics = rows.Where(r => !r.IsWholeUnit).Select(ToItem).ToList();
        var known = topics.Select(t => TopicKeys.Key(t.Topic)).ToHashSet(StringComparer.Ordinal);
        topics.AddRange(unit.KnownTopics
            .Where(t => known.Add(TopicKeys.Key(t)))
            .Select(t => new TopicMasteryItem(TopicKeys.Display(t), null, null, false, 0, 0, null, null)));

        var marksRow = rows.SingleOrDefault(r => r.IsWholeUnit && r.Score is not null);
        var (score, questions) = MasteryMath.Combine(rows.Select(r => (r.Score, r.EvidenceQuestions)));
        return new UnitMasteryView(
            unit.StudyUnitId,
            unit.Name,
            score,
            MasteryMath.BandOf(score),
            score is not null && questions < MasteryMath.EarlyReadBelowQuestions,
            questions,
            marksRow is null ? null : ToItem(marksRow) with { Topic = "Assessment marks" },
            topics.OrderBy(t => t.Topic, StringComparer.OrdinalIgnoreCase).ToList());
    }

    private static TopicMasteryItem ToItem(TopicMastery row) => new(
        row.Topic,
        row.Score,
        row.Band,
        row.EarlyRead,
        row.EvidenceQuestions,
        row.ObservationCount,
        row.LastEvidenceAt,
        MasteryMath.Trend(row.Score, row.PreviousScore));
}
