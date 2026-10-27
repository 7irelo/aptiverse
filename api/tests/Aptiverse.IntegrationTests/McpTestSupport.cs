using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Aptiverse.Academics.Contracts;
using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Contracts;
using Aptiverse.Mcp.Contracts;
using Aptiverse.Mcp.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using ModelContextProtocol.Client;
using ModelContextProtocol.Protocol;
using Wolverine.Tracking;

namespace Aptiverse.IntegrationTests;

/// <summary>Mints delegated MCP tokens and talks to /mcp through the official SDK client or raw Streamable HTTP.</summary>
internal sealed class McpTestSupport(ApiFactory factory)
{
    public static readonly string[] ReadScopes = [McpScopes.ReadProgress, McpScopes.ReadAssessments];
    public static readonly string[] AllScopes = [McpScopes.ReadProgress, McpScopes.ReadAssessments, McpScopes.WritePractice];

    private static readonly string[] StudentRole = ["student"];

    public static CancellationToken Ct => TestContext.Current.CancellationToken;

    /// <summary>A delegated token exactly as AiTutor mints it.</summary>
    public string Token(Guid userId, IReadOnlyCollection<string>? scopes = null, string role = "student") =>
        factory.Services.GetRequiredService<IServiceTokenIssuer>().Issue(new ServiceTokenRequest(
            userId, [role], scopes ?? AllScopes, DelegatedMcpTokens.Audience, DelegatedMcpTokens.MaxLifetime, "test-request"));

    /// <summary>A properly signed delegated token issued ten minutes ago, so it expired five minutes ago.</summary>
    public string ExpiredToken(Guid userId)
    {
        var issuer = new ServiceTokenIssuer(
            factory.Services.GetRequiredService<SigningKeys>(),
            factory.Services.GetRequiredService<IOptions<AuthOptions>>(),
            new FixedClock(TimeProvider.System.GetUtcNow().AddMinutes(-10)));
        return issuer.Issue(new ServiceTokenRequest(userId, ["student"], AllScopes, DelegatedMcpTokens.Audience, DelegatedMcpTokens.MaxLifetime, null));
    }

    /// <summary>A properly signed token with the MCP audience that lives an hour, which the issuer would never mint.</summary>
    public string LongLivedToken(Guid userId)
    {
        var keys = factory.Services.GetRequiredService<SigningKeys>();
        var auth = factory.Services.GetRequiredService<IOptions<AuthOptions>>().Value;
        var now = TimeProvider.System.GetUtcNow().UtcDateTime;
        return new JsonWebTokenHandler { SetDefaultTimesOnTokenCreation = false }.CreateToken(new SecurityTokenDescriptor
        {
            Issuer = auth.Issuer,
            Audience = DelegatedMcpTokens.Audience,
            IssuedAt = now,
            NotBefore = now,
            Expires = now.AddHours(1),
            SigningCredentials = keys.Credentials,
            Claims = new Dictionary<string, object>
            {
                ["sub"] = userId.ToString(),
                ["roles"] = StudentRole,
                ["scope"] = string.Join(' ', AllScopes),
                ["jti"] = Guid.CreateVersion7().ToString(),
            },
        });
    }

    /// <summary>A service token for the ai service (the wrong audience for /mcp).</summary>
    public string AiServiceToken(Guid userId) =>
        factory.Services.GetRequiredService<IServiceTokenIssuer>().Issue(new ServiceTokenRequest(
            userId, ["student"], AllScopes, "aptiverse-ai", TimeSpan.FromMinutes(1), null));

    public async Task<McpClient> ConnectAsync(string token)
    {
        var http = factory.CreateClient();
        http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var transport = new HttpClientTransport(
            new HttpClientTransportOptions { Endpoint = new Uri(http.BaseAddress!, "/mcp"), TransportMode = HttpTransportMode.StreamableHttp },
            http,
            ownsHttpClient: true);
        return await McpClient.CreateAsync(transport, cancellationToken: Ct);
    }

    /// <summary>Calls a tool with raw JSON arguments, so tests can send anything a model might.</summary>
    public static async Task<(bool IsError, JsonElement Body)> CallAsync(McpClient client, string tool, string argumentsJson = "{}")
    {
        using var args = JsonDocument.Parse(argumentsJson);
        var result = await client.CallToolAsync(
            new CallToolRequestParams
            {
                Name = tool,
                Arguments = args.RootElement.EnumerateObject().ToDictionary(p => p.Name, p => p.Value.Clone()),
            },
            Ct);
        var text = Assert.IsType<TextContentBlock>(Assert.Single(result.Content)).Text;
        using var body = JsonDocument.Parse(text);
        return (result.IsError == true, body.RootElement.Clone());
    }

    public static async Task<string> ErrorCodeAsync(McpClient client, string tool, string argumentsJson = "{}")
    {
        var (isError, body) = await CallAsync(client, tool, argumentsJson);
        Assert.True(isError, body.GetRawText());
        return body.GetProperty("error").GetString()!;
    }

    public static async Task<JsonElement> OkAsync(McpClient client, string tool, string argumentsJson = "{}")
    {
        var (isError, body) = await CallAsync(client, tool, argumentsJson);
        Assert.False(isError, body.GetRawText());
        return body;
    }

    /// <summary>A raw initialize request, for asserting what the transport answers before any MCP handling.</summary>
    public async Task<HttpResponseMessage> RawInitializeAsync(string? bearer, Action<HttpRequestMessage>? configure = null)
    {
        var client = factory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Post, "/mcp")
        {
            Content = new StringContent(
                """{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"tests","version":"1.0"}}}""",
                Encoding.UTF8,
                "application/json"),
        };
        request.Headers.Accept.ParseAdd("application/json");
        request.Headers.Accept.ParseAdd("text/event-stream");
        if (bearer is not null)
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", bearer);
        }

        configure?.Invoke(request);
        return await client.SendAsync(request, Ct);
    }

    public async Task<string> SubjectNameAsync(Guid userId)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        var units = await scope.ServiceProvider.GetRequiredService<IStudyUnitLookup>().GetForUserAsync(userId, Ct);
        return Assert.Single(units).Name;
    }

    public async Task<T> WithDbAsync<T>(Func<McpDbContext, Task<T>> work)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        return await work(scope.ServiceProvider.GetRequiredService<McpDbContext>());
    }

    public async Task<T> TrackAsync<T>(Func<Task<T>> action)
    {
        T result = default!;
        await factory.AppHost.ExecuteAndWaitAsync(async () => result = await action(), timeoutInMilliseconds: 30_000);
        return result;
    }

    private sealed class FixedClock(DateTimeOffset now) : IClock
    {
        public DateTimeOffset UtcNow => now;
    }
}
