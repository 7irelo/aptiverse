using System.Net;
using System.Net.Http.Json;
using Aptiverse.Identity.Contracts;
using Aptiverse.Notifications.Delivery;
using Aptiverse.Notifications.Email;
using Aptiverse.Notifications.Persistence;
using Aptiverse.Notifications.Templates;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Wolverine.Tracking;
using static Aptiverse.IntegrationTests.IdentityTestSupport;

namespace Aptiverse.IntegrationTests;

/// <summary>Identity events flowing through the outbox into emails, with a fake provider standing in for SES.</summary>
[Collection(ApiTestGroup.Name)]
public sealed class NotificationsEmailTests(ApiFactory factory)
{
    private const string Base = ApiFactory.EmailWebAppUrl;

    private readonly IdentityTestSupport _support = new(factory);

    private void SkipWithoutDocker() => Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);

    [Fact]
    public async Task Registering_sends_only_the_verification_email_with_a_link_on_the_configured_web_app()
    {
        SkipWithoutDocker();
        var (account, token) = await _support.RegisterWithTokenAsync();

        var email = Assert.Single(factory.Email.To(account.Email));
        Assert.Equal("Verify your email address for Aptiverse", email.Subject);
        Assert.Equal("Thandi Test", email.ToName);
        var link = $"{Base}/verify-email?token={Uri.EscapeDataString(token)}";
        Assert.Contains(link, email.TextBody, StringComparison.Ordinal);
        Assert.Contains($"href=\"{WebUtility.HtmlEncode(link)}\"", email.HtmlBody, StringComparison.Ordinal);
        Assert.DoesNotContain("aptiverse.co.za", email.HtmlBody, StringComparison.Ordinal);

        var delivery = Assert.Single(await DeliveriesAsync(account.UserId));
        Assert.Equal(EmailTemplates.VerifyEmail.Key, delivery.TemplateKey);
        Assert.Equal(DeliveryStatuses.Sent, delivery.Status);
        Assert.Equal(1, delivery.Attempts);
        Assert.NotNull(delivery.ProviderMessageId);
        Assert.Equal(64, delivery.ToAddressHash.Length);
        Assert.DoesNotContain(account.Email, delivery.ToAddressHash, StringComparison.OrdinalIgnoreCase);
        Assert.Equal("s***@e***.test", delivery.ToAddressMasked.ToLowerInvariant());
    }

    [Fact]
    public async Task Verifying_the_address_sends_one_welcome_email()
    {
        SkipWithoutDocker();
        var (account, token) = await _support.RegisterWithTokenAsync("parent");

        HttpResponseMessage? verify = null;
        var session = await _support.TrackAsync(async () =>
            verify = await _support.Anonymous().PostAsJsonAsync("/auth/verify-email", new { token }, Ct));
        Assert.Equal(HttpStatusCode.NoContent, verify!.StatusCode);
        var verified = Assert.Single(MessagesOf<EmailVerified>(session));

        // A redelivered or repeated verification never welcomes twice.
        await factory.AppHost.InvokeMessageAndWaitAsync(verified);
        await factory.AppHost.InvokeMessageAndWaitAsync(verified with { OccurredAt = verified.OccurredAt.AddMinutes(5) });

        var welcome = Assert.Single(factory.Email.To(account.Email), e => e.Subject == "Welcome to Aptiverse");
        Assert.Contains("add your child", welcome.TextBody, StringComparison.Ordinal);
        Assert.Contains($"href=\"{Base}/\"", welcome.HtmlBody, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Forgot_password_sends_the_reset_email_with_a_link_on_the_configured_web_app()
    {
        SkipWithoutDocker();
        var account = await _support.RegisterAsync();

        var session = await _support.TrackAsync(async () =>
            await _support.Anonymous().PostAsJsonAsync("/auth/forgot-password", new { email = account.Email }, Ct));
        var requested = Assert.Single(MessagesOf<PasswordResetRequested>(session));

        var email = Assert.Single(factory.Email.To(account.Email), e => e.Subject == "Reset your Aptiverse password");
        Assert.Contains($"{Base}/reset-password?token={Uri.EscapeDataString(TokenFrom(requested.ResetUrl))}", email.TextBody, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Changing_the_password_sends_one_security_notice_and_no_separate_sessions_notice()
    {
        SkipWithoutDocker();
        var account = await _support.RegisterAsync();
        await _support.SignInAgainAsync(account);

        HttpResponseMessage? changed = null;
        var session = await _support.TrackAsync(async () => changed = await _support.Bearer(account).PostAsJsonAsync(
            "/me/password", new { currentPassword = Password, newPassword = "a whole new phrase" }, Ct));
        Assert.Equal(HttpStatusCode.NoContent, changed!.StatusCode);
        Assert.Single(MessagesOf<SessionsRevoked>(session));

        var emails = factory.Email.To(account.Email);
        var notice = Assert.Single(emails, e => e.Subject == "Your Aptiverse password was changed");
        Assert.Contains("changed from your account settings", notice.TextBody, StringComparison.Ordinal);
        Assert.Contains($"{Base}/forgot-password", notice.TextBody, StringComparison.Ordinal);
        Assert.DoesNotContain(emails, e => e.Subject.StartsWith("Devices were signed out", StringComparison.Ordinal));
    }

    [Fact]
    public async Task Signing_out_other_devices_sends_the_sessions_notice()
    {
        SkipWithoutDocker();
        var account = await _support.RegisterAsync();
        await _support.SignInAgainAsync(account);
        await _support.SignInAgainAsync(account);

        HttpResponseMessage? revoked = null;
        await _support.TrackAsync(async () => revoked = await _support.Bearer(account).PostAsync("/me/sessions/revoke-others", null, Ct));
        Assert.True(revoked!.IsSuccessStatusCode);

        var notice = Assert.Single(factory.Email.To(account.Email), e => e.Subject == "Devices were signed out of your Aptiverse account");
        Assert.Contains("2 of your devices were signed out", notice.TextBody, StringComparison.Ordinal);
        Assert.Contains($"{Base}/settings/security", notice.TextBody, StringComparison.Ordinal);
    }

    [Fact]
    public async Task A_lockout_sends_the_account_locked_notice()
    {
        SkipWithoutDocker();
        var account = await _support.RegisterAsync();
        var ip = NewIp();

        for (var attempt = 1; attempt <= 4; attempt++)
        {
            await _support.LoginAsync(account.Email, "wrong password!", ip);
        }

        var session = await _support.TrackAsync(async () => await _support.LoginAsync(account.Email, "wrong password!", ip));
        var locked = Assert.Single(MessagesOf<AccountLockedOut>(session));

        var notice = Assert.Single(factory.Email.To(account.Email), e => e.Subject == "Your Aptiverse account is temporarily locked");
        Assert.Contains(EmailFormat.When(locked.LockedUntil), notice.TextBody, StringComparison.Ordinal);
        Assert.Contains($"{Base}/forgot-password", notice.TextBody, StringComparison.Ordinal);
    }

    [Fact]
    public async Task A_redelivered_event_sends_once()
    {
        SkipWithoutDocker();
        var userId = Guid.NewGuid();
        var address = NewEmail("redelivered");
        var message = new PasswordChanged(userId, address, "Thandi", ViaReset: true, DateTimeOffset.UtcNow);

        await factory.AppHost.InvokeMessageAndWaitAsync(message);
        await factory.AppHost.InvokeMessageAndWaitAsync(message);
        await factory.AppHost.InvokeMessageAndWaitAsync(message with { });

        var email = Assert.Single(factory.Email.To(address));
        Assert.Contains("reset using a password reset link", email.TextBody, StringComparison.Ordinal);
        var delivery = Assert.Single(await DeliveriesAsync(userId));
        Assert.Equal(1, delivery.Attempts);
    }

    [Fact]
    public async Task User_supplied_names_are_html_encoded()
    {
        SkipWithoutDocker();
        var address = NewEmail("markup");
        const string name = "<img src=x onerror=alert(1)> & \"Co\"";

        await factory.AppHost.InvokeMessageAndWaitAsync(
            new AccountLockedOut(Guid.NewGuid(), address, name, DateTimeOffset.UtcNow.AddMinutes(15), DateTimeOffset.UtcNow));

        var email = Assert.Single(factory.Email.To(address));
        Assert.DoesNotContain("<img", email.HtmlBody, StringComparison.Ordinal);
        Assert.Contains("&lt;img src=x onerror=alert(1)&gt; &amp; &quot;Co&quot;", email.HtmlBody, StringComparison.Ordinal);
        Assert.Contains(name, email.TextBody, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Links_from_another_origin_are_rebuilt_and_links_without_a_token_are_not_sent()
    {
        SkipWithoutDocker();
        var address = NewEmail("origin");
        var now = DateTimeOffset.UtcNow;

        await factory.AppHost.InvokeMessageAndWaitAsync(new EmailVerificationRequested(
            Guid.NewGuid(), address, "Thandi", new Uri("https://evil.example/steal?token=abc123"), now.AddDays(2), now));
        await factory.AppHost.InvokeMessageAndWaitAsync(new PasswordResetRequested(
            Guid.NewGuid(), address, "Thandi", new Uri("https://evil.example/steal"), now.AddHours(1), now));

        var email = Assert.Single(factory.Email.To(address));
        Assert.Contains($"{Base}/verify-email?token=abc123", email.TextBody, StringComparison.Ordinal);
        Assert.DoesNotContain("evil.example", email.TextBody, StringComparison.Ordinal);
        Assert.DoesNotContain("evil.example", email.HtmlBody, StringComparison.Ordinal);
    }

    [Fact]
    public async Task A_transient_failure_is_recorded_and_the_retry_sends()
    {
        SkipWithoutDocker();
        var request = Request(NewEmail("transient"));
        factory.Email.FailNext(request.ToAddress, new EmailSendException("TooManyRequestsException", transient: true));

        await Assert.ThrowsAsync<EmailDeliveryDeferredException>(() => DispatchAsync(request));
        var pending = Assert.Single(await DeliveriesAsync(request.UserId!.Value));
        Assert.Equal(DeliveryStatuses.Queued, pending.Status);
        Assert.Equal(1, pending.Attempts);
        Assert.Equal("TooManyRequestsException", pending.LastErrorCode);
        Assert.Empty(factory.Email.To(request.ToAddress));

        Assert.Equal(EmailOutcome.Sent, await DispatchAsync(request));
        var sent = Assert.Single(await DeliveriesAsync(request.UserId.Value));
        Assert.Equal(DeliveryStatuses.Sent, sent.Status);
        Assert.Equal(2, sent.Attempts);
        Assert.Null(sent.LastErrorCode);
        Assert.Single(factory.Email.To(request.ToAddress));
    }

    [Fact]
    public async Task Transient_failures_stop_at_the_attempt_limit()
    {
        SkipWithoutDocker();
        var request = Request(NewEmail("exhausted"));
        for (var i = 0; i < 6; i++)
        {
            factory.Email.FailNext(request.ToAddress, new EmailSendException("ServiceUnavailable", transient: true));
        }

        for (var i = 0; i < 5; i++)
        {
            await Assert.ThrowsAsync<EmailDeliveryDeferredException>(() => DispatchAsync(request));
        }

        Assert.Equal(EmailOutcome.Failed, await DispatchAsync(request));
        var failed = Assert.Single(await DeliveriesAsync(request.UserId!.Value));
        Assert.Equal(DeliveryStatuses.Failed, failed.Status);
        Assert.Equal(6, failed.Attempts);
    }

    [Fact]
    public async Task A_permanent_failure_is_recorded_and_never_retried()
    {
        SkipWithoutDocker();
        var request = Request(NewEmail("permanent"));
        factory.Email.FailNext(request.ToAddress, new EmailSendException("MessageRejected", transient: false));

        Assert.Equal(EmailOutcome.Failed, await DispatchAsync(request));
        var calls = factory.Email.Calls;
        Assert.Equal(EmailOutcome.Duplicate, await DispatchAsync(request));
        Assert.Equal(calls, factory.Email.Calls);

        var failed = Assert.Single(await DeliveriesAsync(request.UserId!.Value));
        Assert.Equal(DeliveryStatuses.Failed, failed.Status);
        Assert.Equal("MessageRejected", failed.LastErrorCode);
        Assert.Empty(factory.Email.To(request.ToAddress));
    }

    [Fact]
    public async Task No_address_or_token_reaches_the_logs()
    {
        SkipWithoutDocker();
        var (account, verificationToken) = await _support.RegisterWithTokenAsync();
        await _support.TrackAsync(async () => await _support.Anonymous().PostAsJsonAsync("/auth/verify-email", new { token = verificationToken }, Ct));
        var reset = await _support.TrackAsync(async () =>
            await _support.Anonymous().PostAsJsonAsync("/auth/forgot-password", new { email = account.Email }, Ct));
        var resetToken = TokenFrom(Assert.Single(MessagesOf<PasswordResetRequested>(reset)).ResetUrl);

        // A provider failure is logged too; it must not echo the address either.
        var failing = Request(NewEmail("logged"));
        factory.Email.FailNext(failing.ToAddress, new EmailSendException("MessageRejected", transient: false));
        await DispatchAsync(failing);

        Assert.Equal(3, factory.Email.To(account.Email).Count);
        Assert.NotEmpty(factory.Logs.Mentioning(account.UserId.ToString()));
        Assert.Empty(factory.Logs.Mentioning(account.Email));
        Assert.Empty(factory.Logs.Mentioning(failing.ToAddress));
        Assert.Empty(factory.Logs.Mentioning(verificationToken));
        Assert.Empty(factory.Logs.Mentioning(Uri.EscapeDataString(verificationToken)));
        Assert.Empty(factory.Logs.Mentioning(resetToken));
        Assert.Empty(factory.Logs.Mentioning(Uri.EscapeDataString(resetToken)));
    }

    private static EmailRequest Request(string address) => new(
        Guid.NewGuid(),
        EmailTemplates.PasswordChanged,
        Guid.NewGuid(),
        address,
        "Thandi",
        new Dictionary<string, string>
        {
            ["name"] = "Thandi",
            ["changed_at"] = EmailFormat.When(DateTimeOffset.UtcNow),
            ["via_reset"] = "false",
            ["reset_link"] = $"{Base}/forgot-password",
        });

    private async Task<EmailOutcome> DispatchAsync(EmailRequest request)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        return await scope.ServiceProvider.GetRequiredService<EmailDispatcher>().SendAsync(request, Ct);
    }

    private async Task<List<EmailDelivery>> DeliveriesAsync(Guid userId)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        return await scope.ServiceProvider.GetRequiredService<NotificationsDbContext>().Deliveries
            .AsNoTracking()
            .Where(d => d.UserId == userId)
            .ToListAsync(Ct);
    }
}
