using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Entitlements.Infrastructure.Paystack
{
    // HttpClient-based Paystack client. Registered via AddHttpClient so the
    // factory owns the connection pool. The secret key is read once at
    // construction from config / environment and is NEVER logged.
    public class PaystackClient : IPaystackClient
    {
        private const string DefaultBaseUrl = "https://api.paystack.co";

        private readonly HttpClient _http;
        private readonly string? _secretKey;
        private readonly string _baseUrl;
        private readonly ILogger<PaystackClient> _logger;

        public PaystackClient(
            HttpClient http,
            IConfiguration config,
            ILogger<PaystackClient> logger)
        {
            _http = http;
            // Config first (appsettings / user-secrets), then environment.
            _secretKey = config["Paystack:SecretKey"]
                ?? Environment.GetEnvironmentVariable("PAYSTACK_SECRET_KEY");
            _baseUrl = config["Paystack:BaseUrl"] ?? DefaultBaseUrl;
            _logger = logger;
        }

        public bool IsConfigured => !string.IsNullOrWhiteSpace(_secretKey);

        public async Task<PaystackInitResult> InitializeTransactionAsync(
            PaystackInitRequest request, CancellationToken ct = default)
        {
            if (!IsConfigured)
            {
                throw new PaystackException(
                    "Paystack secret key is not configured. Set PAYSTACK_SECRET_KEY in api/.env.");
            }

            using var msg = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/transaction/initialize");
            msg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _secretKey);
            msg.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var body = new InitApiRequest
            {
                Email = request.Email,
                Amount = request.AmountMinor,
                Currency = request.Currency,
                CallbackUrl = request.CallbackUrl,
                Plan = request.PaystackPlanCode,
                Metadata = request.Metadata,
            };
            msg.Content = JsonContent.Create(body, options: JsonOpts);

            HttpResponseMessage res;
            try
            {
                res = await _http.SendAsync(msg, ct);
            }
            catch (Exception ex)
            {
                throw new PaystackException("Paystack request failed (network).", null, ex);
            }

            var raw = await res.Content.ReadAsStringAsync(ct);
            if (!res.IsSuccessStatusCode)
            {
                _logger.LogWarning("Paystack init {Status}: {Body}", (int)res.StatusCode, raw);
                throw new PaystackException(
                    $"Paystack returned {(int)res.StatusCode}. {TrySummariseError(raw)}",
                    (int)res.StatusCode);
            }

            InitApiResponse? parsed;
            try
            {
                parsed = JsonSerializer.Deserialize<InitApiResponse>(raw, JsonOpts);
            }
            catch (Exception ex)
            {
                throw new PaystackException("Could not parse Paystack response.", null, ex);
            }

            if (parsed is null || !parsed.Status || parsed.Data is null
                || string.IsNullOrWhiteSpace(parsed.Data.AuthorizationUrl))
            {
                throw new PaystackException(
                    $"Paystack init did not return an authorization url. {parsed?.Message}");
            }

            return new PaystackInitResult
            {
                AuthorizationUrl = parsed.Data.AuthorizationUrl,
                AccessCode = parsed.Data.AccessCode ?? "",
                Reference = parsed.Data.Reference ?? "",
            };
        }

        public bool VerifySignature(string rawBody, string? signatureHeader)
        {
            if (!IsConfigured || string.IsNullOrWhiteSpace(signatureHeader) || rawBody is null)
            {
                return false;
            }

            // Paystack signs the raw request body with HMAC-SHA512 keyed on
            // the SECRET key, and sends the lowercase hex digest in the
            // x-paystack-signature header.
            var keyBytes = Encoding.UTF8.GetBytes(_secretKey!);
            using var hmac = new HMACSHA512(keyBytes);
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawBody));
            var computed = Convert.ToHexString(hash).ToLowerInvariant();

            // Constant-time comparison to avoid timing side-channels.
            var expected = Encoding.ASCII.GetBytes(computed);
            var actual = Encoding.ASCII.GetBytes(signatureHeader.Trim().ToLowerInvariant());
            return CryptographicOperations.FixedTimeEquals(expected, actual);
        }

        private static string TrySummariseError(string raw)
        {
            try
            {
                var doc = JsonDocument.Parse(raw);
                if (doc.RootElement.TryGetProperty("message", out var m))
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

        // Wire types — match Paystack's REST JSON shape.
        private record InitApiRequest
        {
            [JsonPropertyName("email")] public required string Email { get; init; }
            [JsonPropertyName("amount")] public required long Amount { get; init; }
            [JsonPropertyName("currency")] public string? Currency { get; init; }
            [JsonPropertyName("callback_url")] public string? CallbackUrl { get; init; }
            [JsonPropertyName("plan")] public string? Plan { get; init; }
            [JsonPropertyName("metadata")] public IDictionary<string, string>? Metadata { get; init; }
        }

        private record InitApiResponse
        {
            [JsonPropertyName("status")] public bool Status { get; init; }
            [JsonPropertyName("message")] public string? Message { get; init; }
            [JsonPropertyName("data")] public InitApiData? Data { get; init; }
        }

        private record InitApiData
        {
            [JsonPropertyName("authorization_url")] public string? AuthorizationUrl { get; init; }
            [JsonPropertyName("access_code")] public string? AccessCode { get; init; }
            [JsonPropertyName("reference")] public string? Reference { get; init; }
        }
    }

    public class PaystackException : Exception
    {
        public int? StatusCode { get; }

        public PaystackException(string message, int? statusCode = null, Exception? inner = null)
            : base(message, inner)
        {
            StatusCode = statusCode;
        }
    }
}
