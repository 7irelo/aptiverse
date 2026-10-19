using System.Security.Cryptography;
using Aptiverse.SharedKernel.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Aptiverse.Identity.Authentication;

/// <summary>
/// The ES256 key that signs access tokens, plus every public key that may verify them (the current key and
/// any retired keys still inside their rotation window). Published as the JWKS.
/// </summary>
internal sealed class SigningKeys : IDisposable
{
    private readonly List<ECDsa> _owned = [];

    public SigningKeys(IOptions<AuthOptions> options, IHostEnvironment environment, ILogger<SigningKeys> logger)
    {
        ArgumentNullException.ThrowIfNull(options);
        ArgumentNullException.ThrowIfNull(environment);

        var configured = options.Value.SigningKey;
        ECDsa signer;
        if (!string.IsNullOrWhiteSpace(configured))
        {
            signer = Own(LoadPem(configured));
        }
        else if (AllowsEphemeralKey(environment))
        {
            signer = Own(ECDsa.Create(ECCurve.NamedCurves.nistP256));
            logger.LogWarning("Auth:SigningKey is not configured. Using an ephemeral signing key: tokens stop working when the process restarts.");
        }
        else
        {
            throw new InvalidOperationException("Auth:SigningKey is required outside Development.");
        }

        if (signer.KeySize != 256)
        {
            throw new InvalidOperationException("Auth:SigningKey must be an EC P-256 key (ES256).");
        }

        var publicSigner = Own(ECDsa.Create(signer.ExportParameters(includePrivateParameters: false)));
        var current = PublicJwk(publicSigner);

        SigningKey = new ECDsaSecurityKey(signer) { KeyId = current.Kid };
        Credentials = new SigningCredentials(SigningKey, SecurityAlgorithms.EcdsaSha256);

        var validation = new List<SecurityKey> { new ECDsaSecurityKey(publicSigner) { KeyId = current.Kid } };
        var jwks = new List<JsonWebKey> { current };
        foreach (var pem in options.Value.PreviousPublicKeys.Where(p => !string.IsNullOrWhiteSpace(p)))
        {
            var previous = Own(LoadPem(pem));
            var jwk = PublicJwk(previous);
            validation.Add(new ECDsaSecurityKey(previous) { KeyId = jwk.Kid });
            jwks.Add(jwk);
        }

        ValidationKeys = validation;
        Jwks = jwks;
    }

    public ECDsaSecurityKey SigningKey { get; }

    public SigningCredentials Credentials { get; }

    public IReadOnlyList<SecurityKey> ValidationKeys { get; }

    public IReadOnlyList<JsonWebKey> Jwks { get; }

    public static bool AllowsEphemeralKey(IHostEnvironment environment) =>
        environment.IsDevelopment() || PlatformHostingExtensions.IsBuildTimeDocumentGeneration;

    public void Dispose()
    {
        foreach (var key in _owned)
        {
            key.Dispose();
        }
    }

    private static ECDsa LoadPem(string pem)
    {
        var key = ECDsa.Create();
        try
        {
            key.ImportFromPem(pem.Replace("\\n", "\n", StringComparison.Ordinal));
            return key;
        }
        catch (Exception ex) when (ex is ArgumentException or CryptographicException)
        {
            key.Dispose();
            throw new InvalidOperationException("An Auth signing key is not a valid PEM encoded EC key.", ex);
        }
    }

    private static JsonWebKey PublicJwk(ECDsa publicKey)
    {
        var jwk = JsonWebKeyConverter.ConvertFromECDsaSecurityKey(new ECDsaSecurityKey(publicKey));
        jwk.Kid = Base64UrlEncoder.Encode(jwk.ComputeJwkThumbprint());
        jwk.Use = JsonWebKeyUseNames.Sig;
        jwk.Alg = SecurityAlgorithms.EcdsaSha256;
        return jwk;
    }

    private ECDsa Own(ECDsa key)
    {
        _owned.Add(key);
        return key;
    }
}
