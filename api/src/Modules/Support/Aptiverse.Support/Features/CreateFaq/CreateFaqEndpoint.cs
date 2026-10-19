using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Support.Features.CreateFaq;

internal static class CreateFaqEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/faqs", HandleAsync)
            .WithName("createFaq")
            .WithSummary("Create an FAQ")
            .RequirePermission(Permissions.Content.Manage)
            .WithValidation<CreateFaqRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status409Conflict);
    }

    private static async Task<Results<Created<CreateFaqResponse>, ProblemHttpResult>> HandleAsync(
        CreateFaqRequest request,
        CreateFaqHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(request, cancellationToken);
        return result.IsSuccess
            ? TypedResults.Created((string?)null, result.Value)
            : result.ToProblem();
    }
}
