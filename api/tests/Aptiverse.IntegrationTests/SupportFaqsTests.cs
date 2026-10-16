using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Aptiverse.Support.Contracts;
using Wolverine.Tracking;

namespace Aptiverse.IntegrationTests;

[Collection(ApiTestGroup.Name)]
public sealed class SupportFaqsTests(ApiFactory factory)
{
    private static readonly string[] ContractProperties = ["id", "question", "answer", "category", "sortOrder"];

    [Fact]
    public async Task List_returns_seeded_faqs_in_contract_shape_and_order()
    {
        Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);
        var client = factory.CreateClient();

        var response = await client.GetAsync("/support/faqs", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
        var items = json.RootElement.EnumerateArray().ToList();
        Assert.NotEmpty(items);

        foreach (var item in items)
        {
            Assert.Equal(ContractProperties, item.EnumerateObject().Select(p => p.Name));
            Assert.True(Guid.TryParse(item.GetProperty("id").GetString(), out _));
            Assert.Equal(JsonValueKind.String, item.GetProperty("question").ValueKind);
            Assert.Equal(JsonValueKind.String, item.GetProperty("answer").ValueKind);
            Assert.Equal(JsonValueKind.String, item.GetProperty("category").ValueKind);
            Assert.Equal(JsonValueKind.Number, item.GetProperty("sortOrder").ValueKind);
        }

        var keys = items.Select(i => (i.GetProperty("category").GetString()!, i.GetProperty("sortOrder").GetInt32())).ToList();
        var sorted = keys.OrderBy(k => k.Item1, StringComparer.Ordinal).ThenBy(k => k.Item2).ToList();
        Assert.Equal(sorted, keys);
        Assert.Contains(items, i => i.GetProperty("question").GetString() == "What is Aptiverse?");
    }

    [Fact]
    public async Task Create_without_auth_is_401()
    {
        Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync(
            "/support/faqs",
            new { question = "Q?", answer = "A.", category = "General", sortOrder = 1, isPublished = true },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Create_with_invalid_body_is_400_validation_problem()
    {
        Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);
        var client = factory.CreateAdminClient();

        var response = await client.PostAsJsonAsync(
            "/support/faqs",
            new { question = "", answer = "A.", category = "General", sortOrder = -5, isPublished = true },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
        Assert.Equal(400, json.RootElement.GetProperty("status").GetInt32());
        Assert.True(json.RootElement.TryGetProperty("traceId", out _));
        var errors = json.RootElement.GetProperty("errors");
        Assert.True(errors.TryGetProperty("Question", out _));
        Assert.True(errors.TryGetProperty("SortOrder", out _));
    }

    [Fact]
    public async Task Admin_can_create_published_faq_and_it_is_listed()
    {
        Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);
        var admin = factory.CreateAdminClient();
        var question = $"Can I change my grade later? {Guid.NewGuid():N}";

        HttpResponseMessage? created = null;

        // Waits until the outbox has delivered and handled the FaqPublished event raised by the insert.
        var session = await factory.AppHost.ExecuteAndWaitAsync(
            async () => created = await admin.PostAsJsonAsync(
                "/support/faqs",
                new { question, answer = "Yes, from your profile.", category = "Account", sortOrder = 5, isPublished = true },
                TestContext.Current.CancellationToken),
            timeoutInMilliseconds: 30_000);

        Assert.Equal(HttpStatusCode.Created, created!.StatusCode);
        var published = session.Executed.SingleMessage<FaqPublished>();
        Assert.Equal("Account", published.Category);

        var duplicate = await admin.PostAsJsonAsync(
            "/support/faqs",
            new { question, answer = "Again.", category = "Account", sortOrder = 6, isPublished = true },
            TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.Conflict, duplicate.StatusCode);

        var list = await factory.CreateClient().GetStringAsync("/support/faqs", TestContext.Current.CancellationToken);
        Assert.Contains(question, list, StringComparison.Ordinal);
    }
}
