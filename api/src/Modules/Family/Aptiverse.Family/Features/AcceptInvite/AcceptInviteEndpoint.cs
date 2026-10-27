using System.Security.Claims;
using Aptiverse.Family.Features.Common;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Family.Features.AcceptInvite;

internal static class AcceptInviteEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/invites/accept", HandleAsync)
            .WithName("acceptFamilyInvite")
            .WithSummary("Accept a parent's invite and link your accounts")
            .WithDescription(
                "Sign in with the invited email address first (403 family.invite_email_mismatch otherwise). An expired " +
                "invite is 410 family.invite_expired; an unknown, cancelled or used one is 404. Accepting again returns the " +
                "same link. You choose what this parent sees and can change it or remove the link at any time.")
            .RequirePermission(Permissions.Family.Student)
            .RequireRateLimiting(FamilyRateLimiting.Token)
            .WithValidation<AcceptInviteRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status410Gone)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<Ok<LinkView>, ProblemHttpResult>> HandleAsync(
        AcceptInviteRequest request,
        ClaimsPrincipal user,
        AcceptInviteHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), request, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }
}
