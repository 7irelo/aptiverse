using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.AiTutor.Domain;

/// <summary>A student's chat with the tutor. Only its owner ever reads it; another user's id is a 404.</summary>
internal sealed class Conversation : Entity
{
    public const int TitleMaxLength = 120;
    public const int ModeMaxLength = 16;
    public const int SummaryMaxLength = 2000;
    public const string DefaultTitle = "New conversation";

    private const int TitleFromMessageLength = 60;

    private Conversation()
    {
    }

    public Guid UserId { get; private set; }

    public string Title { get; private set; } = DefaultTitle;

    public string Mode { get; private set; } = ConversationModes.Standard;

    /// <summary>Rolling summary of turns older than the history window, sent to the ai service as context.</summary>
    public string? Summary { get; private set; }

    public int MessageCount { get; private set; }

    public static Conversation Start(Guid userId, string? title, string? mode) => new()
    {
        UserId = userId,
        Title = string.IsNullOrWhiteSpace(title) ? DefaultTitle : title.Trim(),
        Mode = string.IsNullOrWhiteSpace(mode) ? ConversationModes.Standard : mode,
    };

    /// <summary>Counts a stored message. An untitled conversation takes its title from the first question.</summary>
    public void RecordMessage(string? firstUserMessage = null)
    {
        if (MessageCount == 0 && Title == DefaultTitle && !string.IsNullOrWhiteSpace(firstUserMessage))
        {
            var text = string.Join(' ', firstUserMessage.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries));
            Title = text.Length <= TitleFromMessageLength ? text : text[..TitleFromMessageLength].TrimEnd() + "...";
        }

        MessageCount++;
    }
}

internal static class ConversationModes
{
    public const string Standard = "standard";
    public const string Deep = "deep";

    public static IReadOnlyList<string> All { get; } = [Standard, Deep];
}
