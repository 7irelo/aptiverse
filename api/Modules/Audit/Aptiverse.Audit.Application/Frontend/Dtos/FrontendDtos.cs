// Frontend-shaped read DTOs for the admin audit viewer.
using System.Text.Json.Serialization;

namespace Aptiverse.Audit.Application.Frontend.Dtos
{
    // One row of the trail. Carries both the human labels the table renders
    // and the raw ids the filters key off, so clicking an actor or an entity
    // in the table can narrow the query without a second lookup.
    public record FrontendAuditLogDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("ts")] public DateTime Ts { get; init; }
        [JsonPropertyName("actorId")] public string ActorId { get; init; } = "";
        [JsonPropertyName("actor")] public string Actor { get; init; } = "";
        [JsonPropertyName("actorEmail")] public string ActorEmail { get; init; } = "";
        [JsonPropertyName("actorRole")] public string ActorRole { get; init; } = "";
        [JsonPropertyName("action")] public string Action { get; init; } = "";
        [JsonPropertyName("category")] public string Category { get; init; } = "";
        [JsonPropertyName("severity")] public string Severity { get; init; } = "info";
        [JsonPropertyName("entityType")] public string EntityType { get; init; } = "";
        [JsonPropertyName("entityId")] public string EntityId { get; init; } = "";
        [JsonPropertyName("resource")] public string Resource { get; init; } = "";

        // Before / after snapshots as raw JSON strings, null when the action
        // carried none. The viewer pretty-prints them in the detail drawer.
        [JsonPropertyName("oldValues")] public string? OldValues { get; init; }
        [JsonPropertyName("newValues")] public string? NewValues { get; init; }

        [JsonPropertyName("ip")] public string Ip { get; init; } = "";
        [JsonPropertyName("service")] public string Service { get; init; } = "";
        [JsonPropertyName("correlationId")] public string CorrelationId { get; init; } = "";
    }

    // Paged envelope. The total is what lets the viewer say "50 of 812" rather
    // than implying the page is the whole trail.
    public record FrontendAuditLogPageDto
    {
        [JsonPropertyName("items")] public IList<FrontendAuditLogDto> Items { get; init; } = [];
        [JsonPropertyName("total")] public int Total { get; init; }
        [JsonPropertyName("skip")] public int Skip { get; init; }
        [JsonPropertyName("take")] public int Take { get; init; }
    }

    public record FrontendAuditActionDto
    {
        [JsonPropertyName("name")] public string Name { get; init; } = "";
        [JsonPropertyName("category")] public string Category { get; init; } = "";
        [JsonPropertyName("severity")] public string Severity { get; init; } = "info";
    }
}
