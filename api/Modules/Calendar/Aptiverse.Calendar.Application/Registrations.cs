using Aptiverse.Calendar.Application.CalendarEvents.Services;
using Aptiverse.Calendar.Application.CalendarSyncs.Services;
using Aptiverse.Calendar.Application.Reminders.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.Calendar.Application
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<ICalendarEventService, CalendarEventService>();
            services.AddScoped<ICalendarSyncService, CalendarSyncService>();
            services.AddScoped<IReminderService, ReminderService>();

            return services;
        }
    }
}
