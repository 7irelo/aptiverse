using Aptiverse.Moderation.Application.ContentReports.Services;
using Aptiverse.Moderation.Application.ModerationActions.Services;
using Aptiverse.Moderation.Application.ContentFilters.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.Moderation.Application
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IContentReportService, ContentReportService>();
            services.AddScoped<IModerationActionService, ModerationActionService>();
            services.AddScoped<IContentFilterService, ContentFilterService>();

            return services;
        }
    }
}
