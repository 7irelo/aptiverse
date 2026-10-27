using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Aptiverse.Family.Domain;
using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Wolverine.Tracking;
using static Aptiverse.IntegrationTests.FamilyTestSupport;

namespace Aptiverse.IntegrationTests;

/// <summary>Link-scoped parent reads (IDOR), student-controlled sharing, and parental consent feeding Billing's payer check.</summary>
[Collection(ApiTestGroup.Name)]
public sealed class FamilyAccessTests(ApiFactory factory)
{
    private readonly FamilyTestSupport _family = new(factory);
    private readonly BillingTestSupport _billing = new(factory);

    private void SkipWithoutDocker() => Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);

    [Fact]
    public async Task Parent_A_cannot_read_or_act_on_parent_Bs_child_and_gets_404_not_403()
    {
        SkipWithoutDocker();
        var parentA = await _family.ParentAsync();
        var parentB = await _family.ParentAsync();
        var studentA = await _family.StudentAsync();
        var studentB = await _family.StudentAsync(ageYears: 15);
        await LinkAsync(parentA, studentA);
        await LinkAsync(parentB, studentB);

        Assert.Equal(HttpStatusCode.OK, (await parentA.Client.GetAsync($"/family/children/{studentA.UserId}/summary", Ct)).StatusCode);

        var probes = new[]
        {
            await parentA.Client.GetAsync($"/family/children/{studentB.UserId}/summary", Ct),
            await parentA.Client.GetAsync($"/family/children/{Guid.NewGuid()}/summary", Ct),
            await parentA.Client.PostAsJsonAsync($"/family/children/{studentB.UserId}/consent", new { documentVersion = ConsentVersion, confirmIsParentOrGuardian = true }, Ct),
            await parentA.Client.DeleteAsync($"/family/children/{studentB.UserId}/consent", Ct),
            await parentA.Client.DeleteAsync($"/family/children/{studentB.UserId}", Ct),
        };
        foreach (var probe in probes)
        {
            Assert.Equal(HttpStatusCode.NotFound, probe.StatusCode);
            Assert.Equal("family.child_not_found", await ProblemCodeAsync(probe));
        }

        // Students cannot reach into other links either.
        var sharing = new { academics = true, practice = true, goals = true, tutorActivity = true };
        Assert.Equal(HttpStatusCode.NotFound, (await studentA.Client.PutAsJsonAsync($"/family/parents/{parentB.UserId}/sharing", sharing, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await studentA.Client.DeleteAsync($"/family/parents/{parentB.UserId}", Ct)).StatusCode);

        using var children = await ReadJsonAsync(await parentA.Client.GetAsync("/family/children", Ct));
        Assert.Equal([studentA.UserId], children.RootElement.GetProperty("children").EnumerateArray().Select(c => c.GetProperty("studentId").GetGuid()));

        // The links of parent B are untouched by every probe above.
        Assert.Equal(HttpStatusCode.OK, (await parentB.Client.GetAsync($"/family/children/{studentB.UserId}/summary", Ct)).StatusCode);
    }

    [Fact]
    public async Task The_student_controls_what_each_parent_sees_and_tutor_content_never_appears()
    {
        SkipWithoutDocker();
        var parent = await _family.ParentAsync();
        var student = await _family.StudentAsync();
        await LinkAsync(parent, student);

        using (var before = await SummaryAsync(parent, student))
        {
            Assert.True(before.RootElement.GetProperty("academics").GetProperty("shared").GetBoolean());
            Assert.True(before.RootElement.GetProperty("practice").GetProperty("shared").GetBoolean());
            Assert.Equal(0, before.RootElement.GetProperty("practice").GetProperty("completedLast30Days").GetInt32());
            Assert.False(before.RootElement.GetProperty("tutor").GetProperty("shared").GetBoolean());
            Assert.Equal(JsonValueKind.Null, before.RootElement.GetProperty("tutor").GetProperty("questionsLast30Days").ValueKind);
        }

        var update = await student.Client.PutAsJsonAsync(
            $"/family/parents/{parent.UserId}/sharing",
            new { academics = false, practice = false, goals = true, tutorActivity = true },
            Ct);
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await student.Client.PutAsJsonAsync($"/family/parents/{parent.UserId}/sharing", new { academics = true }, Ct)).StatusCode);

        using var after = await SummaryAsync(parent, student);
        var root = after.RootElement;
        Assert.False(root.GetProperty("academics").GetProperty("shared").GetBoolean());
        Assert.Equal(JsonValueKind.Null, root.GetProperty("academics").GetProperty("units").ValueKind);
        Assert.False(root.GetProperty("mastery").GetProperty("shared").GetBoolean());
        Assert.False(root.GetProperty("practice").GetProperty("shared").GetBoolean());
        Assert.Equal(JsonValueKind.Null, root.GetProperty("practice").GetProperty("recent").ValueKind);
        Assert.True(root.GetProperty("goals").GetProperty("shared").GetBoolean());
        var tutor = root.GetProperty("tutor");
        Assert.True(tutor.GetProperty("shared").GetBoolean());
        Assert.Equal(0, tutor.GetProperty("questionsLast30Days").GetInt32());
        Assert.Equal(["conversationsLast30Days", "questionsLast30Days", "shared"], tutor.EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal));

        // A parent cannot change sharing: the route is the student's only.
        Assert.Equal(HttpStatusCode.Forbidden, (await parent.Client.PutAsJsonAsync($"/family/parents/{parent.UserId}/sharing", new { academics = true, practice = true, goals = true, tutorActivity = true }, Ct)).StatusCode);
        Assert.Equal("no-store", (await parent.Client.GetAsync("/family/children", Ct)).Headers.CacheControl?.ToString());
    }

    [Fact]
    public async Task A_linked_parents_consent_lets_a_minor_pay_and_withdrawing_it_stops_that()
    {
        SkipWithoutDocker();
        await _billing.EnsurePlansSyncedAsync();
        var parent = await _family.ParentAsync();
        var minor = await _family.StudentAsync(ageYears: 15);
        await LinkAsync(parent, minor);

        var refused = await BillingTestSupport.CheckoutAsync(minor.Client);
        Assert.Equal(HttpStatusCode.Forbidden, refused.StatusCode);
        Assert.Equal("billing.payer_must_be_adult", await ProblemCodeAsync(refused));

        HttpResponseMessage? granted = null;
        await _family.TrackAsync(async () => granted = await GrantAsync(parent, minor));
        Assert.Equal(HttpStatusCode.OK, granted!.StatusCode);
        using (var consent = await ReadJsonAsync(granted))
        {
            Assert.Equal("granted", consent.RootElement.GetProperty("status").GetString());
            Assert.True(consent.RootElement.GetProperty("grantedByYou").GetBoolean());
        }

        Assert.Equal(HttpStatusCode.Created, (await BillingTestSupport.CheckoutAsync(minor.Client)).StatusCode);
        var recorded = await IdentityConsentsAsync(minor.UserId);
        var row = Assert.Single(recorded);
        Assert.Equal(ConsentSources.Family, row.Source);
        Assert.Null(row.WithdrawnAt);

        // Granting again is the same consent; the student sees which parent gave it.
        Assert.Equal(HttpStatusCode.OK, (await GrantAsync(parent, minor)).StatusCode);
        using (var parents = await ReadJsonAsync(await minor.Client.GetAsync("/family/parents", Ct)))
        {
            Assert.True(Assert.Single(parents.RootElement.EnumerateArray()).GetProperty("isConsentingParent").GetBoolean());
        }

        // Consent outlives the link: the student revokes the parent, and the parent can still withdraw.
        Assert.Equal(HttpStatusCode.NoContent, (await minor.Client.DeleteAsync($"/family/parents/{parent.UserId}", Ct)).StatusCode);
        HttpResponseMessage? withdrawn = null;
        await _family.TrackAsync(async () => withdrawn = await parent.Client.DeleteAsync($"/family/children/{minor.UserId}/consent", Ct));
        Assert.Equal(HttpStatusCode.NoContent, withdrawn!.StatusCode);
        Assert.All(await IdentityConsentsAsync(minor.UserId), c => Assert.NotNull(c.WithdrawnAt));
        Assert.Equal("billing.payer_must_be_adult", await ProblemCodeAsync(await BillingTestSupport.CheckoutAsync(minor.Client)));
    }

    [Fact]
    public async Task Erasing_the_consenting_parent_withdraws_their_consent_and_the_minor_can_no_longer_pay()
    {
        SkipWithoutDocker();
        await _billing.EnsurePlansSyncedAsync();
        var parent = await _family.ParentAsync();
        var minor = await _family.StudentAsync(ageYears: 14);
        await LinkAsync(parent, minor);
        await _family.TrackAsync(async () => Assert.Equal(HttpStatusCode.OK, (await GrantAsync(parent, minor)).StatusCode));
        Assert.Equal(HttpStatusCode.Created, (await BillingTestSupport.CheckoutAsync(minor.Client)).StatusCode);

        await factory.AppHost.InvokeMessageAndWaitAsync(new AccountDeletionRequested(parent.UserId, parent.Email, "Gone", DateTimeOffset.UtcNow));

        var refused = await BillingTestSupport.CheckoutAsync(minor.Client);
        Assert.Equal(HttpStatusCode.Forbidden, refused.StatusCode);
        Assert.Equal("billing.payer_must_be_adult", await ProblemCodeAsync(refused));
        Assert.All(await IdentityConsentsAsync(minor.UserId), c => Assert.NotNull(c.WithdrawnAt));

        // The grant stays as evidence; the withdrawal is appended and marked as caused by the system.
        var rows = await _family.WithDbAsync(db => db.ParentalConsents.AsNoTracking()
            .Where(c => c.StudentUserId == minor.UserId)
            .OrderBy(c => c.OccurredAt)
            .ToListAsync(Ct));
        Assert.Equal([ConsentActions.Granted, ConsentActions.Withdrawn], rows.Select(r => r.Action));
        Assert.Equal([ConsentRecordSources.Parent, ConsentRecordSources.System], rows.Select(r => r.Source));
        Assert.All(rows, r => Assert.Equal(parent.UserId, r.ParentUserId));

        // A repeated erasure appends nothing more.
        await factory.AppHost.InvokeMessageAndWaitAsync(new AccountDeletionRequested(parent.UserId, parent.Email, "Gone", DateTimeOffset.UtcNow));
        Assert.Equal(2, await _family.WithDbAsync(db => db.ParentalConsents.CountAsync(c => c.StudentUserId == minor.UserId, Ct)));
    }

    [Fact]
    public async Task Consent_needs_a_verified_adult_parent_a_minor_and_the_current_text()
    {
        SkipWithoutDocker();
        var adultStudent = await _family.StudentAsync(ageYears: 19);
        var minor = await _family.StudentAsync(ageYears: 16);
        var parent = await _family.ParentAsync();
        var otherParent = await _family.ParentAsync();
        await LinkAsync(parent, adultStudent);

        Assert.Equal("family.consent_not_needed", await ProblemCodeAsync(await GrantAsync(parent, adultStudent)));

        var parentOfMinor = await _family.ParentAsync();
        await LinkAsync(parentOfMinor, minor);
        var outdated = await parentOfMinor.Client.PostAsJsonAsync($"/family/children/{minor.UserId}/consent", new { documentVersion = "2020-01-01", confirmIsParentOrGuardian = true }, Ct);
        Assert.Equal("family.consent_version_outdated", await ProblemCodeAsync(outdated));
        Assert.Equal(HttpStatusCode.BadRequest, (await parentOfMinor.Client.PostAsJsonAsync($"/family/children/{minor.UserId}/consent", new { documentVersion = ConsentVersion, confirmIsParentOrGuardian = false }, Ct)).StatusCode);

        await UnverifyAsync(parentOfMinor.UserId);
        Assert.Equal("family.parent_not_verified_adult", await ProblemCodeAsync(await GrantAsync(parentOfMinor, minor)));
        await VerifyAsync(parentOfMinor.UserId);
        Assert.Equal(HttpStatusCode.OK, (await GrantAsync(parentOfMinor, minor)).StatusCode);

        // A second linked parent can neither consent over the first nor withdraw the first parent's consent.
        await LinkAsync(otherParent, minor);
        Assert.Equal("family.consent_already_granted", await ProblemCodeAsync(await GrantAsync(otherParent, minor)));
        Assert.Equal("family.consent_not_parent", await ProblemCodeAsync(await otherParent.Client.DeleteAsync($"/family/children/{minor.UserId}/consent", Ct)));

        using var children = await ReadJsonAsync(await otherParent.Client.GetAsync("/family/children", Ct));
        var consent = Assert.Single(children.RootElement.GetProperty("children").EnumerateArray()).GetProperty("consent");
        Assert.Equal("granted", consent.GetProperty("status").GetString());
        Assert.False(consent.GetProperty("grantedByYou").GetBoolean());
    }

    private static Task<HttpResponseMessage> GrantAsync(FamilyUser parent, FamilyUser student) =>
        parent.Client.PostAsJsonAsync($"/family/children/{student.UserId}/consent", new { documentVersion = ConsentVersion, confirmIsParentOrGuardian = true }, Ct);

    private static async Task<JsonDocument> SummaryAsync(FamilyUser parent, FamilyUser student)
    {
        var response = await parent.Client.GetAsync($"/family/children/{student.UserId}/summary", Ct);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return await ReadJsonAsync(response);
    }

    private async Task<List<UserConsent>> IdentityConsentsAsync(Guid userId)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();
        return await db.UserConsents.AsNoTracking().Where(c => c.UserId == userId && c.DocumentKey == UserConsent.ParentalConsent).ToListAsync(Ct);
    }

    private Task UnverifyAsync(Guid userId) => SetVerifiedAsync(userId, false);

    private Task VerifyAsync(Guid userId) => SetVerifiedAsync(userId, true);

    private async Task SetVerifiedAsync(Guid userId, bool verified)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();
        await db.Users.Where(u => u.Id == userId).ExecuteUpdateAsync(s => s.SetProperty(u => u.EmailConfirmed, verified), Ct);
    }
}
