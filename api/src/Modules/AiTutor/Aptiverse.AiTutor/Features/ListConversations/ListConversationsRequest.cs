using Aptiverse.SharedKernel.Paging;

namespace Aptiverse.AiTutor.Features.ListConversations;

/// <summary>1-based paging over the caller's own conversations.</summary>
internal sealed record ListConversationsRequest(int Page = 1, int PageSize = PageRequest.DefaultPageSize);
