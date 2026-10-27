using Aptiverse.Academics.Contracts;
using Aptiverse.Academics.Features.Common;
using Aptiverse.Academics.Features.CreateAssessment;
using Aptiverse.Academics.Features.CreateTertiaryCourse;
using Aptiverse.Academics.Features.DeleteMyAssessment;
using Aptiverse.Academics.Features.EnrolInCapsSubjects;
using Aptiverse.Academics.Features.GetCatalog;
using Aptiverse.Academics.Features.GetMyAssessment;
using Aptiverse.Academics.Features.GetMyUnit;
using Aptiverse.Academics.Features.ListMyAssessments;
using Aptiverse.Academics.Features.ListMyUnits;
using Aptiverse.Academics.Features.ListUnitTopics;
using Aptiverse.Academics.Features.RecordAssessmentMark;
using Aptiverse.Academics.Features.SearchCourses;
using Aptiverse.Academics.Features.SearchInstitutions;
using Aptiverse.Academics.Features.TransitionAssessment;
using Aptiverse.Academics.Features.UnenrolFromUnit;
using Aptiverse.Academics.Features.UpdateMyAssessment;
using Aptiverse.Academics.Features.UpdateMyUnit;
using Aptiverse.Academics.Lookups;
using Aptiverse.Academics.Persistence;
using Aptiverse.Academics.Seeding;
using Aptiverse.SharedKernel.Persistence;
using Aptiverse.SharedKernel.Seeding;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Aptiverse.Academics;

/// <summary>
/// The only public surface of the Academics module besides its Contracts project. It owns the CAPS catalog,
/// institutions, study units (CAPS subjects and tertiary courses behind one id), the topic registry and assessments.
/// </summary>
public static class AcademicsModule
{
    public const string Schema = "academics";

    public static IServiceCollection AddAcademicsModule(this IServiceCollection services, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        services.AddOptions<AcademicsOptions>()
            .Bind(configuration.GetSection(AcademicsOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddModuleDbContext<AcademicsDbContext>(Schema);
        services.AddHybridCache();
        services.AddValidatorsFromAssemblyContaining<GetCatalogValidator>(includeInternalTypes: true);

        services.AddScoped<ReferenceCache>();
        services.AddScoped<StudentResolver>();
        services.AddScoped<UnitStore>();
        services.AddScoped<UnitQueries>();
        services.AddScoped<AssessmentQueries>();

        services.AddScoped<GetCatalogHandler>();
        services.AddScoped<SearchInstitutionsHandler>();
        services.AddScoped<SearchCoursesHandler>();
        services.AddScoped<EnrolInCapsSubjectsHandler>();
        services.AddScoped<CreateTertiaryCourseHandler>();
        services.AddScoped<ListMyUnitsHandler>();
        services.AddScoped<GetMyUnitHandler>();
        services.AddScoped<UpdateMyUnitHandler>();
        services.AddScoped<UnenrolFromUnitHandler>();
        services.AddScoped<ListUnitTopicsHandler>();
        services.AddScoped<CreateAssessmentHandler>();
        services.AddScoped<ListMyAssessmentsHandler>();
        services.AddScoped<GetMyAssessmentHandler>();
        services.AddScoped<UpdateMyAssessmentHandler>();
        services.AddScoped<TransitionAssessmentHandler>();
        services.AddScoped<RecordAssessmentMarkHandler>();
        services.AddScoped<DeleteMyAssessmentHandler>();

        services.AddScoped<IStudyUnitLookup, StudyUnitLookup>();
        services.AddScoped<ITopicRegistry, TopicRegistry>();
        services.AddScoped<IAssessmentLookup, AssessmentLookup>();

        services.AddScoped<IDataSeeder, AcademicsReferenceSeeder>();

        services.AddOptions<RateLimiterOptions>()
            .Configure<IOptions<AcademicsOptions>>((limiter, academics) => AcademicsRateLimiting.AddPolicies(limiter, academics.Value));

        return services;
    }

    public static IEndpointRouteBuilder MapAcademicsEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/academics").WithTags("Academics");

        GetCatalogEndpoint.Map(group);
        SearchInstitutionsEndpoint.Map(group);
        SearchCoursesEndpoint.Map(group);

        EnrolInCapsSubjectsEndpoint.Map(group);
        CreateTertiaryCourseEndpoint.Map(group);
        ListMyUnitsEndpoint.Map(group);
        GetMyUnitEndpoint.Map(group);
        UpdateMyUnitEndpoint.Map(group);
        UnenrolFromUnitEndpoint.Map(group);
        ListUnitTopicsEndpoint.Map(group);

        CreateAssessmentEndpoint.Map(group);
        ListMyAssessmentsEndpoint.Map(group);
        GetMyAssessmentEndpoint.Map(group);
        UpdateMyAssessmentEndpoint.Map(group);
        TransitionAssessmentEndpoint.Map(group);
        RecordAssessmentMarkEndpoint.Map(group);
        DeleteMyAssessmentEndpoint.Map(group);

        return endpoints;
    }
}
