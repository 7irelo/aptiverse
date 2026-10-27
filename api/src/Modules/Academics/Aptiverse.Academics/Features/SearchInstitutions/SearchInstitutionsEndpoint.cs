using Aptiverse.SharedKernel.Validation;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Academics.Features.SearchInstitutions;

internal static class SearchInstitutionsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/institutions", HandleAsync)
            .WithName("searchInstitutions")
            .WithSummary("Search tertiary institutions")
            .WithDescription("Active catalog institutions, best match first. Public: onboarding needs it.")
            .AllowAnonymous()
            .WithValidation<SearchInstitutionsRequest>();
    }

    private static async Task<Ok<IReadOnlyList<InstitutionView>>> HandleAsync(
        [AsParameters] SearchInstitutionsRequest request,
        SearchInstitutionsHandler handler,
        HttpResponse response,
        CancellationToken cancellationToken)
    {
        var institutions = await handler.HandleAsync(request, cancellationToken);
        response.Headers.CacheControl = "public, max-age=3600";
        return TypedResults.Ok(institutions);
    }
}
