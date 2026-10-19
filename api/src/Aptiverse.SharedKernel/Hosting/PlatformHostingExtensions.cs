using System.Reflection;
using Aptiverse.SharedKernel.Persistence;
using Aptiverse.SharedKernel.Time;
using JasperFx;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using OpenTelemetry;
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Wolverine;
using Wolverine.EntityFrameworkCore;
using Wolverine.Postgresql;

namespace Aptiverse.SharedKernel.Hosting;

/// <summary>
/// Composition shared by the API host and the worker: options, clock, persistence plumbing,
/// OpenTelemetry, Sentry, health checks and Wolverine with the Postgres outbox.
/// </summary>
public static class PlatformHostingExtensions
{
    public const string ReadyTag = "ready";

    /// <summary>True while dotnet-getdocument loads the app during build to write openapi/v1.json.</summary>
    public static bool IsBuildTimeDocumentGeneration =>
        Assembly.GetEntryAssembly()?.GetName().Name == "GetDocument.Insider";

    public static WebApplicationBuilder AddPlatform(this WebApplicationBuilder builder, string serviceName)
    {
        ArgumentNullException.ThrowIfNull(builder);

        var services = builder.Services;
        var configuration = builder.Configuration;

        if (IsBuildTimeDocumentGeneration && string.IsNullOrWhiteSpace(configuration.GetConnectionString("Aptiverse")))
        {
            // The document generator boots the app without a database. Nothing connects in this mode.
            configuration["ConnectionStrings:Aptiverse"] = "Host=localhost;Database=openapi-generation";
        }
        else if (string.IsNullOrWhiteSpace(configuration.GetConnectionString("Aptiverse"))
            && DatabaseOptions.FromParts(configuration.GetSection(DatabaseOptions.PartsSectionName)) is { } composed)
        {
            configuration["ConnectionStrings:Aptiverse"] = composed;
        }

        services.AddOptions<DatabaseOptions>()
            .Bind(configuration.GetSection(DatabaseOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();
        services.AddOptions<MessagingOptions>().Bind(configuration.GetSection(MessagingOptions.SectionName));
        services.AddOptions<TelemetryOptions>().Bind(configuration.GetSection(TelemetryOptions.SectionName));

        services.AddSingleton(TimeProvider.System);
        services.AddSingleton<IClock, SystemClock>();
        services.AddSingleton<AuditableEntityInterceptor>();

        services.AddHealthChecks().AddCheck<PostgresHealthCheck>("postgres", tags: [ReadyTag]);

        builder.AddTelemetry(serviceName);
        builder.AddSentry();
        builder.AddMessaging(serviceName);

        return builder;
    }

    public static IEndpointRouteBuilder MapPlatformHealthChecks(this IEndpointRouteBuilder endpoints)
    {
        ArgumentNullException.ThrowIfNull(endpoints);

        endpoints.MapHealthChecks("/health/live", new HealthCheckOptions { Predicate = _ => false })
            .AllowAnonymous()
            .DisableRateLimiting();
        endpoints.MapHealthChecks("/health/ready", new HealthCheckOptions { Predicate = c => c.Tags.Contains(ReadyTag) })
            .AllowAnonymous()
            .DisableRateLimiting();

        return endpoints;
    }

    private static void AddTelemetry(this WebApplicationBuilder builder, string serviceName)
    {
        var telemetry = builder.Configuration.GetSection(TelemetryOptions.SectionName).Get<TelemetryOptions>() ?? new();
        var otlpConfigured = !string.IsNullOrWhiteSpace(builder.Configuration["OTEL_EXPORTER_OTLP_ENDPOINT"]);

        var otel = builder.Services.AddOpenTelemetry()
            .ConfigureResource(resource => resource
                .AddService(serviceName, serviceVersion: typeof(PlatformHostingExtensions).Assembly.GetName().Version?.ToString())
                .AddAttributes([new("deployment.environment.name", builder.Environment.EnvironmentName)]))
            .WithTracing(tracing =>
            {
                tracing
                    .AddAspNetCoreInstrumentation(o => o.Filter = ctx => !ctx.Request.Path.StartsWithSegments("/health"))
                    .AddHttpClientInstrumentation()
                    .AddNpgsql()
                    .AddSource("Wolverine");
                if (telemetry.ConsoleExporter)
                {
                    tracing.AddConsoleExporter();
                }
            })
            .WithMetrics(metrics => metrics
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddRuntimeInstrumentation()
                .AddMeter("Wolverine")
                .AddMeter("Aptiverse.*"))
            .WithLogging();

        if (otlpConfigured)
        {
            otel.UseOtlpExporter();
        }
    }

    private static void AddSentry(this WebApplicationBuilder builder)
    {
        var dsn = builder.Configuration["Sentry:Dsn"];
        if (string.IsNullOrWhiteSpace(dsn))
        {
            return;
        }

        builder.WebHost.UseSentry(options =>
        {
            options.Dsn = dsn;
            options.Environment = builder.Environment.EnvironmentName;
            options.SendDefaultPii = false;
        });
    }

    private static void AddMessaging(this WebApplicationBuilder builder, string serviceName)
    {
        var messaging = builder.Configuration.GetSection(MessagingOptions.SectionName).Get<MessagingOptions>() ?? new();
        var connectionString = builder.Configuration.GetConnectionString("Aptiverse");

        builder.UseWolverine(opts =>
        {
            opts.ServiceName = serviceName;

            // Slice handlers are named XHandler too, so conventional discovery would misread them as
            // message handlers. Modules register their Wolverine handlers explicitly with IncludeType.
            opts.Discovery.DisableConventionalDiscovery();

            if (IsBuildTimeDocumentGeneration)
            {
                opts.Durability.Mode = DurabilityMode.MediatorOnly;
                return;
            }

            // A missing connection string fails the boot through DatabaseOptions.ValidateOnStart instead.
            if (!string.IsNullOrWhiteSpace(connectionString))
            {
                opts.PersistMessagesWithPostgresql(DatabaseOptions.Normalize(connectionString), messaging.Schema);
            }

            opts.UseEntityFrameworkCoreTransactions();
            opts.Policies.AutoApplyTransactions();
            opts.Policies.UseDurableLocalQueues();
            opts.Durability.Mode = messaging.SoloMode ? DurabilityMode.Solo : DurabilityMode.Balanced;
            opts.AutoBuildMessageStorageOnStartup = messaging.AutoBuildStorage ? AutoCreate.CreateOrUpdate : AutoCreate.None;
        });
    }
}
