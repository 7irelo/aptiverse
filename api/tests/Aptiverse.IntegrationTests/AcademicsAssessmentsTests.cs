using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Aptiverse.Academics.Contracts;
using static Aptiverse.IntegrationTests.AcademicsTestSupport;

namespace Aptiverse.IntegrationTests;

[Collection(ApiTestGroup.Name)]
public sealed class AcademicsAssessmentsTests(ApiFactory factory)
{
    private readonly AcademicsTestSupport _support = new(factory);

    private void SkipWithoutDocker() => Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);

    private async Task<(Guid UserId, HttpClient Client, Guid EnrolmentId)> LearnerWithUnitAsync(string slug = "math")
    {
        var (userId, client) = await _support.HighSchoolAsync();
        var enrolmentId = (await _support.EnrolCapsAsync(client, slug))[0];
        return (userId, client, enrolmentId);
    }

    [Fact]
    public async Task Assessment_routes_without_auth_are_401()
    {
        SkipWithoutDocker();
        var client = factory.CreateClient();
        var id = Guid.CreateVersion7();

        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/academics/assessments", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/academics/assessments", new { enrolmentId = id }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync($"/academics/assessments/{id}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PatchAsJsonAsync($"/academics/assessments/{id}", new { }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync($"/academics/assessments/{id}/transition", new { action = "start" }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync($"/academics/assessments/{id}/mark", new { percent = 50 }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.DeleteAsync($"/academics/assessments/{id}", Ct)).StatusCode);
    }

    [Fact]
    public async Task Parents_are_403_on_assessment_routes()
    {
        SkipWithoutDocker();
        var parent = factory.CreateUserClient(Guid.CreateVersion7(), role: "parent");
        var id = Guid.CreateVersion7();

        Assert.Equal(HttpStatusCode.Forbidden, (await parent.GetAsync($"/academics/assessments/{id}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await parent.PatchAsJsonAsync($"/academics/assessments/{id}", new { }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await parent.PostAsJsonAsync($"/academics/assessments/{id}/transition", new { action = "start" }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await parent.PostAsJsonAsync($"/academics/assessments/{id}/mark", new { percent = 50 }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await parent.DeleteAsync($"/academics/assessments/{id}", Ct)).StatusCode);
    }

    [Fact]
    public async Task Creating_an_assessment_returns_it_scheduled_and_publishes_the_event()
    {
        SkipWithoutDocker();
        var (userId, learner, enrolmentId) = await LearnerWithUnitAsync();
        var dueAt = Now.AddDays(10);

        HttpResponseMessage? response = null;
        var session = await _support.TrackAsync(async () => response = await learner.PostAsJsonAsync(
            "/academics/assessments",
            new { enrolmentId, title = "  Algebra   test ", type = "class_test", weightPercent = 12.5m, term = 2, dueAt, predictedPercent = 70m, notes = "Chapters 1 to 3" },
            Ct));

        Assert.Equal(HttpStatusCode.Created, response!.StatusCode);
        Assert.NotNull(response.Headers.Location);
        using var json = await ReadJsonAsync(response);
        var view = json.RootElement;
        Assert.Equal("Algebra test", view.GetProperty("title").GetString());
        Assert.Equal("scheduled", view.GetProperty("state").GetString());
        Assert.Equal(12.5m, view.GetProperty("weightPercent").GetDecimal());
        Assert.Equal(2, view.GetProperty("term").GetInt32());
        Assert.Equal(["start", "submit", "mark"], view.GetProperty("allowedActions").EnumerateArray().Select(a => a.GetString()));
        Assert.Equal(JsonValueKind.Null, view.GetProperty("percent").ValueKind);
        Assert.Equal(70m, view.GetProperty("unitWeighting").GetProperty("predictedPercent").GetDecimal());
        Assert.Equal(JsonValueKind.Null, view.GetProperty("unitWeighting").GetProperty("currentPercent").ValueKind);

        var created = Assert.Single(MessagesOf<AssessmentCreated>(session));
        Assert.Equal(userId, created.UserId);
        Assert.Equal(view.GetProperty("id").GetGuid(), created.AssessmentId);
        Assert.Equal(view.GetProperty("unitId").GetGuid(), created.StudyUnitId);
    }

    [Fact]
    public async Task Creating_an_assessment_validates_every_field()
    {
        SkipWithoutDocker();
        var (_, learner, enrolmentId) = await LearnerWithUnitAsync();
        var due = Now.AddDays(3);

        object[] bad =
        [
            new { enrolmentId, title = "Test", type = "test" },
            new { enrolmentId, title = "T", type = "test", dueAt = due },
            new { enrolmentId, title = new string('t', 161), type = "test", dueAt = due },
            new { enrolmentId, title = "Test", type = "quiz", dueAt = due },
            new { enrolmentId, title = "Test", type = "test", dueAt = due, weightPercent = 100.5m },
            new { enrolmentId, title = "Test", type = "test", dueAt = due, weightPercent = 10.123m },
            new { enrolmentId, title = "Test", type = "test", dueAt = due, predictedPercent = -1m },
            new { enrolmentId, title = "Test", type = "test", dueAt = due, term = 5 },
            new { enrolmentId, title = "Test", type = "test", dueAt = Now.AddYears(3) },
            new { enrolmentId, title = "Test", type = "test", dueAt = due, notes = new string('n', 2001) },
            new { enrolmentId = Guid.Empty, title = "Test", type = "test", dueAt = due },
        ];

        foreach (var body in bad)
        {
            var response = await learner.PostAsJsonAsync("/academics/assessments", body, Ct);
            Assert.True(response.StatusCode == HttpStatusCode.BadRequest, JsonSerializer.Serialize(body));
        }
    }

    [Fact]
    public async Task Creating_an_assessment_in_someone_elses_unit_is_404_and_term_is_high_school_only()
    {
        SkipWithoutDocker();
        var (_, _, enrolmentId) = await LearnerWithUnitAsync();
        var (_, stranger) = await _support.HighSchoolAsync();

        var response = await stranger.PostAsJsonAsync("/academics/assessments", new { enrolmentId, title = "Sneaky", type = "test", dueAt = Now.AddDays(1) }, Ct);
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("academics.unit_not_found", await ProblemCodeAsync(response));

        var (_, student) = await _support.TertiaryAsync();
        var course = await CreateCourseAsync(student, $"Economics {Guid.NewGuid():N}"[..20]);
        var termed = await student.PostAsJsonAsync(
            "/academics/assessments",
            new { enrolmentId = course.GetProperty("enrolmentId").GetGuid(), title = "Midterm", type = "midterm", term = 2, dueAt = Now.AddDays(1) },
            Ct);
        Assert.Equal(HttpStatusCode.BadRequest, termed.StatusCode);
        Assert.Equal("academics.term_not_allowed", await ProblemCodeAsync(termed));
    }

    [Fact]
    public async Task Listing_filters_by_unit_state_and_dates_and_never_shows_other_users()
    {
        SkipWithoutDocker();
        var (_, learner) = await _support.HighSchoolAsync();
        var enrolments = await _support.EnrolCapsAsync(learner, "geo", "hist");
        var soon = await CreateAssessmentAsync(learner, enrolments[0], "Soon", dueAt: Now.AddDays(2));
        await CreateAssessmentAsync(learner, enrolments[0], "Later", dueAt: Now.AddDays(40));
        await CreateAssessmentAsync(learner, enrolments[1], "Other unit", dueAt: Now.AddDays(5));
        await learner.PostAsJsonAsync($"/academics/assessments/{soon.GetProperty("id").GetGuid()}/transition", new { action = "start" }, Ct);

        var (_, stranger) = await _support.HighSchoolAsync();
        var strangerUnit = (await _support.EnrolCapsAsync(stranger, "geo"))[0];
        await CreateAssessmentAsync(stranger, strangerUnit, "Not yours");

        using (var all = await ReadJsonAsync(await learner.GetAsync("/academics/assessments", Ct)))
        {
            Assert.Equal(3, all.RootElement.GetProperty("totalCount").GetInt64());
            Assert.Equal(["Soon", "Other unit", "Later"], all.RootElement.GetProperty("items").EnumerateArray().Select(i => i.GetProperty("title").GetString()));
        }

        using (var byUnit = await ReadJsonAsync(await learner.GetAsync($"/academics/assessments?enrolmentId={enrolments[0]}&sort=due_desc", Ct)))
        {
            Assert.Equal(["Later", "Soon"], byUnit.RootElement.GetProperty("items").EnumerateArray().Select(i => i.GetProperty("title").GetString()));
        }

        using (var byState = await ReadJsonAsync(await learner.GetAsync("/academics/assessments?state=in_progress&state=submitted", Ct)))
        {
            Assert.Equal(["Soon"], byState.RootElement.GetProperty("items").EnumerateArray().Select(i => i.GetProperty("title").GetString()));
        }

        // Date filters are SAST calendar days, so derive them in SAST (UTC+2, no DST).
        var from = DateOnly.FromDateTime(Now.AddDays(3).ToOffset(TimeSpan.FromHours(2)).DateTime);
        var to = DateOnly.FromDateTime(Now.AddDays(10).ToOffset(TimeSpan.FromHours(2)).DateTime);
        using (var byDate = await ReadJsonAsync(await learner.GetAsync($"/academics/assessments?from={from:yyyy-MM-dd}&to={to:yyyy-MM-dd}", Ct)))
        {
            Assert.Equal(["Other unit"], byDate.RootElement.GetProperty("items").EnumerateArray().Select(i => i.GetProperty("title").GetString()));
        }

        using (var strangers = await ReadJsonAsync(await learner.GetAsync($"/academics/assessments?enrolmentId={strangerUnit}", Ct)))
        {
            Assert.Equal(0, strangers.RootElement.GetProperty("totalCount").GetInt64());
        }

        Assert.Equal(HttpStatusCode.BadRequest, (await learner.GetAsync("/academics/assessments?state=lost", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await learner.GetAsync("/academics/assessments?from=2026-01-01&to=2027-06-01", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await learner.GetAsync("/academics/assessments?from=2026-02-01&to=2026-01-01", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await learner.GetAsync("/academics/assessments?pageSize=101", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await learner.GetAsync("/academics/assessments?sort=title", Ct)).StatusCode);
    }

    [Fact]
    public async Task Another_users_assessment_is_404_for_every_route()
    {
        SkipWithoutDocker();
        var (_, owner, enrolmentId) = await LearnerWithUnitAsync();
        var (_, stranger) = await _support.HighSchoolAsync();
        var id = (await CreateAssessmentAsync(owner, enrolmentId)).GetProperty("id").GetGuid();

        var peek = await stranger.GetAsync($"/academics/assessments/{id}", Ct);
        Assert.Equal(HttpStatusCode.NotFound, peek.StatusCode);
        Assert.Equal("academics.assessment_not_found", await ProblemCodeAsync(peek));
        Assert.Equal(HttpStatusCode.NotFound, (await stranger.PatchAsJsonAsync($"/academics/assessments/{id}", new { title = "Mine now" }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await stranger.PostAsJsonAsync($"/academics/assessments/{id}/transition", new { action = "start" }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await stranger.PostAsJsonAsync($"/academics/assessments/{id}/mark", new { percent = 100 }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await stranger.DeleteAsync($"/academics/assessments/{id}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await owner.GetAsync($"/academics/assessments/{Guid.CreateVersion7()}", Ct)).StatusCode);

        using var untouched = await ReadJsonAsync(await owner.GetAsync($"/academics/assessments/{id}", Ct));
        Assert.Equal("Term test", untouched.RootElement.GetProperty("title").GetString());
        Assert.Equal("scheduled", untouched.RootElement.GetProperty("state").GetString());
    }

    [Fact]
    public async Task Editing_publishes_due_changes_only_and_honours_if_match()
    {
        SkipWithoutDocker();
        var (_, learner, enrolmentId) = await LearnerWithUnitAsync();
        var created = await CreateAssessmentAsync(learner, enrolmentId, weightPercent: 20m);
        var id = created.GetProperty("id").GetGuid();
        var url = $"/academics/assessments/{id}";

        var get = await learner.GetAsync(url, Ct);
        var etag = get.Headers.ETag!.ToString();

        HttpResponseMessage? renamed = null;
        var renameSession = await _support.TrackAsync(async () => renamed = await learner.PatchAsJsonAsync(url, new { title = "Renamed", clearWeightPercent = true, notes = "Bring a calculator" }, Ct));
        Assert.Equal(HttpStatusCode.OK, renamed!.StatusCode);
        Assert.Empty(MessagesOf<AssessmentDueChanged>(renameSession));
        using (var json = await ReadJsonAsync(renamed))
        {
            Assert.Equal("Renamed", json.RootElement.GetProperty("title").GetString());
            Assert.Equal(JsonValueKind.Null, json.RootElement.GetProperty("weightPercent").ValueKind);
            Assert.Equal("Bring a calculator", json.RootElement.GetProperty("notes").GetString());
        }

        var newDue = Now.AddDays(20);
        HttpResponseMessage? moved = null;
        var moveSession = await _support.TrackAsync(async () => moved = await learner.PatchAsJsonAsync(url, new { dueAt = newDue }, Ct));
        Assert.Equal(HttpStatusCode.OK, moved!.StatusCode);
        var dueChanged = Assert.Single(MessagesOf<AssessmentDueChanged>(moveSession));
        Assert.Equal(id, dueChanged.AssessmentId);

        using var staleRequest = new HttpRequestMessage(HttpMethod.Patch, url) { Content = JsonContent.Create(new { title = "Stale" }) };
        staleRequest.Headers.TryAddWithoutValidation("If-Match", etag);
        var stale = await learner.SendAsync(staleRequest, Ct);
        Assert.Equal(HttpStatusCode.Conflict, stale.StatusCode);
        Assert.Equal("academics.concurrency_conflict", await ProblemCodeAsync(stale));

        using var freshRequest = new HttpRequestMessage(HttpMethod.Patch, url) { Content = JsonContent.Create(new { title = "Fresh" }) };
        freshRequest.Headers.TryAddWithoutValidation("If-Match", moved.Headers.ETag!.ToString());
        Assert.Equal(HttpStatusCode.OK, (await learner.SendAsync(freshRequest, Ct)).StatusCode);

        Assert.Equal(HttpStatusCode.BadRequest, (await learner.PatchAsJsonAsync(url, new { weightPercent = 10m, clearWeightPercent = true }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await learner.PatchAsJsonAsync(url, new { type = "quiz" }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await learner.PatchAsJsonAsync(url, new { title = "x" }, Ct)).StatusCode);
    }

    [Fact]
    public async Task Lifecycle_transitions_follow_the_state_machine()
    {
        SkipWithoutDocker();
        var (userId, learner, enrolmentId) = await LearnerWithUnitAsync();
        var id = (await CreateAssessmentAsync(learner, enrolmentId)).GetProperty("id").GetGuid();
        var url = $"/academics/assessments/{id}/transition";

        async Task<JsonElement> TransitionAsync(string action, HttpStatusCode expected = HttpStatusCode.OK)
        {
            var response = await learner.PostAsJsonAsync(url, new { action }, Ct);
            Assert.Equal(expected, response.StatusCode);
            using var json = await ReadJsonAsync(response);
            return json.RootElement.Clone();
        }

        Assert.Equal("in_progress", (await TransitionAsync("start")).GetProperty("state").GetString());
        Assert.Equal("in_progress", (await TransitionAsync("start")).GetProperty("state").GetString());
        Assert.Equal("scheduled", (await TransitionAsync("reopen")).GetProperty("state").GetString());

        HttpResponseMessage? submitted = null;
        var session = await _support.TrackAsync(async () => submitted = await learner.PostAsJsonAsync(url, new { action = "submit" }, Ct));
        Assert.Equal(HttpStatusCode.OK, submitted!.StatusCode);
        var submittedEvent = Assert.Single(MessagesOf<AssessmentSubmitted>(session));
        Assert.Equal(userId, submittedEvent.UserId);

        var view = await TransitionAsync("reopen");
        Assert.Equal("in_progress", view.GetProperty("state").GetString());
        Assert.Equal(["submit", "reopen", "mark"], view.GetProperty("allowedActions").EnumerateArray().Select(a => a.GetString()));

        var refused = await learner.PostAsJsonAsync(url, new { action = "remove_mark" }, Ct);
        Assert.Equal(HttpStatusCode.Conflict, refused.StatusCode);
        Assert.Equal("academics.invalid_transition", await ProblemCodeAsync(refused));

        Assert.Equal(HttpStatusCode.BadRequest, (await learner.PostAsJsonAsync(url, new { action = "grade" }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await learner.PostAsJsonAsync(url, new { }, Ct)).StatusCode);
    }

    [Fact]
    public async Task Recording_a_mark_grades_once_updates_weighting_and_can_be_removed()
    {
        SkipWithoutDocker();
        var (userId, learner, enrolmentId) = await LearnerWithUnitAsync("acc");
        var id = (await CreateAssessmentAsync(learner, enrolmentId, weightPercent: 25m)).GetProperty("id").GetGuid();
        var url = $"/academics/assessments/{id}/mark";

        HttpResponseMessage? marked = null;
        var session = await _support.TrackAsync(async () => marked = await learner.PostAsJsonAsync(url, new { markObtained = 45, markTotal = 50 }, Ct));
        Assert.Equal(HttpStatusCode.OK, marked!.StatusCode);
        using (var json = await ReadJsonAsync(marked))
        {
            Assert.Equal("graded", json.RootElement.GetProperty("state").GetString());
            Assert.Equal(90m, json.RootElement.GetProperty("percent").GetDecimal());
            Assert.Equal(90m, json.RootElement.GetProperty("unitWeighting").GetProperty("currentPercent").GetDecimal());
            Assert.Equal(25m, json.RootElement.GetProperty("unitWeighting").GetProperty("gradedWeightPercent").GetDecimal());
        }

        var graded = Assert.Single(MessagesOf<AssessmentGraded>(session));
        Assert.Equal(userId, graded.UserId);
        Assert.Equal(90m, graded.Percent);
        Assert.Equal(25m, graded.WeightPercent);

        var repeat = await _support.TrackAsync(async () => await learner.PostAsJsonAsync(url, new { markObtained = 45, markTotal = 50 }, Ct));
        Assert.Empty(MessagesOf<AssessmentGraded>(repeat));

        using (var changed = await ReadJsonAsync(await learner.PostAsJsonAsync(url, new { percent = 75 }, Ct)))
        {
            Assert.Equal(75, changed.RootElement.GetProperty("markObtained").GetInt32());
            Assert.Equal(100, changed.RootElement.GetProperty("markTotal").GetInt32());
        }

        using (var units = await ReadJsonAsync(await learner.GetAsync("/academics/units", Ct)))
        {
            var unit = units.RootElement.EnumerateArray().Single(u => u.GetProperty("enrolmentId").GetGuid() == enrolmentId);
            Assert.Equal(75m, unit.GetProperty("weighting").GetProperty("currentPercent").GetDecimal());
            Assert.Equal(1, unit.GetProperty("weighting").GetProperty("gradedCount").GetInt32());
        }

        HttpResponseMessage? removed = null;
        var removeSession = await _support.TrackAsync(async () =>
            removed = await learner.PostAsJsonAsync($"/academics/assessments/{id}/transition", new { action = "remove_mark" }, Ct));
        Assert.Equal(HttpStatusCode.OK, removed!.StatusCode);
        Assert.Single(MessagesOf<AssessmentMarkRemoved>(removeSession));
        using (var json = await ReadJsonAsync(removed))
        {
            Assert.Equal("submitted", json.RootElement.GetProperty("state").GetString());
            Assert.Equal(JsonValueKind.Null, json.RootElement.GetProperty("markObtained").ValueKind);
            Assert.Equal(JsonValueKind.Null, json.RootElement.GetProperty("unitWeighting").GetProperty("currentPercent").ValueKind);
        }

        Assert.Equal(HttpStatusCode.BadRequest, (await learner.PostAsJsonAsync(url, new { markObtained = 51, markTotal = 50 }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await learner.PostAsJsonAsync(url, new { markObtained = 5, markTotal = 10, percent = 50 }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await learner.PostAsJsonAsync(url, new { markObtained = 5 }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await learner.PostAsJsonAsync(url, new { percent = 101 }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await learner.PostAsJsonAsync(url, new { markObtained = 1, markTotal = 10_001 }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await learner.PostAsJsonAsync(url, new { percent = 50.5 }, Ct)).StatusCode);
    }

    [Fact]
    public async Task Deleting_an_assessment_publishes_the_event_and_is_idempotent()
    {
        SkipWithoutDocker();
        var (userId, learner, enrolmentId) = await LearnerWithUnitAsync("eco");
        var id = (await CreateAssessmentAsync(learner, enrolmentId)).GetProperty("id").GetGuid();

        HttpResponseMessage? deleted = null;
        var session = await _support.TrackAsync(async () => deleted = await learner.DeleteAsync($"/academics/assessments/{id}", Ct));

        Assert.Equal(HttpStatusCode.NoContent, deleted!.StatusCode);
        var deletedEvent = Assert.Single(MessagesOf<AssessmentDeleted>(session));
        Assert.Equal(userId, deletedEvent.UserId);
        Assert.False(deletedEvent.WasGraded);
        Assert.Equal(HttpStatusCode.NoContent, (await learner.DeleteAsync($"/academics/assessments/{id}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await learner.GetAsync($"/academics/assessments/{id}", Ct)).StatusCode);

        var (_, stranger) = await _support.HighSchoolAsync();
        Assert.Equal(HttpStatusCode.NotFound, (await stranger.DeleteAsync($"/academics/assessments/{id}", Ct)).StatusCode);
    }
}
