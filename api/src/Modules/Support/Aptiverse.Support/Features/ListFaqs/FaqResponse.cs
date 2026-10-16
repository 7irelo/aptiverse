namespace Aptiverse.Support.Features.ListFaqs;

/// <summary>Public FAQ contract consumed by the web app. Changing it changes openapi/v1.json.</summary>
internal sealed record FaqResponse(Guid Id, string Question, string Answer, string Category, int SortOrder);
