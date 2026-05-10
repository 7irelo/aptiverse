using Aptiverse.Support.Application.SupportTickets.Services;
using Aptiverse.Support.Application.SupportMessages.Services;
using Aptiverse.Support.Application.SupportCategories.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.Support.Application
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<ISupportTicketService, SupportTicketService>();
            services.AddScoped<ISupportMessageService, SupportMessageService>();
            services.AddScoped<ISupportCategoryService, SupportCategoryService>();

            return services;
        }
    }
}
