using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Aptiverse.AI.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Aptiverse.AI.Infrastructure
{
    // HttpClient-based Anthropic Messages API client. The Anthropic
    // surface is small enough that an SDK adds more dep than it removes
    // typed wrappers — this implementation is ~80 lines and easy to
    // audit.
    //
    // Wire up:
    //   ANTHROPIC_API_KEY in api/.env (or Anthropic:ApiKey in appsettings)
    //   anthropic-version header defaults to 2023-06-01 — Anthropic still
    //   supports that and it's stable across all our use cases.
    public class AnthropicClient : IAnthropicClient
    {
        private const string DefaultBaseUrl = "https://api.anthropic.com";
        private const string DefaultVersion = "2023-06-01";

        private readonly HttpClient _http;
        private readonly string? _apiKey;
        private readonly string _baseUrl;
        private readonly string _version;
        private readonly ILogger<AnthropicClient> _logger;

        public AnthropicClient(
            HttpClient http,
            IConfiguration config,
            ILogger<AnthropicClient> logger)
        {
            _http = http;
            _apiKey = config["Anthropic:ApiKey"] ?? Environment.GetEnvironmentVariable("ANTHROPIC_API_KEY");
            _baseUrl = config["Anthropic:BaseUrl"] ?? DefaultBaseUrl;
            _version = config["Anthropic:Version"] ?? DefaultVersion;
            _logger = logger;
        }

        public bool IsConfigured => !string.IsNullOrWhiteSpace(_apiKey);

        public async Task<AnthropicResponse> ChatAsync(AnthropicChatRequest request, CancellationToken ct = default)
        {
            if (!IsConfigured)
            {
                throw new AnthropicException(
                    "Anthropic API key is not configured. Set ANTHROPIC_API_KEY in api/.env.");
            }

            using var msg = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/v1/messages");
            msg.Headers.Add("x-api-key", _apiKey);
            msg.Headers.Add("anthropic-version", _version);
            msg.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var body = new ApiRequest
            {
                Model = request.Model,
                System = request.SystemPrompt,
                Messages = request.Messages.Select(m => new ApiMessage { Role = m.Role, Content = m.Content }).ToList(),
                MaxTokens = request.MaxTokens,
                Temperature = request.Temperature,
            };
            msg.Content = JsonContent.Create(body, options: JsonOpts);

            HttpResponseMessage res;
            try
            {
                res = await _http.SendAsync(msg, ct);
            }
            catch (Exception ex)
            {
                throw new AnthropicException("Anthropic request failed (network).", null, ex);
            }

            var raw = await res.Content.ReadAsStringAsync(ct);
            if (!res.IsSuccessStatusCode)
            {
                _logger.LogWarning("Anthropic API {Status}: {Body}", (int)res.StatusCode, raw);
                throw new AnthropicException(
                    $"Anthropic API returned {(int)res.StatusCode}. {TrySummariseError(raw)}",
                    (int)res.StatusCode);
            }

            ApiResponse? parsed;
            try
            {
                parsed = JsonSerializer.Deserialize<ApiResponse>(raw, JsonOpts);
            }
            catch (Exception ex)
            {
                throw new AnthropicException("Could not parse Anthropic response.", null, ex);
            }

            if (parsed is null || parsed.Content is null || parsed.Content.Count == 0)
            {
                throw new AnthropicException("Empty response from Anthropic.");
            }

            // Concatenate all text blocks — the API returns an array of
            // content blocks but for chat completions we typically get
            // a single "text" block.
            var text = string.Concat(parsed.Content.Where(c => c.Type == "text").Select(c => c.Text));
            return new AnthropicResponse
            {
                Text = text,
                StopReason = parsed.StopReason ?? "end_turn",
                Usage = new AnthropicUsage
                {
                    InputTokens = parsed.Usage?.InputTokens ?? 0,
                    OutputTokens = parsed.Usage?.OutputTokens ?? 0,
                },
            };
        }

        private static string TrySummariseError(string raw)
        {
            try
            {
                var doc = JsonDocument.Parse(raw);
                if (doc.RootElement.TryGetProperty("error", out var err) &&
                    err.TryGetProperty("message", out var m))
                {
                    return m.GetString() ?? raw;
                }
            }
            catch { /* fall through */ }
            return raw.Length > 200 ? raw[..200] + "…" : raw;
        }

        private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web)
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };

        // Wire types — match Anthropic's Messages API JSON shape.
        private record ApiRequest
        {
            [JsonPropertyName("model")] public required string Model { get; init; }
            [JsonPropertyName("system")] public required string System { get; init; }
            [JsonPropertyName("messages")] public required IList<ApiMessage> Messages { get; init; }
            [JsonPropertyName("max_tokens")] public int MaxTokens { get; init; }
            [JsonPropertyName("temperature")] public double Temperature { get; init; }
        }

        private record ApiMessage
        {
            [JsonPropertyName("role")] public required string Role { get; init; }
            [JsonPropertyName("content")] public required string Content { get; init; }
        }

        private record ApiResponse
        {
            [JsonPropertyName("content")] public List<ApiContentBlock>? Content { get; init; }
            [JsonPropertyName("stop_reason")] public string? StopReason { get; init; }
            [JsonPropertyName("usage")] public ApiUsage? Usage { get; init; }
        }

        private record ApiContentBlock
        {
            [JsonPropertyName("type")] public string Type { get; init; } = "";
            [JsonPropertyName("text")] public string Text { get; init; } = "";
        }

        private record ApiUsage
        {
            [JsonPropertyName("input_tokens")] public int InputTokens { get; init; }
            [JsonPropertyName("output_tokens")] public int OutputTokens { get; init; }
        }
    }
}
