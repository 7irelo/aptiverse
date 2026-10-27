using Microsoft.Extensions.Options;

namespace Aptiverse.Notifications.Email;

/// <summary>
/// Builds every link an email contains from Email:WebAppUrl, so a bug or a tampered message can never make an email
/// point anywhere else. Token links from Identity keep only their token; the rest of the URL is discarded.
/// </summary>
internal sealed class EmailLinks(IOptions<EmailOptions> options)
{
    public const string VerifyEmailPath = "verify-email";
    public const string ResetPasswordPath = "reset-password";
    public const string ForgotPasswordPath = "forgot-password";
    public const string SecuritySettingsPath = "settings/security";
    public const string FamilyInvitePath = "family/invite";
    public const string FamilyPath = "family";

    private Uri Base => options.Value.WebAppUrl ?? throw new InvalidOperationException("Email:WebAppUrl is not configured.");

    /// <summary>The web app's home page.</summary>
    public Uri Home() => To(string.Empty);

    /// <summary>A fixed app page, for example <see cref="ForgotPasswordPath"/>.</summary>
    public Uri To(string path)
    {
        ArgumentNullException.ThrowIfNull(path);
        var root = Base.GetLeftPart(UriPartial.Path).TrimEnd('/');
        var link = new Uri(path.Length == 0 ? $"{root}/" : $"{root}/{path.TrimStart('/')}", UriKind.Absolute);
        return SameOrigin(link) ? link : throw new InvalidOperationException("An email link left the web app origin.");
    }

    /// <summary>
    /// Rebuilds a single-use token link on the configured origin, or returns null when the source link carries no
    /// usable token (the email is then not sent).
    /// </summary>
    public Uri? WithToken(string path, Uri source)
    {
        ArgumentNullException.ThrowIfNull(source);
        var token = TokenOf(source);
        return token is null ? null : new Uri($"{To(path)}?token={Uri.EscapeDataString(token)}", UriKind.Absolute);
    }

    private bool SameOrigin(Uri link) =>
        Uri.Compare(link, Base, UriComponents.SchemeAndServer, UriFormat.Unescaped, StringComparison.OrdinalIgnoreCase) == 0;

    private static string? TokenOf(Uri source)
    {
        if (!source.IsAbsoluteUri)
        {
            return null;
        }

        foreach (var pair in source.Query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries))
        {
            var parts = pair.Split('=', 2);
            if (parts.Length == 2 && parts[0] == "token")
            {
                var token = Uri.UnescapeDataString(parts[1]);
                return token.Length is > 0 and <= 512 ? token : null;
            }
        }

        return null;
    }
}
