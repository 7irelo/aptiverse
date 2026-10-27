using Aptiverse.SharedKernel.Validation;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Academics.Features.GetCatalog;

internal static class GetCatalogEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/catalog", HandleAsync)
            .WithName("getSubjectCatalog")
            .WithSummary("CAPS subjects for a curriculum and grade")
            .WithDescription("Active subjects, compulsory first, then by category and name. Public: onboarding needs it before sign-in completes.")
            .AllowAnonymous()
            .WithValidation<GetCatalogRequest>();
    }

    private static async Task<Ok<CatalogResponse>> HandleAsync(
        [AsParameters] GetCatalogRequest request,
        GetCatalogHandler handler,
        HttpResponse response,
        CancellationToken cancellationToken)
    {
        var catalog = await handler.HandleAsync(request, cancellationToken);
        response.Headers.CacheControl = "public, max-age=3600";
        return TypedResults.Ok(catalog);
    }
}
