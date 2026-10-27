using System.Globalization;
using System.Text.RegularExpressions;
using Aptiverse.Notifications.Delivery;
using Aptiverse.Notifications.Email;
using Aptiverse.Notifications.Templates;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Hosting.Internal;

namespace Aptiverse.IntegrationTests;

/// <summary>Template rendering, link building and option rules. No database needed.</summary>
public sealed partial class NotificationsTemplateTests
{
    private const string Base = "https://app.aptiverse.test";

    private static readonly EmailOptions Options = new() { WebAppUrl = new Uri(Base), FromAddress = "noreply@aptiverse.test" };

    private static EmailLinks Links => new(Microsoft.Extensions.Options.Options.Create(Options));

    private static EmailTemplateRenderer Renderer => new(Links);

    public static TheoryData<string> TemplateKeys => new(EmailTemplates.All.Select(t => t.Key));

    [Theory]
    [MemberData(nameof(TemplateKeys))]
    public void Every_template_renders_a_clean_branded_email(string key)
    {
        var template = EmailTemplates.All.Single(t => t.Key == key);

        var email = Renderer.Render(template, SampleModel(template));

        Assert.False(string.IsNullOrWhiteSpace(email.Subject));
        Assert.True(email.Subject.Length < 78, $"Subject too long: {email.Subject}");
        Assert.DoesNotContain('\n', email.Subject);
        foreach (var part in new[] { email.Subject, email.Text, email.Html })
        {
            Assert.Contains("Aptiverse", part, StringComparison.Ordinal);
            Assert.DoesNotContain("{{", part, StringComparison.Ordinal);
            Assert.DoesNotContain("}}", part, StringComparison.Ordinal);
            Assert.DoesNotContain('\u2013', part);
            Assert.DoesNotContain('\u2014', part);
            Assert.False(Emoji().IsMatch(part), $"{key} contains an emoji or pictograph.");
        }

        Assert.Contains("Thandi", email.Text, StringComparison.Ordinal);
        Assert.Contains("<html lang=\"en-ZA\"", email.Html, StringComparison.Ordinal);
        Assert.Contains($"<title>{System.Net.WebUtility.HtmlEncode(email.Subject)}</title>", email.Html, StringComparison.Ordinal);

        var hrefs = Href().Matches(email.Html).Select(m => m.Groups[1].Value).ToList();
        Assert.NotEmpty(hrefs);
        Assert.All(hrefs, href => Assert.StartsWith($"{Base}/", System.Net.WebUtility.HtmlDecode(href), StringComparison.Ordinal));
        Assert.All(TextLinks().Matches(email.Text).Select(m => m.Value), link => Assert.StartsWith($"{Base}/", link, StringComparison.Ordinal));
    }

    [Fact]
    public void Model_values_are_html_encoded_in_html_and_raw_in_text()
    {
        var model = SampleModel(EmailTemplates.PasswordChanged);
        model["name"] = "<script>alert('x')</script> & \"Co\"";

        var email = Renderer.Render(EmailTemplates.PasswordChanged, model);

        Assert.DoesNotContain("<script>", email.Html, StringComparison.Ordinal);
        Assert.Contains("&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt; &amp; &quot;Co&quot;", email.Html, StringComparison.Ordinal);
        Assert.Contains("<script>alert('x')</script> & \"Co\"", email.Text, StringComparison.Ordinal);
    }

    [Fact]
    public void Password_changed_copy_follows_how_it_changed()
    {
        var model = SampleModel(EmailTemplates.PasswordChanged);
        model["via_reset"] = "true";
        Assert.Contains("reset using a password reset link", Renderer.Render(EmailTemplates.PasswordChanged, model).Text, StringComparison.Ordinal);
        model["via_reset"] = "false";
        Assert.Contains("changed from your account settings", Renderer.Render(EmailTemplates.PasswordChanged, model).Text, StringComparison.Ordinal);
    }

    [Fact]
    public void Welcome_copy_differs_for_parents()
    {
        var model = SampleModel(EmailTemplates.Welcome);
        model["is_parent"] = "true";
        Assert.Contains("add your child", Renderer.Render(EmailTemplates.Welcome, model).Text, StringComparison.Ordinal);
        model["is_parent"] = "false";
        Assert.Contains("add your subjects or courses", Renderer.Render(EmailTemplates.Welcome, model).Text, StringComparison.Ordinal);
    }

    [Fact]
    public void A_model_with_missing_or_unexpected_keys_is_refused()
    {
        var missing = SampleModel(EmailTemplates.VerifyEmail);
        missing.Remove("link");
        Assert.Throws<ArgumentException>(() => Renderer.Render(EmailTemplates.VerifyEmail, missing));

        var extra = SampleModel(EmailTemplates.VerifyEmail);
        extra["evil"] = "x";
        Assert.Throws<ArgumentException>(() => Renderer.Render(EmailTemplates.VerifyEmail, extra));
    }

    [Fact]
    public void Token_links_are_rebuilt_on_the_configured_origin()
    {
        var link = Links.WithToken(EmailLinks.VerifyEmailPath, new Uri("https://evil.example/phish?x=1&token=abc%2Bdef"));
        Assert.Equal($"{Base}/verify-email?token=abc%2Bdef", link!.AbsoluteUri);

        Assert.Null(Links.WithToken(EmailLinks.VerifyEmailPath, new Uri("https://aptiverse.co.za/verify-email")));
        // A protocol-relative path cannot switch hosts: it stays a path under the configured origin.
        Assert.Equal($"{Base}/evil.example/x", Links.To("//evil.example/x").AbsoluteUri);
    }

    [Fact]
    public void Dedupe_keys_are_stable_per_event_and_distinct_across_events()
    {
        var user = Guid.NewGuid();
        var at = new DateTimeOffset(2026, 10, 27, 10, 0, 0, TimeSpan.Zero);

        Assert.Equal(DedupeKeys.ForEvent("PasswordChanged", user, at), DedupeKeys.ForEvent("PasswordChanged", user, at.ToOffset(TimeSpan.FromHours(2))));
        Assert.NotEqual(DedupeKeys.ForEvent("PasswordChanged", user, at), DedupeKeys.ForEvent("PasswordChanged", user, at.AddTicks(1)));
        Assert.NotEqual(DedupeKeys.ForEvent("PasswordChanged", user, at), DedupeKeys.ForEvent("AccountLockedOut", user, at));
        Assert.Equal(8, DedupeKeys.OncePerUser("identity.welcome", user).Version);
    }

    [Fact]
    public void Recipient_addresses_are_only_stored_hashed_or_masked()
    {
        var privacy = new RecipientPrivacy(Microsoft.Extensions.Options.Options.Create(new EmailOptions { AddressHashPepper = "pepper" }));
        var unpeppered = new RecipientPrivacy(Microsoft.Extensions.Options.Options.Create(new EmailOptions()));

        var hash = privacy.Hash(" Thandi@Example.CO.ZA ");
        Assert.Equal(64, hash.Length);
        Assert.Equal(hash, privacy.Hash("thandi@example.co.za"));
        Assert.NotEqual(hash, unpeppered.Hash("thandi@example.co.za"));
        Assert.Equal("T***@E***.ZA", RecipientPrivacy.Mask("Thandi@Example.CO.ZA"));
        Assert.Equal("***", RecipientPrivacy.Mask("not-an-address"));
    }

    [Theory]
    [InlineData("Production", "Smtp", "set", "https://aptiverse.co.za", false)]
    [InlineData("Production", "Ses", null, "https://aptiverse.co.za", false)]
    [InlineData("Production", "Ses", "set", "http://aptiverse.co.za", false)]
    [InlineData("Production", "Ses", "set", "https://aptiverse.co.za/?next=x", false)]
    [InlineData("Production", "Ses", "set", "https://aptiverse.co.za", true)]
    [InlineData("Development", "Smtp", null, "http://localhost:3000", true)]
    public void Email_options_are_checked_on_start(string environment, string sender, string? configurationSet, string webAppUrl, bool valid)
    {
        var options = new EmailOptions
        {
            Sender = Enum.Parse<EmailSenderKind>(sender),
            ConfigurationSet = configurationSet,
            FromAddress = "noreply@aptiverse.co.za",
            WebAppUrl = new Uri(webAppUrl),
        };
        IHostEnvironment host = new HostingEnvironment { EnvironmentName = environment };

        var result = new EmailOptionsValidator(host).Validate(null, options);

        Assert.Equal(valid, result.Succeeded);
    }

    private static Dictionary<string, string> SampleModel(EmailTemplate template)
    {
        var at = new DateTimeOffset(2026, 10, 29, 12, 5, 0, TimeSpan.Zero);
        var values = new Dictionary<string, string>
        {
            ["name"] = "Thandi",
            ["link"] = $"{Base}/verify-email?token=abc",
            ["expires_at"] = EmailFormat.When(at),
            ["changed_at"] = EmailFormat.When(at),
            ["locked_until"] = EmailFormat.When(at),
            ["revoked_at"] = EmailFormat.When(at),
            ["via_reset"] = "false",
            ["is_parent"] = "false",
            ["device_count"] = 2.ToString(CultureInfo.InvariantCulture),
            ["reason_text"] = "They were signed out from the devices list in your account settings.",
            ["reset_link"] = $"{Base}/forgot-password",
            ["security_link"] = $"{Base}/settings/security",
            ["app_link"] = $"{Base}/",
        };
        return template.ModelKeys.ToDictionary(k => k, k => values[k]);
    }

    [GeneratedRegex("href=\"([^\"]*)\"")]
    private static partial Regex Href();

    [GeneratedRegex(@"https?://\S+")]
    private static partial Regex TextLinks();

    [GeneratedRegex(@"[\u2600-\u27BF]|\p{Cs}")]
    private static partial Regex Emoji();
}
