using System.Security.Claims;
using Aptiverse.Family.Features.Common;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Family.Features.UpdateSharing;

internal static class UpdateSharingEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPut("/parents/{parentId:guid}/sharing", HandleAsync)
            .WithName("updateFamilySharing")
            .WithSummary("Choose what a linked parent can see")
            .WithDescription(
                "Send all four flags. Takes effect on the parent's next read. Tutor conversations are never shared; the " +
                "tutor flag shares counts only. A parent you are not linked to is 404.")
            .RequirePermission(Permissions.Family.Student)
            .RequireRateLimiting(FamilyRateLimiting.Write)
            .WithValidation<UpdateSharingRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<Ok<LinkView>, ProblemHttpResult>> HandleAsync(
        Guid parentId,
        UpdateSharingRequest request,
        ClaimsPrincipal user,
        UpdateSharingHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), parentId, request, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }
}
