using Aptiverse.Wellbeing.Application.DiaryEntries.Services;
using Aptiverse.Wellbeing.Application.DiaryGoals.Services;
using Aptiverse.Wellbeing.Application.Frontend.Services;
using Aptiverse.Wellbeing.Application.MoodTrackings.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.Wellbeing.Application
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IDiaryEntryService, DiaryEntryService>();
            services.AddScoped<IDiaryGoalService, DiaryGoalService>();
            services.AddScoped<IMoodTrackingService, MoodTrackingService>();
            services.AddScoped<IFrontendWellbeingService, FrontendWellbeingService>();

            return services;
        }
    }
}
