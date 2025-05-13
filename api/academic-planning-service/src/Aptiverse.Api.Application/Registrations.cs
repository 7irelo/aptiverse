using Aptiverse.AcademicPlanning.Application.AssessmentBreakdowns.Services;
using Aptiverse.AcademicPlanning.Application.Assessments.Services;
using Aptiverse.AcademicPlanning.Application.StudentSubjects.Services;
using Aptiverse.AcademicPlanning.Application.StudySessions.Services;
using Aptiverse.AcademicPlanning.Application.Subjects.Services;
using Aptiverse.AcademicPlanning.Application.Topics.Services;
using Aptiverse.AcademicPlanning.Application.WeeklyStudyHours.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.AcademicPlanning.Application
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IAssessmentService, AssessmentService>();
            services.AddScoped<IAssessmentBreakdownService, AssessmentBreakdownService>();
            services.AddScoped<IStudentSubjectService, StudentSubjectService>();
            services.AddScoped<IStudySessionService, StudySessionService>();
            services.AddScoped<ISubjectService, SubjectService>();
            services.AddScoped<ITopicService, TopicService>();
            services.AddScoped<IWeeklyStudyHourService, WeeklyStudyHourService>();
            return services;
        }
    }
}