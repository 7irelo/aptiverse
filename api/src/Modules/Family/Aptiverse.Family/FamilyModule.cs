using Aptiverse.Family.Contracts;
using Aptiverse.Family.Erasure;
using Aptiverse.Family.Features.AcceptInvite;
using Aptiverse.Family.Features.CancelInvite;
using Aptiverse.Family.Features.Common;
using Aptiverse.Family.Features.CreateLinkCode;
using Aptiverse.Family.Features.GetChildSummary;
using Aptiverse.Family.Features.GrantConsent;
using Aptiverse.Family.Features.ListChildren;
using Aptiverse.Family.Features.ListInvites;
using Aptiverse.Family.Features.ListParents;
using Aptiverse.Family.Features.RedeemLinkCode;
using Aptiverse.Family.Features.RemoveLink;
using Aptiverse.Family.Features.SendInvite;
using Aptiverse.Family.Features.UpdateSharing;
using Aptiverse.Family.Features.WithdrawConsent;
using Aptiverse.Family.Lookups;
using Aptiverse.Family.Messaging;
using Aptiverse.Family.Persistence;
using Aptiverse.SharedKernel.Persistence;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Wolverine;

namespace Aptiverse.Family;

/// <summary>
/// The only public surface of the Family module besides its Contracts project. It owns parent and student links (made
/// only by the student's action: accepting an emailed invite or handing over a short-lived code), the sharing flags the
/// student controls, link-scoped parent reads composed from other modules' contracts, and parental consent evidence
/// for minors, which Identity records as the document Billing's payer check reads.
/// </summary>
public static class FamilyModule
{
    public const string Schema = "family";

    /// <summary>Family bodies are tiny (spec BE-FAM-52).</summary>
    private const long MaxBodyBytes = 2 * 1024;

    public static IServiceCollection AddFamilyModule(this IServiceCollection services, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        services.AddOptions<FamilyOptions>()
            .Bind(configuration.GetSection(FamilyOptions.SectionName))
            .PostConfigure(options => options.WebAppUrl ??= configuration.GetValue<Uri?>("Auth:WebAppUrl"))
            .ValidateDataAnnotations()
            .Validate(o => o.WebAppUrl is { IsAbsoluteUri: true }, "Family:WebAppUrl (or Auth:WebAppUrl) must be an absolute URL.")
            .Validate(o => o.ChildrenWithoutPlan <= o.MaxChildren, "Family:ChildrenWithoutPlan cannot exceed Family:MaxChildren.")
            .ValidateOnStart();

        services.AddModuleDbContext<FamilyDbContext>(Schema);
        services.AddValidatorsFromAssemblyContaining<SendInviteValidator>(includeInternalTypes: true);

        services.AddScoped<ChildAllowance>();
        services.AddScoped<LinkWriter>();
        services.AddScoped<FamilyUserDataEraser>();
        services.AddScoped<IFamilyLinkLookup, FamilyLinkLookup>();

        services.AddScoped<SendInviteHandler>();
        services.AddScoped<ListInvitesHandler>();
        services.AddScoped<CancelInviteHandler>();
        services.AddScoped<AcceptInviteHandler>();
        services.AddScoped<CreateLinkCodeHandler>();
        services.AddScoped<RedeemLinkCodeHandler>();
        services.AddScoped<RemoveLinkHandler>();
        services.AddScoped<ListChildrenHandler>();
        services.AddScoped<ListParentsHandler>();
        services.AddScoped<UpdateSharingHandler>();
        services.AddScoped<GetChildSummaryHandler>();
        services.AddScoped<GrantConsentHandler>();
        services.AddScoped<WithdrawConsentHandler>();

        services.AddOptions<RateLimiterOptions>()
            .Configure<IOptions<FamilyOptions>>((limiter, family) => FamilyRateLimiting.AddPolicies(limiter, family.Value));

        services.ConfigureWolverine(opts => opts.Discovery.IncludeType(typeof(FamilyAccountDeletionRequestedHandler)));

        return services;
    }

    public static IEndpointRouteBuilder MapFamilyEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/family").WithTags("Family").WithMetadata(new RequestSizeLimitAttribute(MaxBodyBytes));

        // Responses carry a child's personal information; no shared or browser cache may keep them.
        group.AddEndpointFilter(async (context, next) =>
        {
            context.HttpContext.Response.Headers.CacheControl = "no-store";
            return await next(context);
        });

        SendInviteEndpoint.Map(group);
        ListInvitesEndpoint.Map(group);
        AcceptInviteEndpoint.Map(group);
        CancelInviteEndpoint.Map(group);
        CreateLinkCodeEndpoint.Map(group);
        RedeemLinkCodeEndpoint.Map(group);
        ListChildrenEndpoint.Map(group);
        ListParentsEndpoint.Map(group);
        GetChildSummaryEndpoint.Map(group);
        UpdateSharingEndpoint.Map(group);
        RemoveLinkEndpoints.Map(group);
        ConsentEndpoints.Map(group);

        return endpoints;
    }
}
