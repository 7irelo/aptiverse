using Aptiverse.Academics.Domain;
using Aptiverse.Academics.Features.Common;
using FluentValidation;

namespace Aptiverse.Academics.Features.GetCatalog;

internal sealed class GetCatalogHandler(ReferenceCache reference)
{
    public async Task<CatalogResponse> HandleAsync(GetCatalogRequest request, CancellationToken cancellationToken)
    {
        var curriculum = request.Curriculum!;
        var grade = request.Grade!.Value;
        var entries = await reference.GetCatalogAsync(curriculum, cancellationToken);

        var subjects = entries
            .Where(e => e.MinGrade <= grade && grade <= e.MaxGrade)
            .Where(e => request.Category is null || e.Category == request.Category)
            .OrderByDescending(e => e.IsCompulsory)
            .ThenBy(e => IndexOf(SubjectCategories.All, e.Category))
            .ThenBy(e => e.Name, StringComparer.OrdinalIgnoreCase)
            .Select(e => new CatalogSubjectView(e.SubjectId, e.Slug, e.Code, e.Name, e.Category, e.LanguageType, e.IsCompulsory))
            .ToList();

        return new CatalogResponse(curriculum, grade, subjects);
    }

    private static int IndexOf(IReadOnlyList<string> values, string value)
    {
        for (var i = 0; i < values.Count; i++)
        {
            if (values[i] == value)
            {
                return i;
            }
        }

        return values.Count;
    }
}
