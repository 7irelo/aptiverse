using System.Text.Json;
using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Contracts;
using Aptiverse.SharedKernel.Time;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Hosting.Internal;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace Aptiverse.IntegrationTests;

/// <summary>Service tokens in isolation: no database or host needed.</summary>
public sealed class ServiceTokenIssuerTests : IDisposable
{
    private const string AiAudience = "aptiverse-ai";

    private static readonly AuthOptions Auth = new()
    {
        Issuer = "https://api.aptiverse.test",
        Audience = "aptiverse-web",
        WebAppUrl = new Uri("https://aptiverse.test"),
    };

    private static readonly Guid UserId = Guid.CreateVersion7();

    private readonly SigningKeys _keys = new(
        Options.Create(Auth),
        new HostingEnvironment { EnvironmentName = Environments.Development },
        NullLogger<SigningKeys>.Instance);

    private readonly ServiceTokenIssuer _issuer;

    public ServiceTokenIssuerTests()
    {
        _issuer = new ServiceTokenIssuer(_keys, Options.Create(Auth), new UtcClock());
    }

    public void Dispose() => _keys.Dispose();

    [Fact]
    public async Task Token_validates_against_the_published_jwks_and_carries_the_claims()
    {
        var token = _issuer.Issue(Request() with { RequestId = "trace-123" });

        var result = await new JsonWebTokenHandler().ValidateTokenAsync(token, new TokenValidationParameters
        {
            ValidIssuer = Auth.Issuer,
            ValidAudience = AiAudience,
            IssuerSigningKeys = PublishedJwks().GetSigningKeys(),
            ValidAlgorithms = [SecurityAlgorithms.EcdsaSha256],
            RequireExpirationTime = true,
            RequireSignedTokens = true,
        });

        Assert.True(result.IsValid, result.Exception?.Message);

        var jwt = new JsonWebToken(token);
        Assert.Equal("ES256", jwt.Alg);
        Assert.Equal(_keys.SigningKey.KeyId, jwt.Kid);
        Assert.Equal(UserId.ToString(), jwt.Subject);
        Assert.Equal([AiAudience], jwt.Audiences);
        Assert.Equal(Auth.Issuer, jwt.Issuer);
        Assert.Equal("ai.tutor ai.notes", jwt.GetClaim("scope").Value);
        Assert.Equal(["student"], jwt.Claims.Where(c => c.Type == "roles").Select(c => c.Value));
        Assert.Equal("trace-123", jwt.GetClaim("rid").Value);
        Assert.True(Guid.TryParse(jwt.Id, out _));
        Assert.Equal(TimeSpan.FromSeconds(60), jwt.ValidTo - jwt.IssuedAt);
        Assert.Equal(jwt.IssuedAt, jwt.ValidFrom);
        Assert.False(jwt.TryGetClaim("email", out _));
        Assert.False(jwt.TryGetClaim("sid", out _));

        // The roles claim is a JSON array even with one role, which the ai service relies on.
        using var payload = JsonDocument.Parse(Base64UrlEncoder.Decode(jwt.EncodedPayload));
        Assert.Equal(JsonValueKind.Array, payload.RootElement.GetProperty("roles").ValueKind);
    }

    [Fact]
    public async Task Token_is_rejected_by_the_access_token_bearer_pipeline()
    {
        var bearer = new JwtBearerOptions();
        new ConfigureJwtBearerOptions(Options.Create(Auth), _keys).Configure(bearer);

        var result = await new JsonWebTokenHandler().ValidateTokenAsync(_issuer.Issue(Request()), bearer.TokenValidationParameters);

        Assert.False(result.IsValid);
        Assert.IsType<SecurityTokenInvalidAudienceException>(result.Exception);
    }

    [Fact]
    public void Request_id_is_optional()
    {
        var jwt = new JsonWebToken(_issuer.Issue(Request() with { RequestId = null }));

        Assert.False(jwt.TryGetClaim("rid", out _));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    [InlineData(301)]
    public void Lifetime_outside_zero_to_five_minutes_throws(int seconds)
    {
        Assert.ThrowsAny<ArgumentException>(() => _issuer.Issue(Request() with { Lifetime = TimeSpan.FromSeconds(seconds) }));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("aptiverse-web")]
    [InlineData("APTIVERSE-WEB")]
    [InlineData("aptiverse-web/")]
    public void Empty_or_access_token_audience_throws(string audience)
    {
        Assert.ThrowsAny<ArgumentException>(() => _issuer.Issue(Request() with { Audience = audience }));
    }

    [Fact]
    public void Missing_user_throws()
    {
        Assert.ThrowsAny<ArgumentException>(() => _issuer.Issue(Request() with { UserId = Guid.Empty }));
    }

    [Theory]
    [InlineData("ai.tutor ai.notes")]
    [InlineData("")]
    public void Scope_with_whitespace_or_blank_throws(string scope)
    {
        Assert.ThrowsAny<ArgumentException>(() => _issuer.Issue(Request() with { Scopes = [scope] }));
    }

    private static ServiceTokenRequest Request() =>
        new(UserId, ["student"], ["ai.tutor", "ai.notes"], AiAudience, TimeSpan.FromSeconds(60), null);

    private JsonWebKeySet PublishedJwks()
    {
        // The same shape GET /.well-known/jwks.json serves.
        var keys = _keys.Jwks.Select(k => new { kty = k.Kty, crv = k.Crv, x = k.X, y = k.Y, kid = k.Kid, use = k.Use, alg = k.Alg });
        return new JsonWebKeySet(JsonSerializer.Serialize(new { keys }));
    }

    private sealed class UtcClock : IClock
    {
        public DateTimeOffset UtcNow => TimeProvider.System.GetUtcNow();
    }
}
