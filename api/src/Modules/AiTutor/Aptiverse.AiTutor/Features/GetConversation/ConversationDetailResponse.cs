namespace Aptiverse.AiTutor.Features.GetConversation;

internal sealed record ConversationDetailResponse(
    Guid Id,
    string Title,
    string Mode,
    int MessageCount,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    IReadOnlyList<MessageResponse> Messages);

/// <summary>
/// Role is "user" or "assistant". Status is "complete", "incomplete" (the answer was cut off) or "failed".
/// </summary>
internal sealed record MessageResponse(Guid Id, string Role, string Content, string Status, DateTimeOffset CreatedAt);
