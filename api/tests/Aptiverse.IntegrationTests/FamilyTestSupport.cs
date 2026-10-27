using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using Aptiverse.Family.Persistence;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Wolverine.Tracking;

namespace Aptiverse.IntegrationTests;

/// <summary>A person with a client signed in as them.</summary>
internal sealed record FamilyUser(Guid UserId, string Email, HttpClient Client);

/// <summary>Seeds parents and students through Identity and links them through the real Family routes.</summary>
internal sealed partial class FamilyTestSupport(ApiFactory factory)
{
    public const string ConsentVersion = "2026-10-28";

    public static CancellationToken Ct => TestContext.Current.CancellationToken;

    public RecordingEmailSender Email => factory.Email;

    public Task<FamilyUser> ParentAsync(bool verified = true, string name = "Pat Parent") => SeedAsync("parent", verified, null, name);

    /// <summary>A student; with an age they get a date of birth (under 18 is a minor).</summary>
    public Task<FamilyUser> StudentAsync(int? ageYears = 20, bool verified = true, string name = "Sam Student") => SeedAsync("student", verified, ageYears, name);

    public static async Task<string> CodeAsync(FamilyUser student)
    {
        var response = await student.Client.PostAsync("/family/link-codes", null, Ct);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        using var json = await ReadJsonAsync(response);
        return json.RootElement.GetProperty("code").GetString()!;
    }

    public static Task<HttpResponseMessage> RedeemAsync(FamilyUser parent, string code, string relationship = "mother") =>
        parent.Client.PostAsJsonAsync("/family/link-codes/redeem", new { code, relationship }, Ct);

    /// <summary>Links the two through a link code and returns the link id.</summary>
    public static async Task<Guid> LinkAsync(FamilyUser parent, FamilyUser student)
    {
        var response = await RedeemAsync(parent, await CodeAsync(student));
        Assert.True(response.StatusCode == HttpStatusCode.OK, await response.Content.ReadAsStringAsync(Ct));
        using var json = await ReadJsonAsync(response);
        return json.RootElement.GetProperty("linkId").GetGuid();
    }

    /// <summary>Sends an invite and waits for its email, returning the token from the emailed link.</summary>
    public async Task<(HttpResponseMessage Response, string? Token)> InviteAsync(FamilyUser parent, string email)
    {
        HttpResponseMessage? response = null;
        await TrackAsync(async () => response = await parent.Client.PostAsJsonAsync("/family/invites", new { email, relationship = "father" }, Ct));
        var sent = factory.Email.To(email).LastOrDefault(e => e.Subject.Contains("invited you", StringComparison.Ordinal));
        return (response!, sent is null ? null : TokenIn().Match(sent.TextBody).Groups[1].Value);
    }

    public async Task<ITrackedSession> TrackAsync(Func<Task> action) =>
        await factory.AppHost.ExecuteAndWaitAsync(action, timeoutInMilliseconds: 30_000);

    public async Task WithDbAsync(Func<FamilyDbContext, Task> work)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        await work(scope.ServiceProvider.GetRequiredService<FamilyDbContext>());
    }

    public async Task<T> WithDbAsync<T>(Func<FamilyDbContext, Task<T>> work)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        return await work(scope.ServiceProvider.GetRequiredService<FamilyDbContext>());
    }

    public static async Task<JsonDocument> ReadJsonAsync(HttpResponseMessage response) =>
        JsonDocument.Parse(await response.Content.ReadAsStringAsync(Ct));

    public static async Task<string> ProblemCodeAsync(HttpResponseMessage response)
    {
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        using var json = await ReadJsonAsync(response);
        return json.RootElement.GetProperty("code").GetString()!;
    }

    private async Task<FamilyUser> SeedAsync(string role, bool verified, int? ageYears, string name)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();
        var email = $"{role}-{Guid.NewGuid():N}@example.test";
        var user = User.Create(email, email.ToUpperInvariant(), name, emailConfirmed: verified);
        user.AddRole(role);
        if (ageYears is { } age)
        {
            user.SetDateOfBirth(DateOnly.FromDateTime(DateTime.UtcNow.Date).AddYears(-age).AddDays(-10));
        }

        db.Users.Add(user);
        await db.SaveChangesAsync(Ct);
        return new FamilyUser(user.Id, email, factory.CreateUserClient(user.Id, role));
    }

    [GeneratedRegex(@"token=([A-Za-z0-9_\-]+)")]
    private static partial Regex TokenIn();
}
