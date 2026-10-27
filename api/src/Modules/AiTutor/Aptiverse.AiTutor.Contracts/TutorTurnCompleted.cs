namespace Aptiverse.AiTutor.Contracts;

/// <summary>
/// Integration event raised (through the outbox) when the ai service finished a tutor turn and reported its
/// usage. Carries the real token counts and cost so billing and quota modules can account for it later.
/// </summary>
public sealed record TutorTurnCompleted(
    Guid UserId,
    Guid ConversationId,
    Guid MessageId,
    string Mode,
    int InputTokens,
    int OutputTokens,
    long CostUsdMicros,
    DateTimeOffset OccurredAt);
