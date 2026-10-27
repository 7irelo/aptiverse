using Amazon;
using Amazon.SimpleEmailV2;
using Aptiverse.Notifications.Delivery;
using Aptiverse.Notifications.Email;
using Aptiverse.Notifications.Messaging;
using Aptiverse.Notifications.Persistence;
using Aptiverse.Notifications.Templates;
using Aptiverse.SharedKernel.Hosting;
using Aptiverse.SharedKernel.Persistence;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Wolverine;
using Wolverine.ErrorHandling;

namespace Aptiverse.Notifications;

/// <summary>
/// The only public surface of the Notifications module besides its Contracts project. This first pass owns
/// transactional email: Identity and Family events in, rendered templates out through SES (Mailpit locally), with a delivery
/// log that makes every email idempotent. The in-app feed and preferences come later.
/// </summary>
public static class NotificationsModule
{
    public const string Schema = "notifications";

    // Backoff for transient provider failures (throttling, 5xx, network). With the first try this is
    // EmailOptions.MaxSendAttempts (6) calls; the dispatcher records the last one as failed instead of throwing.
    private static readonly TimeSpan[] RetryDelays =
    [
        TimeSpan.FromSeconds(5),
        TimeSpan.FromSeconds(30),
        TimeSpan.FromMinutes(2),
        TimeSpan.FromMinutes(10),
        TimeSpan.FromHours(1),
    ];

    public static IServiceCollection AddNotificationsModule(this IServiceCollection services, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        var email = services.AddOptions<EmailOptions>()
            .Bind(configuration.GetSection(EmailOptions.SectionName))
            .PostConfigure(options => options.WebAppUrl ??= configuration.GetValue<Uri?>("Auth:WebAppUrl"))
            .ValidateDataAnnotations();
        services.AddSingleton<IValidateOptions<EmailOptions>, EmailOptionsValidator>();

        // The build-time OpenAPI generator starts the app without the deployed SES settings and never sends mail.
        if (!PlatformHostingExtensions.IsBuildTimeDocumentGeneration)
        {
            email.ValidateOnStart();
        }

        services.AddModuleDbContext<NotificationsDbContext>(Schema);

        services.AddSingleton<EmailLinks>();
        services.AddSingleton<RecipientPrivacy>();
        services.AddSingleton<EmailTemplateRenderer>();
        services.AddHostedService<EmailTemplateWarmup>();

        services.AddSingleton<IAmazonSimpleEmailServiceV2>(sp =>
        {
            var email = sp.GetRequiredService<IOptions<EmailOptions>>().Value;
            return new AmazonSimpleEmailServiceV2Client(new AmazonSimpleEmailServiceV2Config
            {
                RegionEndpoint = RegionEndpoint.GetBySystemName(email.SesRegion),
                Timeout = TimeSpan.FromSeconds(5),
                MaxErrorRetry = 3,
            });
        });
        services.AddSingleton<SesEmailSender>();
        services.AddSingleton<SmtpEmailSender>();
        services.AddSingleton<IEmailSender>(sp => sp.GetRequiredService<IOptions<EmailOptions>>().Value.Sender switch
        {
            EmailSenderKind.Ses => sp.GetRequiredService<SesEmailSender>(),
            _ => sp.GetRequiredService<SmtpEmailSender>(),
        });

        services.AddScoped<EmailDispatcher>();
        services.AddScoped<IdentityEmails>();
        services.AddScoped<FamilyEmails>();

        services.ConfigureWolverine(opts =>
        {
            opts.Discovery.IncludeType(typeof(EmailVerificationRequestedEmailHandler));
            opts.Discovery.IncludeType(typeof(PasswordResetRequestedEmailHandler));
            opts.Discovery.IncludeType(typeof(PasswordChangedEmailHandler));
            opts.Discovery.IncludeType(typeof(AccountLockedOutEmailHandler));
            opts.Discovery.IncludeType(typeof(EmailVerifiedEmailHandler));
            opts.Discovery.IncludeType(typeof(SessionsRevokedEmailHandler));
            opts.Discovery.IncludeType(typeof(FamilyInviteSentEmailHandler));
            opts.Discovery.IncludeType(typeof(FamilyLinkCreatedEmailHandler));
            opts.Discovery.IncludeType(typeof(FamilyLinkRemovedEmailHandler));

            // Only this module throws this type, so the policy cannot change how other modules' failures are handled.
            opts.Policies.OnException<EmailDeliveryDeferredException>()
                .ScheduleRetry(RetryDelays)
                .Then.MoveToErrorQueue();
        });

        return services;
    }

    /// <summary>No HTTP surface yet; the feed, preferences and SES webhook slices will map here.</summary>
    public static IEndpointRouteBuilder MapNotificationsEndpoints(this IEndpointRouteBuilder endpoints)
    {
        ArgumentNullException.ThrowIfNull(endpoints);
        return endpoints;
    }
}

/// <summary>Builds the template renderer at startup, so a missing or broken template fails the boot, not a send.</summary>
internal sealed class EmailTemplateWarmup(EmailTemplateRenderer renderer) : IHostedService
{
    public Task StartAsync(CancellationToken cancellationToken)
    {
        GC.KeepAlive(renderer);
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
