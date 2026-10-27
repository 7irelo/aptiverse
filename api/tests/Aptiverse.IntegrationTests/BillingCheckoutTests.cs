using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;
using Aptiverse.Billing.Domain;
using Microsoft.EntityFrameworkCore;
using static Aptiverse.IntegrationTests.BillingTestSupport;

namespace Aptiverse.IntegrationTests;

[Collection(ApiTestGroup.Name)]
public sealed class BillingCheckoutTests(ApiFactory factory)
{
    private readonly BillingTestSupport _billing = new(factory);

    private void SkipWithoutDocker() => Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);

    [Fact]
    public async Task Every_user_route_without_auth_is_401_and_admin_routes_need_billing_admin()
    {
        SkipWithoutDocker();
        var anonymous = factory.CreateClient();
        var routes = new (HttpMethod Method, string Path, object? Body)[]
        {
            (HttpMethod.Get, "/billing/usage", null),
            (HttpMethod.Get, "/billing/subscription", null),
            (HttpMethod.Get, "/billing/invoices", null),
            (HttpMethod.Post, "/billing/checkout", new { planCode = "student.pro", interval = "monthly" }),
            (HttpMethod.Post, "/billing/checkout/verify", new { reference = "apt_x" }),
            (HttpMethod.Post, "/billing/subscription/cancel", new { }),
            (HttpMethod.Post, "/billing/subscription/resume", null),
            (HttpMethod.Post, "/billing/admin/plans/sync", new { dryRun = true }),
            (HttpMethod.Post, "/billing/admin/reconciliation/run", null),
        };

        foreach (var (method, path, body) in routes)
        {
            using var request = new HttpRequestMessage(method, path) { Content = body is null ? null : JsonContent.Create(body) };
            Assert.True(HttpStatusCode.Unauthorized == (await anonymous.SendAsync(request, Ct)).StatusCode, path);
        }

        var student = await _billing.StudentAsync();
        Assert.Equal(HttpStatusCode.Forbidden, (await student.Client.PostAsJsonAsync("/billing/admin/plans/sync", new { dryRun = true }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await student.Client.PostAsync("/billing/admin/reconciliation/run", null, Ct)).StatusCode);
    }

    [Fact]
    public async Task Plans_are_public_in_cents_and_hide_inactive_plans()
    {
        SkipWithoutDocker();
        var response = await factory.CreateClient().GetAsync("/billing/plans", Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("max-age=300", response.Headers.CacheControl?.ToString(), StringComparison.Ordinal);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(Ct));
        Assert.True(json.RootElement.GetProperty("vatInclusive").GetBoolean());
        Assert.Equal("test", json.RootElement.GetProperty("paystackMode").GetString());
        var plans = json.RootElement.GetProperty("plans").EnumerateArray().ToDictionary(p => p.GetProperty("code").GetString()!);
        Assert.DoesNotContain("student.max", plans.Keys);
        var pro = plans["student.pro"].GetProperty("prices").EnumerateArray().ToDictionary(p => p.GetProperty("interval").GetString()!, p => p.GetProperty("amountCents").GetInt64());
        Assert.Equal(12_900, pro["monthly"]);
        Assert.Equal(129_000, pro["annual"]);

        using var parents = JsonDocument.Parse(await factory.CreateClient().GetStringAsync("/billing/plans?audience=parent", Ct));
        Assert.All(parents.RootElement.GetProperty("plans").EnumerateArray(), p => Assert.Equal("parent", p.GetProperty("audience").GetString()));
        Assert.Equal(HttpStatusCode.BadRequest, (await factory.CreateClient().GetAsync("/billing/plans?audience=tutor", Ct)).StatusCode);
    }

    [Fact]
    public async Task Checkout_takes_the_amount_callback_and_email_from_the_server_never_the_client()
    {
        SkipWithoutDocker();
        await _billing.EnsurePlansSyncedAsync();
        var student = await _billing.StudentAsync();

        var response = await CheckoutAsync(student.Client, extra: new { planCode = "student.pro", interval = "annual", amountCents = 1, amount = 1, callbackUrl = "https://evil.test", email = "evil@evil.test" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(Ct));
        var reference = json.RootElement.GetProperty("reference").GetString()!;
        Assert.StartsWith("apt_", reference, StringComparison.Ordinal);
        Assert.Equal($"https://checkout.paystack.com/{reference}", json.RootElement.GetProperty("authorizationUrl").GetString());

        var sent = _billing.Paystack.Transactions[reference];
        Assert.Equal(129_000, sent.Amount);
        Assert.Equal("ZAR", sent.Currency);
        Assert.Equal(ApiFactory.BillingCallbackUrl, sent.CallbackUrl);
        Assert.NotEqual("evil@evil.test", sent.Email);
        Assert.NotNull(sent.PlanCode);

        await _billing.WithDbAsync(async db =>
        {
            var session = await db.CheckoutSessions.AsNoTracking().SingleAsync(c => c.Reference == reference, Ct);
            Assert.Equal(129_000, session.AmountCents);
            Assert.Equal(student.UserId, session.UserId);
            var subscription = await db.Subscriptions.AsNoTracking().SingleAsync(s => s.Id == session.SubscriptionId, Ct);
            Assert.Equal(SubscriptionStatuses.Incomplete, subscription.Status);
            Assert.True(await db.SubscriptionTransitions.AnyAsync(t => t.SubscriptionId == subscription.Id && t.Transition == SubscriptionStateMachine.CheckoutStarted, Ct));
        });
    }

    [Fact]
    public async Task A_verified_email_is_not_needed_and_checkout_is_reused_and_idempotent()
    {
        SkipWithoutDocker();
        await _billing.EnsurePlansSyncedAsync();
        var student = await _billing.StudentAsync();

        var first = await ReferenceAsync(await CheckoutAsync(student.Client, idempotencyKey: "checkout-key-1"));
        var replay = await ReferenceAsync(await CheckoutAsync(student.Client, idempotencyKey: "checkout-key-1"));
        var reused = await ReferenceAsync(await CheckoutAsync(student.Client));

        Assert.Equal(first, replay);
        Assert.Equal(first, reused);
        Assert.Equal(1, await _billing.WithDbAsync(db => db.CheckoutSessions.CountAsync(c => c.UserId == student.UserId, Ct)));

        var badKey = await CheckoutAsync(student.Client, idempotencyKey: "bad key!");
        Assert.Equal(HttpStatusCode.BadRequest, badKey.StatusCode);
    }

    [Fact]
    public async Task Under_18s_pay_only_with_recorded_parental_consent_and_an_unknown_age_is_refused()
    {
        SkipWithoutDocker();
        await _billing.EnsurePlansSyncedAsync();
        var minor = await _billing.StudentAsync(ageYears: 15);
        var unknown = await _billing.StudentAsync(ageYears: null);
        var consented = await _billing.StudentAsync(ageYears: 16, parentalConsent: true);
        var calls = _billing.Paystack.Requests.Count;

        foreach (var refused in new[] { minor, unknown })
        {
            var response = await CheckoutAsync(refused.Client);
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            Assert.Equal("billing.payer_must_be_adult", await ProblemCodeAsync(response));
        }

        Assert.Equal(calls, _billing.Paystack.Requests.Count);
        Assert.Equal(HttpStatusCode.Created, (await CheckoutAsync(consented.Client)).StatusCode);
    }

    [Fact]
    public async Task Each_role_buys_only_its_own_plans_and_unknown_plans_are_404()
    {
        SkipWithoutDocker();
        await _billing.EnsurePlansSyncedAsync();
        var parent = await _billing.ParentAsync();
        var student = await _billing.StudentAsync();

        Assert.Equal("billing.plan_not_found", await ProblemCodeAsync(await CheckoutAsync(parent.Client, "student.pro")));
        Assert.Equal("billing.plan_not_found", await ProblemCodeAsync(await CheckoutAsync(student.Client, "parent.2")));
        Assert.Equal("billing.plan_not_found", await ProblemCodeAsync(await CheckoutAsync(student.Client, "student.max")));
        Assert.Equal("billing.plan_not_found", await ProblemCodeAsync(await CheckoutAsync(student.Client, "free")));
        Assert.Equal(HttpStatusCode.Created, (await CheckoutAsync(parent.Client, "parent.2", "annual")).StatusCode);

        var admin = factory.CreateAdminClient();
        Assert.Equal(HttpStatusCode.NotFound, (await CheckoutAsync(admin, "student.pro")).StatusCode);
    }

    [Fact]
    public async Task An_unsynced_price_is_409_and_paystack_failures_leave_no_state()
    {
        SkipWithoutDocker();
        await _billing.EnsurePlansSyncedAsync();
        var code = $"t{Guid.NewGuid():N}"[..20];
        await _billing.WithDbAsync(async db =>
        {
            var plan = Plan.Create(code, "Unsynced", "A plan never pushed to Paystack", PlanKinds.Paid, Audiences.Student, 1, isPublic: true, 999, isActive: true);
            db.Plans.Add(plan);
            db.PlanPrices.Add(PlanPrice.Create(plan.Id, Intervals.Monthly, 5_000));
            await db.SaveChangesAsync(Ct);
        });
        var student = await _billing.StudentAsync();
        try
        {
            Assert.Equal("billing.plan_not_synced", await ProblemCodeAsync(await CheckoutAsync(student.Client, code)));
        }
        finally
        {
            await _billing.WithDbAsync(db => db.Plans.Where(p => p.Code == code).ExecuteUpdateAsync(s => s.SetProperty(p => p.IsActive, false), Ct));
        }

        var down = await _billing.StudentAsync();
        _billing.Paystack.Down = true;
        HttpResponseMessage unavailable;
        try
        {
            unavailable = await CheckoutAsync(down.Client);
        }
        finally
        {
            _billing.Paystack.Down = false;
        }

        Assert.Equal(HttpStatusCode.ServiceUnavailable, unavailable.StatusCode);
        Assert.Equal("billing.checkout_unavailable", await ProblemCodeAsync(unavailable));

        _billing.Paystack.RejectWrites = true;
        HttpResponseMessage rejected;
        try
        {
            rejected = await CheckoutAsync(down.Client);
        }
        finally
        {
            _billing.Paystack.RejectWrites = false;
        }

        Assert.Equal(HttpStatusCode.BadGateway, rejected.StatusCode);
        Assert.Equal("billing.provider_error", await ProblemCodeAsync(rejected));
        await _billing.WithDbAsync(async db =>
        {
            Assert.False(await db.CheckoutSessions.AnyAsync(c => c.UserId == down.UserId, Ct));
            Assert.False(await db.Subscriptions.AnyAsync(s => s.OwnerUserId == down.UserId, Ct));
        });
    }

    [Fact]
    public async Task A_subscribed_student_cannot_check_out_again()
    {
        SkipWithoutDocker();
        var paid = await _billing.PaidStudentAsync();

        var again = await CheckoutAsync(paid.Client, interval: "annual");

        Assert.Equal(HttpStatusCode.Conflict, again.StatusCode);
        Assert.Equal("billing.already_subscribed", await ProblemCodeAsync(again));
    }

    [Fact]
    public async Task Users_only_ever_see_their_own_checkout_subscription_usage_and_invoices()
    {
        SkipWithoutDocker();
        var paid = await _billing.PaidStudentAsync();
        var stranger = await _billing.StudentAsync();

        var verify = await stranger.Client.PostAsJsonAsync("/billing/checkout/verify", new { reference = paid.Reference }, Ct);
        Assert.Equal(HttpStatusCode.NotFound, verify.StatusCode);
        Assert.Equal("billing.checkout_not_found", await ProblemCodeAsync(verify));

        var subscription = await stranger.Client.GetFromJsonAsync<JsonObject>("/billing/subscription", Ct);
        Assert.Null(subscription!["subscription"]);

        var invoices = await stranger.Client.GetFromJsonAsync<JsonObject>("/billing/invoices", Ct);
        Assert.Equal(0, invoices!["totalCount"]!.GetValue<long>());
        var own = await paid.Client.GetFromJsonAsync<JsonObject>("/billing/invoices", Ct);
        Assert.Equal(1, own!["totalCount"]!.GetValue<long>());

        var cancel = await stranger.Client.PostAsJsonAsync("/billing/subscription/cancel", new { }, Ct);
        Assert.Equal("billing.no_active_subscription", await ProblemCodeAsync(cancel));
        Assert.Equal(SubscriptionStatuses.Active, await _billing.WithDbAsync(db => db.Subscriptions.Where(s => s.Id == paid.SubscriptionId).Select(s => s.Status).SingleAsync(Ct)));

        var mine = await paid.Client.GetFromJsonAsync<JsonObject>("/billing/subscription", Ct);
        Assert.Equal("student.pro", mine!["subscription"]!["planCode"]!.GetValue<string>());
        Assert.Equal(12_900, mine["subscription"]!["amountCents"]!.GetValue<long>());
    }
}
