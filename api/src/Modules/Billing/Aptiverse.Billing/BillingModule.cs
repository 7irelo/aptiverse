using Aptiverse.Billing.Catalog;
using Aptiverse.Billing.Contracts;
using Aptiverse.Billing.Entitlements;
using Aptiverse.Billing.Erasure;
using Aptiverse.Billing.Features.CancelSubscription;
using Aptiverse.Billing.Features.Common;
using Aptiverse.Billing.Features.GetMySubscription;
using Aptiverse.Billing.Features.GetMyUsage;
using Aptiverse.Billing.Features.ListMyInvoices;
using Aptiverse.Billing.Features.ListPlans;
using Aptiverse.Billing.Features.ReceivePaystackWebhook;
using Aptiverse.Billing.Features.StartCheckout;
using Aptiverse.Billing.Features.SyncPlans;
using Aptiverse.Billing.Features.VerifyCheckout;
using Aptiverse.Billing.Inbox;
using Aptiverse.Billing.Invoicing;
using Aptiverse.Billing.Messaging;
using Aptiverse.Billing.Paystack;
using Aptiverse.Billing.Persistence;
using Aptiverse.Billing.Reconciliation;
using Aptiverse.Billing.Subscriptions;
using Aptiverse.Billing.Usage;
using Aptiverse.SharedKernel.Persistence;
using Aptiverse.SharedKernel.Seeding;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Http.Resilience;
using Microsoft.Extensions.Options;
using Polly;
using Wolverine;

namespace Aptiverse.Billing;

/// <summary>
/// The only public surface of the Billing module besides its Contracts project. It owns the plan catalog, Paystack
/// checkout and the signed webhook inbox, the subscription state machine, the append-only money ledger and receipts,
/// usage metering behind IUsageMeter and entitlements behind IEntitlements. Money is integer cents in ZAR.
/// </summary>
public static class BillingModule
{
    public const string Schema = "billing";

    private static readonly TimeSpan ConnectTimeout = TimeSpan.FromSeconds(3);

    public static IServiceCollection AddBillingModule(this IServiceCollection services, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        services.AddOptions<BillingOptions>()
            .Bind(configuration.GetSection(BillingOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();
        services.AddSingleton<IValidateOptions<BillingOptions>, BillingOptionsValidator>();

        services.AddModuleDbContext<BillingDbContext>(Schema);
        services.AddValidatorsFromAssemblyContaining<StartCheckoutValidator>(includeInternalTypes: true);
        services.AddScoped<IDataSeeder, CatalogSeeder>();

        services.AddScoped<PlanAccess>();
        services.AddScoped<IEntitlements>(sp => sp.GetRequiredService<PlanAccess>());
        services.AddScoped<UsageMeterService>();
        services.AddScoped<IUsageMeter>(sp => sp.GetRequiredService<UsageMeterService>());

        services.AddScoped<SubscriptionLifecycle>();
        services.AddScoped<SubscriptionTimers>();
        services.AddScoped<SubscriptionViews>();
        services.AddScoped<InvoiceIssuer>();
        services.AddScoped<InboxWriter>();
        services.AddScoped<InboxProcessor>();
        services.AddScoped<PlanSyncer>();
        services.AddScoped<Reconciler>();
        services.AddScoped<BillingUserDataEraser>();
        services.AddHostedService<ReconciliationBootstrap>();

        services.AddScoped<ListPlansHandler>();
        services.AddScoped<StartCheckoutHandler>();
        services.AddScoped<VerifyCheckoutHandler>();
        services.AddScoped<SubscriptionChangeHandler>();
        services.AddScoped<ListMyInvoicesHandler>();
        services.AddScoped<ReceivePaystackWebhookHandler>();

        AddPaystackClient(services);

        services.AddOptions<RateLimiterOptions>()
            .Configure<IOptions<BillingOptions>>((limiter, billing) => BillingRateLimiting.AddPolicies(limiter, billing.Value));

        services.ConfigureWolverine(opts =>
        {
            opts.Discovery.IncludeType(typeof(ProcessPaystackInboxHandler));
            opts.Discovery.IncludeType(typeof(ExpireUsageReservationHandler));
            opts.Discovery.IncludeType(typeof(ExpireCheckoutSessionHandler));
            opts.Discovery.IncludeType(typeof(EndSubscriptionPeriodHandler));
            opts.Discovery.IncludeType(typeof(CheckPastDueSubscriptionHandler));
            opts.Discovery.IncludeType(typeof(RunPaystackReconciliationHandler));
            opts.Discovery.IncludeType(typeof(BillingAccountDeletionRequestedHandler));
        });

        return services;
    }

    public static IEndpointRouteBuilder MapBillingEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/billing").WithTags("Billing");

        ListPlansEndpoint.Map(group);
        GetMyUsageEndpoint.Map(group);
        GetMySubscriptionEndpoint.Map(group);
        StartCheckoutEndpoint.Map(group);
        VerifyCheckoutEndpoint.Map(group);
        SubscriptionChangeEndpoints.Map(group);
        ListMyInvoicesEndpoint.Map(group);
        ReceivePaystackWebhookEndpoint.Map(group);
        AdminEndpoints.Map(group);

        return endpoints;
    }

    private static void AddPaystackClient(IServiceCollection services)
    {
        services.AddHttpClient<IPaystackClient, PaystackClient>(PaystackClient.HttpClientName, (sp, client) =>
            {
                var settings = sp.GetRequiredService<IOptions<BillingOptions>>().Value.Paystack;
                client.BaseAddress = settings.BaseUrl.AbsoluteUri.EndsWith('/') ? settings.BaseUrl : new Uri(settings.BaseUrl.AbsoluteUri + "/");
                client.Timeout = Timeout.InfiniteTimeSpan;
            })
            .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
            {
                ConnectTimeout = ConnectTimeout,
                PooledConnectionLifetime = TimeSpan.FromMinutes(5),

                // A redirect would carry the secret key somewhere else.
                AllowAutoRedirect = false,
            })
            .AddResilienceHandler("paystack", (pipeline, context) =>
            {
                var settings = context.ServiceProvider.GetRequiredService<IOptions<BillingOptions>>().Value.Paystack;

                // Retries only on reads: a POST is retried by its caller with the same reference, never blindly here.
                pipeline.AddRetry(new HttpRetryStrategyOptions
                {
                    MaxRetryAttempts = 2,
                    Delay = TimeSpan.FromMilliseconds(300),
                    BackoffType = DelayBackoffType.Exponential,
                    UseJitter = true,
                    ShouldHandle = args => ValueTask.FromResult(
                        args.Outcome.Result?.RequestMessage?.Method == HttpMethod.Get
                        && (args.Outcome.Exception is HttpRequestException || (int?)args.Outcome.Result?.StatusCode >= 500)),
                });
                pipeline.AddCircuitBreaker(new HttpCircuitBreakerStrategyOptions());
                pipeline.AddTimeout(TimeSpan.FromSeconds(settings.TimeoutSeconds));
            });
    }
}
