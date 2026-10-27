using Aptiverse.Practice.Agents;
using Aptiverse.Practice.Contracts;
using Aptiverse.Practice.Erasure;
using Aptiverse.Practice.Features.ArchiveTest;
using Aptiverse.Practice.Features.Common;
using Aptiverse.Practice.Features.GenerateTest;
using Aptiverse.Practice.Features.GetActiveAttempt;
using Aptiverse.Practice.Features.GetActiveGeneration;
using Aptiverse.Practice.Features.GetAttempt;
using Aptiverse.Practice.Features.GetResults;
using Aptiverse.Practice.Features.GetTest;
using Aptiverse.Practice.Features.GetTestStatus;
using Aptiverse.Practice.Features.ListTests;
using Aptiverse.Practice.Features.PauseAttempt;
using Aptiverse.Practice.Features.ReportFocusLoss;
using Aptiverse.Practice.Features.ResumeAttempt;
using Aptiverse.Practice.Features.SaveAnswer;
using Aptiverse.Practice.Features.StartAttempt;
using Aptiverse.Practice.Features.SubmitAttempt;
using Aptiverse.Practice.Generation;
using Aptiverse.Practice.Grading;
using Aptiverse.Practice.Lookups;
using Aptiverse.Practice.Messaging;
using Aptiverse.Practice.Persistence;
using Aptiverse.SharedKernel.Persistence;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Wolverine;

namespace Aptiverse.Practice;

/// <summary>
/// The only public surface of the Practice module besides its Contracts project. It owns practice tests generated per
/// assessment, their one attempt with server-authoritative timing, marking, and the "is this student mid-test" answer
/// AiTutor uses to block the tutor during an attempt.
/// </summary>
public static class PracticeModule
{
    public const string Schema = "practice";

    public static IServiceCollection AddPracticeModule(this IServiceCollection services, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        services.AddOptions<PracticeOptions>()
            .Bind(configuration.GetSection(PracticeOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddModuleDbContext<PracticeDbContext>(Schema);
        services.AddValidatorsFromAssemblyContaining<GeneratePracticeTestValidator>(includeInternalTypes: true);

        services.AddScoped<AttemptViews>();

        services.AddScoped<GeneratePracticeTestHandler>();
        services.AddScoped<GetPracticeTestStatusHandler>();
        services.AddScoped<GetActiveGenerationHandler>();
        services.AddScoped<ListPracticeTestsHandler>();
        services.AddScoped<GetPracticeTestHandler>();
        services.AddScoped<ArchivePracticeTestHandler>();
        services.AddScoped<StartPracticeAttemptHandler>();
        services.AddScoped<GetPracticeAttemptHandler>();
        services.AddScoped<GetActivePracticeAttemptHandler>();
        services.AddScoped<SaveAttemptAnswerHandler>();
        services.AddScoped<ReportFocusLossHandler>();
        services.AddScoped<PausePracticeAttemptHandler>();
        services.AddScoped<ResumePracticeAttemptHandler>();
        services.AddScoped<GetPracticeAttemptResultsHandler>();

        services.AddScoped<AttemptSubmitter>();
        services.AddScoped<SubmitOnce>();
        services.AddScoped<GradeFinalizer>();
        services.AddScoped<WrittenGrader>();
        services.AddScoped<AutoSubmitter>();

        services.AddScoped<IGenerationWatcher, PollingGenerationWatcher>();
        services.AddScoped<GenerationCompletion>();
        services.AddScoped<GenerationRunner>();
        services.AddScoped<GenerationPoller>();

        services.AddScoped<PracticeUserDataEraser>();
        services.AddScoped<IActiveAttemptLookup, ActiveAttemptLookup>();
        services.AddScoped<IPracticeMistakeLookup, PracticeMistakeLookup>();
        services.AddScoped<IPracticeQuizCommands, PracticeQuizCommands>();

        services.AddOptions<RateLimiterOptions>()
            .Configure<IOptions<PracticeOptions>>((limiter, practice) => PracticeRateLimiting.AddPolicies(limiter, practice.Value));

        services.ConfigureWolverine(opts =>
        {
            opts.Discovery.IncludeType(typeof(StartPracticeGenerationHandler));
            opts.Discovery.IncludeType(typeof(PollPracticeGenerationHandler));
            opts.Discovery.IncludeType(typeof(AutoSubmitPracticeAttemptHandler));
            opts.Discovery.IncludeType(typeof(GradePracticeAttemptHandler));
            opts.Discovery.IncludeType(typeof(AccountDeletionRequestedHandler));
        });

        return services;
    }

    public static IEndpointRouteBuilder MapPracticeEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/practice").WithTags("Practice");

        GeneratePracticeTestEndpoint.Map(group);
        GetPracticeTestStatusEndpoint.Map(group);
        GetActiveGenerationEndpoint.Map(group);
        ListPracticeTestsEndpoint.Map(group);
        GetPracticeTestEndpoint.Map(group);
        ArchivePracticeTestEndpoint.Map(group);

        StartPracticeAttemptEndpoint.Map(group);
        GetActivePracticeAttemptEndpoint.Map(group);
        GetPracticeAttemptEndpoint.Map(group);
        SaveAttemptAnswerEndpoint.Map(group);
        ReportFocusLossEndpoint.Map(group);
        PausePracticeAttemptEndpoint.Map(group);
        ResumePracticeAttemptEndpoint.Map(group);
        SubmitPracticeAttemptEndpoint.Map(group);
        GetPracticeAttemptResultsEndpoint.Map(group);

        return endpoints;
    }
}
