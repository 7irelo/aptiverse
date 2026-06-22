using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.AcademicPlanning.Application
{
    public static class ServiceCollectionExtensions
    {
        // Pre-modulith service scaffold (SubjectService, AssessmentService,
        // StudentSubjectService, etc.) was removed as part of the clean-slate
        // rewrite. AcademicPlanningController now talks to ApplicationDbContext
        // directly — see Controllers/AcademicPlanningController.cs.
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
            => services;
    }
}
