using Aptiverse.Practice.Application.Practice.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.Practice.Application
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IPracticeService, PracticeService>();

            // The Anthropic side of practice generation. Scoped because it
            // writes through ApplicationDbContext; resolved per job by
            // PracticeGenerationWorker (registered as a hosted service in
            // InfrastructureRegistrations, alongside the other workers).
            services.AddScoped<IPracticeTestGenerator, PracticeTestGenerator>();
            return services;
        }
    }
}
