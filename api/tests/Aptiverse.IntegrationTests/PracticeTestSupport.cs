using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Aptiverse.Practice.Contracts;
using Aptiverse.Practice.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Wolverine.Tracking;
using static Aptiverse.IntegrationTests.AcademicsTestSupport;

namespace Aptiverse.IntegrationTests;

/// <summary>A student with an upcoming assessment, ready to generate practice tests for it.</summary>
internal sealed record PracticeStudent(Guid UserId, HttpClient Client, Guid AssessmentId);

/// <summary>Builds students, tests and attempts through the real routes, and drives background messages by hand.</summary>
internal sealed class PracticeTestSupport(ApiFactory factory)
{
    private readonly AcademicsTestSupport _academics = new(factory);

    public async Task<PracticeStudent> HighSchoolStudentAsync()
    {
        var (userId, client) = await _academics.HighSchoolAsync();
        var enrolmentId = (await _academics.EnrolCapsAsync(client, "math"))[0];
        var assessment = await AcademicsTestSupport.CreateAssessmentAsync(client, enrolmentId, title: "June exam");
        return new PracticeStudent(userId, client, assessment.GetProperty("id").GetGuid());
    }

    public async Task<PracticeStudent> TertiaryStudentAsync()
    {
        var (userId, client) = await _academics.TertiaryAsync();
        var course = await AcademicsTestSupport.CreateCourseAsync(client, $"Economics {Guid.NewGuid():N}"[..20]);
        var assessment = await AcademicsTestSupport.CreateAssessmentAsync(client, course.GetProperty("enrolmentId").GetGuid(), title: "Midterm");
        return new PracticeStudent(userId, client, assessment.GetProperty("id").GetGuid());
    }

    /// <summary>Posts a generation request and waits until the start message has been handled.</summary>
    public async Task<HttpResponseMessage> GenerateAsync(
        PracticeStudent student,
        string format = "quiz",
        string[]? topics = null,
        string? mode = "untimed",
        int? durationMinutes = null,
        int? questionCount = null,
        int? paperMarks = null,
        string? idempotencyKey = null)
    {
        HttpResponseMessage? response = null;
        await _academics.TrackAsync(async () =>
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, "/practice/tests/generate")
            {
                Content = JsonContent.Create(new
                {
                    assessmentId = student.AssessmentId,
                    format,
                    topics = topics ?? ["Algebra"],
                    mode,
                    durationMinutes,
                    questionCount,
                    paperMarks,
                }),
            };
            if (idempotencyKey is not null)
            {
                request.Headers.Add("Idempotency-Key", idempotencyKey);
            }

            response = await student.Client.SendAsync(request, Ct);
        });
        return response!;
    }

    public static async Task<(Guid TestId, Guid JobId)> AcceptedAsync(HttpResponseMessage response)
    {
        Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
        using var json = await AcademicsTestSupport.ReadJsonAsync(response);
        return (json.RootElement.GetProperty("testId").GetGuid(), json.RootElement.GetProperty("jobId").GetGuid());
    }

    public Task<ITrackedSession> PollAsync(Guid jobId) =>
        factory.AppHost.InvokeMessageAndWaitAsync(new PollPracticeGeneration(jobId));

    /// <summary>Generates and completes a test; returns its id.</summary>
    public async Task<Guid> ReadyTestAsync(
        PracticeStudent student,
        string format = "quiz",
        string? mode = "untimed",
        int? durationMinutes = null,
        int? paperMarks = null)
    {
        var (testId, jobId) = await AcceptedAsync(await GenerateAsync(student, format, mode: mode, durationMinutes: durationMinutes, paperMarks: paperMarks));
        await PollAsync(jobId);
        return testId;
    }

    public static async Task<JsonElement> StartAsync(HttpClient client, Guid testId)
    {
        var response = await client.PostAsync($"/practice/tests/{testId}/attempts", null, Ct);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        using var json = await AcademicsTestSupport.ReadJsonAsync(response);
        return json.RootElement.Clone();
    }

    /// <summary>A ready test with a started attempt: (test id, attempt state).</summary>
    public async Task<(Guid TestId, JsonElement Attempt)> StartedAsync(PracticeStudent student, string format = "quiz", string? mode = "untimed", int? durationMinutes = null)
    {
        var testId = await ReadyTestAsync(student, format, mode, durationMinutes);
        return (testId, await StartAsync(student.Client, testId));
    }

    public static Guid AttemptId(JsonElement attempt) => attempt.GetProperty("attemptId").GetGuid();

    /// <summary>The questions of an attempt state, in order: (id, kind).</summary>
    public static List<(Guid Id, string Kind)> Questions(JsonElement attempt) =>
        attempt.GetProperty("questions").EnumerateArray()
            .Select(q => (q.GetProperty("id").GetGuid(), q.GetProperty("kind").GetString()!))
            .ToList();

    public static Task<HttpResponseMessage> SaveAsync(HttpClient client, Guid attemptId, Guid questionId, object body) =>
        client.PutAsJsonAsync($"/practice/attempts/{attemptId}/answers/{questionId}", body, Ct);

    /// <summary>Submits through the route and waits for any grading message it sends.</summary>
    public async Task<HttpResponseMessage> SubmitAsync(HttpClient client, Guid attemptId)
    {
        HttpResponseMessage? response = null;
        await _academics.TrackAsync(async () => response = await client.PostAsync($"/practice/attempts/{attemptId}/submit", null, Ct));
        return response!;
    }

    public async Task<ITrackedSession> TrackAsync(Func<Task> action) => await _academics.TrackAsync(action);

    public async Task WithDbAsync(Func<PracticeDbContext, Task> work)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        await work(scope.ServiceProvider.GetRequiredService<PracticeDbContext>());
    }

    /// <summary>Moves a timed attempt's start and deadline back so its deadline was <paramref name="ago"/> ago.</summary>
    public async Task<DateTimeOffset> ExpireAsync(Guid attemptId, TimeSpan ago)
    {
        DateTimeOffset deadline = default;
        await WithDbAsync(async db =>
        {
            var attempt = await db.Attempts.AsNoTracking().SingleAsync(a => a.Id == attemptId, Ct);
            var length = attempt.DeadlineAt!.Value - attempt.StartedAt;
            deadline = AcademicsTestSupport.Now - ago;
            var started = deadline - length;
            await db.Attempts.Where(a => a.Id == attemptId)
                .ExecuteUpdateAsync(set => set.SetProperty(a => a.DeadlineAt, deadline).SetProperty(a => a.StartedAt, started), Ct);
        });
        return deadline;
    }
}
