using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Domain;
using Microsoft.EntityFrameworkCore;
using Wolverine.Tracking;
using static Aptiverse.IntegrationTests.IdentityTestSupport;

namespace Aptiverse.IntegrationTests;

/// <summary>The signed-in account: profile, sessions, onboarding, password, consents and deletion.</summary>
[Collection(ApiTestGroup.Name)]
public sealed class IdentityMeTests(ApiFactory factory)
{
    private readonly IdentityTestSupport _support = new(factory);

    private static DateOnly Today => DateOnly.FromDateTime(TimeProvider.System.GetUtcNow().UtcDateTime);

    private void SkipWithoutDocker() => Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);

    [Fact]
    public async Task Me_lists_permissions_derived_from_roles()
    {
        SkipWithoutDocker();
        var student = await _support.MeAsync(await _support.RegisterAsync("student"));
        Assert.Equal(["student"], Strings(student.GetProperty("roles")));
        Assert.Equal("student", student.GetProperty("primaryRole").GetString());
        var studentPermissions = Strings(student.GetProperty("permissions"));
        Assert.Contains("account.manage", studentPermissions);
        Assert.Contains("practice.generate", studentPermissions);
        Assert.DoesNotContain("audit.read", studentPermissions);
        Assert.Empty(student.GetProperty("entitlements").EnumerateArray());
        Assert.Equal(JsonValueKind.Null, student.GetProperty("isMinor").ValueKind);
        Assert.True(student.GetProperty("hasPassword").GetBoolean());
        Assert.False(student.GetProperty("consent").GetProperty("reconsentRequired").GetBoolean());

        var parent = await _support.MeAsync(await _support.RegisterAsync("parent"));
        Assert.Equal(["account.manage", "notifications.read"], Strings(parent.GetProperty("permissions")));
        Assert.False(parent.GetProperty("isMinor").GetBoolean());

        Assert.Equal(HttpStatusCode.Unauthorized, (await _support.Anonymous().GetAsync("/me", Ct)).StatusCode);
    }

    [Fact]
    public async Task Sessions_can_be_listed_and_revoked_one_by_one_or_all_others()
    {
        SkipWithoutDocker();
        var phone = await _support.RegisterAsync();
        var laptop = await _support.SignInAgainAsync(phone);
        var tablet = await _support.SignInAgainAsync(phone);

        var list = await _support.Bearer(phone).GetAsync("/me/sessions", Ct);
        Assert.Equal(HttpStatusCode.OK, list.StatusCode);
        using var json = await ReadJsonAsync(list);
        var sessions = json.RootElement.EnumerateArray().ToList();
        Assert.Equal(3, sessions.Count);
        Assert.Single(sessions, s => s.GetProperty("current").GetBoolean());
        var laptopId = await SessionIdAsync(laptop);

        // Another user's session id is simply not found.
        var stranger = await _support.RegisterAsync();
        var foreign = await _support.Bearer(stranger).DeleteAsync($"/me/sessions/{laptopId}", Ct);
        Assert.Equal(HttpStatusCode.NotFound, foreign.StatusCode);
        Assert.Equal("identity.session_not_found", await ProblemCodeAsync(foreign));

        Assert.Equal(HttpStatusCode.NoContent, (await _support.Bearer(phone).DeleteAsync($"/me/sessions/{laptopId}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await _support.Bearer(phone).DeleteAsync($"/me/sessions/{laptopId}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, await _support.MeStatusAsync(laptop.AccessToken));
        Assert.Equal(HttpStatusCode.Unauthorized, (await _support.RefreshAsync(laptop.RefreshToken)).StatusCode);

        var others = await _support.Bearer(phone).PostAsync("/me/sessions/revoke-others", null, Ct);
        Assert.Equal(HttpStatusCode.OK, others.StatusCode);
        using var revoked = await ReadJsonAsync(others);
        Assert.Equal(1, revoked.RootElement.GetProperty("revoked").GetInt32());
        Assert.Equal(HttpStatusCode.Unauthorized, (await _support.RefreshAsync(tablet.RefreshToken)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, await _support.MeStatusAsync(phone.AccessToken));
        Assert.Equal(HttpStatusCode.OK, (await _support.RefreshAsync(phone.RefreshToken)).StatusCode);

        await _support.WithDbAsync(async db =>
            Assert.True(await db.SecurityEvents.CountAsync(e => e.UserId == phone.UserId && e.Type == SecurityEventTypes.SessionRevoked, Ct) >= 2));
    }

    [Fact]
    public async Task Changing_the_password_needs_the_current_one_and_signs_out_other_devices()
    {
        SkipWithoutDocker();
        var account = await _support.RegisterAsync();
        var other = await _support.SignInAgainAsync(account);

        var wrong = await _support.Bearer(account).PostAsJsonAsync("/me/password", new { currentPassword = "not my password", newPassword = "a whole new phrase" }, Ct);
        Assert.Equal(HttpStatusCode.Unauthorized, wrong.StatusCode);
        Assert.Equal("identity.invalid_credentials", await ProblemCodeAsync(wrong));

        HttpResponseMessage? changed = null;
        var session = await _support.TrackAsync(async () => changed = await _support.Bearer(account).PostAsJsonAsync(
            "/me/password", new { currentPassword = Password, newPassword = "a whole new phrase" }, Ct));
        Assert.Equal(HttpStatusCode.NoContent, changed!.StatusCode);
        Assert.False(Assert.Single(MessagesOf<PasswordChanged>(session)).ViaReset);

        Assert.Equal(HttpStatusCode.OK, await _support.MeStatusAsync(account.AccessToken));
        Assert.Equal(HttpStatusCode.Unauthorized, await _support.MeStatusAsync(other.AccessToken));
        Assert.Equal(HttpStatusCode.OK, (await _support.LoginAsync(account.Email, "a whole new phrase")).StatusCode);
    }

    [Fact]
    public async Task A_high_school_student_onboards_through_drafts_and_the_date_of_birth_is_set_once()
    {
        SkipWithoutDocker();
        var account = await _support.RegisterAsync();
        var client = _support.Bearer(account);

        var level = await client.PutAsJsonAsync("/me/onboarding/level", new { educationLevel = "high_school" }, Ct);
        Assert.Equal(HttpStatusCode.OK, level.StatusCode);
        var etag = level.Headers.ETag!.Tag;
        using (var json = await ReadJsonAsync(level))
        {
            Assert.Equal(["grade", "curriculum", "institutionName", "dateOfBirth"], Strings(json.RootElement.GetProperty("missing")));
        }

        var mismatch = await client.PutAsJsonAsync("/me/onboarding/details", new { studyLevel = "honours" }, Ct);
        Assert.Equal(HttpStatusCode.BadRequest, mismatch.StatusCode);
        Assert.Equal("identity.stage_mismatch", await ProblemCodeAsync(mismatch));

        var dob = Today.AddYears(-16);
        using var details = new HttpRequestMessage(HttpMethod.Put, "/me/onboarding/details")
        {
            Content = JsonContent.Create(new { grade = 11, curriculum = "ieb", institutionName = "Parktown High", dateOfBirth = dob }),
        };
        details.Headers.TryAddWithoutValidation("If-Match", etag);
        var saved = await client.SendAsync(details, Ct);
        Assert.Equal(HttpStatusCode.OK, saved.StatusCode);
        using (var json = await ReadJsonAsync(saved))
        {
            Assert.Empty(json.RootElement.GetProperty("missing").EnumerateArray());
            Assert.Equal(JsonValueKind.Null, json.RootElement.GetProperty("completedAt").ValueKind);
        }

        // The ETag from before the details save is stale now.
        using var stale = new HttpRequestMessage(HttpMethod.Put, "/me/onboarding/level") { Content = JsonContent.Create(new { educationLevel = "high_school" }) };
        stale.Headers.TryAddWithoutValidation("If-Match", etag);
        var conflict = await client.SendAsync(stale, Ct);
        Assert.Equal(HttpStatusCode.Conflict, conflict.StatusCode);
        Assert.Equal("concurrency_conflict", await ProblemCodeAsync(conflict));

        HttpResponseMessage? complete = null;
        var session = await _support.TrackAsync(async () => complete = await client.PostAsJsonAsync("/me/onboarding/complete", new { }, Ct));
        Assert.Equal(HttpStatusCode.OK, complete!.StatusCode);
        var onboarded = Assert.Single(MessagesOf<UserOnboarded>(session));
        Assert.True(onboarded.IsMinor);
        Assert.Equal(11, onboarded.Grade);
        Assert.Equal("ieb", onboarded.Curriculum);
        using var first = await ReadJsonAsync(complete);
        var completedAt = first.RootElement.GetProperty("completedAt").GetDateTimeOffset();

        HttpResponseMessage? repeat = null;
        var repeatSession = await _support.TrackAsync(async () => repeat = await client.PostAsJsonAsync("/me/onboarding/complete", new { }, Ct));
        using var second = await ReadJsonAsync(repeat!);
        Assert.Equal(completedAt, second.RootElement.GetProperty("completedAt").GetDateTimeOffset());
        Assert.Empty(MessagesOf<UserOnboarded>(repeatSession));

        var me = await _support.MeAsync(account);
        Assert.False(me.GetProperty("onboarding").GetProperty("required").GetBoolean());
        Assert.True(me.GetProperty("isMinor").GetBoolean());

        // Set once: a different date is refused, the same date is accepted.
        var change = await client.PatchAsJsonAsync("/me/profile", new { dateOfBirth = dob.AddYears(-3) }, Ct);
        Assert.Equal(HttpStatusCode.Conflict, change.StatusCode);
        Assert.Equal("identity.date_of_birth_already_set", await ProblemCodeAsync(change));
        Assert.Equal(HttpStatusCode.OK, (await client.PatchAsJsonAsync("/me/profile", new { dateOfBirth = dob }, Ct)).StatusCode);
    }

    [Fact]
    public async Task A_tertiary_student_completes_in_one_call_and_parents_confirm_they_are_adults()
    {
        SkipWithoutDocker();
        var student = _support.Bearer(await _support.RegisterAsync());
        var incomplete = await student.PostAsJsonAsync("/me/onboarding/complete", new { educationLevel = "tertiary", studyLevel = "masters" }, Ct);
        Assert.Equal(HttpStatusCode.Conflict, incomplete.StatusCode);
        Assert.Equal("identity.onboarding_incomplete", await ProblemCodeAsync(incomplete));
        using (var json = await ReadJsonAsync(incomplete))
        {
            var missing = json.RootElement.GetProperty("errors").EnumerateObject().Select(p => p.Name).ToList();
            Assert.Equal(["institutionName", "dateOfBirth"], missing);
        }

        var done = await student.PostAsJsonAsync("/me/onboarding/complete", new
        {
            educationLevel = "tertiary",
            studyLevel = "masters",
            programme = "MSc Data Science",
            institutionName = "University of Cape Town",
            dateOfBirth = Today.AddYears(-24),
        }, Ct);
        Assert.Equal(HttpStatusCode.OK, done.StatusCode);
        using (var json = await ReadJsonAsync(done))
        {
            Assert.Equal(JsonValueKind.Null, json.RootElement.GetProperty("yearOfStudy").ValueKind);
            Assert.Equal("masters", json.RootElement.GetProperty("studyLevel").GetString());
        }

        var parentAccount = await _support.RegisterAsync("parent");
        var parent = _support.Bearer(parentAccount);
        var notForParents = await parent.PutAsJsonAsync("/me/onboarding/level", new { educationLevel = "high_school" }, Ct);
        Assert.Equal(HttpStatusCode.Forbidden, notForParents.StatusCode);
        Assert.Equal("identity.onboarding_students_only", await ProblemCodeAsync(notForParents));
        Assert.Equal(HttpStatusCode.BadRequest, (await parent.PatchAsJsonAsync("/me/profile", new { dateOfBirth = Today.AddYears(-40) }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await parent.PostAsJsonAsync("/me/onboarding/complete", new { }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await parent.PostAsJsonAsync("/me/onboarding/complete", new { adultConfirmed = true }, Ct)).StatusCode);

        var me = await _support.MeAsync(parentAccount);
        Assert.False(me.GetProperty("onboarding").GetProperty("required").GetBoolean());
        Assert.NotEqual(JsonValueKind.Null, me.GetProperty("adultConfirmedAt").ValueKind);
        Assert.Equal(HttpStatusCode.OK, (await parent.PatchAsJsonAsync("/me/profile", new { adultConfirmed = true }, Ct)).StatusCode);
        await _support.WithDbAsync(async db => Assert.Equal(
            1, await db.UserConsents.CountAsync(c => c.UserId == parentAccount.UserId && c.DocumentKey == UserConsent.AdultConfirmation, Ct)));
    }

    [Fact]
    public async Task Profile_updates_validate_and_null_clears_the_phone_number()
    {
        SkipWithoutDocker();
        var account = await _support.RegisterAsync();
        var client = _support.Bearer(account);

        HttpResponseMessage? renamed = null;
        var session = await _support.TrackAsync(async () => renamed = await client.PatchAsJsonAsync("/me/profile", new { name = "Sipho Dlamini", phoneNumber = "+27821234567" }, Ct));
        Assert.Equal(HttpStatusCode.OK, renamed!.StatusCode);
        Assert.Equal("Sipho Dlamini", Assert.Single(MessagesOf<UserProfileUpdated>(session)).Name);

        using (var json = await ReadJsonAsync(await client.PatchAsJsonAsync("/me/profile", new { name = "Sipho D" }, Ct)))
        {
            Assert.Equal("+27821234567", json.RootElement.GetProperty("phoneNumber").GetString());
        }

        using (var json = await ReadJsonAsync(await client.PatchAsync("/me/profile", JsonContent.Create(new Dictionary<string, object?> { ["phoneNumber"] = null }), Ct)))
        {
            Assert.Equal(JsonValueKind.Null, json.RootElement.GetProperty("phoneNumber").ValueKind);
            Assert.Equal("Sipho D", json.RootElement.GetProperty("name").GetString());
        }

        Assert.Equal(HttpStatusCode.BadRequest, (await client.PatchAsJsonAsync("/me/profile", new { phoneNumber = "0821234567" }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PatchAsJsonAsync("/me/profile", new { name = "12345" }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PatchAsJsonAsync("/me/profile", new { dateOfBirth = Today.AddYears(-5) }, Ct)).StatusCode);
    }

    [Fact]
    public async Task A_deletion_request_waits_out_the_cooling_off_then_publishes_the_erasure_event()
    {
        SkipWithoutDocker();
        var account = await _support.RegisterAsync();
        var client = _support.Bearer(account);

        var noPassword = await client.PostAsJsonAsync("/me/deletion-request", new { confirm = "DELETE" }, Ct);
        Assert.Equal(HttpStatusCode.Unauthorized, noPassword.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/me/deletion-request", new { confirm = "delete", currentPassword = Password }, Ct)).StatusCode);

        HttpResponseMessage? requested = null;
        var session = await _support.TrackAsync(async () => requested = await client.PostAsJsonAsync(
            "/me/deletion-request", new { confirm = "DELETE", currentPassword = Password, reason = "Finished school" }, Ct));
        Assert.Equal(HttpStatusCode.Accepted, requested!.StatusCode);
        using var body = await ReadJsonAsync(requested);
        var requestId = body.RootElement.GetProperty("requestId").GetGuid();
        var scheduled = body.RootElement.GetProperty("scheduledErasureAt").GetDateTimeOffset();
        var requestedAt = body.RootElement.GetProperty("requestedAt").GetDateTimeOffset();
        Assert.Equal(TimeSpan.FromDays(14), scheduled - requestedAt);
        Assert.Contains(MessagesOf<ProcessScheduledErasure>(session), m => m.RequestId == requestId);

        // Nothing is erased yet: the account still works and shows the pending request.
        Assert.Empty(MessagesOf<AccountDeletionRequested>(session));
        var me = await _support.MeAsync(account);
        Assert.Equal(requestId, me.GetProperty("deletionRequest").GetProperty("id").GetGuid());

        var again = await client.PostAsJsonAsync("/me/deletion-request", new { confirm = "DELETE", currentPassword = Password }, Ct);
        Assert.Equal(HttpStatusCode.OK, again.StatusCode);
        using (var json = await ReadJsonAsync(again))
        {
            Assert.Equal(requestId, json.RootElement.GetProperty("requestId").GetGuid());
        }

        // The cooling-off period ends.
        var erasure = await factory.AppHost.InvokeMessageAndWaitAsync(new ProcessScheduledErasure(requestId));
        var published = Assert.Single(MessagesOf<AccountDeletionRequested>(erasure));
        Assert.Equal(account.UserId, published.UserId);
        Assert.Equal(HttpStatusCode.Unauthorized, await _support.MeStatusAsync(account.AccessToken));

        await _support.WithDbAsync(async db =>
        {
            var row = await db.AccountDeletionRequests.SingleAsync(r => r.Id == requestId, Ct);
            Assert.Equal(AccountDeletionRequest.Approved, row.Status);
        });

        // Erasure has started, so it can no longer be cancelled.
        var signedIn = await _support.LoginAsync(account.Email, Password);
        var tokens = await AccountFromAsync(signedIn, account.Email, Password, NewIp());
        var cancel = await _support.Bearer(tokens.AccessToken).DeleteAsync("/me/deletion-request", Ct);
        Assert.Equal(HttpStatusCode.Conflict, cancel.StatusCode);
        Assert.Equal("identity.erasure_in_progress", await ProblemCodeAsync(cancel));
    }

    [Fact]
    public async Task A_cancelled_deletion_request_never_erases()
    {
        SkipWithoutDocker();
        var account = await _support.RegisterAsync();
        var client = _support.Bearer(account);

        var requested = await client.PostAsJsonAsync("/me/deletion-request", new { confirm = "DELETE", currentPassword = Password }, Ct);
        Assert.Equal(HttpStatusCode.Accepted, requested.StatusCode);
        using var body = await ReadJsonAsync(requested);
        var requestId = body.RootElement.GetProperty("requestId").GetGuid();

        Assert.Equal(HttpStatusCode.NoContent, (await client.DeleteAsync("/me/deletion-request", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.DeleteAsync("/me/deletion-request", Ct)).StatusCode);
        Assert.Equal(JsonValueKind.Null, (await _support.MeAsync(account)).GetProperty("deletionRequest").ValueKind);

        // The scheduled message still fires, finds the request cancelled and does nothing.
        var late = await factory.AppHost.InvokeMessageAndWaitAsync(new ProcessScheduledErasure(requestId));
        Assert.Empty(MessagesOf<AccountDeletionRequested>(late));
        Assert.Equal(HttpStatusCode.OK, await _support.MeStatusAsync(account.AccessToken));

        await _support.WithDbAsync(async db =>
        {
            Assert.True(await db.SecurityEvents.AnyAsync(e => e.UserId == account.UserId && e.Type == SecurityEventTypes.AccountDeletionCancelled, Ct));
            Assert.Null((await db.Users.SingleAsync(u => u.Id == account.UserId, Ct)).DeletionRequestedAt);
        });
    }

    [Fact]
    public async Task Consents_are_listed_re_accepted_idempotently_and_marketing_can_be_withdrawn()
    {
        SkipWithoutDocker();
        var account = await _support.RegisterAsync();
        var client = _support.Bearer(account);
        var legal = await _support.LegalVersionsAsync();
        var terms = legal.GetProperty("termsVersion").GetString();
        var privacy = legal.GetProperty("privacyVersion").GetString();

        using (var json = await ReadJsonAsync(await client.GetAsync("/me/consents", Ct)))
        {
            Assert.Equal(["privacy", "terms"], json.RootElement.EnumerateArray().Select(c => c.GetProperty("documentKey").GetString()).Order());
        }

        var outdated = await client.PostAsJsonAsync("/me/consents", new { termsVersion = "old", privacyVersion = privacy }, Ct);
        Assert.Equal(HttpStatusCode.Conflict, outdated.StatusCode);
        Assert.Equal("identity.consent_outdated", await ProblemCodeAsync(outdated));

        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsJsonAsync("/me/consents", new { termsVersion = terms, privacyVersion = privacy, marketingEmails = true }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsJsonAsync("/me/consents", new { termsVersion = terms, privacyVersion = privacy, marketingEmails = false }, Ct)).StatusCode);

        await _support.WithDbAsync(async db =>
        {
            var rows = await db.UserConsents.Where(c => c.UserId == account.UserId).ToListAsync(Ct);
            Assert.Single(rows, c => c.DocumentKey == UserConsent.Terms);
            Assert.Single(rows, c => c.DocumentKey == UserConsent.Privacy);
            Assert.NotNull(Assert.Single(rows, c => c.DocumentKey == UserConsent.MarketingEmail).WithdrawnAt);
        });

        var versions = await _support.Anonymous().GetAsync("/legal/versions", Ct);
        Assert.Equal("public, max-age=300", versions.Headers.CacheControl?.ToString());
    }

    private async Task<Guid> SessionIdAsync(Account account)
    {
        using var json = await ReadJsonAsync(await _support.Bearer(account).GetAsync("/me/sessions", Ct));
        return json.RootElement.EnumerateArray().Single(s => s.GetProperty("current").GetBoolean()).GetProperty("id").GetGuid();
    }

    private static List<string?> Strings(JsonElement array) => array.EnumerateArray().Select(e => e.GetString()).ToList();
}
