using System.Text.Json;

namespace Aptiverse.AiTutor.Features.SendMessage;

/// <param name="Message">The student's message.</param>
/// <param name="AllowPrivateNotes">Lets the tutor search the student's own uploaded notes (university students only).</param>
/// <param name="ConfirmedAction">A proposal from an earlier confirm event that the student accepted, sent back unchanged.</param>
internal sealed record SendMessageRequest(string Message, bool AllowPrivateNotes = false, ConfirmedTutorAction? ConfirmedAction = null);

/// <summary>An action the tutor proposed (a confirm event) and the student accepted.</summary>
internal sealed record ConfirmedTutorAction(string Tool, JsonElement Arguments);
