using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.AiTutor.Features.GetConversation;

internal static class GetConversationEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/conversations/{id:guid}", HandleAsync)
            .WithName("getConversation")
            .WithSummary("Get one of your tutor conversations with its messages")
            .RequirePermission(Permissions.Ai.Chat)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Results<Ok<ConversationDetailResponse>, ProblemHttpResult>> HandleAsync(
        Guid id,
        ClaimsPrincipal user,
        GetConversationHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }
}
