using System.Security.Claims;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Features.Common;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Identity.Features.CompleteOnboarding;

internal static class CompleteOnboardingEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/onboarding/complete", HandleAsync)
            .WithName("completeOnboarding")
            .WithSummary("Finish onboarding (students and parents)")
            .WithDescription(
                "Merges the body over the saved draft; a client may also skip the draft steps and send everything here. " +
                "409 identity.onboarding_incomplete lists the missing fields in errors. Idempotent: a repeat returns the same " +
                "completedAt. 403 identity.onboarding_not_applicable for admins.")
            .RequirePermission(Permissions.Account.Manage)
            .WithValidation<CompleteOnboardingRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status409Conflict);
    }

    private static async Task<Results<Ok<OnboardingState>, ProblemHttpResult>> HandleAsync(
        CompleteOnboardingRequest request,
        ClaimsPrincipal user,
        CompleteOnboardingHandler handler,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), request, RequestInfo.From(context), cancellationToken);
        if (result.IsFailure)
        {
            return result.ToProblem();
        }

        context.Response.Headers.ETag = result.Value.ETag;
        return TypedResults.Ok(result.Value.Value);
    }
}
