using System.Security.Claims;
using Aptiverse.Identity.Features.Common;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Identity.Features.SetEducationLevel;

internal static class SetEducationLevelEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPut("/onboarding/level", HandleAsync)
            .WithName("setEducationLevel")
            .WithSummary("Choose high school or tertiary (students)")
            .WithDescription(
                "Saves a draft step; switching level clears the other stage's details. Optional If-Match with the ETag from a " +
                "previous onboarding response; a stale value returns 409 concurrency_conflict. 403 identity.onboarding_students_only.")
            .RequirePermission(Permissions.Account.Manage)
            .WithValidation<SetEducationLevelRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status409Conflict);
    }

    private static async Task<Results<Ok<OnboardingState>, ProblemHttpResult>> HandleAsync(
        SetEducationLevelRequest request,
        [FromHeader(Name = "If-Match")] string? ifMatch,
        ClaimsPrincipal user,
        SetEducationLevelHandler handler,
        HttpResponse response,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), request, ifMatch, cancellationToken);
        if (result.IsFailure)
        {
            return result.ToProblem();
        }

        response.Headers.ETag = result.Value.ETag;
        return TypedResults.Ok(result.Value.Value);
    }
}
