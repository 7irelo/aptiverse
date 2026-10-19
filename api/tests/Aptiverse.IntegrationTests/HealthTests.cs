using System.Net;

namespace Aptiverse.IntegrationTests;

[Collection(ApiTestGroup.Name)]
public sealed class HealthTests(ApiFactory factory)
{
    [Theory]
    [InlineData("/health/live")]
    [InlineData("/health/ready")]
    public async Task Health_endpoints_are_200(string path)
    {
        Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);

        var response = await factory.CreateClient().GetAsync(path, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Unknown_route_is_problem_details_without_internals()
    {
        Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);

        var response = await factory.CreateAdminClient().GetAsync("/nope", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Anonymous_request_to_unknown_route_fails_closed()
    {
        Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);

        // The fallback policy runs before routing can answer 404, so anonymous callers cannot enumerate routes.
        var response = await factory.CreateClient().GetAsync("/nope", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }
}
