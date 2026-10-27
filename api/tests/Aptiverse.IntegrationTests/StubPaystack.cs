using System.Collections.Concurrent;
using System.Globalization;
using System.Net;
using System.Text;
using System.Text.Json.Nodes;

namespace Aptiverse.IntegrationTests;

/// <summary>
/// Stands in for the Paystack REST API behind the typed client: transactions (initialize, verify, list), plans and
/// subscriptions, all in memory. Nothing here talks to Paystack. Tests flip <see cref="Down"/> or
/// <see cref="RejectWrites"/> to exercise outages and refusals, and use <see cref="MarkPaid"/> to play the payer.
/// </summary>
public sealed class StubPaystack
{
    private long _nextId = 4_000_000;

    public ConcurrentDictionary<string, StubTransaction> Transactions { get; } = new(StringComparer.Ordinal);

    public ConcurrentDictionary<string, StubPlan> Plans { get; } = new(StringComparer.Ordinal);

    public ConcurrentDictionary<string, StubSubscription> Subscriptions { get; } = new(StringComparer.Ordinal);

    public ConcurrentQueue<(HttpMethod Method, string Path, string Body, string? Authorization)> Requests { get; } = new();

    /// <summary>Every call answers 503, like an outage.</summary>
    public bool Down { get; set; }

    /// <summary>Writes (POST and PUT) answer 400, like a refusal.</summary>
    public bool RejectWrites { get; set; }

    public long NextId() => Interlocked.Increment(ref _nextId);

    /// <summary>The payer pays: the transaction succeeds, optionally with a different amount than initialized.</summary>
    public StubTransaction MarkPaid(string reference, long? amount = null, string? customerCode = null)
    {
        var transaction = Transactions[reference];
        transaction.Status = "success";
        transaction.Amount = amount ?? transaction.Amount;
        transaction.CustomerCode = customerCode ?? transaction.CustomerCode ?? $"CUS_{NextId()}";
        transaction.PaidAt = DateTimeOffset.UtcNow;
        return transaction;
    }

    /// <summary>A renewal charge Paystack made on its own for a subscription.</summary>
    public StubTransaction AddRenewal(string customerCode, string planCode, long amount)
    {
        var transaction = new StubTransaction
        {
            Id = NextId(),
            Reference = $"renewal_{Guid.NewGuid():N}",
            Amount = amount,
            Currency = "ZAR",
            Status = "success",
            CustomerCode = customerCode,
            PlanCode = planCode,
            PaidAt = DateTimeOffset.UtcNow,
        };
        Transactions[transaction.Reference] = transaction;
        return transaction;
    }

    public StubSubscription AddSubscription(string customerCode, string planCode)
    {
        var subscription = new StubSubscription($"SUB_{NextId()}", customerCode, planCode, "active", $"tok_{NextId()}");
        Subscriptions[subscription.Code] = subscription;
        return subscription;
    }

    /// <summary>The transaction as Paystack's verify and charge.success put it in data.</summary>
    public static JsonObject TransactionData(StubTransaction t) => new()
    {
        ["id"] = t.Id,
        ["status"] = t.Status,
        ["reference"] = t.Reference,
        ["amount"] = t.Amount,
        ["currency"] = t.Currency,
        ["paid_at"] = t.PaidAt?.ToString("O", CultureInfo.InvariantCulture),
        ["channel"] = "card",
        ["fees"] = 150,
        ["customer"] = new JsonObject { ["customer_code"] = t.CustomerCode, ["email"] = t.Email },
        ["plan"] = t.PlanCode is null ? null : new JsonObject { ["plan_code"] = t.PlanCode },
    };

    public static JsonObject SubscriptionData(StubSubscription s, string? status = null) => new()
    {
        ["id"] = 77,
        ["subscription_code"] = s.Code,
        ["status"] = status ?? s.Status,
        ["email_token"] = s.EmailToken,
        ["next_payment_date"] = DateTimeOffset.UtcNow.AddMonths(1).ToString("O", CultureInfo.InvariantCulture),
        ["customer"] = new JsonObject { ["customer_code"] = s.CustomerCode },
        ["plan"] = new JsonObject { ["plan_code"] = s.PlanCode },
    };

    internal HttpResponseMessage Respond(HttpMethod method, string path, string query, string body)
    {
        if (Down)
        {
            return new HttpResponseMessage(HttpStatusCode.ServiceUnavailable);
        }

        if (RejectWrites && (method == HttpMethod.Post || method == HttpMethod.Put))
        {
            return Json(HttpStatusCode.BadRequest, new JsonObject { ["status"] = false, ["message"] = "Refused" });
        }

        var segments = path.Trim('/').Split('/');
        return (method.Method, segments) switch
        {
            ("POST", ["transaction", "initialize"]) => Initialize(body),
            ("GET", ["transaction", "verify", var reference]) => Transactions.TryGetValue(Uri.UnescapeDataString(reference), out var t)
                ? Ok(TransactionData(t))
                : Json(HttpStatusCode.NotFound, new JsonObject { ["status"] = false }),
            ("GET", ["transaction"]) => Ok(new JsonArray(Transactions.Values.Select(t => (JsonNode)TransactionData(t)).ToArray()), new JsonObject { ["pageCount"] = 1 }),
            ("POST", ["plan"]) => CreatePlan(body),
            ("GET", ["plan", var code]) => Plans.TryGetValue(code, out var plan) ? Ok(PlanData(plan)) : Json(HttpStatusCode.NotFound, new JsonObject { ["status"] = false }),
            ("PUT", ["plan", var code]) => UpdatePlan(code, body),
            ("GET", ["subscription", var code]) => Subscriptions.TryGetValue(code, out var s)
                ? Ok(SubscriptionData(s))
                : Json(HttpStatusCode.NotFound, new JsonObject { ["status"] = false }),
            ("POST", ["subscription", "disable"]) => Toggle(body, "non-renewing"),
            ("POST", ["subscription", "enable"]) => Toggle(body, "active"),
            _ => Json(HttpStatusCode.NotFound, new JsonObject { ["status"] = false }),
        };
    }

    private HttpResponseMessage Initialize(string body)
    {
        var json = JsonNode.Parse(body)!;
        var reference = json["reference"]!.GetValue<string>();
        var transaction = new StubTransaction
        {
            Id = NextId(),
            Reference = reference,
            Amount = long.Parse(json["amount"]!.GetValue<string>(), CultureInfo.InvariantCulture),
            Currency = json["currency"]!.GetValue<string>(),
            Status = "abandoned",
            Email = json["email"]!.GetValue<string>(),
            PlanCode = json["plan"]?.GetValue<string>(),
            CallbackUrl = json["callback_url"]?.GetValue<string>(),
        };
        Transactions[reference] = transaction;
        return Ok(new JsonObject
        {
            ["authorization_url"] = $"https://checkout.paystack.com/{reference}",
            ["access_code"] = $"ac_{transaction.Id}",
            ["reference"] = reference,
        });
    }

    private HttpResponseMessage CreatePlan(string body)
    {
        var json = JsonNode.Parse(body)!;
        var plan = new StubPlan(
            $"PLN_{NextId()}",
            json["name"]!.GetValue<string>(),
            long.Parse(json["amount"]!.GetValue<string>(), CultureInfo.InvariantCulture),
            json["interval"]!.GetValue<string>());
        Plans[plan.Code] = plan;
        return Ok(PlanData(plan));
    }

    private HttpResponseMessage UpdatePlan(string code, string body)
    {
        if (!Plans.TryGetValue(code, out var plan))
        {
            return Json(HttpStatusCode.NotFound, new JsonObject { ["status"] = false });
        }

        Plans[code] = plan with { Name = JsonNode.Parse(body)!["name"]!.GetValue<string>() };
        return Json(HttpStatusCode.OK, new JsonObject { ["status"] = true, ["message"] = "Plan updated" });
    }

    private HttpResponseMessage Toggle(string body, string status)
    {
        var json = JsonNode.Parse(body)!;
        var code = json["code"]!.GetValue<string>();
        if (!Subscriptions.TryGetValue(code, out var s) || s.EmailToken != json["token"]?.GetValue<string>())
        {
            return Json(HttpStatusCode.BadRequest, new JsonObject { ["status"] = false });
        }

        s.Status = status;
        return Json(HttpStatusCode.OK, new JsonObject { ["status"] = true, ["message"] = "Done" });
    }

    private static JsonObject PlanData(StubPlan plan) => new()
    {
        ["plan_code"] = plan.Code,
        ["name"] = plan.Name,
        ["amount"] = plan.Amount,
        ["interval"] = plan.Interval,
        ["currency"] = "ZAR",
    };

    private static HttpResponseMessage Ok(JsonNode data, JsonObject? meta = null) =>
        Json(HttpStatusCode.OK, new JsonObject { ["status"] = true, ["message"] = "OK", ["data"] = data, ["meta"] = meta });

    private static HttpResponseMessage Json(HttpStatusCode status, JsonObject body) => new(status)
    {
        Content = new StringContent(body.ToJsonString(), Encoding.UTF8, "application/json"),
    };
}

public sealed class StubTransaction
{
    public long Id { get; set; }

    public string Reference { get; set; } = string.Empty;

    public long Amount { get; set; }

    public string Currency { get; set; } = "ZAR";

    public string Status { get; set; } = "abandoned";

    public string? Email { get; set; }

    public string? CustomerCode { get; set; }

    public string? PlanCode { get; set; }

    public string? CallbackUrl { get; set; }

    public DateTimeOffset? PaidAt { get; set; }
}

public sealed record StubPlan(string Code, string Name, long Amount, string Interval);

public sealed class StubSubscription(string code, string customerCode, string planCode, string status, string emailToken)
{
    public string Code { get; } = code;

    public string CustomerCode { get; } = customerCode;

    public string PlanCode { get; } = planCode;

    public string Status { get; set; } = status;

    public string EmailToken { get; } = emailToken;
}

/// <summary>Primary handler of the Paystack client in tests. A new one per handler rotation; the state is shared.</summary>
internal sealed class StubPaystackHandler(StubPaystack stub) : HttpMessageHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var body = request.Content is null ? string.Empty : await request.Content.ReadAsStringAsync(cancellationToken);
        stub.Requests.Enqueue((request.Method, request.RequestUri!.AbsolutePath, body, request.Headers.Authorization?.ToString()));
        return stub.Respond(request.Method, request.RequestUri.AbsolutePath, request.RequestUri.Query, body);
    }
}
