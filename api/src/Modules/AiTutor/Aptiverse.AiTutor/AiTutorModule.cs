using Aptiverse.AiTutor.AiService;
using Aptiverse.AiTutor.Contracts;
using Aptiverse.AiTutor.Features.CreateConversation;
using Aptiverse.AiTutor.Features.DeleteConversation;
using Aptiverse.AiTutor.Features.EraseUserData;
using Aptiverse.AiTutor.Features.GetConversation;
using Aptiverse.AiTutor.Features.ListConversations;
using Aptiverse.AiTutor.Features.SendMessage;
using Aptiverse.AiTutor.Persistence;
using Aptiverse.SharedKernel.Persistence;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Polly;
using Wolverine;

namespace Aptiverse.AiTutor;

/// <summary>
/// The only public surface of the AiTutor module besides its Contracts project. It is the API's edge for the
/// internal ai service: it owns conversations, enforces per-user limits and relays tutor answers as SSE.
/// </summary>
public static class AiTutorModule
{
    public const string Schema = "ai";

    private static readonly TimeSpan ConnectTimeout = TimeSpan.FromSeconds(3);

    public static IServiceCollection AddAiTutorModule(this IServiceCollection services, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        services.AddOptions<AiServiceOptions>()
            .Bind(configuration.GetSection(AiServiceOptions.SectionName))
            .ValidateDataAnnotations()
            .Validate(AiServiceOptions.HasValidBaseUrl, "AiService:BaseUrl must be an absolute http or https URL without credentials, query or fragment.")
            .ValidateOnStart();

        services.AddModuleDbContext<AiTutorDbContext>(Schema);
        services.AddValidatorsFromAssemblyContaining<CreateConversationValidator>(includeInternalTypes: true);

        services.AddScoped<CreateConversationHandler>();
        services.AddScoped<ListConversationsHandler>();
        services.AddScoped<GetConversationHandler>();
        services.AddScoped<DeleteConversationHandler>();
        services.AddScoped<SendMessageHandler>();
        services.AddScoped<UserDataEraser>();

        // Practice generates and grades through this module's ai service edge.
        services.AddScoped<PracticeAiGateway>();
        services.AddScoped<IQuestionGenerator>(sp => sp.GetRequiredService<PracticeAiGateway>());
        services.AddScoped<IGrader>(sp => sp.GetRequiredService<PracticeAiGateway>());

        services.AddHttpClient<AiServiceClient>(AiServiceClient.HttpClientName, (sp, client) =>
            {
                var options = sp.GetRequiredService<IOptions<AiServiceOptions>>().Value;
                client.BaseAddress = WithTrailingSlash(options.BaseUrl);

                // The resilience timeout bounds sending; the client bounds the whole streamed turn.
                client.Timeout = Timeout.InfiniteTimeSpan;
            })
            .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
            {
                ConnectTimeout = ConnectTimeout,
                PooledConnectionLifetime = TimeSpan.FromMinutes(5),

                // A redirect would carry the service token somewhere else.
                AllowAutoRedirect = false,
            })
            .AddResilienceHandler("ai-service", (pipeline, context) =>
            {
                // No retries: a tutor turn is not idempotent, and failed erasures are retried by Wolverine.
                var options = context.ServiceProvider.GetRequiredService<IOptions<AiServiceOptions>>().Value;
                pipeline.AddTimeout(TimeSpan.FromSeconds(options.TimeoutSeconds));
            });

        services.AddOptions<RateLimiterOptions>()
            .Configure<IOptions<AiServiceOptions>>((limiter, ai) => AiRateLimiting.AddPolicies(limiter, ai.Value));

        services.ConfigureWolverine(opts => opts.Discovery.IncludeType(typeof(AccountDeletionRequestedHandler)));

        return services;
    }

    public static IEndpointRouteBuilder MapAiTutorEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/ai").WithTags("AiTutor");

        CreateConversationEndpoint.Map(group);
        ListConversationsEndpoint.Map(group);
        GetConversationEndpoint.Map(group);
        DeleteConversationEndpoint.Map(group);
        SendMessageEndpoint.Map(group);

        return endpoints;
    }

    private static Uri WithTrailingSlash(Uri baseUrl) =>
        baseUrl.AbsoluteUri.EndsWith('/') ? baseUrl : new Uri(baseUrl.AbsoluteUri + "/");
}
