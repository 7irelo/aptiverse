using Aptiverse.Insights.Application.GradeDistributions.Services;
using Aptiverse.Insights.Application.ImprovementTips.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.Insights.Application
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IGradeDistributionService, GradeDistributionService>();
            services.AddScoped<IImprovementTipService, ImprovementTipService>();

            return services;
        }
    }
}