using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Validation;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Progress.Features.GetAnalytics;

internal static class GetAnalyticsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/analytics", HandleAsync)
            .WithName("getAnalytics")
            .WithSummary("Your time on task, strengths and gaps")
            .WithDescription(
                "Strengths are secure or mastered topics with at least 5 questions; gaps are your lowest topics with at " +
                "least 5 questions. Early reads are left out of both, so a single lucky or unlucky test does not decide them.")
            .RequirePermission(Permissions.Progress.Read)
            .WithValidation<GetAnalyticsRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Ok<AnalyticsView>> HandleAsync(
        [AsParameters] GetAnalyticsRequest request,
        ClaimsPrincipal user,
        GetAnalyticsHandler handler,
        CancellationToken cancellationToken) =>
        TypedResults.Ok(await handler.HandleAsync(user.GetRequiredUserId(), request, cancellationToken));
}
