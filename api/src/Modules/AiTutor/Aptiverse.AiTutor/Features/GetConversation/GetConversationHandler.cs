using Aptiverse.AiTutor.Persistence;
using Aptiverse.SharedKernel.Results;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.AiTutor.Features.GetConversation;

internal sealed class GetConversationHandler(AiTutorDbContext db)
{
    public async Task<Result<ConversationDetailResponse>> HandleAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken)
    {
        var conversation = await db.Conversations
            .AsNoTracking()
            .Where(c => c.Id == conversationId && c.UserId == userId)
            .SingleOrDefaultAsync(cancellationToken);
        if (conversation is null)
        {
            return ConversationErrors.NotFound;
        }

        var messages = await db.Messages
            .AsNoTracking()
            .Where(m => m.ConversationId == conversationId && m.UserId == userId)
            .OrderBy(m => m.CreatedAt)
            .ThenBy(m => m.Id)
            .Select(m => new MessageResponse(m.Id, m.Role, m.Content, m.Status, m.CreatedAt))
            .ToListAsync(cancellationToken);

        return new ConversationDetailResponse(
            conversation.Id,
            conversation.Title,
            conversation.Mode,
            conversation.MessageCount,
            conversation.CreatedAt,
            conversation.UpdatedAt,
            messages);
    }
}
