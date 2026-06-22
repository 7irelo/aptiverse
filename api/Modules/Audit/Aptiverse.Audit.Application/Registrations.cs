using Aptiverse.Audit.Application.AuditLogs.Services;
using Aptiverse.Audit.Application.AuditActions.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.Audit.Application
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IAuditLogService, AuditLogService>();
            services.AddScoped<IAuditActionService, AuditActionService>();

            return services;
        }
    }
}
