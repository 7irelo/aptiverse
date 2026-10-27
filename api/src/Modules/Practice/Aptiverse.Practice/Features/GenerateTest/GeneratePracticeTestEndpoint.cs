using System.Security.Claims;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Practice.Features.GenerateTest;

internal static class GeneratePracticeTestEndpoint
{
    public const long MaxBodyBytes = 4 * 1024;

    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/tests/generate", HandleAsync)
            .WithName("generatePracticeTest")
            .WithSummary("Generate a practice test for one of your assessments")
            .WithDescription(
                "Answers 202 at once and generates in the background; poll statusUrl. Optional Idempotency-Key header " +
                "(8 to 64 letters, digits, dashes or underscores): a replay returns the same test and job. One generation " +
                "at a time per student (409 practice.generation_in_progress with jobId) and a daily limit (429).")
            .RequirePermission(Permissions.Practice.Generate)
            .RequireRateLimiting(PracticeRateLimiting.Generate)
            .WithMetadata(new RequestSizeLimitAttribute(MaxBodyBytes))
            .WithValidation<GeneratePracticeTestRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status429TooManyRequests)
            .ProducesProblem(StatusCodes.Status503ServiceUnavailable);
    }

    private static async Task<Results<Accepted<GenerationAccepted>, ProblemHttpResult>> HandleAsync(
        GeneratePracticeTestRequest request,
        [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey,
        ClaimsPrincipal user,
        GeneratePracticeTestHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), request, idempotencyKey, cancellationToken);
        return result.IsSuccess ? TypedResults.Accepted(result.Value.StatusUrl, result.Value) : result.ToProblem();
    }
}
