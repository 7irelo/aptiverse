using System.Security.Claims;
using Aptiverse.Family.Features.Common;
using Aptiverse.Family.Features.WithdrawConsent;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Family.Features.GrantConsent;

internal static class ConsentEndpoints
{
    public const int UserAgentMaxLength = 300;

    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/children/{studentId:guid}/consent", GrantAsync)
            .WithName("grantFamilyParentalConsent")
            .WithSummary("Give parental consent for a child under 18")
            .WithDescription(
                "Only a linked parent with a verified email can consent, and only for a child under 18 (409 " +
                "family.consent_not_needed otherwise). documentVersion must be the current consent text version (409 " +
                "family.consent_version_outdated, currentVersion extension). Consenting again is 200; another parent's " +
                "consent already on record is 409. Consent lets your child subscribe and stays until you withdraw it.")
            .RequirePermission(Permissions.Family.Parent)
            .RequireRateLimiting(FamilyRateLimiting.Write)
            .WithValidation<GrantConsentRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);

        group.MapDelete("/children/{studentId:guid}/consent", WithdrawAsync)
            .WithName("withdrawFamilyParentalConsent")
            .WithSummary("Withdraw the parental consent you gave")
            .WithDescription(
                "Only the parent who consented can withdraw (403 family.consent_not_parent), even after the link is removed. " +
                "With no consent on record it is 404.")
            .RequirePermission(Permissions.Family.Parent)
            .RequireRateLimiting(FamilyRateLimiting.Write)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<Ok<ConsentView>, ProblemHttpResult>> GrantAsync(
        Guid studentId,
        GrantConsentRequest request,
        ClaimsPrincipal user,
        HttpContext context,
        GrantConsentHandler handler,
        CancellationToken cancellationToken)
    {
        var userAgent = context.Request.Headers.UserAgent.ToString();
        var origin = new RequestOrigin(
            context.Connection.RemoteIpAddress?.ToString(),
            string.IsNullOrWhiteSpace(userAgent) ? null : userAgent[..Math.Min(userAgent.Length, UserAgentMaxLength)]);
        var result = await handler.HandleAsync(user.GetRequiredUserId(), studentId, request, origin, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> WithdrawAsync(
        Guid studentId,
        ClaimsPrincipal user,
        WithdrawConsentHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(user.GetRequiredUserId(), studentId, cancellationToken);
        return result.IsSuccess ? TypedResults.NoContent() : result.ToProblem();
    }
}
