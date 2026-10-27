using System.Globalization;
using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Polly.CircuitBreaker;
using Polly.Timeout;

namespace Aptiverse.Billing.Paystack;

/// <summary>The Paystack calls Billing makes. Behind an interface so tests and local dev can use a fake.</summary>
internal interface IPaystackClient
{
    Task<InitializedTransaction> InitializeTransactionAsync(InitializeTransaction request, CancellationToken cancellationToken);

    /// <summary>Null when Paystack does not know the reference.</summary>
    Task<PaystackTransaction?> VerifyTransactionAsync(string reference, CancellationToken cancellationToken);

    Task<IReadOnlyList<PaystackTransaction>> ListTransactionsAsync(DateTimeOffset from, DateTimeOffset to, CancellationToken cancellationToken);

    Task<string> CreatePlanAsync(string name, string interval, long amount, string currency, CancellationToken cancellationToken);

    Task<PaystackPlan?> FetchPlanAsync(string planCode, CancellationToken cancellationToken);

    Task UpdatePlanNameAsync(string planCode, string name, CancellationToken cancellationToken);

    Task<PaystackSubscription?> FetchSubscriptionAsync(string subscriptionCode, CancellationToken cancellationToken);

    Task DisableSubscriptionAsync(string subscriptionCode, string emailToken, CancellationToken cancellationToken);

    Task EnableSubscriptionAsync(string subscriptionCode, string emailToken, CancellationToken cancellationToken);
}

/// <summary>Paystack could not be reached, timed out, answered 5xx, or the circuit is open. Safe to retry later.</summary>
internal sealed class PaystackUnavailableException : Exception
{
    public PaystackUnavailableException()
    {
    }

    public PaystackUnavailableException(string message)
        : base(message)
    {
    }

    public PaystackUnavailableException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}

/// <summary>Paystack answered but refused the call (4xx or status false). Retrying the same call will not help.</summary>
internal sealed class PaystackRejectedException : Exception
{
    public PaystackRejectedException()
    {
    }

    public PaystackRejectedException(string message)
        : base(message)
    {
    }

    public PaystackRejectedException(string message, Exception innerException)
        : base(message, innerException)
    {
    }

    public PaystackRejectedException(string message, HttpStatusCode statusCode)
        : base(message)
    {
        StatusCode = statusCode;
    }

    public HttpStatusCode? StatusCode { get; }
}

/// <summary>
/// Typed Paystack client on the shared resilience pipeline. The secret key is read per call from options and never
/// logged; Paystack's error messages are not passed to users. Every failure becomes one of the two exceptions above.
/// </summary>
internal sealed class PaystackClient(HttpClient http, IOptions<BillingOptions> options) : IPaystackClient
{
    public const string HttpClientName = "paystack";
    private const int PageSize = 100;
    private const int MaxPages = 50;

    public async Task<InitializedTransaction> InitializeTransactionAsync(InitializeTransaction request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var body = new Dictionary<string, object?>
        {
            ["email"] = request.Email,
            ["amount"] = request.Amount.ToString(CultureInfo.InvariantCulture),
            ["currency"] = request.Currency,
            ["reference"] = request.Reference,
            ["callback_url"] = request.CallbackUrl,
            ["metadata"] = request.Metadata,
        };
        if (request.Plan is not null)
        {
            body["plan"] = request.Plan;
        }

        using var data = await SendAsync(HttpMethod.Post, "transaction/initialize", body, cancellationToken)
            ?? throw new PaystackRejectedException("Paystack did not initialize the transaction.");
        var wire = data.RootElement.Deserialize<InitializeWire>(PaystackJson.Options);
        if (wire?.AuthorizationUrl is not { Length: > 0 } url || !Uri.TryCreate(url, UriKind.Absolute, out var parsed) || parsed.Scheme != Uri.UriSchemeHttps)
        {
            throw new PaystackRejectedException("Paystack returned no usable authorization URL.");
        }

        return new InitializedTransaction(url, wire.AccessCode ?? string.Empty, wire.Reference ?? request.Reference);
    }

    public async Task<PaystackTransaction?> VerifyTransactionAsync(string reference, CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(reference);
        using var data = await SendAsync(HttpMethod.Get, "transaction/verify/" + Uri.EscapeDataString(reference), null, cancellationToken);
        return data is null ? null : PaystackJson.ReadTransaction(data.RootElement);
    }

    public async Task<IReadOnlyList<PaystackTransaction>> ListTransactionsAsync(DateTimeOffset from, DateTimeOffset to, CancellationToken cancellationToken)
    {
        var all = new List<PaystackTransaction>();
        for (var page = 1; page <= MaxPages; page++)
        {
            var path = string.Create(
                CultureInfo.InvariantCulture,
                $"transaction?perPage={PageSize}&page={page}&from={Uri.EscapeDataString(from.UtcDateTime.ToString("O", CultureInfo.InvariantCulture))}&to={Uri.EscapeDataString(to.UtcDateTime.ToString("O", CultureInfo.InvariantCulture))}");
            using var envelope = await SendEnvelopeAsync(HttpMethod.Get, path, null, cancellationToken);
            if (envelope is null || !envelope.RootElement.TryGetProperty("data", out var data) || data.ValueKind != JsonValueKind.Array)
            {
                break;
            }

            all.AddRange(data.EnumerateArray().Select(PaystackJson.ReadTransaction));
            var pageCount = envelope.RootElement.TryGetProperty("meta", out var meta) ? PaystackJson.Long(meta, "pageCount") ?? 1 : 1;
            if (page >= pageCount || data.GetArrayLength() == 0)
            {
                break;
            }
        }

        return all;
    }

    public async Task<string> CreatePlanAsync(string name, string interval, long amount, string currency, CancellationToken cancellationToken)
    {
        var body = new Dictionary<string, object?>
        {
            ["name"] = name,
            ["interval"] = interval,
            ["amount"] = amount.ToString(CultureInfo.InvariantCulture),
            ["currency"] = currency,
        };
        using var data = await SendAsync(HttpMethod.Post, "plan", body, cancellationToken)
            ?? throw new PaystackRejectedException("Paystack did not create the plan.");
        return data.RootElement.Deserialize<PlanWire>(PaystackJson.Options)?.PlanCode is { Length: > 0 } code
            ? code
            : throw new PaystackRejectedException("Paystack returned no plan code.");
    }

    public async Task<PaystackPlan?> FetchPlanAsync(string planCode, CancellationToken cancellationToken)
    {
        using var data = await SendAsync(HttpMethod.Get, "plan/" + Uri.EscapeDataString(planCode), null, cancellationToken);
        var wire = data?.RootElement.Deserialize<PlanWire>(PaystackJson.Options);
        return wire is null ? null : new PaystackPlan(wire.PlanCode ?? planCode, wire.Name ?? string.Empty, wire.Amount, wire.Interval ?? string.Empty, wire.Currency ?? string.Empty);
    }

    public async Task UpdatePlanNameAsync(string planCode, string name, CancellationToken cancellationToken)
    {
        using var _ = await SendEnvelopeAsync(HttpMethod.Put, "plan/" + Uri.EscapeDataString(planCode), new Dictionary<string, object?> { ["name"] = name }, cancellationToken)
            ?? throw new PaystackRejectedException("Paystack does not know the plan.");
    }

    public async Task<PaystackSubscription?> FetchSubscriptionAsync(string subscriptionCode, CancellationToken cancellationToken)
    {
        using var data = await SendAsync(HttpMethod.Get, "subscription/" + Uri.EscapeDataString(subscriptionCode), null, cancellationToken);
        var wire = data?.RootElement.Deserialize<SubscriptionWire>(PaystackJson.Options);
        return wire is null ? null : new PaystackSubscription(wire.SubscriptionCode ?? subscriptionCode, wire.Status ?? string.Empty, wire.EmailToken, wire.NextPaymentDate);
    }

    public Task DisableSubscriptionAsync(string subscriptionCode, string emailToken, CancellationToken cancellationToken) =>
        ToggleAsync("subscription/disable", subscriptionCode, emailToken, cancellationToken);

    public Task EnableSubscriptionAsync(string subscriptionCode, string emailToken, CancellationToken cancellationToken) =>
        ToggleAsync("subscription/enable", subscriptionCode, emailToken, cancellationToken);

    private async Task ToggleAsync(string path, string code, string token, CancellationToken cancellationToken)
    {
        using var _ = await SendEnvelopeAsync(HttpMethod.Post, path, new Dictionary<string, object?> { ["code"] = code, ["token"] = token }, cancellationToken)
            ?? throw new PaystackRejectedException("Paystack does not know the subscription.");
    }

    /// <summary>The data object of a successful call, or null when Paystack answers 404.</summary>
    private async Task<JsonDocument?> SendAsync(HttpMethod method, string path, object? body, CancellationToken cancellationToken)
    {
        using var envelope = await SendEnvelopeAsync(method, path, body, cancellationToken);
        if (envelope is null)
        {
            return null;
        }

        return envelope.RootElement.TryGetProperty("data", out var data) && data.ValueKind == JsonValueKind.Object
            ? JsonDocument.Parse(data.GetRawText())
            : throw new PaystackRejectedException("Paystack answered without a data object.");
    }

    private async Task<JsonDocument?> SendEnvelopeAsync(HttpMethod method, string path, object? body, CancellationToken cancellationToken)
    {
        var settings = options.Value.Paystack;
        if (!settings.IsConfigured)
        {
            throw new PaystackUnavailableException("Paystack is not configured.");
        }

        using var request = new HttpRequestMessage(method, path);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", settings.SecretKey);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        if (body is not null)
        {
            request.Content = new ByteArrayContent(JsonSerializer.SerializeToUtf8Bytes(body, PaystackJson.Options));
            request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json") { CharSet = "utf-8" };
        }

        HttpResponseMessage response;
        try
        {
            response = await http.SendAsync(request, cancellationToken);
        }
        catch (Exception ex) when (ex is HttpRequestException or TimeoutRejectedException or BrokenCircuitException or TaskCanceledException && !cancellationToken.IsCancellationRequested)
        {
            throw new PaystackUnavailableException("Paystack could not be reached.", ex);
        }

        using (response)
        {
            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                return null;
            }

            if ((int)response.StatusCode >= 500 || response.StatusCode == HttpStatusCode.TooManyRequests)
            {
                throw new PaystackUnavailableException($"Paystack answered {(int)response.StatusCode}.");
            }

            if (!response.IsSuccessStatusCode)
            {
                throw new PaystackRejectedException($"Paystack refused the call with {(int)response.StatusCode}.", response.StatusCode);
            }

            JsonDocument document;
            try
            {
                await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
                document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
            }
            catch (JsonException ex)
            {
                throw new PaystackRejectedException("Paystack answered with something other than JSON.", ex);
            }

            if (!document.RootElement.TryGetProperty("status", out var status) || status.ValueKind != JsonValueKind.True)
            {
                document.Dispose();
                throw new PaystackRejectedException("Paystack answered with status false.", response.StatusCode);
            }

            return document;
        }
    }
}
