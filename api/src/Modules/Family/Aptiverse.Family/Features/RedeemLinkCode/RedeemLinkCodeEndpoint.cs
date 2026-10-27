using System.Globalization;
using System.Security.Claims;
using Aptiverse.Family.Features.Common;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Family.Features.RedeemLinkCode;

internal static class RedeemLinkCodeEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/link-codes/redeem", HandleAsync)
            .WithName("redeemFamilyLinkCode")
            .WithSummary("Link to your child with the code they gave you")
            .WithDescription(
                "A wrong code is 404 family.link_code_invalid and counts against you: after 5 wrong codes in an hour " +
                "redeeming is blocked with 429 family.too_many_attempts (Retry-After header). An expired code is 410. " +
                "Linking more children than your plan covers is 409 family.limit_reached.")
            .RequirePermission(Permissions.Family.Parent)
            .RequireRateLimiting(FamilyRateLimiting.Token)
            .WithValidation<RedeemLinkCodeRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status410Gone)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<Ok<LinkView>, ProblemHttpResult>> HandleAsync(
        RedeemLinkCodeRequest request,
        ClaimsPrincipal user,
        RedeemLinkCodeHandler handler,
        HttpResponse response,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), request, cancellationToken);
        if (result.IsSuccess)
        {
            return TypedResults.Ok(result.Value);
        }

        if (result.Error!.Extensions?.TryGetValue("retryAfterSeconds", out var seconds) == true && seconds is int value)
        {
            response.Headers.RetryAfter = value.ToString(CultureInfo.InvariantCulture);
        }

        return result.ToProblem();
    }
}
