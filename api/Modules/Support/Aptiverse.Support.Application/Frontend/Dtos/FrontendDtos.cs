using System.Text.Json.Serialization;

namespace Aptiverse.Support.Application.Frontend.Dtos
{
    public record FrontendSupportTicketDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("subject")] public string Subject { get; init; } = "";
        [JsonPropertyName("body")] public string Body { get; init; } = "";
        [JsonPropertyName("status")] public string Status { get; init; } = "open"; // open | pending | resolved
        [JsonPropertyName("priority")] public string Priority { get; init; } = "normal";
        [JsonPropertyName("createdAt")] public DateTime CreatedAt { get; init; }
        [JsonPropertyName("updatedAt")] public DateTime UpdatedAt { get; init; }
        [JsonPropertyName("requester")] public string Requester { get; init; } = "";
    }

    public record FrontendCreateTicketInput
    {
        [JsonPropertyName("subject")] public string Subject { get; init; } = "";
        [JsonPropertyName("body")] public string Body { get; init; } = "";
        [JsonPropertyName("priority")] public string? Priority { get; init; }
    }

    public record FrontendFaqDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("q")] public string Q { get; init; } = "";
        [JsonPropertyName("a")] public string A { get; init; } = "";
        [JsonPropertyName("category")] public string Category { get; init; } = "general";
    }
}
