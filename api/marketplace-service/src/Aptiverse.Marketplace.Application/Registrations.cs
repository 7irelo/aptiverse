using Aptiverse.Marketplace.Application.CourseEnrollments.Services;
using Aptiverse.Marketplace.Application.CourseModules.Services;
using Aptiverse.Marketplace.Application.Courses.Services;
using Aptiverse.Marketplace.Application.ModuleLessons.Services;
using Aptiverse.Marketplace.Application.ResourceDownloads.Services;
using Aptiverse.Marketplace.Application.Resources.Services;
using Aptiverse.Marketplace.Application.Tutors.Services;
using Aptiverse.Marketplace.Application.TutorSubjects.Service;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.Marketplace.Application
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<ICourseService, CourseService>();
            services.AddScoped<ICourseEnrollmentService, CourseEnrollmentService>();
            services.AddScoped<ICourseModuleService, CourseModuleService>();
            services.AddScoped<ITutorSubjectService, TutorSubjectService>();
            services.AddScoped<ITutorService, TutorService>();
            services.AddScoped<IModuleLessonService, ModuleLessonService>();
            services.AddScoped<IResourceService, ResourceService>();
            services.AddScoped<IResourceDownloadService, ResourceDownloadService>();

            return services;
        }
    }
}