using System.ComponentModel.DataAnnotations;
using Amazon;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace Aptiverse.Notifications.Email;

internal enum EmailSenderKind
{
    /// <summary>Amazon SES v2 with the task role credentials. Required in Staging and Production.</summary>
    Ses,

    /// <summary>Plain SMTP, for Mailpit on the local compose stack.</summary>
    Smtp,
}

/// <summary>Transactional email settings. Deployed environments set SesRegion, ConfigurationSet and FromAddress.</summary>
internal sealed class EmailOptions
{
    public const string SectionName = "Email";

    public EmailSenderKind Sender { get; set; } = EmailSenderKind.Ses;

    /// <summary>SES has no SMTP or v2 sending endpoint in af-south-1, so mail goes out of eu-west-1.</summary>
    [Required(AllowEmptyStrings = false)]
    public string SesRegion { get; set; } = "eu-west-1";

    /// <summary>SES configuration set that routes delivery, bounce and complaint events. Required for SES.</summary>
    [MaxLength(64)]
    public string? ConfigurationSet { get; set; }

    [Required(AllowEmptyStrings = false)]
    [EmailAddress]
    [MaxLength(254)]
    public string FromAddress { get; set; } = string.Empty;

    [Required(AllowEmptyStrings = false)]
    [MaxLength(64)]
    public string FromName { get; set; } = "Aptiverse";

    /// <summary>
    /// The only origin email links may point at. Falls back to Auth:WebAppUrl when unset, so the deployed tasks
    /// (which set only Auth__WebAppUrl today) and Identity always agree on the web app.
    /// </summary>
    [Required]
    public Uri? WebAppUrl { get; set; }

    /// <summary>
    /// Secret mixed into recipient hashes in the delivery log so a leaked table cannot be matched against a list of
    /// known addresses. Optional for now; set it from Secrets Manager in deployed environments.
    /// </summary>
    [MaxLength(256)]
    public string? AddressHashPepper { get; set; }

    /// <summary>Provider calls per email before a transient failure is recorded as final.</summary>
    [Range(1, 10)]
    public int MaxSendAttempts { get; set; } = 6;

    public SmtpOptions Smtp { get; set; } = new();
}

internal sealed class SmtpOptions
{
    [MaxLength(255)]
    public string Host { get; set; } = "localhost";

    [Range(1, 65_535)]
    public int Port { get; set; } = 1025;

    /// <summary>Mailpit speaks plain SMTP; any real relay must use STARTTLS.</summary>
    public bool UseStartTls { get; set; }

    public string? Username { get; set; }

    public string? Password { get; set; }
}

/// <summary>Cross-field rules DataAnnotations cannot express.</summary>
internal sealed class EmailOptionsValidator(IHostEnvironment environment) : IValidateOptions<EmailOptions>
{
    public ValidateOptionsResult Validate(string? name, EmailOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);
        var failures = new List<string>();

        if (options.WebAppUrl is not { IsAbsoluteUri: true } url
            || (url.Scheme != Uri.UriSchemeHttps && url.Scheme != Uri.UriSchemeHttp)
            || !string.IsNullOrEmpty(url.Query)
            || !string.IsNullOrEmpty(url.Fragment)
            || !string.IsNullOrEmpty(url.UserInfo))
        {
            failures.Add("Email:WebAppUrl must be an absolute http or https URL without credentials, query or fragment.");
        }
        else if (url.Scheme != Uri.UriSchemeHttps && !url.IsLoopback)
        {
            failures.Add("Email:WebAppUrl must use https unless it points at this machine.");
        }

        var deployed = environment.IsProduction() || environment.IsStaging();
        if (deployed && options.Sender != EmailSenderKind.Ses)
        {
            failures.Add("Email:Sender must be Ses in Staging and Production.");
        }

        if (options.Sender == EmailSenderKind.Ses)
        {
            if (string.IsNullOrWhiteSpace(options.ConfigurationSet))
            {
                failures.Add("Email:ConfigurationSet is required when Email:Sender is Ses.");
            }

            if (RegionEndpoint.EnumerableAllRegions.All(r => r.SystemName != options.SesRegion))
            {
                failures.Add("Email:SesRegion is not a known AWS region.");
            }
        }
        else if (string.IsNullOrWhiteSpace(options.Smtp.Host))
        {
            failures.Add("Email:Smtp:Host is required when Email:Sender is Smtp.");
        }

        return failures.Count == 0 ? ValidateOptionsResult.Success : ValidateOptionsResult.Fail(failures);
    }
}
