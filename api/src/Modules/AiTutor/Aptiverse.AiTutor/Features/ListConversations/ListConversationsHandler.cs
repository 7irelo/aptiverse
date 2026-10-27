using Aptiverse.AiTutor.Features.CreateConversation;
using Aptiverse.AiTutor.Persistence;
using Aptiverse.SharedKernel.Paging;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.AiTutor.Features.ListConversations;

internal sealed class ListConversationsHandler(AiTutorDbContext db)
{
    public async Task<PagedResult<ConversationResponse>> HandleAsync(Guid userId, ListConversationsRequest request, CancellationToken cancellationToken)
    {
        var page = new PageRequest(request.Page, request.PageSize);
        var owned = db.Conversations.AsNoTracking().Where(c => c.UserId == userId);

        var total = await owned.LongCountAsync(cancellationToken);
        var items = await owned
            .OrderByDescending(c => c.UpdatedAt)
            .ThenByDescending(c => c.Id)
            .Skip(page.Skip)
            .Take(page.NormalizedPageSize)
            .Select(c => new ConversationResponse(c.Id, c.Title, c.Mode, c.MessageCount, c.CreatedAt, c.UpdatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<ConversationResponse>(items, page.NormalizedPage, page.NormalizedPageSize, total);
    }
}
