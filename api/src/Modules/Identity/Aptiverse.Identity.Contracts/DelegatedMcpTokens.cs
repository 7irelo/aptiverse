namespace Aptiverse.Identity.Contracts;

/// <summary>
/// The delegated token the API mints for the AI tutor so it can call the Aptiverse MCP server for one student.
/// It is a service token (see <see cref="IServiceTokenIssuer"/>) with the <see cref="Audience"/> audience. Identity
/// validates it under <see cref="AuthenticationScheme"/> on <see cref="Path"/> only; every other route validates the
/// access token audience, so neither token is accepted where the other belongs.
/// </summary>
public static class DelegatedMcpTokens
{
    public const string Audience = "aptiverse-mcp";

    public const string AuthenticationScheme = "McpDelegated";

    /// <summary>Where the MCP server is mapped. Requests under it authenticate with <see cref="AuthenticationScheme"/>.</summary>
    public const string Path = "/mcp";

    /// <summary>Space separated scopes, as in every service token.</summary>
    public const string ScopeClaim = "scope";

    public const string TokenIdClaim = "jti";

    public const string RequestIdClaim = "rid";

    /// <summary>The longest lifetime a delegated MCP token may have; a longer one is rejected even if signed.</summary>
    public static readonly TimeSpan MaxLifetime = TimeSpan.FromMinutes(5);
}
