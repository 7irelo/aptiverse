using System.Security.Claims;
using Aptiverse.Practice.Domain;
using Aptiverse.Practice.Features.Common;
using Aptiverse.Practice.Grading;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Practice.Features.SubmitAttempt;

/// <param name="AttemptId">The attempt.</param>
/// <param name="Status">"grading" while written answers are being marked, then "graded".</param>
/// <param name="ResultsUrl">Where the marked paper is.</param>
internal sealed record SubmitResult(Guid AttemptId, string Status, string ResultsUrl);

internal static class SubmitPracticeAttemptEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/attempts/{id:guid}/submit", HandleAsync)
            .WithName("submitPracticeAttempt")
            .WithSummary("Submit your attempt for marking")
            .WithDescription(
                "Multiple choice is marked at once; written answers are marked in the background (status grading). " +
                "Submitting again returns the current status. After a timed attempt's deadline plus 10 seconds the " +
                "auto-submit owns it (409 practice.deadline_passed).")
            .RequirePermission(Permissions.Practice.Take)
            .RequireRateLimiting(PracticeRateLimiting.Submit)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<Ok<SubmitResult>, ProblemHttpResult>> HandleAsync(
        Guid id,
        ClaimsPrincipal user,
        AttemptSubmitter submitter,
        CancellationToken cancellationToken)
    {
        var result = await submitter.SubmitAsync(id, user.GetRequiredUserId(), SubmitSources.Student, expectedDeadline: null, cancellationToken);
        return result.IsSuccess
            ? TypedResults.Ok(new SubmitResult(result.Value.AttemptId, result.Value.Status, PracticeUrls.Results(result.Value.AttemptId)))
            : result.ToProblem();
    }
}
