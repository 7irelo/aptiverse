using Aptiverse.FeatureFlags.Application.FeatureFlags.Services;
using Aptiverse.FeatureFlags.Application.FeatureFlagRules.Services;
using Aptiverse.FeatureFlags.Application.FeatureFlagEvaluations.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.FeatureFlags.Application
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IFeatureFlagService, FeatureFlagService>();
            services.AddScoped<IFeatureFlagRuleService, FeatureFlagRuleService>();
            services.AddScoped<IFeatureFlagEvaluationService, FeatureFlagEvaluationService>();

            return services;
        }
    }
}
