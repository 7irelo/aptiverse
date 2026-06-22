using Aptiverse.AI.Core;
using Aptiverse.AI.Infrastructure;
using Aptiverse.Entitlements.Application.Services;
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
            services.AddHttpClient<IAnthropicClient, AnthropicClient>();

            return services;
        }
    }
}
