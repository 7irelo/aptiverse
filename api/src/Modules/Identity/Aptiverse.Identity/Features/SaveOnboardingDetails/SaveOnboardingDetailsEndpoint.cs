using System.Security.Claims;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Features.Common;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Identity.Features.SaveOnboardingDetails;

internal static class SaveOnboardingDetailsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPut("/onboarding/details", HandleAsync)
            .WithName("saveOnboardingDetails")
            .WithSummary("Save grade or study level, exam body, institution and date of birth (students)")
            .WithDescription(
                "A draft step: any subset of fields, each checked against the stored level (400 identity.level_not_set, " +
                "400 identity.stage_mismatch). missing lists what completion still needs. The date of birth is set once " +
                "(409 identity.date_of_birth_already_set). Optional If-Match; a stale value returns 409 concurrency_conflict.")
            .RequirePermission(Permissions.Account.Manage)
            .WithValidation<SaveOnboardingDetailsRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status409Conflict);
    }

    private static async Task<Results<Ok<OnboardingState>, ProblemHttpResult>> HandleAsync(
        SaveOnboardingDetailsRequest request,
        [FromHeader(Name = "If-Match")] string? ifMatch,
        ClaimsPrincipal user,
        SaveOnboardingDetailsHandler handler,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), request, ifMatch, RequestInfo.From(context), cancellationToken);
        if (result.IsFailure)
        {
            return result.ToProblem();
        }

        context.Response.Headers.ETag = result.Value.ETag;
        return TypedResults.Ok(result.Value.Value);
    }
}
