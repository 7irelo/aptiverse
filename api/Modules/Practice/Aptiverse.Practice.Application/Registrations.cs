using Aptiverse.Practice.Application.Practice.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.Practice.Application
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IPracticeService, PracticeService>();
            return services;
        }
    }
}
