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

        public async Task<string> CreatePlanAsync(
            PaystackPlanRequest request, CancellationToken ct = default)
        {
            if (!IsConfigured)
            {
                throw new PaystackException(
                    "Paystack secret key is not configured. Set PAYSTACK_SECRET_KEY in api/.env.");
            }

            using var msg = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/plan");
            msg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _secretKey);
            msg.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            msg.Content = JsonContent.Create(new PlanApiRequest
            {
                Name = request.Name,
                Amount = request.AmountMinor,
                Interval = request.Interval,
                Currency = request.Currency,
            }, options: JsonOpts);

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
                _logger.LogWarning("Paystack create-plan {Status}: {Body}", (int)res.StatusCode, raw);
                throw new PaystackException(
                    $"Paystack returned {(int)res.StatusCode}. {TrySummariseError(raw)}",
                    (int)res.StatusCode);
            }

            PlanApiResponse? parsed;
            try
            {
                parsed = JsonSerializer.Deserialize<PlanApiResponse>(raw, JsonOpts);
            }
            catch (Exception ex)
            {
                throw new PaystackException("Could not parse Paystack plan response.", null, ex);
            }

            if (parsed is null || !parsed.Status || parsed.Data is null
                || string.IsNullOrWhiteSpace(parsed.Data.PlanCode))
            {
                throw new PaystackException(
                    $"Paystack create-plan did not return a plan_code. {parsed?.Message}");
            }

            return parsed.Data.PlanCode;
        }

        public async Task<PaystackSubscriptionInfo?> FetchSubscriptionAsync(
            string codeOrId, CancellationToken ct = default)
        {
            if (!IsConfigured || string.IsNullOrWhiteSpace(codeOrId)) return null;

            var raw = await SendGetAsync($"/subscription/{Uri.EscapeDataString(codeOrId)}", ct);
            if (raw is null) return null;

            try
            {
                using var doc = JsonDocument.Parse(raw);
                if (!doc.RootElement.TryGetProperty("data", out var d) || d.ValueKind != JsonValueKind.Object)
                    return null;

                var subCode = d.TryGetProperty("subscription_code", out var sc) ? sc.GetString() : null;
                if (string.IsNullOrWhiteSpace(subCode)) subCode = codeOrId;

                DateTime? next = null;
                if (d.TryGetProperty("next_payment_date", out var npd) && npd.ValueKind == JsonValueKind.String
                    && DateTime.TryParse(npd.GetString(), out var pn)) next = pn.ToUniversalTime();

                long? amount = d.TryGetProperty("amount", out var am) && am.ValueKind == JsonValueKind.Number
                    ? am.GetInt64() : null;

                long? custId = null;
                string? custCode = null;
                if (d.TryGetProperty("customer", out var cu) && cu.ValueKind == JsonValueKind.Object)
                {
                    if (cu.TryGetProperty("id", out var cid) && cid.ValueKind == JsonValueKind.Number)
                        custId = cid.GetInt64();
                    if (cu.TryGetProperty("customer_code", out var cc)) custCode = cc.GetString();
                }

                string? brand = null, last4 = null, authCode = null;
                int? em = null, ey = null;
                if (d.TryGetProperty("authorization", out var au) && au.ValueKind == JsonValueKind.Object)
                {
                    if (au.TryGetProperty("brand", out var b) && b.ValueKind == JsonValueKind.String) brand = b.GetString();
                    else if (au.TryGetProperty("card_type", out var ctp)) brand = ctp.GetString();
                    if (au.TryGetProperty("last4", out var l4)) last4 = l4.GetString();
                    if (au.TryGetProperty("exp_month", out var xm)) em = ParseIntLoose(xm);
                    if (au.TryGetProperty("exp_year", out var xy)) ey = ParseIntLoose(xy);
                    if (au.TryGetProperty("authorization_code", out var ac)) authCode = ac.GetString();
                }

                return new PaystackSubscriptionInfo
                {
                    SubscriptionCode = subCode!,
                    EmailToken = d.TryGetProperty("email_token", out var et) ? et.GetString() : null,
                    Status = d.TryGetProperty("status", out var st) ? st.GetString() : null,
                    NextPaymentDate = next,
                    AmountMinor = amount,
                    CustomerId = custId,
                    CustomerCode = custCode,
                    CardBrand = brand,
                    CardLast4 = last4,
                    CardExpMonth = em,
                    CardExpYear = ey,
                    AuthorizationCode = authCode,
                };
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Paystack fetch-subscription parse failed.");
                return null;
            }
        }

        public Task<bool> DisableSubscriptionAsync(string code, string emailToken, CancellationToken ct = default)
            => ToggleSubscriptionAsync("disable", code, emailToken, ct);

        public Task<bool> EnableSubscriptionAsync(string code, string emailToken, CancellationToken ct = default)
            => ToggleSubscriptionAsync("enable", code, emailToken, ct);

        private async Task<bool> ToggleSubscriptionAsync(
            string action, string code, string emailToken, CancellationToken ct)
        {
            if (!IsConfigured || string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(emailToken))
                return false;

            using var msg = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/subscription/{action}");
            msg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _secretKey);
            msg.Content = JsonContent.Create(new { code, token = emailToken }, options: JsonOpts);

            try
            {
                var res = await _http.SendAsync(msg, ct);
                var raw = await res.Content.ReadAsStringAsync(ct);
                if (!res.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Paystack {Action}-subscription {Status}: {Body}", action, (int)res.StatusCode, raw);
                    return false;
                }
                using var doc = JsonDocument.Parse(raw);
                return doc.RootElement.TryGetProperty("status", out var s) && s.ValueKind == JsonValueKind.True;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Paystack {Action}-subscription request failed.", action);
                return false;
            }
        }

        public async Task<PaystackSubscriptionInfo?> CreateSubscriptionAsync(
            string customerCode, string planCode, string authorizationCode, CancellationToken ct = default)
        {
            if (!IsConfigured || string.IsNullOrWhiteSpace(customerCode)
                || string.IsNullOrWhiteSpace(planCode) || string.IsNullOrWhiteSpace(authorizationCode))
                return null;

            using var msg = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/subscription");
            msg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _secretKey);
            msg.Content = JsonContent.Create(
                new { customer = customerCode, plan = planCode, authorization = authorizationCode },
                options: JsonOpts);

            try
            {
                var res = await _http.SendAsync(msg, ct);
                var raw = await res.Content.ReadAsStringAsync(ct);
                if (!res.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Paystack create-subscription {Status}: {Body}", (int)res.StatusCode, raw);
                    return null;
                }

                using var doc = JsonDocument.Parse(raw);
                if (!doc.RootElement.TryGetProperty("data", out var d) || d.ValueKind != JsonValueKind.Object)
                    return null;

                var code = d.TryGetProperty("subscription_code", out var sc) ? sc.GetString() : null;
                if (string.IsNullOrWhiteSpace(code)) return null;

                DateTime? next = null;
                if (d.TryGetProperty("next_payment_date", out var npd) && npd.ValueKind == JsonValueKind.String
                    && DateTime.TryParse(npd.GetString(), out var pn)) next = pn.ToUniversalTime();

                return new PaystackSubscriptionInfo
                {
                    SubscriptionCode = code!,
                    EmailToken = d.TryGetProperty("email_token", out var et) ? et.GetString() : null,
                    Status = d.TryGetProperty("status", out var st) ? st.GetString() : null,
                    NextPaymentDate = next,
                    CustomerCode = customerCode,
                    AuthorizationCode = authorizationCode,
                };
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Paystack create-subscription request failed.");
                return null;
            }
        }

        public async Task<PaystackChargeResult> ChargeAuthorizationAsync(
            PaystackChargeRequest request, CancellationToken ct = default)
        {
            if (!IsConfigured || string.IsNullOrWhiteSpace(request.AuthorizationCode)
                || string.IsNullOrWhiteSpace(request.Email))
                return new PaystackChargeResult { Success = false, Status = "not_configured" };

            using var msg = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/transaction/charge_authorization");
            msg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _secretKey);
            msg.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            msg.Content = JsonContent.Create(new
            {
                email = request.Email,
                amount = request.AmountMinor,
                authorization_code = request.AuthorizationCode,
                currency = request.Currency,
                metadata = request.Metadata,
            }, options: JsonOpts);

            try
            {
                var res = await _http.SendAsync(msg, ct);
                var raw = await res.Content.ReadAsStringAsync(ct);
                if (!res.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Paystack charge-authorization {Status}: {Body}", (int)res.StatusCode, raw);
                    return new PaystackChargeResult { Success = false, Status = $"http_{(int)res.StatusCode}" };
                }

                using var doc = JsonDocument.Parse(raw);
                if (!doc.RootElement.TryGetProperty("data", out var d) || d.ValueKind != JsonValueKind.Object)
                    return new PaystackChargeResult { Success = false, Status = "no_data" };

                var status = d.TryGetProperty("status", out var st) ? st.GetString() : null;
                var (brand, last4, em, ey, authCode) = ReadAuthorization(d);

                return new PaystackChargeResult
                {
                    Success = string.Equals(status, "success", StringComparison.OrdinalIgnoreCase),
                    Status = status,
                    Reference = d.TryGetProperty("reference", out var r) ? r.GetString() : null,
                    GatewayResponse = d.TryGetProperty("gateway_response", out var g) ? g.GetString() : null,
                    AuthorizationCode = authCode,
                    CardBrand = brand,
                    CardLast4 = last4,
                    CardExpMonth = em,
                    CardExpYear = ey,
                };
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Paystack charge-authorization request failed.");
                return new PaystackChargeResult { Success = false, Status = "error" };
            }
        }

        public async Task<IReadOnlyList<PaystackTransactionInfo>> ListTransactionsAsync(
            long customerId, int count = 24, CancellationToken ct = default)
        {
            if (!IsConfigured || customerId <= 0) return Array.Empty<PaystackTransactionInfo>();

            var raw = await SendGetAsync($"/transaction?customer={customerId}&perPage={count}&status=success", ct);
            if (raw is null) return Array.Empty<PaystackTransactionInfo>();

            var list = new List<PaystackTransactionInfo>();
            try
            {
                using var doc = JsonDocument.Parse(raw);
                if (doc.RootElement.TryGetProperty("data", out var data) && data.ValueKind == JsonValueKind.Array)
                {
                    foreach (var t in data.EnumerateArray())
                    {
                        var reference = t.TryGetProperty("reference", out var r) ? r.GetString() : null;
                        if (string.IsNullOrWhiteSpace(reference)) continue;

                        long amount = t.TryGetProperty("amount", out var a) && a.ValueKind == JsonValueKind.Number
                            ? a.GetInt64() : 0;
                        DateTime? paid = null;
                        if (t.TryGetProperty("paid_at", out var pa) && pa.ValueKind == JsonValueKind.String
                            && DateTime.TryParse(pa.GetString(), out var pd)) paid = pd.ToUniversalTime();

                        list.Add(new PaystackTransactionInfo
                        {
                            Reference = reference!,
                            AmountMinor = amount,
                            Currency = t.TryGetProperty("currency", out var c) ? c.GetString() ?? "ZAR" : "ZAR",
                            Status = t.TryGetProperty("status", out var s) ? s.GetString() : null,
                            PaidAt = paid,
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Paystack list-transactions parse failed.");
            }
            return list;
        }

        public async Task<PaystackVerifyInfo?> VerifyTransactionAsync(
            string reference, CancellationToken ct = default)
        {
            if (!IsConfigured || string.IsNullOrWhiteSpace(reference)) return null;

            var raw = await SendGetAsync($"/transaction/verify/{Uri.EscapeDataString(reference)}", ct);
            if (raw is null) return null;

            try
            {
                using var doc = JsonDocument.Parse(raw);
                if (!doc.RootElement.TryGetProperty("data", out var d) || d.ValueKind != JsonValueKind.Object)
                    return null;

                long? amount = d.TryGetProperty("amount", out var am) && am.ValueKind == JsonValueKind.Number
                    ? am.GetInt64() : null;

                long? custId = null;
                string? custCode = null, email = null;
                if (d.TryGetProperty("customer", out var cu) && cu.ValueKind == JsonValueKind.Object)
                {
                    if (cu.TryGetProperty("id", out var cid) && cid.ValueKind == JsonValueKind.Number)
                        custId = cid.GetInt64();
                    if (cu.TryGetProperty("customer_code", out var cc)) custCode = cc.GetString();
                    if (cu.TryGetProperty("email", out var em)) email = em.GetString();
                }

                long? localId = null;
                string? planCode = null;
                if (d.TryGetProperty("metadata", out var meta) && meta.ValueKind == JsonValueKind.Object)
                {
                    if (meta.TryGetProperty("subscription_id", out var sid))
                    {
                        var sidStr = sid.ValueKind == JsonValueKind.String ? sid.GetString()
                            : sid.ValueKind == JsonValueKind.Number ? sid.GetRawText() : null;
                        if (long.TryParse(sidStr, out var parsed)) localId = parsed;
                    }
                    if (meta.TryGetProperty("plan_code", out var pc)) planCode = pc.GetString();
                }

                var (brand, last4, em2, ey2, authCode) = ReadAuthorization(d);

                return new PaystackVerifyInfo
                {
                    Reference = reference,
                    Status = d.TryGetProperty("status", out var st) ? st.GetString() : null,
                    AmountMinor = amount,
                    CustomerId = custId,
                    CustomerCode = custCode,
                    Email = email,
                    LocalSubscriptionId = localId,
                    PlanCode = planCode,
                    AuthorizationCode = authCode,
                    CardBrand = brand,
                    CardLast4 = last4,
                    CardExpMonth = em2,
                    CardExpYear = ey2,
                };
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Paystack verify-transaction parse failed.");
                return null;
            }
        }

        public async Task<PaystackSubscriptionInfo?> FindLatestSubscriptionAsync(
            long customerId, CancellationToken ct = default)
        {
            if (!IsConfigured || customerId <= 0) return null;

            var raw = await SendGetAsync($"/subscription?customer={customerId}&perPage=25", ct);
            if (raw is null) return null;

            try
            {
                using var doc = JsonDocument.Parse(raw);
                if (!doc.RootElement.TryGetProperty("data", out var data) || data.ValueKind != JsonValueKind.Array)
                    return null;

                JsonElement? best = null;
                foreach (var s in data.EnumerateArray())
                {
                    // Prefer an active subscription; otherwise keep the first seen.
                    var status = s.TryGetProperty("status", out var st) ? st.GetString() : null;
                    if (string.Equals(status, "active", StringComparison.OrdinalIgnoreCase))
                    {
                        best = s;
                        break;
                    }
                    best ??= s;
                }
                if (best is not { } chosen) return null;

                var code = chosen.TryGetProperty("subscription_code", out var sc) ? sc.GetString() : null;
                if (string.IsNullOrWhiteSpace(code)) return null;

                DateTime? next = null;
                if (chosen.TryGetProperty("next_payment_date", out var npd) && npd.ValueKind == JsonValueKind.String
                    && DateTime.TryParse(npd.GetString(), out var pn)) next = pn.ToUniversalTime();

                string? authCode = null;
                if (chosen.TryGetProperty("authorization", out var au) && au.ValueKind == JsonValueKind.Object
                    && au.TryGetProperty("authorization_code", out var ac)) authCode = ac.GetString();

                return new PaystackSubscriptionInfo
                {
                    SubscriptionCode = code!,
                    EmailToken = chosen.TryGetProperty("email_token", out var et) ? et.GetString() : null,
                    Status = chosen.TryGetProperty("status", out var s2) ? s2.GetString() : null,
                    NextPaymentDate = next,
                    AmountMinor = chosen.TryGetProperty("amount", out var a) && a.ValueKind == JsonValueKind.Number
                        ? a.GetInt64() : null,
                    AuthorizationCode = authCode,
                };
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Paystack find-latest-subscription parse failed.");
                return null;
            }
        }

        // Shared authenticated GET returning the raw body, or null on failure.
        private async Task<string?> SendGetAsync(string path, CancellationToken ct)
        {
            using var msg = new HttpRequestMessage(HttpMethod.Get, $"{_baseUrl}{path}");
            msg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _secretKey);
            msg.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            try
            {
                var res = await _http.SendAsync(msg, ct);
                var raw = await res.Content.ReadAsStringAsync(ct);
                if (!res.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Paystack GET {Path} {Status}: {Body}", path, (int)res.StatusCode, raw);
                    return null;
                }
                return raw;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Paystack GET {Path} failed.", path);
                return null;
            }
        }

        private static int? ParseIntLoose(JsonElement el)
        {
            if (el.ValueKind == JsonValueKind.Number && el.TryGetInt32(out var n)) return n;
            if (el.ValueKind == JsonValueKind.String && int.TryParse(el.GetString(), out var s)) return s;
            return null;
        }

        // Reads the nested `authorization` object (present on verify + charge
        // responses): reusable card token plus the card summary we surface on
        // the billing page.
        private static (string? brand, string? last4, int? expMonth, int? expYear, string? authCode)
            ReadAuthorization(JsonElement d)
        {
            string? brand = null, last4 = null, authCode = null;
            int? em = null, ey = null;
            if (d.TryGetProperty("authorization", out var au) && au.ValueKind == JsonValueKind.Object)
            {
                if (au.TryGetProperty("brand", out var b) && b.ValueKind == JsonValueKind.String) brand = b.GetString();
                else if (au.TryGetProperty("card_type", out var ctp)) brand = ctp.GetString();
                if (au.TryGetProperty("last4", out var l4)) last4 = l4.GetString();
                if (au.TryGetProperty("exp_month", out var xm)) em = ParseIntLoose(xm);
                if (au.TryGetProperty("exp_year", out var xy)) ey = ParseIntLoose(xy);
                if (au.TryGetProperty("authorization_code", out var ac)) authCode = ac.GetString();
            }
            return (brand, last4, em, ey, authCode);
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

        private record PlanApiRequest
        {
            [JsonPropertyName("name")] public required string Name { get; init; }
            [JsonPropertyName("amount")] public required long Amount { get; init; }
            [JsonPropertyName("interval")] public required string Interval { get; init; }
            [JsonPropertyName("currency")] public string? Currency { get; init; }
        }

        private record PlanApiResponse
        {
            [JsonPropertyName("status")] public bool Status { get; init; }
            [JsonPropertyName("message")] public string? Message { get; init; }
            [JsonPropertyName("data")] public PlanApiData? Data { get; init; }
        }

        private record PlanApiData
        {
            [JsonPropertyName("plan_code")] public string? PlanCode { get; init; }
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
