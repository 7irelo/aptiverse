using System.Net;
using System.Net.Http.Json;
using System.Net.ServerSentEvents;
using System.Text.Json;
using Aptiverse.AiTutor.Domain;
using Aptiverse.AiTutor.Persistence;
using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Wolverine.Tracking;

namespace Aptiverse.IntegrationTests;

[Collection(ApiTestGroup.Name)]
public sealed class AiTutorTests(ApiFactory factory)
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task Without_auth_every_route_is_401()
    {
        Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);
        var client = factory.CreateClient();
        var id = Guid.CreateVersion7();

        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/ai/conversations", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/ai/conversations", new { }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync($"/ai/conversations/{id}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.DeleteAsync($"/ai/conversations/{id}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync($"/ai/conversations/{id}/messages", new { message = "hi" }, Ct)).StatusCode);
    }

    [Fact]
    public async Task Without_the_chat_permission_is_403()
    {
        Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);
        var parent = factory.CreateUserClient(Guid.CreateVersion7(), role: "parent");

        Assert.Equal(HttpStatusCode.Forbidden, (await parent.GetAsync("/ai/conversations", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await parent.PostAsJsonAsync("/ai/conversations", new { }, Ct)).StatusCode);
        Assert.Equal(
            HttpStatusCode.Forbidden,
            (await parent.PostAsJsonAsync($"/ai/conversations/{Guid.CreateVersion7()}/messages", new { message = "hi" }, Ct)).StatusCode);
    }

    [Fact]
    public async Task Owner_sees_their_conversation_and_another_user_gets_404()
    {
        Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);
        var owner = factory.CreateUserClient(Guid.CreateVersion7());
        var stranger = factory.CreateUserClient(Guid.CreateVersion7());
        var id = await CreateConversationAsync(owner, "Photosynthesis");

        var own = await owner.GetAsync($"/ai/conversations/{id}", Ct);
        Assert.Equal(HttpStatusCode.OK, own.StatusCode);
        using (var json = await ReadJsonAsync(own))
        {
            Assert.Equal("Photosynthesis", json.RootElement.GetProperty("title").GetString());
            Assert.Equal("standard", json.RootElement.GetProperty("mode").GetString());
            Assert.Empty(json.RootElement.GetProperty("messages").EnumerateArray());
        }

        using (var list = await ReadJsonAsync(await owner.GetAsync("/ai/conversations", Ct)))
        {
            Assert.Equal(1, list.RootElement.GetProperty("totalCount").GetInt64());
            Assert.Equal(id, list.RootElement.GetProperty("items")[0].GetProperty("id").GetGuid());
        }

        var peek = await stranger.GetAsync($"/ai/conversations/{id}", Ct);
        Assert.Equal(HttpStatusCode.NotFound, peek.StatusCode);
        Assert.Equal("application/problem+json", peek.Content.Headers.ContentType?.MediaType);
        Assert.Equal(HttpStatusCode.NotFound, (await stranger.DeleteAsync($"/ai/conversations/{id}", Ct)).StatusCode);
        Assert.Equal(
            HttpStatusCode.NotFound,
            (await stranger.PostAsJsonAsync($"/ai/conversations/{id}/messages", new { message = "Let me in" }, Ct)).StatusCode);
        using (var strangerList = await ReadJsonAsync(await stranger.GetAsync("/ai/conversations", Ct)))
        {
            Assert.Equal(0, strangerList.RootElement.GetProperty("totalCount").GetInt64());
        }

        Assert.Equal(HttpStatusCode.NoContent, (await owner.DeleteAsync($"/ai/conversations/{id}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await owner.GetAsync($"/ai/conversations/{id}", Ct)).StatusCode);
    }

    [Fact]
    public async Task Complete_turn_streams_the_answer_and_saves_it_with_the_cost_from_done()
    {
        Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);
        var (userId, email, name) = await SeedStudentAsync();
        var client = factory.CreateUserClient(userId);
        var id = await CreateConversationAsync(client, title: null);

        var response = await client.PostAsJsonAsync($"/ai/conversations/{id}/messages", new { message = "Explain photosynthesis" }, Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("text/event-stream", response.Content.Headers.ContentType?.MediaType);
        var events = await ReadEventsAsync(response);
        Assert.Equal(["route", "token", "token", "tool_call", "citation", "done"], events.Select(e => e.Name));
        Assert.Equal("explain", events[0].Data.GetProperty("intent").GetString());
        Assert.Equal(StubAiService.AnswerText, string.Concat(events.Where(e => e.Name == "token").Select(e => e.Data.GetProperty("text").GetString())));
        Assert.Equal("Life Sciences Grade 11", events[4].Data.GetProperty("title").GetString());

        // The raw usage and cost never reach the browser.
        var done = events[^1].Data;
        Assert.False(done.TryGetProperty("usage", out _));
        Assert.False(done.TryGetProperty("costUsdMicros", out _));
        var messageId = done.GetProperty("messageId").GetGuid();

        await using (var scope = factory.Services.CreateAsyncScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AiTutorDbContext>();
            var saved = await db.Messages.AsNoTracking().SingleAsync(m => m.Id == messageId, Ct);
            Assert.Equal(MessageRoles.Assistant, saved.Role);
            Assert.Equal(MessageStatuses.Complete, saved.Status);
            Assert.Equal(StubAiService.AnswerText, saved.Content);
            Assert.Equal(StubAiService.CostUsdMicros, saved.CostUsdMicros);
            Assert.Equal(StubAiService.InputTokens + StubAiService.CacheReadTokens, saved.InputTokens);
            Assert.Equal(StubAiService.OutputTokens, saved.OutputTokens);
            Assert.Equal("explain", saved.RouteIntent);
            Assert.Equal(userId, saved.UserId);
        }

        using (var detail = await ReadJsonAsync(await client.GetAsync($"/ai/conversations/{id}", Ct)))
        {
            var messages = detail.RootElement.GetProperty("messages").EnumerateArray().ToList();
            Assert.Equal(["user", "assistant"], messages.Select(m => m.GetProperty("role").GetString()));
            Assert.Equal("Explain photosynthesis", detail.RootElement.GetProperty("title").GetString());
            Assert.Equal(2, detail.RootElement.GetProperty("messageCount").GetInt32());
        }

        var call = factory.AiStub.For("/v1/tutor/turn").Single(r => r.Body.Contains(id.ToString(), StringComparison.Ordinal));
        await AssertServiceTokenAsync(call, userId, "ai.tutor");

        // The context is built on the server from the profile, and no personal details leave the API.
        using var body = JsonDocument.Parse(call.Body);
        var context = body.RootElement.GetProperty("context");
        Assert.Equal("high_school", context.GetProperty("stage").GetString());
        Assert.Equal("Grade 11", context.GetProperty("level").GetString());
        Assert.Equal("caps (ieb)", context.GetProperty("curriculum").GetString());
        Assert.Equal("Explain photosynthesis", body.RootElement.GetProperty("message").GetString());
        Assert.DoesNotContain(email, call.Body, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain(name, call.Body, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task History_is_sent_with_the_next_turn()
    {
        Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);
        var (userId, _, _) = await SeedStudentAsync();
        var client = factory.CreateUserClient(userId);
        var id = await CreateConversationAsync(client, "History");

        await ReadEventsAsync(await client.PostAsJsonAsync($"/ai/conversations/{id}/messages", new { message = "First question" }, Ct));
        await ReadEventsAsync(await client.PostAsJsonAsync($"/ai/conversations/{id}/messages", new { message = "Second question" }, Ct));

        var second = factory.AiStub.For("/v1/tutor/turn").Single(r => r.Body.Contains("Second question", StringComparison.Ordinal));
        using var body = JsonDocument.Parse(second.Body);
        var history = body.RootElement.GetProperty("history").EnumerateArray()
            .Select(h => (h.GetProperty("role").GetString(), h.GetProperty("content").GetString()))
            .ToList();
        Assert.Equal([("user", "First question"), ("assistant", StubAiService.AnswerText)], history);
    }

    [Fact]
    public async Task Broken_stream_saves_an_incomplete_message_and_sends_a_stable_error()
    {
        Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);
        var (userId, _, _) = await SeedStudentAsync();
        var client = factory.CreateUserClient(userId);
        var id = await CreateConversationAsync(client, "Breaks");

        var events = await ReadEventsAsync(await client.PostAsJsonAsync($"/ai/conversations/{id}/messages", new { message = "Explain [break]" }, Ct));

        Assert.Equal("error", events[^1].Name);
        Assert.Equal("ai.interrupted", events[^1].Data.GetProperty("code").GetString());
        var saved = await AssistantMessageAsync(events[^1].Data.GetProperty("messageId").GetGuid());
        Assert.Equal(MessageStatuses.Incomplete, saved.Status);
        Assert.Equal("Photosynthesis turns ", saved.Content);
        Assert.Equal(0, saved.CostUsdMicros);
    }

    [Fact]
    public async Task Error_event_saves_what_arrived_without_leaking_the_ai_code()
    {
        Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);
        var (userId, _, _) = await SeedStudentAsync();
        var client = factory.CreateUserClient(userId);
        var id = await CreateConversationAsync(client, "Errors");

        var events = await ReadEventsAsync(await client.PostAsJsonAsync($"/ai/conversations/{id}/messages", new { message = "Explain [error]" }, Ct));

        Assert.Equal("ai.turn_failed", events[^1].Data.GetProperty("code").GetString());
        var saved = await AssistantMessageAsync(events[^1].Data.GetProperty("messageId").GetGuid());
        Assert.Equal(MessageStatuses.Incomplete, saved.Status);
    }

    [Fact]
    public async Task Unavailable_ai_service_saves_a_failed_message()
    {
        Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);
        var (userId, _, _) = await SeedStudentAsync();
        var client = factory.CreateUserClient(userId);
        var id = await CreateConversationAsync(client, "Down");

        var events = await ReadEventsAsync(await client.PostAsJsonAsync($"/ai/conversations/{id}/messages", new { message = "Explain [down]" }, Ct));

        Assert.Equal([("error", "ai.unavailable")], events.Select(e => (e.Name, e.Data.GetProperty("code").GetString())));
        var saved = await AssistantMessageAsync(events[^1].Data.GetProperty("messageId").GetGuid());
        Assert.Equal(MessageStatuses.Failed, saved.Status);
        Assert.Equal(string.Empty, saved.Content);
    }

    [Fact]
    public async Task Daily_limit_returns_429_and_deleting_conversations_does_not_reset_it()
    {
        Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);
        var (userId, _, _) = await SeedStudentAsync();
        var client = factory.CreateUserClient(userId);
        var first = await CreateConversationAsync(client, "Limit");

        for (var i = 0; i < ApiFactory.DailyMessageLimit; i++)
        {
            var ok = await client.PostAsJsonAsync($"/ai/conversations/{first}/messages", new { message = $"Question {i}" }, Ct);
            Assert.Equal(HttpStatusCode.OK, ok.StatusCode);
            await ReadEventsAsync(ok);
        }

        Assert.Equal(HttpStatusCode.NoContent, (await client.DeleteAsync($"/ai/conversations/{first}", Ct)).StatusCode);
        var second = await CreateConversationAsync(client, "Limit again");
        var calls = factory.AiStub.For("/v1/tutor/turn").Count();

        var limited = await client.PostAsJsonAsync($"/ai/conversations/{second}/messages", new { message = "One more" }, Ct);

        Assert.Equal(HttpStatusCode.TooManyRequests, limited.StatusCode);
        Assert.Equal("application/problem+json", limited.Content.Headers.ContentType?.MediaType);
        using var problem = await ReadJsonAsync(limited);
        Assert.Equal("ai.daily_limit_reached", problem.RootElement.GetProperty("code").GetString());
        Assert.True(problem.RootElement.TryGetProperty("traceId", out _));
        Assert.Equal(calls, factory.AiStub.For("/v1/tutor/turn").Count());
    }

    [Fact]
    public async Task Student_without_a_profile_gets_409()
    {
        Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);
        var client = factory.CreateUserClient(Guid.CreateVersion7());
        var id = await CreateConversationAsync(client, "No profile");

        var response = await client.PostAsJsonAsync($"/ai/conversations/{id}/messages", new { message = "Hello" }, Ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Invalid_message_is_400()
    {
        Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);
        var client = factory.CreateUserClient(Guid.CreateVersion7());
        var id = await CreateConversationAsync(client, "Invalid");

        var response = await client.PostAsJsonAsync($"/ai/conversations/{id}/messages", new { message = new string('m', 4001) }, Ct);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Account_deletion_erases_conversations_and_the_ai_service_data()
    {
        Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);
        var (userId, email, name) = await SeedStudentAsync();
        var client = factory.CreateUserClient(userId);
        var id = await CreateConversationAsync(client, "To erase");
        await ReadEventsAsync(await client.PostAsJsonAsync($"/ai/conversations/{id}/messages", new { message = "Before deletion" }, Ct));

        await factory.AppHost.InvokeMessageAndWaitAsync(new AccountDeletionRequested(userId, email, name, TimeProvider.System.GetUtcNow()));

        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/ai/conversations/{id}", Ct)).StatusCode);
        await using (var scope = factory.Services.CreateAsyncScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AiTutorDbContext>();
            Assert.False(await db.Messages.AnyAsync(m => m.UserId == userId, Ct));
            Assert.True(await db.Messages.IgnoreQueryFilters().AnyAsync(m => m.UserId == userId && m.DeletedAt != null, Ct));
        }

        var erase = Assert.Single(factory.AiStub.Requests, r => r.Path == "/v1/users/me/data" && r.Authorization?.Contains(' ', StringComparison.Ordinal) == true
            && new JsonWebToken(r.Authorization.Split(' ')[1]).Subject == userId.ToString());
        await AssertServiceTokenAsync(erase, userId, "ai.notes");
    }

    private async Task AssertServiceTokenAsync(RecordedRequest call, Guid userId, string scope)
    {
        Assert.NotNull(call.Authorization);
        Assert.StartsWith("Bearer ", call.Authorization, StringComparison.Ordinal);
        var token = call.Authorization["Bearer ".Length..];

        var jwks = new JsonWebKeySet(await factory.CreateClient().GetStringAsync("/.well-known/jwks.json", Ct));
        var issuer = factory.Services.GetRequiredService<IConfiguration>()["Auth:Issuer"];
        var result = await new JsonWebTokenHandler().ValidateTokenAsync(token, new TokenValidationParameters
        {
            ValidIssuer = issuer,
            ValidAudience = "aptiverse-ai",
            IssuerSigningKeys = jwks.GetSigningKeys(),
            ValidAlgorithms = [SecurityAlgorithms.EcdsaSha256],
            RequireExpirationTime = true,
        });

        Assert.True(result.IsValid, result.Exception?.Message);
        var jwt = (JsonWebToken)result.SecurityToken;
        Assert.Equal(userId.ToString(), jwt.Subject);
        Assert.Equal(scope, jwt.GetClaim("scope").Value);
        Assert.Equal(TimeSpan.FromSeconds(60), jwt.ValidTo - jwt.IssuedAt);
    }

    private async Task<(Guid UserId, string Email, string Name)> SeedStudentAsync()
    {
        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();
        var email = $"student-{Guid.NewGuid():N}@example.test";
        var name = $"Thandiwe {Guid.NewGuid():N}";
        var user = User.Create(email, email.ToUpperInvariant(), name, emailConfirmed: true);
        user.CompleteOnboarding(EducationLevels.HighSchool, 11, null, Curricula.Ieb, null, TimeProvider.System.GetUtcNow());
        db.Users.Add(user);
        await db.SaveChangesAsync(Ct);
        return (user.Id, email, name);
    }

    private async Task<Message> AssistantMessageAsync(Guid messageId)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AiTutorDbContext>();
        return await db.Messages.AsNoTracking().SingleAsync(m => m.Id == messageId && m.Role == MessageRoles.Assistant, Ct);
    }

    private static async Task<Guid> CreateConversationAsync(HttpClient client, string? title)
    {
        var response = await client.PostAsJsonAsync("/ai/conversations", new { title }, Ct);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        using var json = await ReadJsonAsync(response);
        return json.RootElement.GetProperty("id").GetGuid();
    }

    private static async Task<JsonDocument> ReadJsonAsync(HttpResponseMessage response) =>
        JsonDocument.Parse(await response.Content.ReadAsStringAsync(Ct));

    private static async Task<List<(string Name, JsonElement Data)>> ReadEventsAsync(HttpResponseMessage response)
    {
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await using var stream = await response.Content.ReadAsStreamAsync(Ct);
        var events = new List<(string, JsonElement)>();
        await foreach (var item in SseParser.Create(stream).EnumerateAsync(Ct))
        {
            using var data = JsonDocument.Parse(item.Data);
            events.Add((item.EventType, data.RootElement.Clone()));
        }

        return events;
    }
}
