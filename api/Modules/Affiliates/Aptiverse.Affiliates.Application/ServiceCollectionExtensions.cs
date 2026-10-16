using Aptiverse.Affiliates.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.Affiliates.Application
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IAffiliateService, AffiliateService>();
            services.AddScoped<IAffiliateLedger, AffiliateLedger>();

            // Hold release + referral-code backfill. Registered exactly once
            // here: AddHostedService is not idempotent.
            services.AddHostedService<AffiliateMaintenanceService>();

            return services;
        }
    }
}
