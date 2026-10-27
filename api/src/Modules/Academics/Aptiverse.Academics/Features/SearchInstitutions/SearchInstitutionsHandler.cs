using Aptiverse.Academics.Domain;
using Aptiverse.Academics.Features.Common;
using FluentValidation;

namespace Aptiverse.Academics.Features.SearchInstitutions;

internal sealed class SearchInstitutionsHandler(ReferenceCache reference)
{
    public async Task<IReadOnlyList<InstitutionView>> HandleAsync(SearchInstitutionsRequest request, CancellationToken cancellationToken)
    {
        var institutions = await reference.GetInstitutionsAsync(cancellationToken);
        var q = request.Q is null ? null : Slugs.CleanText(request.Q);

        return institutions
            .Where(i => request.Type is null || i.Type == request.Type)
            .Where(i => request.Province is null || i.Province == request.Province)
            .Select(i => (Institution: i, Rank: q is null ? 0 : Rank(i, q)))
            .Where(x => x.Rank >= 0)
            .OrderBy(x => x.Rank)
            .ThenBy(x => x.Institution.Name, StringComparer.OrdinalIgnoreCase)
            .Take(request.Limit)
            .Select(x => new InstitutionView(x.Institution.Id, x.Institution.Slug, x.Institution.Name, x.Institution.ShortName, x.Institution.Type, x.Institution.Province))
            .ToList();
    }

    /// <summary>Lower is better: exact short name or slug, then name prefix, then a word prefix, then anywhere. -1 is no match.</summary>
    private static int Rank(InstitutionInfo institution, string q)
    {
        const StringComparison Ignore = StringComparison.OrdinalIgnoreCase;
        if (string.Equals(institution.ShortName, q, Ignore) || string.Equals(institution.Slug, q, Ignore))
        {
            return 0;
        }

        if (institution.Name.StartsWith(q, Ignore) || (institution.ShortName?.StartsWith(q, Ignore) ?? false))
        {
            return 1;
        }

        if (institution.Name.Contains(" " + q, Ignore))
        {
            return 2;
        }

        return institution.Name.Contains(q, Ignore) || (institution.ShortName?.Contains(q, Ignore) ?? false) ? 3 : -1;
    }
}
