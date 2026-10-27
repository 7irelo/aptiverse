using Aptiverse.AiTutor.Contracts;
using Aptiverse.AiTutor.Domain;
using Aptiverse.AiTutor.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.AiTutor.Lookups;

/// <summary>Counts the student's own questions; message content is never read.</summary>
internal sealed class TutorActivityLookup(AiTutorDbContext db) : ITutorActivityLookup
{
    public async Task<TutorActivity> GetAsync(Guid userId, DateTimeOffset since, CancellationToken cancellationToken)
    {
        var questions = db.Messages.AsNoTracking()
            .Where(m => m.UserId == userId && m.Role == MessageRoles.User && m.CreatedAt >= since);
        var asked = await questions.CountAsync(cancellationToken);
        var conversations = asked == 0 ? 0 : await questions.Select(m => m.ConversationId).Distinct().CountAsync(cancellationToken);
        return new TutorActivity(conversations, asked);
    }
}
