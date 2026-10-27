using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.AiTutor.Features.CreateConversation;

internal static class CreateConversationEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/conversations", HandleAsync)
            .WithName("createConversation")
            .WithSummary("Start a tutor conversation")
            .RequirePermission(Permissions.Ai.Chat)
            .WithValidation<CreateConversationRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Created<ConversationResponse>> HandleAsync(
        CreateConversationRequest request,
        ClaimsPrincipal user,
        CreateConversationHandler handler,
        CancellationToken cancellationToken)
    {
        var response = await handler.HandleAsync(user.GetRequiredUserId(), request, cancellationToken);
        return TypedResults.Created($"/ai/conversations/{response.Id}", response);
    }
}
