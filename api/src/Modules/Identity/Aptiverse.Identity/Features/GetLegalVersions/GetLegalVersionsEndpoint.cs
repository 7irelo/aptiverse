using Aptiverse.Identity.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Options;

namespace Aptiverse.Identity.Features.GetLegalVersions;

/// <param name="TermsVersion">Send as acceptedTermsVersion when registering, or termsVersion when re-accepting.</param>
/// <param name="PrivacyVersion">Send as acceptedPrivacyVersion when registering, or privacyVersion when re-accepting.</param>
/// <param name="TermsUrl">Where the current terms are published.</param>
/// <param name="PrivacyUrl">Where the current privacy policy is published.</param>
/// <param name="EffectiveFrom">The date these versions took effect.</param>
internal sealed record LegalVersionsResponse(string TermsVersion, string PrivacyVersion, Uri TermsUrl, Uri PrivacyUrl, DateOnly EffectiveFrom);

internal static class GetLegalVersionsEndpoint
{
    public static void Map(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/legal/versions", Handle)
            .WithName("getLegalVersions")
            .WithTags("Identity")
            .WithSummary("The current terms and privacy policy versions")
            .WithDescription("Public and cacheable. The register page sends these versions back as its consent.")
            .AllowAnonymous();
    }

    private static Ok<LegalVersionsResponse> Handle(IOptions<LegalOptions> legal, HttpContext context)
    {
        var options = legal.Value;
        context.Response.Headers.CacheControl = "public, max-age=300";
        return TypedResults.Ok(new LegalVersionsResponse(
            options.TermsVersion, options.PrivacyVersion, options.TermsUrl, options.PrivacyUrl, options.EffectiveFrom!.Value));
    }
}
