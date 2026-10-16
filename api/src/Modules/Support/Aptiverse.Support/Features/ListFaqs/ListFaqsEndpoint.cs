using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Support.Features.ListFaqs;

internal static class ListFaqsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/faqs", HandleAsync)
            .WithName("listFaqs")
            .WithSummary("List published FAQs")
            .WithDescription("Published FAQs ordered by category, then sort order. Public, no authentication.")
            .AllowAnonymous();
    }

    private static async Task<Ok<IReadOnlyList<FaqResponse>>> HandleAsync(ListFaqsHandler handler, CancellationToken cancellationToken) =>
        TypedResults.Ok(await handler.HandleAsync(cancellationToken));
}
