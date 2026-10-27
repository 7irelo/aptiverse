using Aptiverse.Academics.Contracts;
using Aptiverse.Academics.Domain;
using Aptiverse.Academics.Features.Common;
using Aptiverse.Academics.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Academics.Lookups;

/// <summary>
/// Upserts labels into a unit's emergent topic registry by slug, keeping the first spelling and following admin
/// merges. New topics publish TopicRegistered in the same transaction. A unit holds a bounded number of topics.
/// </summary>
internal sealed partial class TopicRegistry(
    IDbContextOutbox<AcademicsDbContext> outbox,
    IClock clock,
    IOptions<AcademicsOptions> options,
    ILogger<TopicRegistry> logger) : ITopicRegistry
{
    public const int MaxLabelsPerCall = 20;
    private const int ListLimit = 200;

    private AcademicsDbContext Db => outbox.DbContext;

    public async Task<IReadOnlyList<TopicRef>> UpsertAsync(
        Guid studyUnitId,
        IReadOnlyList<string> labels,
        string source,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(labels);
        if (labels.Count > MaxLabelsPerCall)
        {
            throw new ArgumentException($"At most {MaxLabelsPerCall} labels per call.", nameof(labels));
        }

        if (!TopicSources.All.Contains(source))
        {
            throw new ArgumentException($"Unknown topic source '{source}'.", nameof(source));
        }

        var wanted = labels
            .Where(l => l is not null)
            .Select(Slugs.CleanText)
            .Where(l => l.Length is >= Topic.NameMinLength and <= Topic.NameMaxLength)
            .Select(l => (Slug: Slugs.Topic(l), Name: l))
            .Where(l => l.Slug.Length > 0)
            .DistinctBy(l => l.Slug, StringComparer.Ordinal)
            .ToList();
        if (wanted.Count == 0 || !await Db.StudyUnits.AnyAsync(u => u.Id == studyUnitId, cancellationToken))
        {
            return [];
        }

        try
        {
            return await RegisterAsync(studyUnitId, wanted, source, create: true, cancellationToken);
        }
        catch (DbUpdateException ex) when (DbErrors.IsUniqueViolation(ex))
        {
            // Another caller registered one of the same slugs at the same moment. Nothing of this call was saved;
            // return what exists now and let a later call register anything still missing.
            Db.ChangeTracker.Clear();
            return await RegisterAsync(studyUnitId, wanted, source, create: false, cancellationToken);
        }
    }

    public async Task<IReadOnlyList<TopicRef>> ListAsync(Guid studyUnitId, CancellationToken cancellationToken) =>
        await Db.Topics.AsNoTracking()
            .Where(t => t.StudyUnitId == studyUnitId && t.MergedIntoTopicId == null)
            .OrderBy(t => t.Name)
            .ThenBy(t => t.Id)
            .Take(ListLimit)
            .Select(t => new TopicRef(t.Id, t.Slug, t.Name))
            .ToListAsync(cancellationToken);

    private async Task<IReadOnlyList<TopicRef>> RegisterAsync(
        Guid studyUnitId,
        List<(string Slug, string Name)> wanted,
        string source,
        bool create,
        CancellationToken cancellationToken)
    {
        var slugs = wanted.Select(w => w.Slug).ToList();
        var existing = await Db.Topics.AsNoTracking()
            .Where(t => t.StudyUnitId == studyUnitId && slugs.Contains(t.Slug))
            .ToDictionaryAsync(t => t.Slug, StringComparer.Ordinal, cancellationToken);

        var capacity = options.Value.MaxTopicsPerUnit
            - await Db.Topics.CountAsync(t => t.StudyUnitId == studyUnitId && t.MergedIntoTopicId == null, cancellationToken);
        var now = clock.UtcNow;
        var created = new List<Topic>();
        foreach (var (slug, name) in wanted.Where(w => create && !existing.ContainsKey(w.Slug)))
        {
            if (created.Count >= capacity)
            {
                LogRegistryFull(logger, studyUnitId);
                break;
            }

            var topic = Topic.Create(studyUnitId, slug, name, source);
            Db.Topics.Add(topic);
            created.Add(topic);
            await outbox.PublishAsync(new TopicRegistered(studyUnitId, topic.Id, topic.Name, now));
        }

        if (created.Count > 0)
        {
            await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);
        }

        var all = existing.Values.Concat(created).ToDictionary(t => t.Slug, StringComparer.Ordinal);
        var mergeTargetIds = all.Values.Where(t => t.MergedIntoTopicId is not null).Select(t => t.MergedIntoTopicId!.Value).Distinct().ToList();
        var targets = mergeTargetIds.Count == 0
            ? []
            : await Db.Topics.AsNoTracking()
                .Where(t => t.StudyUnitId == studyUnitId && mergeTargetIds.Contains(t.Id))
                .ToDictionaryAsync(t => t.Id, cancellationToken);

        return wanted
            .Where(w => all.ContainsKey(w.Slug))
            .Select(w => all[w.Slug])
            .Select(t => t.MergedIntoTopicId is { } targetId && targets.TryGetValue(targetId, out var target) ? target : t)
            .DistinctBy(t => t.Id)
            .Select(t => new TopicRef(t.Id, t.Slug, t.Name))
            .ToList();
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "Topic registry of unit {StudyUnitId} is full; new labels were not registered")]
    private static partial void LogRegistryFull(ILogger logger, Guid studyUnitId);
}
