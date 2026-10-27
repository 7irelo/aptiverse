using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Domain;
using Microsoft.EntityFrameworkCore;
using static Aptiverse.IntegrationTests.IdentityTestSupport;

namespace Aptiverse.IntegrationTests;

/// <summary>Sign-up, sign-in, tokens and recovery through the real API, tokens and Postgres.</summary>
[Collection(ApiTestGroup.Name)]
public sealed class IdentityAuthTests(ApiFactory factory)
{
    private readonly IdentityTestSupport _support = new(factory);

    private void SkipWithoutDocker() => Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);

    [Fact]
    public async Task Register_verify_login_refresh_and_logout_work_end_to_end()
    {
        SkipWithoutDocker();
        var (account, verificationToken) = await _support.RegisterWithTokenAsync();

        // The register tokens work at once and the API sets no cookies.
        var me = await _support.MeAsync(account);
        Assert.False(me.GetProperty("emailConfirmed").GetBoolean());
        Assert.True(me.GetProperty("onboarding").GetProperty("required").GetBoolean());

        var verify = await _support.Anonymous().PostAsJsonAsync("/auth/verify-email", new { token = verificationToken }, Ct);
        Assert.Equal(HttpStatusCode.NoContent, verify.StatusCode);
        Assert.True((await _support.MeAsync(account)).GetProperty("emailConfirmed").GetBoolean());
        var reused = await _support.Anonymous().PostAsJsonAsync("/auth/verify-email", new { token = verificationToken }, Ct);
        Assert.Equal(HttpStatusCode.BadRequest, reused.StatusCode);
        Assert.Equal("identity.token_invalid", await ProblemCodeAsync(reused));

        var login = await _support.LoginAsync(account.Email.ToUpperInvariant(), Password);
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        Assert.False(login.Headers.Contains("Set-Cookie"));
        Assert.Equal("no-store", login.Headers.CacheControl?.ToString());
        var signedIn = await AccountFromAsync(login, account.Email, Password, account.Ip);

        var refresh = await _support.RefreshAsync(signedIn.RefreshToken);
        Assert.Equal(HttpStatusCode.OK, refresh.StatusCode);
        var rotated = await AccountFromAsync(refresh, account.Email, Password, account.Ip);
        Assert.NotEqual(signedIn.RefreshToken, rotated.RefreshToken);
        Assert.Equal(HttpStatusCode.OK, await _support.MeStatusAsync(rotated.AccessToken));

        var logout = await _support.Bearer(rotated).PostAsync("/auth/logout", null, Ct);
        Assert.Equal(HttpStatusCode.NoContent, logout.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, await _support.MeStatusAsync(rotated.AccessToken));
        Assert.Equal(HttpStatusCode.Unauthorized, (await _support.RefreshAsync(rotated.RefreshToken)).StatusCode);

        // The register session is a different device and keeps working.
        Assert.Equal(HttpStatusCode.OK, await _support.MeStatusAsync(account.AccessToken));

        await _support.WithDbAsync(async db =>
        {
            var types = await db.SecurityEvents.Where(e => e.UserId == account.UserId).Select(e => e.Type).ToListAsync(Ct);
            Assert.Contains(SecurityEventTypes.Registered, types);
            Assert.Contains(SecurityEventTypes.EmailVerified, types);
            Assert.Contains(SecurityEventTypes.LoginSucceeded, types);
            Assert.Contains(SecurityEventTypes.Logout, types);
            var details = await db.SecurityEvents.Where(e => e.UserId == account.UserId).Select(e => e.Detail ?? string.Empty).ToListAsync(Ct);
            Assert.DoesNotContain(details, d => d.Contains(Password, StringComparison.Ordinal) || d.Contains(rotated.RefreshToken, StringComparison.Ordinal));

            // Tokens are stored hashed only.
            Assert.False(await db.RefreshTokens.AnyAsync(t => t.TokenHash == rotated.RefreshToken, Ct));
            Assert.False(await db.OneTimeTokens.AnyAsync(t => t.TokenHash == verificationToken, Ct));
        });
    }

    [Fact]
    public async Task Register_records_consent_and_publishes_the_welcome_events()
    {
        SkipWithoutDocker();
        var email = NewEmail();
        var legal = await _support.LegalVersionsAsync();
        HttpResponseMessage? response = null;
        var session = await _support.TrackAsync(async () => response = await _support.Anonymous().PostAsJsonAsync("/auth/register", new
        {
            name = "Lerato",
            email,
            password = Password,
            role = "parent",
            acceptedTermsVersion = legal.GetProperty("termsVersion").GetString(),
            acceptedPrivacyVersion = legal.GetProperty("privacyVersion").GetString(),
            marketingEmails = true,
        }, Ct));

        Assert.Equal(HttpStatusCode.Created, response!.StatusCode);
        var account = await AccountFromAsync(response, email, Password, NewIp());
        var registered = Assert.Single(MessagesOf<UserRegistered>(session), m => m.UserId == account.UserId);
        Assert.Equal("parent", registered.Role);
        Assert.EndsWith("@example.test", registered.Email, StringComparison.Ordinal);
        Assert.Single(MessagesOf<EmailVerificationRequested>(session), m => m.UserId == account.UserId);

        await _support.WithDbAsync(async db =>
        {
            var consents = await db.UserConsents.Where(c => c.UserId == account.UserId).OrderBy(c => c.DocumentKey).ToListAsync(Ct);
            Assert.Equal(["marketing_email", "privacy", "terms"], consents.Select(c => c.DocumentKey));
            Assert.All(consents, c => Assert.Equal("register", c.Source));
        });

        var duplicate = await _support.Anonymous().PostAsJsonAsync("/auth/register", new
        {
            name = "Lerato",
            email = email.ToUpperInvariant(),
            password = Password,
            role = "parent",
            acceptedTermsVersion = legal.GetProperty("termsVersion").GetString(),
            acceptedPrivacyVersion = legal.GetProperty("privacyVersion").GetString(),
        }, Ct);
        Assert.Equal(HttpStatusCode.Conflict, duplicate.StatusCode);
        Assert.Equal("identity.email_taken", await ProblemCodeAsync(duplicate));

        var outdated = await _support.Anonymous().PostAsJsonAsync("/auth/register", new
        {
            name = "Lerato",
            email = NewEmail(),
            password = Password,
            role = "parent",
            acceptedTermsVersion = "1999-01-01",
            acceptedPrivacyVersion = legal.GetProperty("privacyVersion").GetString(),
        }, Ct);
        Assert.Equal(HttpStatusCode.Conflict, outdated.StatusCode);
        Assert.Equal("identity.consent_outdated", await ProblemCodeAsync(outdated));
    }

    [Theory]
    [InlineData("admin", "a valid password", "role")]
    [InlineData("student", "short", "password")]
    [InlineData("student", "x@example.test", "password")]
    public async Task Register_rejects_invalid_input(string role, string password, string field)
    {
        SkipWithoutDocker();
        var legal = await _support.LegalVersionsAsync();
        var response = await _support.Anonymous().PostAsJsonAsync("/auth/register", new
        {
            name = "Test",
            email = "x@example.test",
            password,
            role,
            acceptedTermsVersion = legal.GetProperty("termsVersion").GetString(),
            acceptedPrivacyVersion = legal.GetProperty("privacyVersion").GetString(),
        }, Ct);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        using var json = await ReadJsonAsync(response);
        Assert.True(json.RootElement.GetProperty("errors").TryGetProperty(char.ToUpperInvariant(field[0]) + field[1..], out _)
            || json.RootElement.GetProperty("errors").TryGetProperty(field, out _));
    }

    [Fact]
    public async Task Oversized_and_malformed_bodies_are_refused()
    {
        SkipWithoutDocker();
        var big = await _support.Anonymous().PostAsJsonAsync("/auth/login", new { email = "a@b.co", password = new string('x', 9000) }, Ct);
        // 413 where the server enforces the 8 KB body limit; the test server does not, so the 128 character cap answers.
        Assert.True(big.StatusCode is HttpStatusCode.RequestEntityTooLarge or HttpStatusCode.BadRequest, big.StatusCode.ToString());

        var badEmail = await _support.Anonymous().PostAsJsonAsync("/auth/forgot-password", new { email = new string('a', 300) }, Ct);
        Assert.Equal(HttpStatusCode.BadRequest, badEmail.StatusCode);

        var badToken = await _support.Anonymous().PostAsJsonAsync("/auth/refresh", new { refreshToken = "not-a-token" }, Ct);
        Assert.Equal(HttpStatusCode.BadRequest, badToken.StatusCode);
    }

    [Fact]
    public async Task Reusing_a_refresh_token_revokes_the_whole_family()
    {
        SkipWithoutDocker();
        var account = await _support.RegisterAsync();
        var first = await _support.RefreshAsync(account.RefreshToken);
        Assert.Equal(HttpStatusCode.OK, first.StatusCode);
        var rotated = await AccountFromAsync(first, account.Email, Password, account.Ip);

        // The old token again: treated as theft.
        var replay = await _support.RefreshAsync(account.RefreshToken);
        Assert.Equal(HttpStatusCode.Unauthorized, replay.StatusCode);
        Assert.Equal("identity.refresh_token_invalid", await ProblemCodeAsync(replay));

        // The legitimate holder's newer token and access token die with the family.
        Assert.Equal(HttpStatusCode.Unauthorized, (await _support.RefreshAsync(rotated.RefreshToken)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, await _support.MeStatusAsync(rotated.AccessToken));

        await _support.WithDbAsync(async db =>
        {
            Assert.True(await db.SecurityEvents.AnyAsync(e => e.UserId == account.UserId && e.Type == SecurityEventTypes.RefreshReuseDetected, Ct));
            var session = await db.Sessions.SingleAsync(s => s.UserId == account.UserId, Ct);
            Assert.Equal(RevocationReasons.RefreshReuse, session.RevokedReason);
            Assert.False(await db.RefreshTokens.AnyAsync(t => t.SessionId == session.Id && t.RevokedAt == null, Ct));
        });
    }

    [Fact]
    public async Task Lockout_and_rate_limits_answer_with_the_same_429()
    {
        SkipWithoutDocker();
        var account = await _support.RegisterAsync();
        var unknown = NewEmail("nobody");
        var ip = NewIp();

        for (var attempt = 1; attempt <= 4; attempt++)
        {
            Assert.Equal(HttpStatusCode.Unauthorized, (await _support.LoginAsync(account.Email, "wrong password!", ip)).StatusCode);
            var miss = await _support.LoginAsync(unknown, "wrong password!", ip);
            Assert.Equal(HttpStatusCode.Unauthorized, miss.StatusCode);
            Assert.Equal("identity.invalid_credentials", await ProblemCodeAsync(miss));
        }

        // The fifth failure locks the real account and blocks the unknown email at the same attempt.
        Assert.Equal(HttpStatusCode.TooManyRequests, (await _support.LoginAsync(account.Email, "wrong password!", ip)).StatusCode);
        Assert.Equal(HttpStatusCode.TooManyRequests, (await _support.LoginAsync(unknown, "wrong password!", ip)).StatusCode);

        // Even the right password is refused while locked, with the same answer as the unknown email.
        var locked = await _support.LoginAsync(account.Email, Password, ip);
        var blocked = await _support.LoginAsync(unknown, Password, ip);
        var lockedBody = await AssertTooManyAsync(locked);
        var blockedBody = await AssertTooManyAsync(blocked);
        Assert.Equal(Shape(lockedBody), Shape(blockedBody));

        // An IP rate limit rejection has the same shape.
        var limitedIp = NewIp();
        HttpResponseMessage? limited = null;
        for (var i = 0; i < 40 && limited?.StatusCode != HttpStatusCode.TooManyRequests; i++)
        {
            limited = await _support.Anonymous(limitedIp).PostAsJsonAsync("/auth/login", new { email = string.Empty, password = string.Empty }, Ct);
        }

        Assert.Equal(Shape(lockedBody), Shape(await AssertTooManyAsync(limited!)));

        await _support.WithDbAsync(async db =>
        {
            Assert.True(await db.SecurityEvents.AnyAsync(e => e.UserId == account.UserId && e.Type == SecurityEventTypes.Lockout, Ct));
            Assert.True(await db.SecurityEvents.AnyAsync(e => e.UserId == null && e.Type == SecurityEventTypes.LoginFailed, Ct));
        });
    }

    [Fact]
    public async Task Forgot_password_does_not_reveal_whether_an_account_exists()
    {
        SkipWithoutDocker();
        var account = await _support.RegisterAsync();
        var unknown = NewEmail("ghost");

        HttpResponseMessage? real = null;
        HttpResponseMessage? missing = null;
        var realSession = await _support.TrackAsync(async () =>
            real = await _support.Anonymous().PostAsJsonAsync("/auth/forgot-password", new { email = account.Email }, Ct));
        var missingSession = await _support.TrackAsync(async () =>
            missing = await _support.Anonymous().PostAsJsonAsync("/auth/forgot-password", new { email = unknown }, Ct));

        Assert.Equal(HttpStatusCode.Accepted, real!.StatusCode);
        Assert.Equal(real.StatusCode, missing!.StatusCode);
        Assert.Equal(await real.Content.ReadAsStringAsync(Ct), await missing.Content.ReadAsStringAsync(Ct));
        Assert.Equal(real.Content.Headers.ContentType, missing.Content.Headers.ContentType);
        Assert.Equal(real.Headers.Select(h => h.Key).Order(), missing.Headers.Select(h => h.Key).Order());

        Assert.Single(MessagesOf<PasswordResetRequested>(realSession), m => m.UserId == account.UserId);
        Assert.Empty(MessagesOf<PasswordResetRequested>(missingSession));
    }

    [Fact]
    public async Task Resend_verification_gives_the_same_answer_for_any_address()
    {
        SkipWithoutDocker();
        var account = await _support.RegisterAsync();
        var real = await _support.Anonymous().PostAsJsonAsync("/auth/verify-email/resend", new { email = account.Email }, Ct);
        var missing = await _support.Anonymous().PostAsJsonAsync("/auth/verify-email/resend", new { email = NewEmail("ghost") }, Ct);
        Assert.Equal(HttpStatusCode.Accepted, real.StatusCode);
        Assert.Equal(real.StatusCode, missing.StatusCode);
        Assert.Equal(await real.Content.ReadAsStringAsync(Ct), await missing.Content.ReadAsStringAsync(Ct));

        var anonymousWithoutEmail = await _support.Anonymous().PostAsJsonAsync("/auth/verify-email/resend", new { }, Ct);
        Assert.Equal(HttpStatusCode.BadRequest, anonymousWithoutEmail.StatusCode);
    }

    [Fact]
    public async Task Resetting_the_password_signs_out_every_session()
    {
        SkipWithoutDocker();
        var account = await _support.RegisterAsync();
        var otherDevice = await _support.SignInAgainAsync(account);

        HttpResponseMessage? forgot = null;
        var session = await _support.TrackAsync(async () =>
            forgot = await _support.Anonymous().PostAsJsonAsync("/auth/forgot-password", new { email = account.Email }, Ct));
        Assert.Equal(HttpStatusCode.Accepted, forgot!.StatusCode);
        var token = TokenFrom(Assert.Single(MessagesOf<PasswordResetRequested>(session)).ResetUrl);

        var weak = await _support.Anonymous().PostAsJsonAsync("/auth/reset-password", new { token, newPassword = "short" }, Ct);
        Assert.Equal(HttpStatusCode.BadRequest, weak.StatusCode);

        const string newPassword = "a brand new passphrase";
        HttpResponseMessage? reset = null;
        var resetSession = await _support.TrackAsync(async () =>
            reset = await _support.Anonymous().PostAsJsonAsync("/auth/reset-password", new { token, newPassword }, Ct));
        Assert.Equal(HttpStatusCode.NoContent, reset!.StatusCode);
        var changed = Assert.Single(MessagesOf<PasswordChanged>(resetSession));
        Assert.True(changed.ViaReset);
        Assert.Equal(2, Assert.Single(MessagesOf<SessionsRevoked>(resetSession)).SessionIds.Count);

        foreach (var device in new[] { account, otherDevice })
        {
            Assert.Equal(HttpStatusCode.Unauthorized, await _support.MeStatusAsync(device.AccessToken));
            Assert.Equal(HttpStatusCode.Unauthorized, (await _support.RefreshAsync(device.RefreshToken)).StatusCode);
        }

        var again = await _support.Anonymous().PostAsJsonAsync("/auth/reset-password", new { token, newPassword = "yet another passphrase" }, Ct);
        Assert.Equal(HttpStatusCode.BadRequest, again.StatusCode);
        Assert.Equal("identity.token_invalid", await ProblemCodeAsync(again));

        Assert.Equal(HttpStatusCode.Unauthorized, (await _support.LoginAsync(account.Email, Password)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await _support.LoginAsync(account.Email, newPassword)).StatusCode);
    }

    [Fact]
    public async Task Google_sign_in_refuses_unknown_accounts_and_links_verified_ones()
    {
        SkipWithoutDocker();
        var unknown = await _support.Anonymous().PostAsJsonAsync(
            "/auth/google", new { idToken = StubGoogleTokenValidator.Token("sub-unknown", NewEmail("google")) }, Ct);
        Assert.Equal(HttpStatusCode.NotFound, unknown.StatusCode);
        Assert.Equal("identity.account_not_found", await ProblemCodeAsync(unknown));

        var invalid = await _support.Anonymous().PostAsJsonAsync("/auth/google", new { idToken = "forged" }, Ct);
        Assert.Equal(HttpStatusCode.Unauthorized, invalid.StatusCode);
        Assert.Equal("identity.google_token_invalid", await ProblemCodeAsync(invalid));

        var down = await _support.Anonymous().PostAsJsonAsync("/auth/google", new { idToken = "down" }, Ct);
        Assert.Equal(HttpStatusCode.ServiceUnavailable, down.StatusCode);

        var account = await _support.RegisterAsync();
        var subject = $"sub-{Guid.NewGuid():N}";
        var unverified = await _support.Anonymous().PostAsJsonAsync(
            "/auth/google", new { idToken = StubGoogleTokenValidator.Token(subject, account.Email, verified: false) }, Ct);
        Assert.Equal(HttpStatusCode.Conflict, unverified.StatusCode);
        Assert.Equal("identity.google_email_unverified", await ProblemCodeAsync(unverified));

        var linked = await _support.Anonymous().PostAsJsonAsync(
            "/auth/google", new { idToken = StubGoogleTokenValidator.Token(subject, account.Email.ToLowerInvariant()) }, Ct);
        Assert.Equal(HttpStatusCode.OK, linked.StatusCode);
        var google = await AccountFromAsync(linked, account.Email, Password, NewIp());
        Assert.Equal(account.UserId, google.UserId);

        // Linking signs out the password session, in case someone else was using it.
        Assert.Equal(HttpStatusCode.Unauthorized, await _support.MeStatusAsync(account.AccessToken));
        var me = await _support.Bearer(google.AccessToken).GetAsync("/me", Ct);
        using var json = await ReadJsonAsync(me);
        Assert.True(json.RootElement.GetProperty("emailConfirmed").GetBoolean());

        // The linked subject signs in again without touching the email.
        var again = await _support.Anonymous().PostAsJsonAsync(
            "/auth/google", new { idToken = StubGoogleTokenValidator.Token(subject, "changed@example.test") }, Ct);
        Assert.Equal(HttpStatusCode.OK, again.StatusCode);
    }

    private static async Task<JsonElement> AssertTooManyAsync(HttpResponseMessage response)
    {
        Assert.Equal(HttpStatusCode.TooManyRequests, response.StatusCode);
        Assert.True(response.Headers.RetryAfter?.Delta > TimeSpan.Zero, "Retry-After must be present.");
        using var json = await ReadJsonAsync(response);
        var body = json.RootElement.Clone();
        Assert.Equal("identity.too_many_attempts", body.GetProperty("code").GetString());
        Assert.True(body.GetProperty("retryAfterSeconds").GetInt32() > 0);
        Assert.False(string.IsNullOrEmpty(body.GetProperty("traceId").GetString()));
        return body;
    }

    /// <summary>The body without the per-request values (trace id, seconds left), for comparing shapes.</summary>
    private static string Shape(JsonElement body) => string.Join(
        ";",
        body.EnumerateObject()
            .Where(p => p.Name is not "traceId" and not "retryAfterSeconds")
            .OrderBy(p => p.Name, StringComparer.Ordinal)
            .Select(p => $"{p.Name}={p.Value}")
            .Append("keys=" + string.Join(",", body.EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal))));
}
