namespace Aptiverse.Identity.Features.RefreshTokens;

/// <param name="RefreshToken">The refresh token from the last token response: 43 base64url characters.</param>
internal sealed record RefreshTokensRequest(string RefreshToken);
