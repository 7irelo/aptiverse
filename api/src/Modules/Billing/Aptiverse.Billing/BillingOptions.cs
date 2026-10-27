using System.ComponentModel.DataAnnotations;
using System.Threading.RateLimiting;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace Aptiverse.Billing;

/// <summary>Billing settings. The Paystack secret comes from Secrets Manager in deployed environments, never the repo.</summary>
internal sealed class BillingOptions
{
    public const string SectionName = "Billing";

    public PaystackSettings Paystack { get; set; } = new();

    public VatSettings Vat { get; set; } = new();

    /// <summary>
    /// Where Paystack sends the payer back after checkout (the web /welcome page). From config only, never the request,
    /// so checkout cannot become an open redirect.
    /// </summary>
    public Uri? CallbackUrl { get; set; }

    /// <summary>How long an unpaid checkout session stays open.</summary>
    [Range(1, 72)]
    public int CheckoutExpiryHours { get; set; } = 24;

    /// <summary>An open session for the same price inside this window is reused instead of starting a new transaction.</summary>
    [Range(0, 1440)]
    public int CheckoutReuseMinutes { get; set; } = 30;

    /// <summary>Days a past due subscription keeps access before it is cancelled (dunning grace).</summary>
    [Range(1, 30)]
    public int PastDueGraceDays { get; set; } = 7;

    /// <summary>Days of Paystack transactions each reconciliation run compares.</summary>
    [Range(1, 30)]
    public int ReconciliationWindowDays { get; set; } = 3;

    /// <summary>Schedules the nightly reconciliation on start. Off in tests, which run it by hand.</summary>
    public bool ScheduleReconciliation { get; set; } = true;

    /// <summary>Times an inbox event that cannot be matched yet (out of order delivery) is retried before it fails.</summary>
    [Range(1, 20)]
    public int InboxMaxAttempts { get; set; } = 5;

    [Range(1, 3600)]
    public int InboxRetrySeconds { get; set; } = 60;

    [Range(1, 10_000)]
    public int CheckoutPermitLimit { get; set; } = 5;

    [Range(1, 10_000)]
    public int VerifyPermitLimit { get; set; } = 20;

    [Range(1, 100_000)]
    public int WebhookPermitLimit { get; set; } = 600;

    [Range(1, 3600)]
    public int RateLimitWindowSeconds { get; set; } = 60;
}

internal sealed class PaystackSettings
{
    public static readonly Uri DefaultBaseUrl = new("https://api.paystack.co/");

    /// <summary>sk_test_ or sk_live_. Signs every API call and, per Paystack, every webhook.</summary>
    public string? SecretKey { get; set; }

    /// <summary>Only when Paystack issues a separate webhook secret; otherwise webhooks are verified with the secret key.</summary>
    public string? WebhookSecret { get; set; }

    public Uri BaseUrl { get; set; } = DefaultBaseUrl;

    [Range(1, 60)]
    public int TimeoutSeconds { get; set; } = 10;

    public bool IsConfigured => !string.IsNullOrWhiteSpace(SecretKey);

    /// <summary>"test" or "live" from the key prefix, for the test mode banner.</summary>
    public string Mode => SecretKey?.StartsWith("sk_live_", StringComparison.Ordinal) == true ? "live" : "test";

    public string? SigningSecret => string.IsNullOrWhiteSpace(WebhookSecret) ? SecretKey : WebhookSecret;
}

/// <summary>VAT registration is a pending fact (DECISIONS.md F 50); prices are VAT inclusive and VAT stays off until it is confirmed.</summary>
internal sealed class VatSettings
{
    public bool Registered { get; set; }

    [Range(0, 5000)]
    public int RateBps { get; set; } = 1500;

    public bool PricesIncludeVat { get; set; } = true;

    public string? VatNumber { get; set; }
}

/// <summary>Boot checks that data annotations cannot express: the key per environment and the callback URL.</summary>
internal sealed class BillingOptionsValidator(IHostEnvironment environment) : IValidateOptions<BillingOptions>
{
    public ValidateOptionsResult Validate(string? name, BillingOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);
        if (PlatformHostingExtensions.IsBuildTimeDocumentGeneration)
        {
            return ValidateOptionsResult.Success;
        }

        var failures = new List<string>();
        var key = options.Paystack.SecretKey;
        if (!environment.IsDevelopment() && string.IsNullOrWhiteSpace(key))
        {
            failures.Add("Billing:Paystack:SecretKey is required outside Development.");
        }

        if (!string.IsNullOrWhiteSpace(key) && !key.StartsWith("sk_test_", StringComparison.Ordinal) && !key.StartsWith("sk_live_", StringComparison.Ordinal))
        {
            failures.Add("Billing:Paystack:SecretKey must start with sk_test_ or sk_live_.");
        }

        // Test and live keys are never mixed: production refuses a test key.
        if (environment.IsProduction() && key?.StartsWith("sk_test_", StringComparison.Ordinal) == true)
        {
            failures.Add("Billing:Paystack:SecretKey must be a live key in Production.");
        }

        if (options.CallbackUrl is { } callback && (!callback.IsAbsoluteUri || (callback.Scheme != Uri.UriSchemeHttps && callback.Scheme != Uri.UriSchemeHttp)))
        {
            failures.Add("Billing:CallbackUrl must be an absolute http or https URL.");
        }

        if (!environment.IsDevelopment() && options.CallbackUrl is null)
        {
            failures.Add("Billing:CallbackUrl is required outside Development.");
        }

        if (!options.Paystack.BaseUrl.IsAbsoluteUri || options.Paystack.BaseUrl.Scheme != Uri.UriSchemeHttps)
        {
            failures.Add("Billing:Paystack:BaseUrl must be an absolute https URL.");
        }

        return failures.Count == 0 ? ValidateOptionsResult.Success : ValidateOptionsResult.Fail(failures);
    }
}

/// <summary>Per-user limits on checkout and verify; the webhook gets its own per-IP partition, never shared with user traffic.</summary>
internal static class BillingRateLimiting
{
    public const string Checkout = "billing-checkout";
    public const string Verify = "billing-verify";
    public const string Webhook = "billing-paystack-webhook";

    public static void AddPolicies(RateLimiterOptions limiter, BillingOptions options)
    {
        ArgumentNullException.ThrowIfNull(limiter);
        ArgumentNullException.ThrowIfNull(options);

        Add(limiter, Checkout, options.CheckoutPermitLimit, options.RateLimitWindowSeconds);
        Add(limiter, Verify, options.VerifyPermitLimit, options.RateLimitWindowSeconds);
        Add(limiter, Webhook, options.WebhookPermitLimit, options.RateLimitWindowSeconds);
    }

    private static void Add(RateLimiterOptions limiter, string policy, int permits, int windowSeconds) =>
        limiter.AddPolicy(policy, context => RateLimitPartition.GetFixedWindowLimiter(
            $"{policy}:{PartitionKey(context)}",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = permits,
                Window = TimeSpan.FromSeconds(windowSeconds),
                QueueLimit = 0,
            }));

    private static string PartitionKey(HttpContext context) =>
        context.User.GetUserId() is { } userId
            ? $"user:{userId}"
            : $"ip:{context.Connection.RemoteIpAddress?.ToString() ?? "unknown"}";
}
