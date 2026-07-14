namespace Aptiverse.AI.Core
{
    // Thin wrapper over the Anthropic Messages API. We talk to Claude
    // directly via HttpClient — no SDK dependency. Just enough surface
    // for chat-style completions: a system prompt plus a list of
    // user / assistant messages, returning the assistant's reply.
    public interface IAnthropicClient
    {
        // Send a chat completion request. Throws AnthropicException on
        // API errors with a useful message (used by the controller to
        // surface 502 / 503 / 401-not-configured back to the client).
        Task<AnthropicResponse> ChatAsync(
            AnthropicChatRequest request,
            CancellationToken ct = default);

        // True iff ANTHROPIC_API_KEY is set in configuration — used by
        // the controller to gate the help-bot endpoint with a clean
        // "AI is not configured" message in dev environments where the
        // key isn't provisioned.
        bool IsConfigured { get; }
    }

    public record AnthropicChatRequest
    {
        public required string SystemPrompt { get; init; }
        public required IList<AnthropicMessage> Messages { get; init; }
        // claude-haiku-4-5 / claude-sonnet-4-6 etc. — see https://docs.anthropic.com/.
        public string Model { get; init; } = "claude-haiku-4-5";
        public int MaxTokens { get; init; } = 1024;
        // Optional. Newer models (Opus 4.7/4.8, Sonnet 5, Fable 5) reject
        // `temperature` with a 400, so it's omitted from the request when null.
        // Only set it for older models that still accept it.
        public double? Temperature { get; init; }
        // When true, enable adaptive extended thinking (Claude 4.6+ models).
        // The client sends `thinking: { type: "adaptive" }`; thinking blocks
        // are stripped from the returned text. Used by the tutor's deep mode.
        public bool Thinking { get; init; }
    }

    public record AnthropicMessage
    {
        public required string Role { get; init; }   // "user" | "assistant"
        public required string Content { get; init; }
    }

    public record AnthropicResponse
    {
        public required string Text { get; init; }
        public required AnthropicUsage Usage { get; init; }
        public required string StopReason { get; init; }
    }

    public record AnthropicUsage
    {
        public int InputTokens { get; init; }
        public int OutputTokens { get; init; }
    }

    public class AnthropicException : Exception
    {
        public int? StatusCode { get; }
        public AnthropicException(string message, int? statusCode = null, Exception? inner = null)
            : base(message, inner)
        {
            StatusCode = statusCode;
        }
    }
}
