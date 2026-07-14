using Aptiverse.AI.Core;
using Aptiverse.AI.Infrastructure;
using Aptiverse.Entitlements.Application.Services;
using Aptiverse.Entitlements.Infrastructure.Paystack;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.Entitlements.Application
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IEntitlementService, EntitlementService>();
            services.AddScoped<IUsageMeter, UsageMeter>();

            // AI client uses HttpClient — let the factory manage the pool.
            // Timeout is generous: the tutor's deep mode runs Opus 4.8 with
            // extended thinking, which can take well over the default 100s.
            services.AddHttpClient<IAnthropicClient, AnthropicClient>(c =>
                c.Timeout = TimeSpan.FromSeconds(180));

            // Paystack billing: typed client via IHttpClientFactory, plus
            // the webhook-driven Subscription lifecycle service. Secret key
            // is read from PAYSTACK_SECRET_KEY (never hardcoded).
            services.AddHttpClient<IPaystackClient, PaystackClient>();
            services.AddScoped<IPaystackSubscriptionService, PaystackSubscriptionService>();

            return services;
        }
    }
}
