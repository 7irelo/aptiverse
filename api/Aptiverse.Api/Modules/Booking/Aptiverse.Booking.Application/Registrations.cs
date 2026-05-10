using Aptiverse.Booking.Application.TutorAvailabilities.Services;
using Aptiverse.Booking.Application.TutorStudents.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.Booking.Application
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<ITutorAvailabilityService, TutorAvailabilityService>();
            services.AddScoped<ITutorStudentService, TutorStudentService>();

            return services;
        }
    }
}