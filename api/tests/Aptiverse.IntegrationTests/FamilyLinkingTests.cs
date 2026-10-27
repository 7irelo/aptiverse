using System.Net;
using System.Net.Http.Json;
using Aptiverse.Family.Domain;
using Aptiverse.Identity.Contracts;
using Microsoft.EntityFrameworkCore;
using Wolverine.Tracking;
using static Aptiverse.IntegrationTests.FamilyTestSupport;

namespace Aptiverse.IntegrationTests;

/// <summary>Invites, link codes (expiry, single use, brute-force limits), revoking and erasure.</summary>
[Collection(ApiTestGroup.Name)]
public sealed class FamilyLinkingTests(ApiFactory factory)
{
    private readonly FamilyTestSupport _family = new(factory);

    private void SkipWithoutDocker() => Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);

    [Fact]
    public async Task Routes_need_a_signed_in_caller_with_the_right_role()
    {
        SkipWithoutDocker();
        var anonymous = factory.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync("/family/children", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.PostAsync("/family/link-codes", null, Ct)).StatusCode);

        var student = await _family.StudentAsync();
        var parent = await _family.ParentAsync();
        Assert.Equal(HttpStatusCode.Forbidden, (await student.Client.GetAsync("/family/children", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await student.Client.PostAsJsonAsync("/family/invites", new { email = "x@example.test", relationship = "mother" }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await parent.Client.PostAsync("/family/link-codes", null, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await parent.Client.GetAsync("/family/parents", Ct)).StatusCode);
    }

    [Fact]
    public async Task A_student_accepts_an_emailed_invite_once_and_the_parent_is_told()
    {
        SkipWithoutDocker();
        var parent = await _family.ParentAsync(name: "Thandi Parent");
        var student = await _family.StudentAsync(name: "Sipho Student");

        var (sent, token) = await _family.InviteAsync(parent, student.Email.ToUpperInvariant());
        Assert.Equal(HttpStatusCode.Created, sent.StatusCode);
        using (var view = await ReadJsonAsync(sent))
        {
            Assert.Equal("pending", view.RootElement.GetProperty("status").GetString());
            Assert.Equal("s***@e***.test", view.RootElement.GetProperty("inviteeEmailMasked").GetString());
        }

        Assert.NotNull(token);
        var stored = await _family.WithDbAsync(db => db.Invites.SingleAsync(i => i.InviterUserId == parent.UserId, Ct));
        Assert.Equal(InviteTokens.Hash(token), stored.TokenHash);
        Assert.DoesNotContain(token, stored.TokenHash, StringComparison.Ordinal);

        HttpResponseMessage? accepted = null;
        await _family.TrackAsync(async () => accepted = await student.Client.PostAsJsonAsync("/family/invites/accept", new { token }, Ct));
        Assert.Equal(HttpStatusCode.OK, accepted!.StatusCode);
        using (var link = await ReadJsonAsync(accepted))
        {
            Assert.Equal(parent.UserId, link.RootElement.GetProperty("parentUserId").GetGuid());
            Assert.False(link.RootElement.GetProperty("sharing").GetProperty("tutorActivity").GetBoolean());
        }

        Assert.Contains(_family.Email.To(parent.Email), e => e.Subject.Contains("Sipho Student", StringComparison.Ordinal));

        // Accepting again is the same link; the invite cannot be used by anyone else.
        Assert.Equal(HttpStatusCode.OK, (await student.Client.PostAsJsonAsync("/family/invites/accept", new { token }, Ct)).StatusCode);
        var other = await _family.StudentAsync();
        Assert.Equal("family.invite_not_found", await ProblemCodeAsync(await other.Client.PostAsJsonAsync("/family/invites/accept", new { token }, Ct)));

        using var children = await ReadJsonAsync(await parent.Client.GetAsync("/family/children", Ct));
        var child = Assert.Single(children.RootElement.GetProperty("children").EnumerateArray());
        Assert.Equal(student.UserId, child.GetProperty("studentId").GetGuid());
        Assert.Equal("Sipho Student", child.GetProperty("displayName").GetString());
        Assert.Equal("not_required", child.GetProperty("consent").GetProperty("status").GetString());
    }

    [Fact]
    public async Task Invites_answer_the_same_for_unknown_emails_and_refuse_duplicates_and_yourself()
    {
        SkipWithoutDocker();
        var parent = await _family.ParentAsync();
        var unknown = $"nobody-{Guid.NewGuid():N}@example.test";

        var (first, _) = await _family.InviteAsync(parent, unknown);
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        var duplicate = await parent.Client.PostAsJsonAsync("/family/invites", new { email = unknown, relationship = "mother" }, Ct);
        Assert.Equal("family.invite_duplicate", await ProblemCodeAsync(duplicate));
        Assert.Equal("family.self_invite", await ProblemCodeAsync(await parent.Client.PostAsJsonAsync("/family/invites", new { email = parent.Email, relationship = "mother" }, Ct)));

        var unverified = await _family.ParentAsync(verified: false);
        Assert.Equal("family.email_not_verified", await ProblemCodeAsync(await unverified.Client.PostAsJsonAsync("/family/invites", new { email = unknown, relationship = "mother" }, Ct)));
    }

    [Fact]
    public async Task An_invite_works_only_for_the_invited_address_and_only_until_it_expires()
    {
        SkipWithoutDocker();
        var parent = await _family.ParentAsync();
        var invited = await _family.StudentAsync();
        var intruder = await _family.StudentAsync();
        var (_, token) = await _family.InviteAsync(parent, invited.Email);

        Assert.Equal("family.invite_email_mismatch", await ProblemCodeAsync(await intruder.Client.PostAsJsonAsync("/family/invites/accept", new { token }, Ct)));

        await _family.WithDbAsync(db => db.Invites.Where(i => i.InviterUserId == parent.UserId)
            .ExecuteUpdateAsync(s => s.SetProperty(i => i.ExpiresAt, DateTimeOffset.UtcNow.AddMinutes(-1)), Ct));
        var expired = await invited.Client.PostAsJsonAsync("/family/invites/accept", new { token }, Ct);
        Assert.Equal(HttpStatusCode.Gone, expired.StatusCode);
        Assert.Equal("family.invite_expired", await ProblemCodeAsync(expired));
        Assert.Equal(HttpStatusCode.NotFound, (await invited.Client.PostAsJsonAsync("/family/invites/accept", new { token = InviteTokens.NewToken() }, Ct)).StatusCode);
    }

    [Fact]
    public async Task A_cancelled_invite_stops_working_and_only_its_sender_can_cancel_it()
    {
        SkipWithoutDocker();
        var parent = await _family.ParentAsync();
        var other = await _family.ParentAsync();
        var student = await _family.StudentAsync();
        var (sent, token) = await _family.InviteAsync(parent, student.Email);
        using var view = await ReadJsonAsync(sent);
        var id = view.RootElement.GetProperty("id").GetGuid();

        Assert.Equal(HttpStatusCode.NotFound, (await other.Client.DeleteAsync($"/family/invites/{id}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await parent.Client.DeleteAsync($"/family/invites/{id}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await parent.Client.DeleteAsync($"/family/invites/{id}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await student.Client.PostAsJsonAsync("/family/invites/accept", new { token }, Ct)).StatusCode);
    }

    [Fact]
    public async Task A_link_code_links_once_is_stored_hashed_and_a_new_code_replaces_the_old()
    {
        SkipWithoutDocker();
        var parent = await _family.ParentAsync();
        var second = await _family.ParentAsync();
        var student = await _family.StudentAsync();

        var replaced = await CodeAsync(student);
        var code = await CodeAsync(student);
        Assert.Matches("^[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$", code);
        var rows = await _family.WithDbAsync(db => db.LinkCodes.Where(c => c.StudentUserId == student.UserId).ToListAsync(Ct));
        Assert.Equal(1, rows.Count(c => c.Status == LinkCodeStatuses.Active));
        Assert.DoesNotContain(rows, r => r.CodeHash.Contains(code.Replace("-", string.Empty, StringComparison.Ordinal), StringComparison.OrdinalIgnoreCase));

        Assert.Equal("family.link_code_invalid", await ProblemCodeAsync(await RedeemAsync(parent, replaced)));
        var linked = await RedeemAsync(parent, code.ToLowerInvariant().Replace("-", " ", StringComparison.Ordinal));
        Assert.Equal(HttpStatusCode.OK, linked.StatusCode);

        // Single use: a second parent with the same code gets nothing.
        Assert.Equal("family.link_code_invalid", await ProblemCodeAsync(await RedeemAsync(second, code)));
        Assert.Equal(HttpStatusCode.BadRequest, (await RedeemAsync(second, "not a code")).StatusCode);
    }

    [Fact]
    public async Task An_expired_link_code_is_gone()
    {
        SkipWithoutDocker();
        var parent = await _family.ParentAsync();
        var student = await _family.StudentAsync();
        var code = await CodeAsync(student);
        await _family.WithDbAsync(db => db.LinkCodes.Where(c => c.StudentUserId == student.UserId)
            .ExecuteUpdateAsync(s => s.SetProperty(c => c.ExpiresAt, DateTimeOffset.UtcNow.AddSeconds(-1)), Ct));

        var response = await RedeemAsync(parent, code);

        Assert.Equal(HttpStatusCode.Gone, response.StatusCode);
        Assert.Equal("family.link_code_expired", await ProblemCodeAsync(response));
    }

    [Fact]
    public async Task Guessing_codes_is_blocked_per_parent_even_for_a_correct_code_afterwards()
    {
        SkipWithoutDocker();
        var guesser = await _family.ParentAsync();
        var student = await _family.StudentAsync();
        var code = await CodeAsync(student);

        for (var i = 0; i < 5; i++)
        {
            var wrong = await RedeemAsync(guesser, LinkCodes.Display(LinkCodes.NewCode()));
            Assert.Equal(HttpStatusCode.NotFound, wrong.StatusCode);
        }

        var blocked = await RedeemAsync(guesser, code);
        Assert.Equal(HttpStatusCode.TooManyRequests, blocked.StatusCode);
        Assert.Equal("family.too_many_attempts", await ProblemCodeAsync(blocked));
        Assert.True(blocked.Headers.RetryAfter?.Delta > TimeSpan.Zero);
        Assert.Equal(5, await _family.WithDbAsync(db => db.LinkCodeFailures.CountAsync(f => f.ParentUserId == guesser.UserId, Ct)));

        // Another parent is not affected by this parent's failures.
        var parent = await _family.ParentAsync();
        Assert.Equal(HttpStatusCode.OK, (await RedeemAsync(parent, code)).StatusCode);
    }

    [Fact]
    public async Task Wrong_guesses_against_a_codes_selector_burn_the_code()
    {
        SkipWithoutDocker();
        var student = await _family.StudentAsync();
        var code = await CodeAsync(student);
        var selector = code[..4];

        for (var i = 0; i < 5; i++)
        {
            // Same selector, wrong rest: a guesser who found the selector still cannot keep trying this code.
            var guesser = await _family.ParentAsync();
            var guess = selector + LinkCodes.NewCode()[4..];
            Assert.Equal(HttpStatusCode.NotFound, (await RedeemAsync(guesser, guess)).StatusCode);
        }

        var status = await _family.WithDbAsync(db => db.LinkCodes.Where(c => c.StudentUserId == student.UserId).Select(c => c.Status).SingleAsync(Ct));
        Assert.Equal(LinkCodeStatuses.Burned, status);
        var parent = await _family.ParentAsync();
        Assert.Equal("family.link_code_invalid", await ProblemCodeAsync(await RedeemAsync(parent, code)));
    }

    [Fact]
    public async Task A_parent_without_a_parent_plan_links_one_child_and_already_linked_is_409()
    {
        SkipWithoutDocker();
        var parent = await _family.ParentAsync();
        var first = await _family.StudentAsync();
        var second = await _family.StudentAsync();

        await LinkAsync(parent, first);
        Assert.Equal("family.already_linked", await ProblemCodeAsync(await RedeemAsync(parent, await CodeAsync(first))));
        var limited = await RedeemAsync(parent, await CodeAsync(second));
        Assert.Equal(HttpStatusCode.Conflict, limited.StatusCode);
        Assert.Equal("family.limit_reached", await ProblemCodeAsync(limited));

        using var children = await ReadJsonAsync(await parent.Client.GetAsync("/family/children", Ct));
        Assert.Equal(1, children.RootElement.GetProperty("childLimit").GetInt32());
    }

    [Fact]
    public async Task The_student_revokes_at_any_time_and_the_parent_loses_access_at_once()
    {
        SkipWithoutDocker();
        var parent = await _family.ParentAsync();
        var student = await _family.StudentAsync(name: "Lerato Student");
        await LinkAsync(parent, student);
        Assert.Equal(HttpStatusCode.OK, (await parent.Client.GetAsync($"/family/children/{student.UserId}/summary", Ct)).StatusCode);

        HttpResponseMessage? revoked = null;
        await _family.TrackAsync(async () => revoked = await student.Client.DeleteAsync($"/family/parents/{parent.UserId}", Ct));
        Assert.Equal(HttpStatusCode.NoContent, revoked!.StatusCode);

        Assert.Equal(HttpStatusCode.NotFound, (await parent.Client.GetAsync($"/family/children/{student.UserId}/summary", Ct)).StatusCode);
        Assert.Contains(_family.Email.To(parent.Email), e => e.Subject.Contains("removed", StringComparison.Ordinal));
        Assert.Equal(HttpStatusCode.NoContent, (await student.Client.DeleteAsync($"/family/parents/{parent.UserId}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await student.Client.DeleteAsync($"/family/parents/{Guid.NewGuid()}", Ct)).StatusCode);

        using var parents = await ReadJsonAsync(await student.Client.GetAsync("/family/parents", Ct));
        Assert.Empty(parents.RootElement.EnumerateArray());

        // The parent can link again only with a new code from the student.
        await LinkAsync(parent, student);
        Assert.Equal(HttpStatusCode.NoContent, (await parent.Client.DeleteAsync($"/family/children/{student.UserId}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await parent.Client.GetAsync($"/family/children/{student.UserId}/summary", Ct)).StatusCode);
    }

    [Fact]
    public async Task Erasure_ends_links_on_either_side_and_deletes_invites_and_codes()
    {
        SkipWithoutDocker();
        var parent = await _family.ParentAsync();
        var student = await _family.StudentAsync();
        await LinkAsync(parent, student);
        await _family.InviteAsync(parent, $"pending-{Guid.NewGuid():N}@example.test");
        var waiting = await _family.StudentAsync();
        await CodeAsync(waiting);
        await _family.InviteAsync(await _family.ParentAsync(), waiting.Email);

        await factory.AppHost.InvokeMessageAndWaitAsync(new AccountDeletionRequested(parent.UserId, parent.Email, "Gone", DateTimeOffset.UtcNow));
        await factory.AppHost.InvokeMessageAndWaitAsync(new AccountDeletionRequested(waiting.UserId, waiting.Email, "Gone", DateTimeOffset.UtcNow));

        await _family.WithDbAsync(async db =>
        {
            Assert.False(await db.Links.AnyAsync(l => l.ParentUserId == parent.UserId, Ct));
            Assert.True(await db.Links.IgnoreQueryFilters().AnyAsync(l => l.ParentUserId == parent.UserId && l.Status == LinkStatuses.Removed && l.RemovedByRole == RemovedBy.System, Ct));
            Assert.False(await db.Invites.AnyAsync(i => i.InviterUserId == parent.UserId, Ct));
            Assert.False(await db.Invites.AnyAsync(i => i.InviteeEmail == waiting.Email, Ct));
            Assert.False(await db.LinkCodes.AnyAsync(c => c.StudentUserId == waiting.UserId, Ct));
        });

        using var parents = await ReadJsonAsync(await student.Client.GetAsync("/family/parents", Ct));
        Assert.Empty(parents.RootElement.EnumerateArray());
    }
}
