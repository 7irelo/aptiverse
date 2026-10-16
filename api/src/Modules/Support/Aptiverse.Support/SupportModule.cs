using Aptiverse.SharedKernel.Persistence;
using Aptiverse.SharedKernel.Seeding;
using Aptiverse.Support.Features.CreateFaq;
using Aptiverse.Support.Features.ListFaqs;
using Aptiverse.Support.Persistence;
using Aptiverse.Support.Seeding;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Wolverine;

namespace Aptiverse.Support;

/// <summary>The only public surface of the Support module besides its Contracts project.</summary>
public static class SupportModule
{
    public const string Schema = "support";

    public static IServiceCollection AddSupportModule(this IServiceCollection services, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        services.AddModuleDbContext<SupportDbContext>(Schema);
        services.AddValidatorsFromAssemblyContaining<CreateFaqValidator>(includeInternalTypes: true);

        services.AddScoped<ListFaqsHandler>();
        services.AddScoped<CreateFaqHandler>();
        services.AddScoped<IDataSeeder, SupportSeeder>();

        services.ConfigureWolverine(opts => opts.Discovery.IncludeType(typeof(FaqPublishedHandler)));

        return services;
    }

    public static IEndpointRouteBuilder MapSupportEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/support").WithTags("Support");

        ListFaqsEndpoint.Map(group);
        CreateFaqEndpoint.Map(group);

        return endpoints;
    }
}
