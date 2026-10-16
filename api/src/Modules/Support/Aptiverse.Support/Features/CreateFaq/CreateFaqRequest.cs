namespace Aptiverse.Support.Features.CreateFaq;

internal sealed record CreateFaqRequest(string Question, string Answer, string Category, int SortOrder, bool IsPublished);

internal sealed record CreateFaqResponse(Guid Id, string Question, string Answer, string Category, int SortOrder, bool IsPublished);
