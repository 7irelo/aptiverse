using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Options;

namespace Aptiverse.Identity.Authentication;

internal sealed class AuthOptions
{
    public const string SectionName = "Auth";

    [Required(AllowEmptyStrings = false)]
    public string Issuer { get; set; } = string.Empty;

    [Required(AllowEmptyStrings = false)]
    public string Audience { get; set; } = string.Empty;

    /// <summary>
    /// PEM encoded EC P-256 private key (PKCS#8 or SEC1) that signs access tokens. Required outside Development.
    /// Literal "\n" sequences are accepted so the key can live in a single-line environment variable.
    /// </summary>
    public string? SigningKey { get; set; }

    /// <summary>PEM public keys of retired signing keys, still published in the JWKS and accepted during rotation.</summary>
    public string[] PreviousPublicKeys { get; set; } = [];

    [Range(1, 60)]
    public int AccessTokenMinutes { get; set; } = 15;

    [Range(1, 365)]
    public int RefreshTokenAbsoluteDays { get; set; } = 30;

    [Range(1, 90)]
    public int RefreshTokenSlidingDays { get; set; } = 7;

    [Range(1, 240)]
    public int EmailVerificationHours { get; set; } = 48;

    [Range(5, 240)]
    public int PasswordResetMinutes { get; set; } = 60;

    [Range(1, 20)]
    public int MaxFailedAccessAttempts { get; set; } = 5;

    [Range(1, 1440)]
    public int LockoutMinutes { get; set; } = 15;

    /// <summary>Days between a deletion request and erasure, during which the user can sign in and cancel (decision 38).</summary>
    [Range(1, 90)]
    public int DeletionCoolingOffDays { get; set; } = 14;

    /// <summary>Base URL of the web app, used to build the links in verification and reset emails.</summary>
    [Required]
    public Uri WebAppUrl { get; set; } = null!;

    /// <summary>Emails of existing accounts the seed command promotes to admin. Admin is never self-registerable.</summary>
    public string[] BootstrapAdminEmails { get; set; } = [];

    public GoogleAuthOptions Google { get; set; } = new();

    public AuthRateLimitOptions RateLimits { get; set; } = new();
}

internal sealed class GoogleAuthOptions
{
    /// <summary>OAuth client ids whose Google ID tokens are accepted (the audience). Empty disables Google sign-in.</summary>
    public string[] ClientIds { get; set; } = [];
}

/// <summary>Fixed windows. IP limits run as endpoint policies; per-email limits run inside the handlers.</summary>
internal sealed class AuthRateLimitOptions
{
    public RateLimitWindow Register { get; set; } = new() { PermitLimit = 10, WindowSeconds = 600 };

    public RateLimitWindow Login { get; set; } = new() { PermitLimit = 30, WindowSeconds = 300 };

    /// <summary>
    /// Failed sign-ins per email, not attempts. Must equal the Identity lockout (threshold and window) so a locked
    /// real account and a hammered unknown email answer the same way; checked at startup.
    /// </summary>
    public RateLimitWindow LoginPerEmail { get; set; } = new() { PermitLimit = 5, WindowSeconds = 900 };

    public RateLimitWindow PasswordReset { get; set; } = new() { PermitLimit = 10, WindowSeconds = 900 };

    public RateLimitWindow PasswordResetPerEmail { get; set; } = new() { PermitLimit = 3, WindowSeconds = 900 };

    public RateLimitWindow Verification { get; set; } = new() { PermitLimit = 5, WindowSeconds = 900 };

    public RateLimitWindow VerificationPerEmail { get; set; } = new() { PermitLimit = 3, WindowSeconds = 900 };

    public RateLimitWindow Refresh { get; set; } = new() { PermitLimit = 120, WindowSeconds = 60 };
}

internal sealed class RateLimitWindow
{
    [Range(1, 100_000)]
    public int PermitLimit { get; set; }

    [Range(1, 86_400)]
    public int WindowSeconds { get; set; }

    public TimeSpan Window => TimeSpan.FromSeconds(WindowSeconds);
}

internal sealed class LegalOptions
{
    public const string SectionName = "Legal";

    [Required(AllowEmptyStrings = false)]
    [MaxLength(32)]
    public string TermsVersion { get; set; } = string.Empty;

    [Required(AllowEmptyStrings = false)]
    [MaxLength(32)]
    public string PrivacyVersion { get; set; } = string.Empty;

    [Required]
    public Uri TermsUrl { get; set; } = null!;

    [Required]
    public Uri PrivacyUrl { get; set; } = null!;

    /// <summary>The date the current versions took effect.</summary>
    [Required]
    public DateOnly? EffectiveFrom { get; set; }
}

/// <summary>Cross-field rules DataAnnotations cannot express.</summary>
internal sealed class AuthOptionsValidator : IValidateOptions<AuthOptions>
{
    public ValidateOptionsResult Validate(string? name, AuthOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);
        var perEmail = options.RateLimits.LoginPerEmail;
        return perEmail.PermitLimit == options.MaxFailedAccessAttempts && perEmail.WindowSeconds == options.LockoutMinutes * 60
            ? ValidateOptionsResult.Success
            : ValidateOptionsResult.Fail(
                "Auth:RateLimits:LoginPerEmail must equal the lockout (PermitLimit = MaxFailedAccessAttempts, WindowSeconds = LockoutMinutes * 60) "
                + "so a locked account and an unknown email give the same answer.");
    }
}
