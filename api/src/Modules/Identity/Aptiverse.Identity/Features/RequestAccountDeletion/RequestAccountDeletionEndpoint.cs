using System.Security.Claims;
using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Domain;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Identity.Features.RequestAccountDeletion;

internal static class RequestAccountDeletionEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/deletion-request", HandleAsync)
            .WithName("requestAccountDeletion")
            .WithSummary("Ask for your account and personal information to be deleted")
            .WithDescription(
                "Erasure starts after a 14 day cooling-off period, during which you can still sign in and cancel. 202 for a new " +
                "request, 200 with the existing one if a request is already pending. Password accounts must give the current " +
                "password: 401 identity.invalid_credentials, counted toward the sign-in lockout.")
            .RequirePermission(Permissions.Account.Manage)
            .WithValidation<RequestAccountDeletionRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<Accepted<AccountDeletionResponse>, Ok<AccountDeletionResponse>, ProblemHttpResult>> HandleAsync(
        RequestAccountDeletionRequest request,
        ClaimsPrincipal user,
        RequestAccountDeletionHandler handler,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), request, RequestInfo.From(context), cancellationToken);
        if (result.IsFailure)
        {
            return result.Error!.WithRetryAfterHeader(context.Response).ToProblem();
        }

        var (response, created) = result.Value;
        return created ? TypedResults.Accepted("/me", response) : TypedResults.Ok(response);
    }
}
