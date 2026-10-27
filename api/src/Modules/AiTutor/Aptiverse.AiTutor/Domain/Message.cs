using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.AiTutor.Domain;

/// <summary>
/// One turn in a conversation. UserId is denormalised from the conversation so ownership checks and the
/// daily limit never need a join.
/// </summary>
internal sealed class Message : Entity
{
    public const int ContentMaxLength = 16_000;
    public const int RoleMaxLength = 16;
    public const int StatusMaxLength = 16;
    public const int RouteIntentMaxLength = 32;

    private Message()
    {
    }

    public Guid ConversationId { get; private set; }

    public Guid UserId { get; private set; }

    public string Role { get; private set; } = MessageRoles.User;

    public string Content { get; private set; } = string.Empty;

    public string Status { get; private set; } = MessageStatuses.Complete;

    public string? RouteIntent { get; private set; }

    public int InputTokens { get; private set; }

    public int OutputTokens { get; private set; }

    /// <summary>Provider cost in millionths of a US dollar, as reported by the ai service.</summary>
    public long CostUsdMicros { get; private set; }

    public static Message FromUser(Conversation conversation, string content)
    {
        ArgumentNullException.ThrowIfNull(conversation);
        return new()
        {
            ConversationId = conversation.Id,
            UserId = conversation.UserId,
            Role = MessageRoles.User,
            Content = content,
            Status = MessageStatuses.Complete,
        };
    }

    public static Message FromAssistant(
        Conversation conversation,
        string content,
        string status,
        string? routeIntent,
        int inputTokens,
        int outputTokens,
        long costUsdMicros)
    {
        ArgumentNullException.ThrowIfNull(conversation);
        ArgumentNullException.ThrowIfNull(content);
        return new()
        {
            ConversationId = conversation.Id,
            UserId = conversation.UserId,
            Role = MessageRoles.Assistant,
            Content = content.Length <= ContentMaxLength ? content : content[..ContentMaxLength],
            Status = status,
            RouteIntent = routeIntent,
            InputTokens = Math.Max(0, inputTokens),
            OutputTokens = Math.Max(0, outputTokens),
            CostUsdMicros = Math.Max(0, costUsdMicros),
        };
    }
}

internal static class MessageRoles
{
    public const string User = "user";
    public const string Assistant = "assistant";

    public static IReadOnlyList<string> All { get; } = [User, Assistant];
}

internal static class MessageStatuses
{
    public const string Complete = "complete";
    public const string Incomplete = "incomplete";
    public const string Failed = "failed";

    public static IReadOnlyList<string> All { get; } = [Complete, Incomplete, Failed];
}
