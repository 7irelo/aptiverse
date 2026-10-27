namespace Aptiverse.Academics.Contracts;

/// <summary>
/// The emergent per-unit topic registry. Practice tags generated questions through it. Callers must already have
/// checked that the user is enrolled in the unit (through <see cref="IStudyUnitLookup"/>); the registry itself
/// never reveals who registered a topic.
/// </summary>
public interface ITopicRegistry
{
    /// <summary>
    /// Registers labels for a unit and returns their canonical topics, one per distinct slug. Labels are
    /// slugified; an existing topic keeps its first spelling and a merged topic resolves to its target. At most
    /// 20 labels per call; labels outside 2 to 120 characters are skipped. Throws <see cref="ArgumentException"/>
    /// for more than 20 labels or an unknown source.
    /// </summary>
    /// <param name="studyUnitId">The unit whose registry receives the labels.</param>
    /// <param name="labels">Topic labels as written, for example by question generation.</param>
    /// <param name="source">"generation", "student", "admin" or "migration".</param>
    /// <param name="cancellationToken">Cancels the call.</param>
    Task<IReadOnlyList<TopicRef>> UpsertAsync(Guid studyUnitId, IReadOnlyList<string> labels, string source, CancellationToken cancellationToken);

    /// <summary>The unit's canonical topics (merged topics excluded), sorted by name.</summary>
    Task<IReadOnlyList<TopicRef>> ListAsync(Guid studyUnitId, CancellationToken cancellationToken);
}

public sealed record TopicRef(Guid TopicId, string Slug, string Name);
