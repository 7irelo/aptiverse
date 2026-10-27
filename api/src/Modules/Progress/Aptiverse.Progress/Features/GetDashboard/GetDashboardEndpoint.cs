using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Progress.Features.GetDashboard;

internal static class GetDashboardEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/dashboard", HandleAsync)
            .WithName("getDashboard")
            .WithSummary("Your dashboard")
            .WithDescription(
                "Only real numbers from your own work. Every score is nullable and null means no marks yet; counts " +
                "are true counts. No points, ranks or streaks.")
            .RequirePermission(Permissions.Progress.Read)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Ok<DashboardView>> HandleAsync(
        ClaimsPrincipal user,
        GetDashboardHandler handler,
        HttpResponse response,
        CancellationToken cancellationToken)
    {
        response.Headers.CacheControl = "no-store";
        return TypedResults.Ok(await handler.HandleAsync(user.GetRequiredUserId(), cancellationToken));
    }
}
