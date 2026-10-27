using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Progress.Evidence;

/// <summary>A recomputed topic. <see cref="BandChanged"/> drives MasteryUpdated and the journey.</summary>
internal sealed record MasteryChange(Guid StudyUnitId, string TopicKey, string Topic, MasteryValue Value, string? PreviousBand)
{
    public bool BandChanged => !string.Equals(PreviousBand, Value.Band, StringComparison.Ordinal);

    public bool BandUp => MasteryBands.Rank(Value.Band) > MasteryBands.Rank(PreviousBand);
}

/// <summary>
/// Recomputes topic_mastery for the touched topics from the live observations in the database. The result depends
/// only on those rows and the clock, so running it twice (a redelivered event) writes the same thing.
/// </summary>
internal sealed class MasteryProjector(ProgressDbContext db, IClock clock)
{
    public async Task<IReadOnlyList<MasteryChange>> RecomputeAsync(
        Guid userId,
        Guid studyUnitId,
        IReadOnlyCollection<string> topicKeys,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(topicKeys);
        var keys = topicKeys.Distinct(StringComparer.Ordinal).ToList();
        if (keys.Count == 0)
        {
            return [];
        }

        var now = clock.UtcNow;
        var observations = await db.MasteryObservations
            .Where(o => o.UserId == userId && o.StudyUnitId == studyUnitId && keys.Contains(o.TopicKey) && o.SupersededAt == null)
            .ToListAsync(cancellationToken);
        var rows = await db.TopicMastery
            .Where(m => m.UserId == userId && m.StudyUnitId == studyUnitId && keys.Contains(m.TopicKey) && m.Model == MasteryModels.RecencyWeightedV1)
            .ToListAsync(cancellationToken);

        var changes = new List<MasteryChange>();
        foreach (var key in keys)
        {
            var live = observations.Where(o => o.TopicKey == key && o.IsLive).ToList();
            var value = MasteryMath.Compute(live.Select(o => new ObservationPoint(o.QuestionsTotal, o.QuestionsCorrect, o.ObservedAt)).ToList(), now);
            var row = rows.SingleOrDefault(r => r.TopicKey == key);
            var display = live.OrderByDescending(o => o.ObservedAt).FirstOrDefault()?.Topic ?? row?.Topic ?? key;
            if (row is null)
            {
                if (value.Score is null)
                {
                    continue;
                }

                row = TopicMastery.Create(userId, studyUnitId, key, display);
                db.TopicMastery.Add(row);
            }

            var previousBand = row.Band;
            if (row.Apply(value, display) || db.Entry(row).State == EntityState.Added)
            {
                changes.Add(new MasteryChange(studyUnitId, key, display, value, previousBand));
            }
        }

        return changes;
    }
}
