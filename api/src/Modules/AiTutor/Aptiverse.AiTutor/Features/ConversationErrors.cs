using Aptiverse.SharedKernel.Results;

namespace Aptiverse.AiTutor.Features;

internal static class ConversationErrors
{
    // Same answer for "does not exist" and "belongs to someone else", so ids cannot be probed.
    public static readonly Error NotFound =
        Error.NotFound("ai.conversation_not_found", "The conversation was not found.");
}
