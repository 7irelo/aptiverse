using System.Security.Claims;
using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Domain;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Identity.Features.UpdateMyProfile;

internal static class UpdateMyProfileEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPatch("/profile", HandleAsync)
            .WithName("updateMyProfile")
            .WithSummary("Change your name or phone number, or set your date of birth or adult confirmation once")
            .WithDescription(
                "Fields left out are unchanged; phoneNumber: null clears it. dateOfBirth (students) and adultConfirmed (parents) " +
                "can each be set once: 409 identity.date_of_birth_already_set. Email changes are a separate flow. Optional " +
                "If-Match; a stale value returns 409 concurrency_conflict.")
            .RequirePermission(Permissions.Account.Manage)
            .WithValidation<UpdateMyProfileRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<Ok<ProfileResponse>, ProblemHttpResult>> HandleAsync(
        UpdateMyProfileRequest request,
        [FromHeader(Name = "If-Match")] string? ifMatch,
        ClaimsPrincipal user,
        UpdateMyProfileHandler handler,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), request, ifMatch, RequestInfo.From(context), cancellationToken);
        if (result.IsFailure)
        {
            return result.Error!.WithRetryAfterHeader(context.Response).ToProblem();
        }

        context.Response.Headers.ETag = result.Value.ETag;
        return TypedResults.Ok(result.Value.Value);
    }
}
