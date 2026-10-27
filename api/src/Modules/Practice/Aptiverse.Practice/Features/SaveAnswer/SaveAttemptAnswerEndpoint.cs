using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Practice.Features.SaveAnswer;

internal static class SaveAttemptAnswerEndpoint
{
    public const long MaxBodyBytes = 8 * 1024;

    public static void Map(RouteGroupBuilder group)
    {
        group.MapPut("/attempts/{id:guid}/answers/{questionId:guid}", HandleAsync)
            .WithName("saveAttemptAnswer")
            .WithSummary("Autosave your answer to one question")
            .WithDescription(
                "Send baseRevision = the revision you last saw. A stale revision returns 409 practice.revision_conflict with " +
                "currentRevision. Refused while paused, after submission, and after a timed attempt's deadline plus 10 seconds.")
            .RequirePermission(Permissions.Practice.Take)
            .RequireRateLimiting(PracticeRateLimiting.Autosave)
            .WithMetadata(new RequestSizeLimitAttribute(MaxBodyBytes))
            .WithValidation<SaveAttemptAnswerRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<Ok<SavedAnswer>, ProblemHttpResult>> HandleAsync(
        Guid id,
        Guid questionId,
        SaveAttemptAnswerRequest request,
        ClaimsPrincipal user,
        SaveAttemptAnswerHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), id, questionId, request, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }
}
