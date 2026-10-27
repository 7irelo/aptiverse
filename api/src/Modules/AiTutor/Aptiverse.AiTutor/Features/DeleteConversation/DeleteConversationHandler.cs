using Aptiverse.AiTutor.Persistence;
using Aptiverse.SharedKernel.Results;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.AiTutor.Features.DeleteConversation;

/// <summary>Soft deletes the conversation and its messages together.</summary>
internal sealed class DeleteConversationHandler(AiTutorDbContext db)
{
    public async Task<Result> HandleAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken)
    {
        var conversation = await db.Conversations
            .SingleOrDefaultAsync(c => c.Id == conversationId && c.UserId == userId, cancellationToken);
        if (conversation is null)
        {
            return ConversationErrors.NotFound;
        }

        var messages = await db.Messages
            .Where(m => m.ConversationId == conversationId && m.UserId == userId)
            .ToListAsync(cancellationToken);

        db.Messages.RemoveRange(messages);
        db.Conversations.Remove(conversation);
        await db.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
