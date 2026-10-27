namespace Aptiverse.Identity.Contracts;

/// <summary>
/// Mints short-lived ES256 tokens that let the API call an internal service (for example the ai service) on
/// behalf of one user. Verifiers check them against /.well-known/jwks.json with their own audience, so a
/// service token is never accepted as a user access token and the reverse.
/// </summary>
public interface IServiceTokenIssuer
{
    /// <summary>Returns the signed compact JWT. Throws <see cref="ArgumentException"/> for an invalid request.</summary>
    string Issue(ServiceTokenRequest request);
}

/// <param name="UserId">The user the call is made for; becomes the sub claim.</param>
/// <param name="Roles">The user's roles, carried as the roles array claim.</param>
/// <param name="Scopes">What the receiving service may do for this call, carried space separated in the scope claim.</param>
/// <param name="Audience">The receiving service. Must differ from the API's own access token audience.</param>
/// <param name="Lifetime">Greater than zero and at most five minutes.</param>
/// <param name="RequestId">Correlation id for logs on both sides; carried as rid when present.</param>
public sealed record ServiceTokenRequest(
    Guid UserId,
    IReadOnlyCollection<string> Roles,
    IReadOnlyCollection<string> Scopes,
    string Audience,
    TimeSpan Lifetime,
    string? RequestId);
