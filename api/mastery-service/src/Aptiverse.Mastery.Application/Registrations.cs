using Aptiverse.Mastery.Application.KnowledgeGaps.Services;
using Aptiverse.Mastery.Application.StudentSubjectAnalyticss.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.Mastery.Application
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IKnowledgeGapService, KnowledgeGapService>();
            services.AddScoped<IStudentSubjectAnalyticsService, StudentSubjectAnalyticsService>();

            return services;
        }
    }
}