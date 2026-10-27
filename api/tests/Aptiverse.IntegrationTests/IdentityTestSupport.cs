using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Wolverine.Tracking;

namespace Aptiverse.IntegrationTests;

/// <summary>A registered account with its current tokens.</summary>
internal sealed record Account(Guid UserId, string Email, string Password, string AccessToken, string RefreshToken, string Ip);

/// <summary>
/// Drives the identity routes with real tokens. Every account gets its own client address, so the per-IP auth limits
/// of one test never trip another.
/// </summary>
internal sealed class IdentityTestSupport(ApiFactory factory)
{
    public const string Password = "correct horse battery staple";

    private static int _ipCounter;

    public static CancellationToken Ct => TestContext.Current.CancellationToken;

    public static string NewIp()
    {
        var n = Interlocked.Increment(ref _ipCounter);
        return $"10.{(n >> 16) & 255}.{(n >> 8) & 255}.{n & 255}";
    }

    public static string NewEmail(string prefix = "user") => $"{prefix}-{Guid.NewGuid():N}@Example.test";

    /// <summary>An anonymous client presenting the given client address.</summary>
    public HttpClient Anonymous(string? ip = null)
    {
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add(TestClientIpStartupFilter.Header, ip ?? NewIp());
        return client;
    }

    /// <summary>A client sending the access token as a bearer token.</summary>
    public HttpClient Bearer(string accessToken, string? ip = null)
    {
        var client = Anonymous(ip);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        return client;
    }

    public HttpClient Bearer(Account account) => Bearer(account.AccessToken, account.Ip);

    public async Task<JsonElement> LegalVersionsAsync()
    {
        using var json = await ReadJsonAsync(await Anonymous().GetAsync("/legal/versions", Ct));
        return json.RootElement.Clone();
    }

    /// <summary>Registers through the API and returns the account plus the verification link's token.</summary>
    public async Task<(Account Account, string VerificationToken)> RegisterWithTokenAsync(string role = "student", string? email = null)
    {
        email ??= NewEmail(role);
        var ip = NewIp();
        var legal = await LegalVersionsAsync();
        HttpResponseMessage? response = null;
        var session = await factory.AppHost.ExecuteAndWaitAsync(
            async () => response = await Anonymous(ip).PostAsJsonAsync("/auth/register", new
            {
                name = "Thandi Test",
                email,
                password = Password,
                role,
                acceptedTermsVersion = legal.GetProperty("termsVersion").GetString(),
                acceptedPrivacyVersion = legal.GetProperty("privacyVersion").GetString(),
            }, Ct),
            timeoutInMilliseconds: 30_000);

        Assert.Equal(HttpStatusCode.Created, response!.StatusCode);
        var account = await AccountFromAsync(response, email, Password, ip);
        var verification = Assert.Single(MessagesOf<EmailVerificationRequested>(session), m => m.UserId == account.UserId);
        return (account, TokenFrom(verification.VerificationUrl));
    }

    public async Task<Account> RegisterAsync(string role = "student", string? email = null) => (await RegisterWithTokenAsync(role, email)).Account;

    public async Task<HttpResponseMessage> LoginAsync(string email, string password, string? ip = null) =>
        await Anonymous(ip).PostAsJsonAsync("/auth/login", new { email, password }, Ct);

    /// <summary>A second session for the same account, as from another device.</summary>
    public async Task<Account> SignInAgainAsync(Account account)
    {
        var ip = NewIp();
        var response = await LoginAsync(account.Email, account.Password, ip);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return await AccountFromAsync(response, account.Email, account.Password, ip);
    }

    public async Task<HttpResponseMessage> RefreshAsync(string refreshToken, string? ip = null) =>
        await Anonymous(ip).PostAsJsonAsync("/auth/refresh", new { refreshToken }, Ct);

    public async Task<HttpStatusCode> MeStatusAsync(string accessToken) =>
        (await Bearer(accessToken).GetAsync("/me", Ct)).StatusCode;

    public async Task<JsonElement> MeAsync(Account account)
    {
        var response = await Bearer(account).GetAsync("/me", Ct);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        using var json = await ReadJsonAsync(response);
        return json.RootElement.Clone();
    }

    public async Task WithDbAsync(Func<IdentityDbContext, Task> action)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        await action(scope.ServiceProvider.GetRequiredService<IdentityDbContext>());
    }

    public async Task<ITrackedSession> TrackAsync(Func<Task> action) =>
        await factory.AppHost.ExecuteAndWaitAsync(action, timeoutInMilliseconds: 30_000);

    public static async Task<Account> AccountFromAsync(HttpResponseMessage response, string email, string password, string ip)
    {
        using var json = await ReadJsonAsync(response);
        var root = json.RootElement;
        return new Account(
            root.GetProperty("user").GetProperty("id").GetGuid(),
            email,
            password,
            root.GetProperty("accessToken").GetString()!,
            root.GetProperty("refreshToken").GetString()!,
            ip);
    }

    public static string TokenFrom(Uri link)
    {
        ArgumentNullException.ThrowIfNull(link);
        var query = link.Query.TrimStart('?').Split('&').Select(p => p.Split('=', 2)).Single(p => p[0] == "token");
        return Uri.UnescapeDataString(query[1]);
    }

    public static List<T> MessagesOf<T>(ITrackedSession session) =>
        session.AllRecordsInOrder()
            .Select(r => r.Envelope?.Message)
            .OfType<T>()
            .DistinctBy(m => m)
            .ToList();

    public static async Task<JsonDocument> ReadJsonAsync(HttpResponseMessage response) =>
        JsonDocument.Parse(await response.Content.ReadAsStringAsync(Ct));

    public static async Task<string> ProblemCodeAsync(HttpResponseMessage response)
    {
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        using var json = await ReadJsonAsync(response);
        return json.RootElement.GetProperty("code").GetString()!;
    }
}
