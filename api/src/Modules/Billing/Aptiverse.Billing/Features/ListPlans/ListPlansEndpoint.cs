using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Billing.Features.ListPlans;

internal static class ListPlansEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/plans", HandleAsync)
            .WithName("listPlans")
            .WithSummary("List the plans on sale")
            .WithDescription("Public and anonymous. Amounts are integer cents, VAT inclusive. quotas[].perPeriod is per calendar month: -1 unlimited, 0 not included.")
            .AllowAnonymous()
            .WithValidation<ListPlansRequest>();
    }

    private static async Task<Ok<PlanCatalog>> HandleAsync(
        [AsParameters] ListPlansRequest request,
        ListPlansHandler handler,
        HttpResponse response,
        CancellationToken cancellationToken)
    {
        response.Headers.CacheControl = "public, max-age=300";
        return TypedResults.Ok(await handler.HandleAsync(request, cancellationToken));
    }
}
