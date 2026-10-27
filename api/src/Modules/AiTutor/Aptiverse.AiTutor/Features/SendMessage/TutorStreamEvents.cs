using System.Text.Json;

namespace Aptiverse.AiTutor.Features.SendMessage;

// Payloads of the Server-Sent Events relayed to the web app by sendMessage. The SSE event name says which
// payload follows: route, token, tool_call, citation, confirm, then exactly one of done or error.

/// <summary>Event "route": what kind of help the tutor decided on.</summary>
internal sealed record TutorRouteEvent(string Intent, bool GradedWork);

/// <summary>Event "token": the next piece of the answer text.</summary>
internal sealed record TutorTokenEvent(string Text);

/// <summary>Event "tool_call": the tutor used a tool.</summary>
internal sealed record TutorToolCallEvent(string Name, bool Ok);

/// <summary>Event "citation": a source the answer relies on.</summary>
internal sealed record TutorCitationEvent(
    string? ChunkId,
    string? Title,
    int? Page,
    IReadOnlyList<string> HeadingPath,
    string? Licence,
    string? DisplayRule,
    bool Private);

/// <summary>Event "confirm": the tutor proposes an action. Send it back as confirmedAction to accept it.</summary>
internal sealed record TutorConfirmEvent(string Tool, JsonElement Arguments);

/// <summary>Event "done": the answer is complete and saved.</summary>
internal sealed record TutorDoneEvent(Guid MessageId, string? Route);

/// <summary>Event "error": the turn ended early. Whatever arrived is saved as an incomplete or failed message.</summary>
internal sealed record TutorErrorEvent(string Code, Guid? MessageId);

internal static class TutorStreamErrorCodes
{
    /// <summary>The ai service could not be reached or refused the call.</summary>
    public const string Unavailable = "ai.unavailable";

    /// <summary>The ai service reported a failure during the turn.</summary>
    public const string TurnFailed = "ai.turn_failed";

    /// <summary>The stream broke or ended before the turn finished.</summary>
    public const string Interrupted = "ai.interrupted";

    /// <summary>The turn took longer than the configured timeout.</summary>
    public const string Timeout = "ai.timeout";

    /// <summary>The client went away. Never sent; only recorded.</summary>
    public const string Cancelled = "ai.cancelled";
}
