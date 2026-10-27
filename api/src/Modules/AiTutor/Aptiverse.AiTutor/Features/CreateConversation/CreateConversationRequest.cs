namespace Aptiverse.AiTutor.Features.CreateConversation;

/// <param name="Title">Optional. Without one the conversation is titled from its first message.</param>
/// <param name="Mode">"standard" (default) or "deep" for slower, more thorough answers.</param>
internal sealed record CreateConversationRequest(string? Title, string? Mode);

internal sealed record ConversationResponse(
    Guid Id,
    string Title,
    string Mode,
    int MessageCount,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
