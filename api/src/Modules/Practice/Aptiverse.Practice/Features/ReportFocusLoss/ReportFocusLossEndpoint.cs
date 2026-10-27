using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Practice.Features.ReportFocusLoss;

internal static class ReportFocusLossEndpoint
{
    public const long MaxBodyBytes = 1024;

    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/attempts/{id:guid}/focus-loss", HandleAsync)
            .WithName("reportFocusLoss")
            .WithSummary("Report that the test lost focus")
            .WithDescription("Losses within 2 seconds of the previous one count once. Informational only: it never fails an attempt.")
            .RequirePermission(Permissions.Practice.Take)
            .RequireRateLimiting(PracticeRateLimiting.Focus)
            .WithMetadata(new RequestSizeLimitAttribute(MaxBodyBytes))
            .WithValidation<ReportFocusLossRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<Ok<FocusLossResult>, ProblemHttpResult>> HandleAsync(
        Guid id,
        ReportFocusLossRequest request,
        ClaimsPrincipal user,
        ReportFocusLossHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }
}
