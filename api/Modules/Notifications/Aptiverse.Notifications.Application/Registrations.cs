using Aptiverse.Notifications.Application.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Aptiverse.Notifications.Application
{
    public static class ServiceCollectionExtensions
    {
        // Registers the Notifications module's Application services.
        //
        // INotificationService is the in-app notification producer other
        // modules (Auth welcome, Goals celebration, AcademicPlanning
        // reminders) inject to enqueue user-scoped notifications. The
        // NotificationsController reads back via ApplicationDbContext
        // directly, mirroring the other modules' read paths.
        //
        // TryAdd so this is idempotent: the consolidated host already
        // registers the same mapping in
        // Aptiverse.Api.Data.InfrastructureRegistrations, and registering
        // the module twice must not produce a duplicate/last-wins surprise.
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.TryAddScoped<INotificationService, NotificationService>();
            return services;
        }
    }
}
