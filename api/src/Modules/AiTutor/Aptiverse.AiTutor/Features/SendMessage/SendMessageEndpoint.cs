using System.Diagnostics;
using System.Security.Claims;
using Aptiverse.AiTutor.AiService;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.AiTutor.Features.SendMessage;

internal static class SendMessageEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/conversations/{id:guid}/messages", HandleAsync)
            .WithName("sendMessage")
            .WithSummary("Send a message to the tutor and stream the answer")
            .WithDescription(
                "Streams Server-Sent Events: route, token, tool_call, citation and confirm while the tutor works, then " +
                "exactly one done (the answer is saved) or error (whatever arrived is saved as incomplete or failed).")
            .RequirePermission(Permissions.Ai.Chat)
            .RequireRateLimiting(AiRateLimiting.SendMessage)
            .WithValidation<SendMessageRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status429TooManyRequests)
            .ProducesProblem(StatusCodes.Status503ServiceUnavailable);
    }

    private static async Task<Results<ServerSentEventsResult<object>, ProblemHttpResult>> HandleAsync(
        Guid id,
        SendMessageRequest request,
        ClaimsPrincipal user,
        HttpContext context,
        SendMessageHandler handler,
        CancellationToken cancellationToken)
    {
        var userId = user.GetRequiredUserId();
        var prepared = await handler.PrepareAsync(userId, id, request, cancellationToken);
        if (prepared.IsFailure)
        {
            return prepared.ToProblem();
        }

        var roles = user.FindAll(AptiverseClaims.Roles).Select(c => c.Value).ToArray();
        var requestId = Activity.Current?.TraceId.ToString() ?? context.TraceIdentifier;
        var caller = new AiCaller(userId, roles, requestId);
        return TypedResults.ServerSentEvents(handler.StreamAsync(prepared.Value, caller, cancellationToken));
    }
}
