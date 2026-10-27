using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Aptiverse.Practice.Contracts;
using Aptiverse.Practice.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Wolverine.Tracking;
using static Aptiverse.IntegrationTests.AcademicsTestSupport;

namespace Aptiverse.IntegrationTests;

[Collection(ApiTestGroup.Name)]
public sealed class PracticeGenerationTests(ApiFactory factory)
{
    private readonly PracticeTestSupport _support = new(factory);

    private void SkipWithoutDocker() => Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);

    [Fact]
    public async Task Every_route_without_auth_is_401_and_a_parent_is_403()
    {
        SkipWithoutDocker();
        var anonymous = factory.CreateClient();
        var parent = factory.CreateUserClient(Guid.CreateVersion7(), role: "parent");
        var id = Guid.CreateVersion7();
        var routes = new (HttpMethod Method, string Path, object? Body)[]
        {
            (HttpMethod.Post, "/practice/tests/generate", new { assessmentId = id, format = "quiz", mode = "untimed" }),
            (HttpMethod.Get, $"/practice/tests/{id}/status", null),
            (HttpMethod.Get, "/practice/generations/active", null),
            (HttpMethod.Get, "/practice/tests", null),
            (HttpMethod.Get, $"/practice/tests/{id}", null),
            (HttpMethod.Delete, $"/practice/tests/{id}", null),
            (HttpMethod.Post, $"/practice/tests/{id}/attempts", null),
            (HttpMethod.Get, "/practice/attempts/active", null),
            (HttpMethod.Get, $"/practice/attempts/{id}", null),
            (HttpMethod.Put, $"/practice/attempts/{id}/answers/{id}", new { selectedIndex = 0, baseRevision = 0 }),
            (HttpMethod.Post, $"/practice/attempts/{id}/focus-loss", new { kind = "window_blur" }),
            (HttpMethod.Post, $"/practice/attempts/{id}/pause", null),
            (HttpMethod.Post, $"/practice/attempts/{id}/resume", null),
            (HttpMethod.Post, $"/practice/attempts/{id}/submit", null),
            (HttpMethod.Get, $"/practice/attempts/{id}/results", null),
        };

        foreach (var (method, path, body) in routes)
        {
            Assert.Equal(HttpStatusCode.Unauthorized, (await SendAsync(anonymous, method, path, body)).StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, (await SendAsync(parent, method, path, body)).StatusCode);
        }
    }

    [Fact]
    public async Task Generation_builds_the_request_on_the_server_and_the_poller_readies_the_test()
    {
        SkipWithoutDocker();
        var student = await _support.HighSchoolStudentAsync();

        var response = await _support.GenerateAsync(student, topics: ["Algebra", "Functions"], questionCount: 12);
        var (testId, jobId) = await PracticeTestSupport.AcceptedAsync(response);
        Assert.Equal($"/practice/tests/{testId}/status", response.Headers.Location?.OriginalString);

        // The start message called the ai service with a service token and a body built from the student's records.
        var start = Assert.Single(factory.AiStub.For("/v1/generations"), r => r.Body.Contains(jobId.ToString(), StringComparison.Ordinal));
        var token = new JsonWebToken(start.Authorization!["Bearer ".Length..]);
        Assert.Equal(student.UserId.ToString(), token.Subject);
        Assert.Equal("ai.generate", token.GetClaim("scope").Value);
        using (var body = JsonDocument.Parse(start.Body))
        {
            var root = body.RootElement;
            Assert.Equal(jobId.ToString(), root.GetProperty("job_id").GetString());
            Assert.Equal("high_school", root.GetProperty("stage").GetString());
            Assert.Equal("Grade 11", root.GetProperty("level").GetString());
            Assert.Equal(11, root.GetProperty("grade").GetInt32());
            Assert.Equal("caps", root.GetProperty("curriculum").GetString());
            Assert.Equal("quiz", root.GetProperty("format").GetString());
            Assert.Equal("June exam", root.GetProperty("assessment_title").GetString());
            Assert.Equal(30, root.GetProperty("total_marks").GetInt32());
            Assert.Equal(["Algebra", "Functions"], root.GetProperty("topics").EnumerateArray().Select(t => t.GetString()));
        }

        Assert.Equal("running", await StatusAsync(student.Client, testId));
        using (var active = await ReadJsonAsync(await student.Client.GetAsync("/practice/generations/active", Ct)))
        {
            Assert.Equal(jobId, active.RootElement.GetProperty("jobId").GetGuid());
            Assert.Equal(student.AssessmentId, active.RootElement.GetProperty("assessmentId").GetGuid());
        }

        var session = await _support.PollAsync(jobId);
        var generated = Assert.Single(MessagesOf<PracticeTestGenerated>(session));
        Assert.Equal(3, generated.QuestionCount);

        Assert.Equal("ready", await StatusAsync(student.Client, testId));
        Assert.Equal(HttpStatusCode.NoContent, (await student.Client.GetAsync("/practice/generations/active", Ct)).StatusCode);

        // The two-correct-answers question was dropped; marks are the sum of what was kept.
        using var test = await ReadJsonAsync(await student.Client.GetAsync($"/practice/tests/{testId}", Ct));
        Assert.Equal(3, test.RootElement.GetProperty("questionCount").GetInt32());
        Assert.Equal(Generation.QuizMarks, test.RootElement.GetProperty("totalMarks").GetInt32());
        Assert.True(test.RootElement.GetProperty("pauseAllowed").GetBoolean());

        await _support.WithDbAsync(async db =>
        {
            var job = await db.GenerationJobs.AsNoTracking().SingleAsync(j => j.Id == jobId, Ct);
            Assert.Equal(JobStatuses.Succeeded, job.Status);
            Assert.Equal(Generation.GenerationCostUsdMicros, job.CostUsdMicros);
        });
    }

    [Fact]
    public async Task Instructions_never_carry_questions_or_answers_before_an_attempt()
    {
        SkipWithoutDocker();
        var student = await _support.HighSchoolStudentAsync();
        var testId = await _support.ReadyTestAsync(student);

        var raw = await (await student.Client.GetAsync($"/practice/tests/{testId}", Ct)).Content.ReadAsStringAsync(Ct);
        foreach (var leak in new[] { "answerIndex", "expectedAnswer", "memo", "explanation", "stem", "Which option is right" })
        {
            Assert.DoesNotContain(leak, raw, StringComparison.OrdinalIgnoreCase);
        }

        using var json = JsonDocument.Parse(raw);
        Assert.Equal(JsonValueKind.Null, json.RootElement.GetProperty("attempt").ValueKind);
        Assert.Equal(JsonValueKind.Null, json.RootElement.GetProperty("activeAttempt").ValueKind);
    }

    [Fact]
    public async Task Another_users_assessment_and_tests_are_404()
    {
        SkipWithoutDocker();
        var owner = await _support.HighSchoolStudentAsync();
        var stranger = await _support.HighSchoolStudentAsync();
        var testId = await _support.ReadyTestAsync(owner);

        var foreign = await _support.GenerateAsync(stranger with { AssessmentId = owner.AssessmentId });
        Assert.Equal(HttpStatusCode.NotFound, foreign.StatusCode);
        Assert.Equal("practice.assessment_not_found", await ProblemCodeAsync(foreign));

        Assert.Equal(HttpStatusCode.NotFound, (await stranger.Client.GetAsync($"/practice/tests/{testId}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await stranger.Client.GetAsync($"/practice/tests/{testId}/status", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await stranger.Client.DeleteAsync($"/practice/tests/{testId}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await stranger.Client.PostAsync($"/practice/tests/{testId}/attempts", null, Ct)).StatusCode);
        using var list = await ReadJsonAsync(await stranger.Client.GetAsync("/practice/tests", Ct));
        Assert.Equal(0, list.RootElement.GetProperty("totalCount").GetInt64());

        Assert.Equal(HttpStatusCode.OK, (await owner.Client.GetAsync($"/practice/tests/{testId}", Ct)).StatusCode);
    }

    [Fact]
    public async Task Reading_is_high_school_only_and_an_exam_paper_is_timed_at_a_minute_per_mark()
    {
        SkipWithoutDocker();
        var tertiary = await _support.TertiaryStudentAsync();
        var reading = await _support.GenerateAsync(tertiary, format: "reading", questionCount: 5);
        Assert.Equal(HttpStatusCode.BadRequest, reading.StatusCode);
        Assert.Equal("practice.format_not_available", await ProblemCodeAsync(reading));

        var (testId, jobId) = await PracticeTestSupport.AcceptedAsync(await _support.GenerateAsync(tertiary, format: "exam_paper", mode: null, paperMarks: 60));
        var start = Assert.Single(factory.AiStub.For("/v1/generations"), r => r.Body.Contains(jobId.ToString(), StringComparison.Ordinal));
        using (var body = JsonDocument.Parse(start.Body))
        {
            Assert.Equal("university", body.RootElement.GetProperty("stage").GetString());
            Assert.Equal("First year", body.RootElement.GetProperty("level").GetString());
            Assert.Equal(JsonValueKind.Null, body.RootElement.GetProperty("grade").ValueKind);
            Assert.Equal(60, body.RootElement.GetProperty("total_marks").GetInt32());
        }

        await _support.PollAsync(jobId);
        using var test = await ReadJsonAsync(await tertiary.Client.GetAsync($"/practice/tests/{testId}", Ct));
        Assert.Equal("timed", test.RootElement.GetProperty("mode").GetString());
        Assert.Equal(60, test.RootElement.GetProperty("durationMinutes").GetInt32());
        Assert.False(test.RootElement.GetProperty("pauseAllowed").GetBoolean());
    }

    [Fact]
    public async Task One_generation_at_a_time_and_an_idempotent_replay_returns_the_same_job()
    {
        SkipWithoutDocker();
        var student = await _support.HighSchoolStudentAsync();
        var key = $"key-{Guid.NewGuid():N}";

        var first = await PracticeTestSupport.AcceptedAsync(await _support.GenerateAsync(student, idempotencyKey: key));
        var replay = await PracticeTestSupport.AcceptedAsync(await _support.GenerateAsync(student, idempotencyKey: key));
        Assert.Equal(first, replay);
        Assert.Single(factory.AiStub.For("/v1/generations"), r => r.Body.Contains(first.JobId.ToString(), StringComparison.Ordinal));

        var second = await _support.GenerateAsync(student);
        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
        Assert.Equal("practice.generation_in_progress", await ProblemCodeAsync(second));
        using (var problem = await ReadJsonAsync(second))
        {
            Assert.Equal(first.JobId, problem.RootElement.GetProperty("jobId").GetGuid());
        }

        var badKey = await _support.GenerateAsync(student, idempotencyKey: "short");
        Assert.Equal(HttpStatusCode.BadRequest, badKey.StatusCode);

        var stranger = await _support.HighSchoolStudentAsync();
        Assert.Equal(HttpStatusCode.NoContent, (await stranger.Client.GetAsync("/practice/generations/active", Ct)).StatusCode);
    }

    [Fact]
    public async Task A_failed_or_invalid_generation_fails_the_test_and_frees_the_slot()
    {
        SkipWithoutDocker();
        var student = await _support.HighSchoolStudentAsync();

        var (failedId, failedJob) = await PracticeTestSupport.AcceptedAsync(await _support.GenerateAsync(student, topics: [Generation.Fail]));
        var session = await _support.PollAsync(failedJob);
        var failure = Assert.Single(MessagesOf<PracticeTestGenerationFailed>(session));
        Assert.Equal("practice.generation_failed", failure.ErrorCode);
        using (var status = await ReadJsonAsync(await student.Client.GetAsync($"/practice/tests/{failedId}/status", Ct)))
        {
            Assert.Equal("failed", status.RootElement.GetProperty("status").GetString());
            Assert.Equal("practice.generation_failed", status.RootElement.GetProperty("errorCode").GetString());
        }

        var (junkId, junkJob) = await PracticeTestSupport.AcceptedAsync(await _support.GenerateAsync(student, topics: [Generation.Junk]));
        await _support.PollAsync(junkJob);
        using (var status = await ReadJsonAsync(await student.Client.GetAsync($"/practice/tests/{junkId}/status", Ct)))
        {
            Assert.Equal("practice.generation_invalid_output", status.RootElement.GetProperty("errorCode").GetString());
        }

        var notReady = await student.Client.PostAsync($"/practice/tests/{junkId}/attempts", null, Ct);
        Assert.Equal(HttpStatusCode.Conflict, notReady.StatusCode);
        Assert.Equal("practice.test_not_ready", await ProblemCodeAsync(notReady));
    }

    [Fact]
    public async Task The_poller_keeps_polling_a_running_job_and_gives_up_after_the_timeout()
    {
        SkipWithoutDocker();
        var student = await _support.HighSchoolStudentAsync();
        var (testId, jobId) = await PracticeTestSupport.AcceptedAsync(await _support.GenerateAsync(student, topics: [Generation.Slow]));

        var session = await _support.PollAsync(jobId);
        Assert.Contains(session.Scheduled.MessagesOf<PollPracticeGeneration>(), m => m.JobId == jobId);
        Assert.Equal("running", await StatusAsync(student.Client, testId));

        await _support.WithDbAsync(db => db.GenerationJobs.Where(j => j.Id == jobId)
            .ExecuteUpdateAsync(set => set.SetProperty(j => j.PollDeadlineAt, Now.AddMinutes(-1)), Ct));
        await _support.PollAsync(jobId);

        using var status = await ReadJsonAsync(await student.Client.GetAsync($"/practice/tests/{testId}/status", Ct));
        Assert.Equal("failed", status.RootElement.GetProperty("status").GetString());
        Assert.Equal("practice.generation_timed_out", status.RootElement.GetProperty("errorCode").GetString());
    }

    [Fact]
    public async Task A_start_the_ai_service_refuses_is_retried_then_fails()
    {
        SkipWithoutDocker();
        var student = await _support.HighSchoolStudentAsync();
        var (testId, jobId) = await PracticeTestSupport.AcceptedAsync(await _support.GenerateAsync(student, topics: [Generation.Down]));
        Assert.Equal("queued", await StatusAsync(student.Client, testId));

        await factory.AppHost.InvokeMessageAndWaitAsync(new StartPracticeGeneration(jobId));
        Assert.Equal("queued", await StatusAsync(student.Client, testId));
        await factory.AppHost.InvokeMessageAndWaitAsync(new StartPracticeGeneration(jobId));

        using var status = await ReadJsonAsync(await student.Client.GetAsync($"/practice/tests/{testId}/status", Ct));
        Assert.Equal("failed", status.RootElement.GetProperty("status").GetString());
        Assert.Equal(3, status.RootElement.GetProperty("attemptsMade").GetInt32());
    }

    [Fact]
    public async Task The_daily_generation_limit_returns_429()
    {
        SkipWithoutDocker();
        var student = await _support.HighSchoolStudentAsync();
        for (var i = 0; i < ApiFactory.DailyGenerationLimit; i++)
        {
            var (testId, _) = await PracticeTestSupport.AcceptedAsync(await _support.GenerateAsync(student, topics: [Generation.Fail]));
            await _support.WithDbAsync(async db => await _support.PollAsync(await db.GenerationJobs.Where(j => j.TestId == testId).Select(j => j.Id).SingleAsync(Ct)));

            // Deleting a test does not give the generation back.
            Assert.Equal(HttpStatusCode.NoContent, (await student.Client.DeleteAsync($"/practice/tests/{testId}", Ct)).StatusCode);
        }

        var limited = await _support.GenerateAsync(student);
        Assert.Equal(HttpStatusCode.TooManyRequests, limited.StatusCode);
        Assert.Equal("practice.daily_limit_reached", await ProblemCodeAsync(limited));
    }

    [Fact]
    public async Task List_filters_and_pages_only_the_callers_tests()
    {
        SkipWithoutDocker();
        var student = await _support.HighSchoolStudentAsync();
        var ready = await _support.ReadyTestAsync(student);
        var (failed, failedJob) = await PracticeTestSupport.AcceptedAsync(await _support.GenerateAsync(student, topics: [Generation.Fail]));
        await _support.PollAsync(failedJob);
        await PracticeTestSupport.StartAsync(student.Client, ready);

        using (var all = await ReadJsonAsync(await student.Client.GetAsync("/practice/tests?pageSize=1", Ct)))
        {
            Assert.Equal(2, all.RootElement.GetProperty("totalCount").GetInt64());
            Assert.Equal(failed, all.RootElement.GetProperty("items")[0].GetProperty("id").GetGuid());
        }

        using (var attempted = await ReadJsonAsync(await student.Client.GetAsync("/practice/tests?attempted=true", Ct)))
        {
            var item = Assert.Single(attempted.RootElement.GetProperty("items").EnumerateArray());
            Assert.Equal(ready, item.GetProperty("id").GetGuid());
            Assert.Equal("in_progress", item.GetProperty("latestAttempt").GetProperty("status").GetString());
        }

        using (var failedOnly = await ReadJsonAsync(await student.Client.GetAsync("/practice/tests?status=failed", Ct)))
        {
            Assert.Equal(failed, Assert.Single(failedOnly.RootElement.GetProperty("items").EnumerateArray()).GetProperty("id").GetGuid());
        }

        Assert.Equal(HttpStatusCode.BadRequest, (await student.Client.GetAsync("/practice/tests?pageSize=51", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await student.Client.GetAsync("/practice/tests?status=nope", Ct)).StatusCode);
    }

    [Fact]
    public async Task Removing_a_test_archives_an_attempted_one_and_deletes_an_unattempted_one()
    {
        SkipWithoutDocker();
        var student = await _support.HighSchoolStudentAsync();
        var unattempted = await _support.ReadyTestAsync(student);
        Assert.Equal(HttpStatusCode.NoContent, (await student.Client.DeleteAsync($"/practice/tests/{unattempted}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await student.Client.GetAsync($"/practice/tests/{unattempted}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await student.Client.DeleteAsync($"/practice/tests/{unattempted}", Ct)).StatusCode);

        var (attempted, attempt) = await _support.StartedAsync(student);
        var active = await student.Client.DeleteAsync($"/practice/tests/{attempted}", Ct);
        Assert.Equal(HttpStatusCode.Conflict, active.StatusCode);
        Assert.Equal("practice.attempt_active", await ProblemCodeAsync(active));

        Assert.Equal(HttpStatusCode.OK, (await _support.SubmitAsync(student.Client, PracticeTestSupport.AttemptId(attempt))).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await student.Client.DeleteAsync($"/practice/tests/{attempted}", Ct)).StatusCode);
        using var archived = await ReadJsonAsync(await student.Client.GetAsync($"/practice/tests/{attempted}", Ct));
        Assert.Equal("archived", archived.RootElement.GetProperty("status").GetString());
        Assert.Equal(HttpStatusCode.OK, (await student.Client.GetAsync($"/practice/attempts/{PracticeTestSupport.AttemptId(attempt)}/results", Ct)).StatusCode);
    }

    [Fact]
    public async Task Invalid_generation_requests_are_400()
    {
        SkipWithoutDocker();
        var student = await _support.HighSchoolStudentAsync();
        Assert.Equal(HttpStatusCode.BadRequest, (await _support.GenerateAsync(student, format: "crossword")).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await _support.GenerateAsync(student, mode: "timed")).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await _support.GenerateAsync(student, format: "exam_paper", mode: null)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await _support.GenerateAsync(student, topics: ["<script>"])).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await _support.GenerateAsync(student, questionCount: 41)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await _support.GenerateAsync(student, format: "flashcards", mode: "timed", durationMinutes: 10)).StatusCode);
    }

    private static async Task<string> StatusAsync(HttpClient client, Guid testId)
    {
        var response = await client.GetAsync($"/practice/tests/{testId}/status", Ct);
        Assert.Equal("no-store", response.Headers.CacheControl?.ToString());
        using var json = await ReadJsonAsync(response);
        return json.RootElement.GetProperty("status").GetString()!;
    }

    private static Task<HttpResponseMessage> SendAsync(HttpClient client, HttpMethod method, string path, object? body)
    {
        var request = new HttpRequestMessage(method, path);
        if (body is not null)
        {
            request.Content = JsonContent.Create(body);
        }

        return client.SendAsync(request, Ct);
    }
}
