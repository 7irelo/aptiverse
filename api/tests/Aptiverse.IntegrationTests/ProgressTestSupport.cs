using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Aptiverse.Academics.Contracts;
using Aptiverse.Practice.Contracts;
using Aptiverse.Progress.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Wolverine.Tracking;
using static Aptiverse.IntegrationTests.AcademicsTestSupport;

namespace Aptiverse.IntegrationTests;

/// <summary>A student enrolled in one subject, with the unit id Progress keys everything by.</summary>
internal sealed record ProgressStudent(Guid UserId, HttpClient Client, Guid EnrolmentId, Guid UnitId);

/// <summary>Builds students through the real routes and delivers Practice and Academics events to Progress directly.</summary>
internal sealed class ProgressTestSupport(ApiFactory factory)
{
    private readonly AcademicsTestSupport _academics = new(factory);

    public AcademicsTestSupport Academics => _academics;

    public async Task<ProgressStudent> StudentAsync(string slug = "math")
    {
        var (userId, client) = await _academics.HighSchoolAsync();
        var enrolmentId = (await _academics.EnrolCapsAsync(client, slug))[0];
        using var units = await ReadJsonAsync(await client.GetAsync("/academics/units", Ct));
        var unitId = units.RootElement.EnumerateArray()
            .Single(u => u.GetProperty("enrolmentId").GetGuid() == enrolmentId)
            .GetProperty("unitId").GetGuid();
        return new ProgressStudent(userId, client, enrolmentId, unitId);
    }

    public static PracticeAttemptGraded Graded(
        ProgressStudent student,
        decimal scorePercent,
        DateTimeOffset? submittedAt = null,
        bool partial = false,
        Guid? attemptId = null,
        params TopicAccuracy[] topics)
    {
        var at = submittedAt ?? Now;
        return new PracticeAttemptGraded(
            attemptId ?? Guid.CreateVersion7(),
            Guid.CreateVersion7(),
            student.UserId,
            student.UnitId,
            (int)scorePercent,
            100,
            scorePercent,
            partial,
            600,
            topics,
            at,
            at.AddSeconds(1));
    }

    public static TopicAccuracy Topic(string name, int total, int correct, int? marked = null) =>
        new(name, total, correct, marked ?? total, correct, marked ?? total);

    public static AssessmentGraded Mark(ProgressStudent student, Guid assessmentId, decimal percent, DateTimeOffset occurredAt) =>
        new(student.UserId, assessmentId, student.UnitId, "test", percent, null, null, occurredAt, occurredAt);

    public Task<ITrackedSession> DeliverAsync(object message) => factory.AppHost.InvokeMessageAndWaitAsync(message);

    public async Task WithDbAsync(Func<ProgressDbContext, Task> work)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        await work(scope.ServiceProvider.GetRequiredService<ProgressDbContext>());
    }

    public async Task<T> WithScopeAsync<T>(Func<IServiceProvider, Task<T>> work)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        return await work(scope.ServiceProvider);
    }

    public static async Task<(JsonElement Goal, string ETag)> CreateGoalAsync(
        HttpClient client,
        Guid unitId,
        string criteriaType,
        decimal target,
        string? topic = null,
        object[]? milestones = null,
        HttpStatusCode expected = HttpStatusCode.Created)
    {
        var response = await PostGoalAsync(client, unitId, criteriaType, target, topic, milestones);
        Assert.True(response.StatusCode == expected, await response.Content.ReadAsStringAsync(Ct));
        using var json = await ReadJsonAsync(response);
        return (json.RootElement.Clone(), response.Headers.ETag?.ToString() ?? string.Empty);
    }

    public static Task<HttpResponseMessage> PostGoalAsync(
        HttpClient client,
        Guid unitId,
        string criteriaType,
        decimal target,
        string? topic = null,
        object[]? milestones = null,
        string? idempotencyKey = null)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "/progress/goals")
        {
            Content = JsonContent.Create(new
            {
                title = $"Goal {criteriaType}",
                criteriaType,
                studyUnitId = unitId,
                topic,
                targetValue = target,
                dueAt = Now.AddDays(30),
                milestones,
            }),
        };
        if (idempotencyKey is not null)
        {
            request.Headers.Add("Idempotency-Key", idempotencyKey);
        }

        return client.SendAsync(request, Ct);
    }

    public static async Task<JsonElement> GetJsonAsync(HttpClient client, string url)
    {
        var response = await client.GetAsync(url, Ct);
        Assert.True(response.StatusCode == HttpStatusCode.OK, $"{url}: {response.StatusCode} {await response.Content.ReadAsStringAsync(Ct)}");
        using var json = await ReadJsonAsync(response);
        return json.RootElement.Clone();
    }

    public static Task<HttpResponseMessage> SendAsync(HttpClient client, HttpMethod method, string url, object? body = null, string? ifMatch = null)
    {
        var request = new HttpRequestMessage(method, url);
        if (body is not null)
        {
            request.Content = JsonContent.Create(body);
        }

        if (ifMatch is not null)
        {
            request.Headers.TryAddWithoutValidation("If-Match", ifMatch);
        }

        return client.SendAsync(request, Ct);
    }
}
