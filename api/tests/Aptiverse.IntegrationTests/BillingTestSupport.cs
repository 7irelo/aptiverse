using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Aptiverse.Billing.Contracts;
using Aptiverse.Billing.Domain;
using Aptiverse.Billing.Paystack;
using Aptiverse.Billing.Persistence;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Wolverine.Tracking;

namespace Aptiverse.IntegrationTests;

/// <summary>A payer with a client signed in as them.</summary>
internal sealed record BillingUser(Guid UserId, HttpClient Client);

/// <summary>A student whose first payment went through: the reference paid and the Paystack customer it created.</summary>
internal sealed record PaidStudent(Guid UserId, HttpClient Client, string Reference, string CustomerCode, Guid SubscriptionId);

/// <summary>Builds payers through Identity, drives checkout through the real routes and plays Paystack with the stub.</summary>
internal sealed class BillingTestSupport(ApiFactory factory)
{
    private static readonly SemaphoreSlim SyncLock = new(1, 1);
    private static bool _synced;

    public static CancellationToken Ct => TestContext.Current.CancellationToken;

    public StubPaystack Paystack => factory.Paystack;

    /// <summary>Pushes the catalog to the stub Paystack once, so prices have plan codes. Idempotent anyway.</summary>
    public async Task EnsurePlansSyncedAsync()
    {
        await SyncLock.WaitAsync(Ct);
        try
        {
            if (_synced && !factory.Paystack.Plans.IsEmpty)
            {
                return;
            }

            using var admin = factory.CreateAdminClient();
            var response = await admin.PostAsJsonAsync("/billing/admin/plans/sync", new { dryRun = false }, Ct);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            _synced = true;
        }
        finally
        {
            SyncLock.Release();
        }
    }

    /// <summary>A student account; with an age it gets a date of birth, and optionally a parent's recorded consent.</summary>
    public async Task<BillingUser> StudentAsync(int? ageYears = 20, bool parentalConsent = false)
    {
        var userId = await SeedUserAsync("student", ageYears, parentalConsent);
        return new BillingUser(userId, factory.CreateUserClient(userId));
    }

    public async Task<BillingUser> ParentAsync()
    {
        var userId = await SeedUserAsync("parent", null, false);
        return new BillingUser(userId, factory.CreateUserClient(userId, "parent"));
    }

    public static async Task<HttpResponseMessage> CheckoutAsync(HttpClient client, string planCode = "student.pro", string interval = "monthly", string? idempotencyKey = null, object? extra = null)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, "/billing/checkout")
        {
            Content = JsonContent.Create(extra ?? new { planCode, interval }),
        };
        if (idempotencyKey is not null)
        {
            request.Headers.Add("Idempotency-Key", idempotencyKey);
        }

        return await client.SendAsync(request, Ct);
    }

    public static async Task<string> ReferenceAsync(HttpResponseMessage checkout)
    {
        Assert.True(checkout.StatusCode == HttpStatusCode.Created, await checkout.Content.ReadAsStringAsync(Ct));
        using var json = JsonDocument.Parse(await checkout.Content.ReadAsStringAsync(Ct));
        return json.RootElement.GetProperty("reference").GetString()!;
    }

    public static byte[] Envelope(string eventType, JsonObject data) =>
        Encoding.UTF8.GetBytes(new JsonObject { ["event"] = eventType, ["data"] = data.DeepClone() }.ToJsonString());

    /// <summary>Posts a webhook signed with the test key (or the given signature) and waits for its processing.</summary>
    public async Task<HttpResponseMessage> WebhookAsync(byte[] body, string? signature = null, bool sign = true) =>
        (await WebhookTrackedAsync(body, signature, sign)).Response;

    /// <summary>As <see cref="WebhookAsync(byte[], string?, bool)"/>, with the tracked session of everything it caused.</summary>
    public async Task<(HttpResponseMessage Response, ITrackedSession Session)> WebhookTrackedAsync(byte[] body, string? signature = null, bool sign = true)
    {
        HttpResponseMessage? response = null;
        var session = await factory.AppHost.ExecuteAndWaitAsync(
            async () =>
            {
                using var client = factory.CreateClient();
                using var content = new ByteArrayContent(body);
                content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");
                if (sign)
                {
                    content.Headers.TryAddWithoutValidation(PaystackWebhooks.SignatureHeader, signature ?? PaystackWebhooks.Sign(body, ApiFactory.PaystackSecret));
                }

                response = await client.PostAsync("/billing/paystack/webhook", content, Ct);
            },
            timeoutInMilliseconds: 30_000);
        return (response!, session);
    }

    public async Task<ITrackedSession> WebhookSessionAsync(string eventType, JsonObject data)
    {
        var (response, session) = await WebhookTrackedAsync(Envelope(eventType, data));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return session;
    }

    public Task<HttpResponseMessage> WebhookAsync(string eventType, JsonObject data) => WebhookAsync(Envelope(eventType, data));

    public async Task<HttpResponseMessage> ChargeSuccessAsync(string reference) =>
        await WebhookAsync(PaystackEvents.ChargeSuccess, StubPaystack.TransactionData(Paystack.Transactions[reference]));

    /// <summary>A student who bought Student Pro monthly and whose charge.success was processed.</summary>
    public async Task<PaidStudent> PaidStudentAsync(string interval = "monthly")
    {
        await EnsurePlansSyncedAsync();
        var student = await StudentAsync();
        var reference = await ReferenceAsync(await CheckoutAsync(student.Client, interval: interval));
        var transaction = Paystack.MarkPaid(reference);
        Assert.Equal(HttpStatusCode.OK, (await ChargeSuccessAsync(reference)).StatusCode);
        var subscriptionId = await WithDbAsync(db => db.Subscriptions.Where(s => s.OwnerUserId == student.UserId && s.Status == SubscriptionStatuses.Active).Select(s => s.Id).SingleAsync(Ct));
        return new PaidStudent(student.UserId, student.Client, reference, transaction.CustomerCode!, subscriptionId);
    }

    /// <summary>Links the paid subscription to a Paystack subscription through subscription.create.</summary>
    public async Task<StubSubscription> LinkPaystackSubscriptionAsync(PaidStudent student)
    {
        var planCode = Paystack.Transactions[student.Reference].PlanCode!;
        var subscription = Paystack.AddSubscription(student.CustomerCode, planCode);
        Assert.Equal(HttpStatusCode.OK, (await WebhookAsync(PaystackEvents.SubscriptionCreate, StubPaystack.SubscriptionData(subscription))).StatusCode);
        return subscription;
    }

    public async Task<T> WithDbAsync<T>(Func<BillingDbContext, Task<T>> work)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        return await work(scope.ServiceProvider.GetRequiredService<BillingDbContext>());
    }

    public async Task WithDbAsync(Func<BillingDbContext, Task> work)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        await work(scope.ServiceProvider.GetRequiredService<BillingDbContext>());
    }

    public async Task<T> WithMeterAsync<T>(Func<IUsageMeter, Task<T>> work)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        return await work(scope.ServiceProvider.GetRequiredService<IUsageMeter>());
    }

    public Task<ITrackedSession> DeliverAsync(object message) => factory.AppHost.InvokeMessageAndWaitAsync(message);

    public static List<T> MessagesOf<T>(ITrackedSession session) =>
        session.AllRecordsInOrder().Select(r => r.Envelope?.Message).OfType<T>().Distinct().ToList();

    public async Task<ITrackedSession> TrackAsync(Func<Task> action) =>
        await factory.AppHost.ExecuteAndWaitAsync(action, timeoutInMilliseconds: 30_000);

    public static async Task<string> ProblemCodeAsync(HttpResponseMessage response)
    {
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(Ct));
        return json.RootElement.GetProperty("code").GetString()!;
    }

    /// <summary>Uses up a user's whole allowance for a quota key through the meter itself.</summary>
    public async Task ExhaustAsync(Guid userId, string quotaKey)
    {
        var snapshot = await WithMeterAsync(m => m.GetAsync(userId, quotaKey, Ct));
        var left = (snapshot.Limit ?? 0) - snapshot.Used - snapshot.Reserved;
        if (left <= 0)
        {
            return;
        }

        var reserved = await WithMeterAsync(m => m.ReserveAsync(userId, quotaKey, left, "test:exhaust", Ct));
        Assert.Equal(ReserveStatus.Reserved, reserved.Status);
        Assert.True(await WithMeterAsync(m => m.ConfirmAsync(reserved.ReservationId!.Value, left, 0, Ct)));
    }

    private async Task<Guid> SeedUserAsync(string role, int? ageYears, bool parentalConsent)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();
        var email = $"payer-{Guid.NewGuid():N}@example.test";
        var user = User.Create(email, email.ToUpperInvariant(), "Pat Payer", emailConfirmed: false);
        user.AddRole(role);
        if (ageYears is { } age)
        {
            user.SetDateOfBirth(DateOnly.FromDateTime(DateTime.UtcNow.Date).AddYears(-age).AddDays(-10));
        }

        db.Users.Add(user);
        if (parentalConsent)
        {
            db.UserConsents.Add(UserConsent.Create(user.Id, UserConsent.ParentalConsent, UserConsent.UnversionedDocument, ConsentSources.Profile, new RequestInfo(null, null), DateTimeOffset.UtcNow));
        }

        await db.SaveChangesAsync(Ct);
        return user.Id;
    }
}
