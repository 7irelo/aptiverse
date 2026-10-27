namespace Aptiverse.Identity.Features.Login;

/// <param name="Email">Max 256 characters.</param>
/// <param name="Password">Max 128 characters. No minimum, so passwords set under older rules still sign in.</param>
internal sealed record LoginRequest(string Email, string Password);
