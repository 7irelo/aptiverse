using System.ComponentModel.DataAnnotations.Schema;

namespace Aptiverse.AI.Domain.Models
{
    // A saved AI-tutor conversation for the /dashboard/chatbot history. The
    // full transcript is stored as a jsonb column (not a child table): it's
    // always read and written as a unit, and never queried by message. Lives
    // in schema `ai` (table ai.tutor_conversations) via the host's reflective
    // entity discovery; the jsonb mapping is in TutorConversationConfiguration.
    public class TutorConversation
    {
        public Guid Id { get; set; }

        // Owning student — the identity user id. Every read is scoped to this.
        public string StudentId { get; set; } = "";

        // Short label shown in the history list. Auto-derived from the first
        // user message when the client doesn't supply one.
        public string Title { get; set; } = "New chat";

        public List<TutorConversationMessage> Messages { get; set; } = [];

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }

    // A single turn inside a conversation. [NotMapped] so the host's entity
    // discovery treats it as a value object serialized into the jsonb column,
    // not its own table.
    [NotMapped]
    public class TutorConversationMessage
    {
        public string Role { get; set; } = "user"; // "user" | "assistant"
        public string Content { get; set; } = "";
    }
}
