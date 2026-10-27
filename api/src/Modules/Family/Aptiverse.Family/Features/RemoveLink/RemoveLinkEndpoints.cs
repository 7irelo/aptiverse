using System.Security.Claims;
using Aptiverse.Family.Domain;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Family.Features.RemoveLink;

/// <summary>Either side can end a link: the parent unlinks a child, the student revokes a parent. Same handler, two routes.</summary>
internal static class RemoveLinkEndpoints
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapDelete("/children/{studentId:guid}", UnlinkChildAsync)
            .WithName("unlinkFamilyChild")
            .WithSummary("Unlink one of your children")
            .WithDescription("You stop seeing anything of theirs immediately. A child you are not linked to is 404; unlinking again is 204.")
            .RequirePermission(Permissions.Family.Parent)
            .RequireRateLimiting(FamilyRateLimiting.Write)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);

        group.MapDelete("/parents/{parentId:guid}", RevokeParentAsync)
            .WithName("revokeFamilyParent")
            .WithSummary("Remove a parent's access to your account")
            .WithDescription(
                "Takes effect immediately: the parent sees nothing more. Parental consent they gave stays on record until " +
                "they withdraw it. A parent you are not linked to is 404; revoking again is 204.")
            .RequirePermission(Permissions.Family.Student)
            .RequireRateLimiting(FamilyRateLimiting.Write)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> UnlinkChildAsync(
        Guid studentId,
        ClaimsPrincipal user,
        RemoveLinkHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), studentId, RemovedBy.Parent, cancellationToken);
        return result.IsSuccess ? TypedResults.NoContent() : result.ToProblem();
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> RevokeParentAsync(
        Guid parentId,
        ClaimsPrincipal user,
        RemoveLinkHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(parentId, user.GetRequiredUserId(), RemovedBy.Student, cancellationToken);
        return result.IsSuccess ? TypedResults.NoContent() : result.ToProblem();
    }
}
