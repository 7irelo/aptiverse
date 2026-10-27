using Aptiverse.AiTutor.AiService;
using Aptiverse.AiTutor.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aptiverse.AiTutor.Features.EraseUserData;

/// <summary>
/// Removes a user's tutor data: soft deletes their conversations and messages here, then asks the ai service
/// to delete their notes and embeddings. Both steps are idempotent, so a retried message is harmless.
/// </summary>
internal sealed partial class UserDataEraser(AiTutorDbContext db, AiServiceClient ai, ILogger<UserDataEraser> logger)
{
    public async Task EraseAsync(Guid userId, CancellationToken cancellationToken)
    {
        var messages = await db.Messages.Where(m => m.UserId == userId).ToListAsync(cancellationToken);
        var conversations = await db.Conversations.Where(c => c.UserId == userId).ToListAsync(cancellationToken);
        db.Messages.RemoveRange(messages);
        db.Conversations.RemoveRange(conversations);
        await db.SaveChangesAsync(cancellationToken);
        LogErased(logger, userId, conversations.Count, messages.Count);

        try
        {
            await ai.DeleteUserDataAsync(userId, requestId: null, cancellationToken);
        }
        catch (Exception ex) when (ex is HttpRequestException or AiServiceException or TaskCanceledException)
        {
            LogAiDeleteFailed(logger, userId, ex);
            throw;
        }
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Erased tutor data of user {UserId}: {Conversations} conversations, {Messages} messages")]
    private static partial void LogErased(ILogger logger, Guid userId, int conversations, int messages);

    [LoggerMessage(Level = LogLevel.Warning, Message = "The ai service did not delete the data of user {UserId}; the message will be retried")]
    private static partial void LogAiDeleteFailed(ILogger logger, Guid userId, Exception exception);
}
