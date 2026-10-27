using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Progress.Features.GetMastery;

internal static class GetMasteryEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/mastery", HandleAsync)
            .WithName("getMastery")
            .WithSummary("Your mastery per subject and topic")
            .WithDescription(
                "Recency-weighted accuracy from your graded practice and recorded marks, with the evidence behind each " +
                "value. Known topics without evidence are listed with a null score (no marks yet), never zero.")
            .RequirePermission(Permissions.Progress.Read)
            .WithValidation<GetMasteryRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound);
    }

    private static async Task<Results<Ok<MasteryView>, ProblemHttpResult>> HandleAsync(
        [AsParameters] GetMasteryRequest request,
        ClaimsPrincipal user,
        GetMasteryHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), request, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }
}
