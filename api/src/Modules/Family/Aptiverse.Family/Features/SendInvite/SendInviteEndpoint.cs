using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Family.Features.SendInvite;

internal static class SendInviteEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/invites", HandleAsync)
            .WithName("sendFamilyInvite")
            .WithSummary("Invite your child to link their account to yours")
            .WithDescription(
                "Emails a single-use link that is valid for 7 days. The child accepts while signed in with that email, " +
                "and only then are the accounts linked. The answer is the same whether or not the address has an account. " +
                "A second invite to the same address while one is pending is 409 family.invite_duplicate (inviteId extension).")
            .RequirePermission(Permissions.Family.Parent)
            .RequireRateLimiting(FamilyRateLimiting.Invite)
            .WithValidation<SendInviteRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<Created<InviteView>, ProblemHttpResult>> HandleAsync(
        SendInviteRequest request,
        ClaimsPrincipal user,
        SendInviteHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), request, cancellationToken);
        return result.IsSuccess ? TypedResults.Created($"/family/invites/{result.Value.Id}", result.Value) : result.ToProblem();
    }
}
