// Frontend-shaped read DTOs matching ui/src/lib/mockData.ts.
using System.Text.Json.Serialization;

namespace Aptiverse.Audit.Application.Frontend.Dtos
{
    public record FrontendAuditLogDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("ts")] public DateTime Ts { get; init; }
        [JsonPropertyName("actor")] public string Actor { get; init; } = "";
        [JsonPropertyName("action")] public string Action { get; init; } = "";
        [JsonPropertyName("resource")] public string Resource { get; init; } = "";
        [JsonPropertyName("ip")] public string Ip { get; init; } = "";
        [JsonPropertyName("severity")] public string Severity { get; init; } = "info";
    }
}
