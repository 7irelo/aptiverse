namespace Aptiverse.Academics.Features.GetCatalog;

/// <param name="Curriculum">"nsc" or "ieb" (the exam body; both follow CAPS).</param>
/// <param name="Grade">8 to 12.</param>
/// <param name="Category">Optional subject category, for example "language" or "commerce".</param>
internal sealed record GetCatalogRequest(string? Curriculum, int? Grade, string? Category);

internal sealed record CatalogResponse(string Curriculum, int Grade, IReadOnlyList<CatalogSubjectView> Subjects);

/// <param name="Id">The id.</param>
/// <param name="Slug">Stable key, for example "math".</param>
/// <param name="Code">Short code, for example "MATH".</param>
/// <param name="Name">The display name.</param>
/// <param name="Category">Subject category, for example "commerce".</param>
/// <param name="LanguageType">"home", "first_additional" or "second_additional" for languages, otherwise null.</param>
/// <param name="IsCompulsory">Compulsory for the curriculum.</param>
internal sealed record CatalogSubjectView(Guid Id, string Slug, string Code, string Name, string Category, string? LanguageType, bool IsCompulsory);
