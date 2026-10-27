using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Academics.Domain;

/// <summary>
/// A topic in a unit's emergent registry, keyed by its slug. The first spelling seen is kept as the name. An admin
/// merge points a duplicate at its canonical topic; readers always resolve to the target.
/// </summary>
internal sealed class Topic : Entity
{
    public const int SlugMaxLength = Slugs.TopicSlugMaxLength;
    public const int NameMaxLength = 120;
    public const int NameMinLength = 2;
    public const int SourceMaxLength = 16;

    private Topic()
    {
    }

    public Guid StudyUnitId { get; private set; }

    public string Slug { get; private set; } = string.Empty;

    public string Name { get; private set; } = string.Empty;

    public string Source { get; private set; } = TopicSources.Generation;

    public Guid? MergedIntoTopicId { get; private set; }

    public static Topic Create(Guid studyUnitId, string slug, string name, string source) => new()
    {
        StudyUnitId = studyUnitId,
        Slug = slug,
        Name = name,
        Source = source,
    };
}
