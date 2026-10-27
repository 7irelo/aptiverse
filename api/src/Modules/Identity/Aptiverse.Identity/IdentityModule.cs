using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Features.AcceptConsents;
using Aptiverse.Identity.Features.CancelAccountDeletion;
using Aptiverse.Identity.Features.ChangeMyPassword;
using Aptiverse.Identity.Features.Common;
using Aptiverse.Identity.Features.CompleteOnboarding;
using Aptiverse.Identity.Features.ForgotPassword;
using Aptiverse.Identity.Features.GetJwks;
using Aptiverse.Identity.Features.GetLegalVersions;
using Aptiverse.Identity.Features.GetMe;
using Aptiverse.Identity.Features.GoogleSignIn;
using Aptiverse.Identity.Features.ListMyConsents;
using Aptiverse.Identity.Features.ListMySessions;
using Aptiverse.Identity.Features.Login;
using Aptiverse.Identity.Features.Logout;
using Aptiverse.Identity.Features.RefreshTokens;
using Aptiverse.Identity.Features.Register;
using Aptiverse.Identity.Features.RequestAccountDeletion;
using Aptiverse.Identity.Features.ResendVerification;
using Aptiverse.Identity.Features.ResetPassword;
using Aptiverse.Identity.Features.RevokeMySession;
using Aptiverse.Identity.Features.RevokeOtherSessions;
using Aptiverse.Identity.Features.SaveOnboardingDetails;
using Aptiverse.Identity.Features.SetEducationLevel;
using Aptiverse.Identity.Features.UpdateMyProfile;
using Aptiverse.Identity.Features.VerifyEmail;
using Aptiverse.Identity.Messaging;
using Aptiverse.Identity.Persistence;
using Aptiverse.Identity.Profiles;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Persistence;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Wolverine;

namespace Aptiverse.Identity;

/// <summary>
/// The only public surface of the Identity module besides its Contracts project. Besides accounts and sessions
/// it owns authentication (ES256 bearer tokens) and authorization (one policy per permission) for the whole API.
/// </summary>
public static class IdentityModule
{
    public const string Schema = "identity";

    private const long MaxBodyBytes = 8 * 1024;

    public static IServiceCollection AddIdentityModule(this IServiceCollection services, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        services.AddOptions<AuthOptions>()
            .Bind(configuration.GetSection(AuthOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();
        services.AddSingleton<IValidateOptions<AuthOptions>, AuthOptionsValidator>();
        services.AddOptions<LegalOptions>()
            .Bind(configuration.GetSection(LegalOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddModuleDbContext<IdentityDbContext>(Schema);
        services.AddValidatorsFromAssemblyContaining<IdentityDbContext>(includeInternalTypes: true);
        services.AddHybridCache();

        services.AddIdentityCore<User>(options =>
            {
                PasswordPolicy.Configure(options.Password);
                options.User.RequireUniqueEmail = true;
            })
            .AddUserStore<UserStore>();
        services.AddOptions<IdentityOptions>().Configure<IOptions<AuthOptions>>((identity, auth) =>
        {
            identity.Lockout.AllowedForNewUsers = true;
            identity.Lockout.MaxFailedAccessAttempts = auth.Value.MaxFailedAccessAttempts;
            identity.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(auth.Value.LockoutMinutes);
        });

        services.AddSingleton<SigningKeys>();
        services.AddSingleton<AccessTokenIssuer>();
        services.AddSingleton<IServiceTokenIssuer, ServiceTokenIssuer>();
        services.AddSingleton<EmailRateLimiter>();
        services.AddSingleton<IGoogleTokenValidator, GoogleTokenValidator>();
        services.AddScoped<SessionRevocationCache>();
        services.AddScoped<SessionService>();
        services.AddScoped<OneTimeTokens>();
        services.AddScoped<IStudentProfileLookup, StudentProfileLookup>();
        services.AddScoped<IUserDirectory, UserDirectory>();

        services.AddScoped<EmailAddresses>();
        services.AddScoped<PasswordVerifier>();
        services.AddScoped<AuthTokensFactory>();
        services.AddScoped<ProfileStore>();

        services.AddScoped<RegisterHandler>();
        services.AddScoped<LoginHandler>();
        services.AddScoped<RefreshTokensHandler>();
        services.AddScoped<LogoutHandler>();
        services.AddScoped<VerifyEmailHandler>();
        services.AddScoped<ResendVerificationHandler>();
        services.AddScoped<ForgotPasswordHandler>();
        services.AddScoped<ResetPasswordHandler>();
        services.AddScoped<GoogleSignInHandler>();
        services.AddScoped<GetMeHandler>();
        services.AddScoped<ListMySessionsHandler>();
        services.AddScoped<RevokeMySessionHandler>();
        services.AddScoped<RevokeOtherSessionsHandler>();
        services.AddScoped<SetEducationLevelHandler>();
        services.AddScoped<SaveOnboardingDetailsHandler>();
        services.AddScoped<CompleteOnboardingHandler>();
        services.AddScoped<UpdateMyProfileHandler>();
        services.AddScoped<ChangeMyPasswordHandler>();
        services.AddScoped<RequestAccountDeletionHandler>();
        services.AddScoped<CancelAccountDeletionHandler>();
        services.AddScoped<ListMyConsentsHandler>();
        services.AddScoped<AcceptConsentsHandler>();

        services.AddScoped<PasswordResetIssuer>();
        services.AddScoped<EmailVerificationIssuer>();
        services.AddScoped<ScheduledErasureProcessor>();

        services.ConfigureWolverine(opts =>
        {
            opts.Discovery.IncludeType(typeof(IssuePasswordResetHandler));
            opts.Discovery.IncludeType(typeof(IssueEmailVerificationHandler));
            opts.Discovery.IncludeType(typeof(ProcessScheduledErasureHandler));
        });

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer();
        services.ConfigureOptions<ConfigureJwtBearerOptions>();

        // Fail closed: an endpoint that forgets RequirePermission still needs a signed-in caller. Public routes
        // opt out with AllowAnonymous.
        var authorization = services.AddAuthorizationBuilder()
            .SetFallbackPolicy(new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build());
        foreach (var permission in Permissions.All)
        {
            authorization.AddPolicy(
                PermissionEndpointExtensions.PolicyName(permission),
                policy => policy.RequireAuthenticatedUser().AddRequirements(new PermissionRequirement(permission)));
        }

        services.AddSingleton<IAuthorizationHandler, PermissionAuthorizationHandler>();

        services.AddOptions<RateLimiterOptions>()
            .Configure<IOptions<AuthOptions>>((limiter, auth) => AuthRateLimiting.AddPolicies(limiter, auth.Value));

        return services;
    }

    public static IEndpointRouteBuilder MapIdentityEndpoints(this IEndpointRouteBuilder endpoints)
    {
        GetJwksEndpoint.Map(endpoints);
        GetLegalVersionsEndpoint.Map(endpoints);

        var auth = IdentityGroup(endpoints, "/auth");
        RegisterEndpoint.Map(auth);
        LoginEndpoint.Map(auth);
        RefreshTokensEndpoint.Map(auth);
        LogoutEndpoint.Map(auth);
        VerifyEmailEndpoint.Map(auth);
        ResendVerificationEndpoint.Map(auth);
        ForgotPasswordEndpoint.Map(auth);
        ResetPasswordEndpoint.Map(auth);
        GoogleSignInEndpoint.Map(auth);

        var me = IdentityGroup(endpoints, "/me");
        GetMeEndpoint.Map(me);
        ListMySessionsEndpoint.Map(me);
        RevokeMySessionEndpoint.Map(me);
        RevokeOtherSessionsEndpoint.Map(me);
        SetEducationLevelEndpoint.Map(me);
        SaveOnboardingDetailsEndpoint.Map(me);
        CompleteOnboardingEndpoint.Map(me);
        UpdateMyProfileEndpoint.Map(me);
        ChangeMyPasswordEndpoint.Map(me);
        RequestAccountDeletionEndpoint.Map(me);
        CancelAccountDeletionEndpoint.Map(me);
        ListMyConsentsEndpoint.Map(me);
        AcceptConsentsEndpoint.Map(me);

        return endpoints;
    }

    /// <summary>
    /// Identity bodies are small, so the limit is 8 KB (long password and token payloads never reach the hasher), and
    /// no response that may carry tokens or personal data is ever stored by a cache.
    /// </summary>
    private static RouteGroupBuilder IdentityGroup(IEndpointRouteBuilder endpoints, string prefix)
    {
        var group = endpoints.MapGroup(prefix).WithTags("Identity").WithMetadata(new RequestSizeLimitAttribute(MaxBodyBytes));
        group.AddEndpointFilter(async (context, next) =>
        {
            context.HttpContext.Response.Headers.CacheControl = "no-store";
            return await next(context);
        });
        return group;
    }
}
