using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.AiTutor.Features.DeleteConversation;

internal static class DeleteConversationEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapDelete("/conversations/{id:guid}", HandleAsync)
            .WithName("deleteConversation")
            .WithSummary("Delete one of your tutor conversations")
            .RequirePermission(Permissions.Ai.Chat)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> HandleAsync(
        Guid id,
        ClaimsPrincipal user,
        DeleteConversationHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, cancellationToken);
        return result.IsSuccess ? TypedResults.NoContent() : result.ToProblem();
    }
}
