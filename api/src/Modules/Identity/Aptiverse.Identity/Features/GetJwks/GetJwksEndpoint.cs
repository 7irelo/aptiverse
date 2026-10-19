using Aptiverse.Identity.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Identity.Features.GetJwks;

internal static class GetJwksEndpoint
{
    public static void Map(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/.well-known/jwks.json", Handle)
            .WithName("getJwks")
            .WithTags("Identity")
            .WithSummary("Public keys that verify access tokens")
            .WithDescription("The current ES256 signing key and any retired keys still inside their rotation window. Public, cacheable.")
            .AllowAnonymous();
    }

    private static Ok<JwksResponse> Handle(SigningKeys keys, HttpContext context)
    {
        // Short enough that a rotated key reaches every verifier well inside the rotation window.
        context.Response.Headers.CacheControl = "public, max-age=300";
        return TypedResults.Ok(new JwksResponse(keys.Jwks
            .Select(k => new JwkResponse(k.Kty, k.Crv, k.X, k.Y, k.Kid, k.Use, k.Alg))
            .ToList()));
    }
}

internal sealed record JwksResponse(IReadOnlyList<JwkResponse> Keys);

internal sealed record JwkResponse(string Kty, string Crv, string X, string Y, string Kid, string Use, string Alg);
