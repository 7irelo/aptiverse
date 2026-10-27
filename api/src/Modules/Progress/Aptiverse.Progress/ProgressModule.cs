using Aptiverse.Progress.Contracts;
using Aptiverse.Progress.Erasure;
using Aptiverse.Progress.Evidence;
using Aptiverse.Progress.Features.AbandonGoal;
using Aptiverse.Progress.Features.AddMilestone;
using Aptiverse.Progress.Features.Common;
using Aptiverse.Progress.Features.CreateGoal;
using Aptiverse.Progress.Features.DeleteMilestone;
using Aptiverse.Progress.Features.GetAnalytics;
using Aptiverse.Progress.Features.GetDashboard;
using Aptiverse.Progress.Features.GetGoal;
using Aptiverse.Progress.Features.GetGoalBaseline;
using Aptiverse.Progress.Features.GetJourney;
using Aptiverse.Progress.Features.GetMastery;
using Aptiverse.Progress.Features.ListGoals;
using Aptiverse.Progress.Features.ReorderGoals;
using Aptiverse.Progress.Features.ReorderMilestones;
using Aptiverse.Progress.Features.UpdateGoal;
using Aptiverse.Progress.Features.UpdateMilestone;
using Aptiverse.Progress.Goals;
using Aptiverse.Progress.Lookups;
using Aptiverse.Progress.Messaging;
using Aptiverse.Progress.Persistence;
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

namespace Aptiverse.Progress;

/// <summary>
/// The only public surface of the Progress module besides its Contracts project. It owns topic mastery (the
/// explainable recency-weighted aggregate), goals verifiable from real work, and the dashboard, analytics and journey
/// read models. Evidence arrives only through Practice and Academics events; no endpoint accepts a progress value.
/// </summary>
public static class ProgressModule
{
    public const string Schema = "progress";

    public static IServiceCollection AddProgressModule(this IServiceCollection services, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        services.AddOptions<ProgressOptions>()
            .Bind(configuration.GetSection(ProgressOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddModuleDbContext<ProgressDbContext>(Schema);
        services.AddValidatorsFromAssemblyContaining<CreateGoalValidator>(includeInternalTypes: true);

        services.AddScoped<MasteryProjector>();
        services.AddScoped<GoalMeasurer>();
        services.AddScoped<GoalProgress>();
        services.AddScoped<GoalExpirer>();
        services.AddScoped<EvidenceIngestor>();
        services.AddScoped<MilestoneWrites>();
        services.AddScoped<ProgressUserDataEraser>();
        services.AddScoped<IMasterySnapshot, MasterySnapshot>();

        services.AddScoped<GetGoalBaselineHandler>();
        services.AddScoped<CreateGoalHandler>();
        services.AddScoped<ListGoalsHandler>();
        services.AddScoped<GetGoalHandler>();
        services.AddScoped<UpdateGoalHandler>();
        services.AddScoped<AbandonGoalHandler>();
        services.AddScoped<AddMilestoneHandler>();
        services.AddScoped<UpdateMilestoneHandler>();
        services.AddScoped<DeleteMilestoneHandler>();
        services.AddScoped<ReorderMilestonesHandler>();
        services.AddScoped<ReorderGoalsHandler>();
        services.AddScoped<GetMasteryHandler>();
        services.AddScoped<GetDashboardHandler>();
        services.AddScoped<GetAnalyticsHandler>();
        services.AddScoped<GetJourneyHandler>();

        services.AddOptions<RateLimiterOptions>()
            .Configure<IOptions<ProgressOptions>>((limiter, progress) => ProgressRateLimiting.AddPolicies(limiter, progress.Value));

        services.ConfigureWolverine(opts =>
        {
            opts.Discovery.IncludeType(typeof(ProgressPracticeAttemptGradedHandler));
            opts.Discovery.IncludeType(typeof(ProgressAssessmentGradedHandler));
            opts.Discovery.IncludeType(typeof(ProgressAssessmentSubmittedHandler));
            opts.Discovery.IncludeType(typeof(ProgressAssessmentMarkRemovedHandler));
            opts.Discovery.IncludeType(typeof(ProgressAssessmentDeletedHandler));
            opts.Discovery.IncludeType(typeof(ExpireProgressGoalHandler));
            opts.Discovery.IncludeType(typeof(ProgressAccountDeletionRequestedHandler));
        });

        return services;
    }

    public static IEndpointRouteBuilder MapProgressEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/progress").WithTags("Progress");

        GetGoalBaselineEndpoint.Map(group);
        ReorderGoalsEndpoint.Map(group);
        CreateGoalEndpoint.Map(group);
        ListGoalsEndpoint.Map(group);
        GetGoalEndpoint.Map(group);
        UpdateGoalEndpoint.Map(group);
        AbandonGoalEndpoint.Map(group);
        AddMilestoneEndpoint.Map(group);
        ReorderMilestonesEndpoint.Map(group);
        UpdateMilestoneEndpoint.Map(group);
        DeleteMilestoneEndpoint.Map(group);

        GetMasteryEndpoint.Map(group);
        GetDashboardEndpoint.Map(group);
        GetAnalyticsEndpoint.Map(group);
        GetJourneyEndpoint.Map(group);

        return endpoints;
    }
}
