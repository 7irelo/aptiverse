using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Features.GetJwks;
using Aptiverse.Identity.Persistence;
using Aptiverse.Identity.Profiles;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Persistence;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Aptiverse.Identity;

/// <summary>
/// The only public surface of the Identity module besides its Contracts project. Besides accounts and sessions
/// it owns authentication (ES256 bearer tokens) and authorization (one policy per permission) for the whole API.
/// </summary>
public static class IdentityModule
{
    public const string Schema = "identity";

    public static IServiceCollection AddIdentityModule(this IServiceCollection services, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        services.AddOptions<AuthOptions>()
            .Bind(configuration.GetSection(AuthOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();
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

        return endpoints;
    }
}
