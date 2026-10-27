namespace Aptiverse.Academics.Features.SearchInstitutions;

/// <param name="Q">Optional search over name, short name and slug, 2 to 60 characters.</param>
/// <param name="Type">Optional institution type, for example "university".</param>
/// <param name="Province">Optional province, for example "western_cape".</param>
/// <param name="Limit">1 to 50 results, default 20.</param>
internal sealed record SearchInstitutionsRequest(string? Q, string? Type, string? Province, int Limit = 20);

internal sealed record InstitutionView(Guid Id, string Slug, string Name, string? ShortName, string Type, string? Province);
