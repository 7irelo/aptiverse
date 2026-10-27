using System.Security.Claims;
using Aptiverse.AiTutor.Features.CreateConversation;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Paging;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.AiTutor.Features.ListConversations;

internal static class ListConversationsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/conversations", HandleAsync)
            .WithName("listConversations")
            .WithSummary("List your tutor conversations")
            .WithDescription("Your own conversations, most recently active first.")
            .RequirePermission(Permissions.Ai.Chat)
            .WithValidation<ListConversationsRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Ok<PagedResult<ConversationResponse>>> HandleAsync(
        [AsParameters] ListConversationsRequest request,
        ClaimsPrincipal user,
        ListConversationsHandler handler,
        CancellationToken cancellationToken) =>
        TypedResults.Ok(await handler.HandleAsync(user.GetRequiredUserId(), request, cancellationToken));
}
