using Aptiverse.AiTutor.Domain;
using Aptiverse.AiTutor.Persistence;

namespace Aptiverse.AiTutor.Features.CreateConversation;

internal sealed class CreateConversationHandler(AiTutorDbContext db)
{
    public async Task<ConversationResponse> HandleAsync(Guid userId, CreateConversationRequest request, CancellationToken cancellationToken)
    {
        var conversation = Conversation.Start(userId, request.Title, request.Mode);
        db.Conversations.Add(conversation);
        await db.SaveChangesAsync(cancellationToken);

        return new ConversationResponse(
            conversation.Id,
            conversation.Title,
            conversation.Mode,
            conversation.MessageCount,
            conversation.CreatedAt,
            conversation.UpdatedAt);
    }
}
