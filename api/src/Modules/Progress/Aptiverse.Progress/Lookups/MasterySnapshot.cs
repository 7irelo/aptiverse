using Aptiverse.Progress.Contracts;
using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Progress.Lookups;

/// <summary>
/// Reads the recency-weighted projection only (the ML model's rows are ignored until a switch flips). Every query
/// filters by the user id first; the whole-unit mark row is not a topic and is never listed.
/// </summary>
internal sealed class MasterySnapshot(ProgressDbContext db) : IMasterySnapshot
{
    public const int MaxTake = 20;

    public async Task<IReadOnlyList<TopicMasteryView>> GetWeakestTopicsAsync(Guid userId, int take, CancellationToken cancellationToken)
    {
        var limit = Math.Clamp(take, 1, MaxTake);
        return await Topics(userId)
            .Where(m => m.Score != null)
            .OrderBy(m => m.EarlyRead)
            .ThenBy(m => m.Score)
            .ThenByDescending(m => m.EvidenceQuestions)
            .ThenBy(m => m.TopicKey)
            .Take(limit)
            .Select(m => new TopicMasteryView(m.StudyUnitId, m.Topic, m.Score, m.Band, m.EvidenceQuestions, m.ObservationCount, m.EarlyRead, m.LastEvidenceAt))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<TopicMasteryView>> GetForUnitAsync(Guid userId, Guid studyUnitId, CancellationToken cancellationToken) =>
        await Topics(userId)
            .Where(m => m.StudyUnitId == studyUnitId)
            .OrderBy(m => m.TopicKey)
            .Select(m => new TopicMasteryView(m.StudyUnitId, m.Topic, m.Score, m.Band, m.EvidenceQuestions, m.ObservationCount, m.EarlyRead, m.LastEvidenceAt))
            .ToListAsync(cancellationToken);

    private IQueryable<TopicMastery> Topics(Guid userId) =>
        db.TopicMastery.AsNoTracking()
            .Where(m => m.UserId == userId && m.Model == MasteryModels.RecencyWeightedV1 && m.TopicKey != TopicKeys.WholeUnit);
}
