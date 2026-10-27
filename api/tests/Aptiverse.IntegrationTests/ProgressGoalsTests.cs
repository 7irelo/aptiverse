using System.Net;
using System.Text.Json;
using Aptiverse.Academics.Contracts;
using Aptiverse.Progress.Contracts;
using Microsoft.EntityFrameworkCore;
using static Aptiverse.IntegrationTests.AcademicsTestSupport;
using static Aptiverse.IntegrationTests.ProgressTestSupport;

namespace Aptiverse.IntegrationTests;

/// <summary>Goals: the baseline rule, progress from real evidence after creation only, milestones, versions and ownership.</summary>
[Collection(ApiTestGroup.Name)]
public sealed class ProgressGoalsTests(ApiFactory factory)
{
    private readonly ProgressTestSupport _support = new(factory);

    private void SkipWithoutDocker() => Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);

    [Fact]
    public async Task The_baseline_rule_refuses_a_target_at_or_below_where_the_student_is()
    {
        SkipWithoutDocker();
        var student = await _support.StudentAsync();
        await _support.DeliverAsync(Graded(student, 70m, submittedAt: Now.AddDays(-3), topics: [Topic("Algebra", 10, 8)]));
        await _support.DeliverAsync(Graded(student, 95m, submittedAt: Now.AddDays(-90), topics: [Topic("Geometry", 2, 2)]));

        var preview = await GetJsonAsync(student.Client, $"/progress/goals/baseline?criteriaType=practice_score_best&studyUnitId={student.UnitId}");
        Assert.Equal(70m, preview.GetProperty("baselineValue").GetDecimal());
        Assert.Equal(71m, preview.GetProperty("minimumTarget").GetDecimal());

        var refused = await PostGoalAsync(student.Client, student.UnitId, "practice_score_best", 70m);
        Assert.Equal(HttpStatusCode.Conflict, refused.StatusCode);
        using (var problem = await ReadJsonAsync(refused))
        {
            Assert.Equal("goal.target_not_above_baseline", problem.RootElement.GetProperty("code").GetString());
            Assert.Equal(70m, problem.RootElement.GetProperty("baseline").GetDecimal());
        }

        var (accepted, _) = await CreateGoalAsync(student.Client, student.UnitId, "practice_score_best", 70.5m);
        Assert.Equal(70m, accepted.GetProperty("baselineValue").GetDecimal());

        var mastery = await GetJsonAsync(student.Client, $"/progress/goals/baseline?criteriaType=mastery_threshold&studyUnitId={student.UnitId}&topic=algebra");
        Assert.Equal(80m, mastery.GetProperty("baselineValue").GetDecimal());
        Assert.Equal("mastery in algebra", mastery.GetProperty("baselineSource").GetString());
        await CreateGoalAsync(student.Client, student.UnitId, "mastery_threshold", 80m, topic: "Algebra", expected: HttpStatusCode.Conflict);
        var (masteryGoal, _) = await CreateGoalAsync(student.Client, student.UnitId, "mastery_threshold", 85m, topic: "Algebra");
        Assert.Equal(80m, masteryGoal.GetProperty("currentValue").GetDecimal());

        var count = await GetJsonAsync(student.Client, $"/progress/goals/baseline?criteriaType=practice_tests_completed&studyUnitId={student.UnitId}");
        Assert.Equal(0m, count.GetProperty("baselineValue").GetDecimal());
        Assert.Equal("counts from today", count.GetProperty("baselineSource").GetString());

        var empty = await _support.StudentAsync("acc");
        var none = await GetJsonAsync(empty.Client, $"/progress/goals/baseline?criteriaType=assessment_mark_threshold&studyUnitId={empty.UnitId}");
        Assert.Equal(JsonValueKind.Null, none.GetProperty("baselineValue").ValueKind);
        Assert.Equal(1m, none.GetProperty("minimumTarget").GetDecimal());
    }

    [Fact]
    public async Task Goal_progress_counts_only_real_evidence_produced_after_creation()
    {
        SkipWithoutDocker();
        var student = await _support.StudentAsync();
        await _support.DeliverAsync(Graded(student, 50m, submittedAt: Now.AddDays(-1), topics: [Topic("Algebra", 4, 2)]));
        var (goal, _) = await CreateGoalAsync(
            student.Client,
            student.UnitId,
            "practice_tests_completed",
            2m,
            milestones: [new { title = "First test", thresholdValue = 1 }]);
        var goalId = goal.GetProperty("id").GetGuid();
        Assert.Equal(0m, goal.GetProperty("currentValue").GetDecimal());

        // An attempt submitted before the goal existed, delivered late, does not count.
        await _support.DeliverAsync(Graded(student, 60m, submittedAt: Now.AddHours(-1), topics: [Topic("Algebra", 4, 3)]));
        Assert.Equal(0m, (await GetJsonAsync(student.Client, $"/progress/goals/{goalId}")).GetProperty("currentValue").GetDecimal());

        var first = Graded(student, 70m, topics: [Topic("Algebra", 4, 3)]);
        var session = await _support.DeliverAsync(first);
        await _support.DeliverAsync(first);
        Assert.Single(MessagesOf<GoalMilestoneReached>(session));
        var halfway = await GetJsonAsync(student.Client, $"/progress/goals/{goalId}");
        Assert.Equal(1m, halfway.GetProperty("currentValue").GetDecimal());
        Assert.Equal(50m, halfway.GetProperty("progressPercent").GetDecimal());
        Assert.Single(halfway.GetProperty("evidence").EnumerateArray());
        Assert.NotEqual(JsonValueKind.Null, halfway.GetProperty("milestones")[0].GetProperty("reachedAt").ValueKind);

        var second = await _support.DeliverAsync(Graded(student, 80m, topics: [Topic("Algebra", 4, 4)]));
        var achieved = Assert.Single(MessagesOf<GoalAchieved>(second));
        Assert.Equal(2, achieved.EvidenceIds.Count);
        var done = await GetJsonAsync(student.Client, $"/progress/goals/{goalId}");
        Assert.Equal("achieved", done.GetProperty("status").GetString());
        Assert.True(done.GetProperty("locked").GetBoolean());
        Assert.Equal(100m, done.GetProperty("progressPercent").GetDecimal());
        var evidence = done.GetProperty("evidence").EnumerateArray().ToList();
        Assert.Equal(2, evidence.Count);
        Assert.Equal("Practice test, 80%", evidence[0].GetProperty("summary").GetString());
        Assert.StartsWith("/practice/attempts/", evidence[0].GetProperty("link").GetString(), StringComparison.Ordinal);
    }

    [Fact]
    public async Task Assessment_goals_count_submissions_and_marks_after_creation()
    {
        SkipWithoutDocker();
        var student = await _support.StudentAsync();
        var old = Guid.CreateVersion7();
        await _support.DeliverAsync(Mark(student, old, 55m, Now.AddDays(-2)));
        var (markGoal, _) = await CreateGoalAsync(student.Client, student.UnitId, "assessment_mark_threshold", 75m);
        var (submitGoal, _) = await CreateGoalAsync(student.Client, student.UnitId, "assessments_submitted", 2m);
        Assert.Equal(55m, markGoal.GetProperty("baselineValue").GetDecimal());
        Assert.Equal(JsonValueKind.Null, markGoal.GetProperty("currentValue").ValueKind);

        var first = Guid.CreateVersion7();
        await _support.DeliverAsync(new AssessmentSubmitted(student.UserId, first, student.UnitId, Now));
        await _support.DeliverAsync(Mark(student, first, 70m, Now));
        var second = Guid.CreateVersion7();
        await _support.DeliverAsync(Mark(student, second, 80m, Now));

        var mark = await GetJsonAsync(student.Client, $"/progress/goals/{markGoal.GetProperty("id").GetGuid()}");
        Assert.Equal(80m, mark.GetProperty("currentValue").GetDecimal());
        Assert.Equal("achieved", mark.GetProperty("status").GetString());
        var submitted = await GetJsonAsync(student.Client, $"/progress/goals/{submitGoal.GetProperty("id").GetGuid()}");
        Assert.Equal(2m, submitted.GetProperty("currentValue").GetDecimal());
        Assert.Equal("achieved", submitted.GetProperty("status").GetString());
    }

    [Fact]
    public async Task A_mastery_goal_is_never_achieved_on_an_early_read()
    {
        SkipWithoutDocker();
        var student = await _support.StudentAsync();
        var (goal, _) = await CreateGoalAsync(student.Client, student.UnitId, "mastery_threshold", 60m, topic: "Trigonometry");
        var goalId = goal.GetProperty("id").GetGuid();

        await _support.DeliverAsync(Graded(student, 100m, topics: [Topic("Trigonometry", 3, 3)]));
        var early = await GetJsonAsync(student.Client, $"/progress/goals/{goalId}");
        Assert.Equal(100m, early.GetProperty("currentValue").GetDecimal());
        Assert.NotEqual("achieved", early.GetProperty("status").GetString());
        Assert.Equal("mastery_update", early.GetProperty("evidence")[0].GetProperty("sourceType").GetString());

        await _support.DeliverAsync(Graded(student, 50m, topics: [Topic("Trigonometry", 2, 1)]));
        Assert.Equal("achieved", (await GetJsonAsync(student.Client, $"/progress/goals/{goalId}")).GetProperty("status").GetString());
    }

    [Fact]
    public async Task Duplicate_active_goals_are_refused_and_an_idempotent_replay_returns_the_original()
    {
        SkipWithoutDocker();
        var student = await _support.StudentAsync();
        var key = $"goal-{Guid.NewGuid():N}";
        var first = await PostGoalAsync(student.Client, student.UnitId, "practice_tests_completed", 3m, idempotencyKey: key);
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        var replay = await PostGoalAsync(student.Client, student.UnitId, "practice_tests_completed", 3m, idempotencyKey: key);
        Assert.Equal(HttpStatusCode.Created, replay.StatusCode);
        using (var a = await ReadJsonAsync(first))
        using (var b = await ReadJsonAsync(replay))
        {
            Assert.Equal(a.RootElement.GetProperty("id").GetGuid(), b.RootElement.GetProperty("id").GetGuid());
        }

        var duplicate = await PostGoalAsync(student.Client, student.UnitId, "practice_tests_completed", 5m);
        Assert.Equal(HttpStatusCode.Conflict, duplicate.StatusCode);
        Assert.Equal("goal.duplicate_active", await ProblemCodeAsync(duplicate));
        Assert.Equal(HttpStatusCode.BadRequest, (await PostGoalAsync(student.Client, student.UnitId, "assessments_submitted", 3m, idempotencyKey: "bad key!")).StatusCode);
    }

    [Fact]
    public async Task Updating_needs_the_current_version_and_a_finished_goal_is_locked()
    {
        SkipWithoutDocker();
        var student = await _support.StudentAsync();
        var (goal, etag) = await CreateGoalAsync(student.Client, student.UnitId, "practice_tests_completed", 1m);
        var url = $"/progress/goals/{goal.GetProperty("id").GetGuid()}";

        var missing = await SendAsync(student.Client, HttpMethod.Patch, url, new { title = "Renamed goal" });
        Assert.Equal(HttpStatusCode.PreconditionRequired, missing.StatusCode);
        Assert.Equal("goal.if_match_required", await ProblemCodeAsync(missing));

        var ok = await SendAsync(student.Client, HttpMethod.Patch, url, new { title = "Renamed goal", targetValue = 2 }, etag);
        Assert.Equal(HttpStatusCode.OK, ok.StatusCode);
        var newTag = ok.Headers.ETag!.ToString();
        Assert.NotEqual(etag, newTag);

        var stale = await SendAsync(student.Client, HttpMethod.Patch, url, new { title = "Again" }, etag);
        Assert.Equal(HttpStatusCode.PreconditionFailed, stale.StatusCode);
        Assert.Equal("goal.version_mismatch", await ProblemCodeAsync(stale));

        var fractional = await SendAsync(student.Client, HttpMethod.Patch, url, new { targetValue = 2.5 }, newTag);
        Assert.Equal(HttpStatusCode.BadRequest, fractional.StatusCode);

        await _support.DeliverAsync(Graded(student, 60m, topics: [Topic("Algebra", 2, 1)]));
        await _support.DeliverAsync(Graded(student, 60m, topics: [Topic("Algebra", 2, 1)]));
        var (achieved, lockedTag) = await GetWithTagAsync(student.Client, url);
        Assert.Equal("achieved", achieved.GetProperty("status").GetString());

        var locked = await SendAsync(student.Client, HttpMethod.Patch, url, new { targetValue = 5 }, lockedTag);
        Assert.Equal(HttpStatusCode.Conflict, locked.StatusCode);
        Assert.Equal("goal.locked", await ProblemCodeAsync(locked));
        Assert.Equal(HttpStatusCode.OK, (await SendAsync(student.Client, HttpMethod.Patch, url, new { title = "Done and dusted" }, lockedTag)).StatusCode);
    }

    [Fact]
    public async Task Deleting_abandons_an_open_goal_then_removes_it_and_repeats_are_harmless()
    {
        SkipWithoutDocker();
        var student = await _support.StudentAsync();
        var (goal, etag) = await CreateGoalAsync(student.Client, student.UnitId, "assessments_submitted", 2m);
        var url = $"/progress/goals/{goal.GetProperty("id").GetGuid()}";

        Assert.Equal(HttpStatusCode.PreconditionRequired, (await SendAsync(student.Client, HttpMethod.Delete, url)).StatusCode);
        Assert.Equal(HttpStatusCode.PreconditionFailed, (await SendAsync(student.Client, HttpMethod.Delete, url, ifMatch: "\"1\"")).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await SendAsync(student.Client, HttpMethod.Delete, url, ifMatch: etag)).StatusCode);

        var (abandoned, abandonedTag) = await GetWithTagAsync(student.Client, url);
        Assert.Equal("abandoned", abandoned.GetProperty("status").GetString());
        var list = await GetJsonAsync(student.Client, "/progress/goals?status=abandoned");
        Assert.Equal(1, list.GetProperty("totalCount").GetInt64());

        Assert.Equal(HttpStatusCode.NoContent, (await SendAsync(student.Client, HttpMethod.Delete, url, ifMatch: abandonedTag)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await student.Client.GetAsync(url, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await SendAsync(student.Client, HttpMethod.Delete, url, ifMatch: abandonedTag)).StatusCode);

        // The slot is free again once the goal is no longer open.
        await CreateGoalAsync(student.Client, student.UnitId, "assessments_submitted", 2m);
    }

    [Fact]
    public async Task Milestones_keep_increasing_thresholds_below_the_target()
    {
        SkipWithoutDocker();
        var student = await _support.StudentAsync();
        var (goal, etag) = await CreateGoalAsync(student.Client, student.UnitId, "practice_score_best", 90m);
        var goalId = goal.GetProperty("id").GetGuid();
        var url = $"/progress/goals/{goalId}/milestones";

        var a = await SendAsync(student.Client, HttpMethod.Post, url, new { title = "Halfway", thresholdValue = 50 });
        Assert.Equal(HttpStatusCode.Created, a.StatusCode);
        var b = await SendAsync(student.Client, HttpMethod.Post, url, new { title = "Getting close", thresholdValue = 75 });
        var tag = b.Headers.ETag!.ToString();
        Assert.NotEqual(etag, tag);
        using var bJson = await ReadJsonAsync(b);
        var bId = bJson.RootElement.GetProperty("id").GetGuid();

        var tooHigh = await SendAsync(student.Client, HttpMethod.Post, url, new { title = "Beyond", thresholdValue = 95 });
        Assert.Equal("goal.invalid_milestones", await ProblemCodeAsync(tooHigh));
        var outOfOrder = await SendAsync(student.Client, HttpMethod.Post, url, new { title = "First step", thresholdValue = 60, position = 1 });
        Assert.Equal("goal.invalid_milestones", await ProblemCodeAsync(outOfOrder));
        var inserted = await SendAsync(student.Client, HttpMethod.Post, url, new { title = "First step", thresholdValue = 20, position = 1 });
        Assert.Equal(HttpStatusCode.Created, inserted.StatusCode);
        tag = inserted.Headers.ETag!.ToString();

        Assert.Equal(HttpStatusCode.PreconditionRequired, (await SendAsync(student.Client, HttpMethod.Patch, $"{url}/{bId}", new { title = "Nearly" })).StatusCode);
        var renamed = await SendAsync(student.Client, HttpMethod.Patch, $"{url}/{bId}", new { title = "Nearly", thresholdValue = 80 }, tag);
        Assert.Equal(HttpStatusCode.OK, renamed.StatusCode);

        var view = await GetJsonAsync(student.Client, $"/progress/goals/{goalId}");
        var ids = view.GetProperty("milestones").EnumerateArray().Select(m => m.GetProperty("id").GetGuid()).ToList();
        Assert.Equal([1, 2, 3], view.GetProperty("milestones").EnumerateArray().Select(m => m.GetProperty("position").GetInt32()));

        var mismatch = await SendAsync(student.Client, HttpMethod.Patch, $"{url}/order", new { milestoneIds = ids.Take(2) });
        Assert.Equal("goal.reorder_mismatch", await ProblemCodeAsync(mismatch));
        var reversed = await SendAsync(student.Client, HttpMethod.Patch, $"{url}/order", new { milestoneIds = Enumerable.Reverse(ids) });
        Assert.Equal("goal.invalid_milestones", await ProblemCodeAsync(reversed));
        Assert.Equal(HttpStatusCode.OK, (await SendAsync(student.Client, HttpMethod.Patch, $"{url}/order", new { milestoneIds = ids })).StatusCode);

        Assert.Equal(HttpStatusCode.NoContent, (await student.Client.DeleteAsync($"{url}/{ids[0]}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await student.Client.DeleteAsync($"{url}/{ids[0]}", Ct)).StatusCode);
        var after = await GetJsonAsync(student.Client, $"/progress/goals/{goalId}");
        Assert.Equal([1, 2], after.GetProperty("milestones").EnumerateArray().Select(m => m.GetProperty("position").GetInt32()));

        await SendAsync(student.Client, HttpMethod.Post, url, new { title = "Third", thresholdValue = 85 });
        await SendAsync(student.Client, HttpMethod.Post, url, new { title = "Fourth", thresholdValue = 86 });
        await SendAsync(student.Client, HttpMethod.Post, url, new { title = "Fifth", thresholdValue = 87 });
        var sixth = await SendAsync(student.Client, HttpMethod.Post, url, new { title = "Sixth", thresholdValue = 88 });
        Assert.Equal("goal.milestone_limit", await ProblemCodeAsync(sixth));
    }

    [Fact]
    public async Task Another_students_goals_and_units_are_never_reachable()
    {
        SkipWithoutDocker();
        var owner = await _support.StudentAsync();
        var stranger = await _support.StudentAsync("acc");
        var (goal, etag) = await CreateGoalAsync(owner.Client, owner.UnitId, "practice_tests_completed", 3m, milestones: [new { title = "One down", thresholdValue = 1 }]);
        var goalId = goal.GetProperty("id").GetGuid();
        var milestoneId = goal.GetProperty("milestones")[0].GetProperty("id").GetGuid();
        var url = $"/progress/goals/{goalId}";

        async Task NotFound(HttpResponseMessage response, string code)
        {
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            Assert.Equal(code, await ProblemCodeAsync(response));
        }

        await NotFound(await stranger.Client.GetAsync(url, Ct), "goal.not_found");
        await NotFound(await SendAsync(stranger.Client, HttpMethod.Patch, url, new { title = "Mine now" }, etag), "goal.not_found");
        await NotFound(await SendAsync(stranger.Client, HttpMethod.Delete, url, ifMatch: etag), "goal.not_found");
        await NotFound(await SendAsync(stranger.Client, HttpMethod.Post, $"{url}/milestones", new { title = "Sneaky", thresholdValue = 2 }), "goal.not_found");
        await NotFound(await SendAsync(stranger.Client, HttpMethod.Patch, $"{url}/milestones/{milestoneId}", new { title = "Sneaky" }, etag), "goal.not_found");
        await NotFound(await stranger.Client.DeleteAsync($"{url}/milestones/{milestoneId}", Ct), "goal.not_found");
        await NotFound(await SendAsync(stranger.Client, HttpMethod.Patch, $"{url}/milestones/order", new { milestoneIds = new[] { milestoneId } }), "goal.not_found");
        await NotFound(await stranger.Client.GetAsync($"/progress/goals/baseline?criteriaType=practice_tests_completed&studyUnitId={owner.UnitId}", Ct), "goal.study_unit_not_found");
        await NotFound(await PostGoalAsync(stranger.Client, owner.UnitId, "practice_tests_completed", 3m), "goal.study_unit_not_found");

        var reorder = await SendAsync(stranger.Client, HttpMethod.Patch, "/progress/goals/reorder", new { goalIds = new[] { goalId } });
        Assert.Equal("goal.reorder_mismatch", await ProblemCodeAsync(reorder));
        Assert.Equal(0, (await GetJsonAsync(stranger.Client, "/progress/goals")).GetProperty("totalCount").GetInt64());
        Assert.Equal(1, (await GetJsonAsync(owner.Client, "/progress/goals")).GetProperty("totalCount").GetInt64());
        Assert.Equal(HttpStatusCode.OK, (await owner.Client.GetAsync(url, Ct)).StatusCode);

        // Evidence for the stranger never touches the owner's goal.
        await _support.DeliverAsync(Graded(stranger, 90m, topics: [Topic("Accounting", 5, 5)]));
        Assert.Equal(0m, (await GetJsonAsync(owner.Client, url)).GetProperty("currentValue").GetDecimal());
    }

    [Fact]
    public async Task Goals_reorder_and_list_filters()
    {
        SkipWithoutDocker();
        var student = await _support.StudentAsync();
        var (a, _) = await CreateGoalAsync(student.Client, student.UnitId, "practice_tests_completed", 3m);
        var (b, _) = await CreateGoalAsync(student.Client, student.UnitId, "assessments_submitted", 3m);
        var ids = new[] { b.GetProperty("id").GetGuid(), a.GetProperty("id").GetGuid() };

        Assert.Equal(HttpStatusCode.NoContent, (await SendAsync(student.Client, HttpMethod.Patch, "/progress/goals/reorder", new { goalIds = ids })).StatusCode);
        var list = await GetJsonAsync(student.Client, "/progress/goals?status=active");
        Assert.Equal(ids, list.GetProperty("items").EnumerateArray().Select(g => g.GetProperty("id").GetGuid()));
        Assert.Equal(0, (await GetJsonAsync(student.Client, "/progress/goals?status=achieved")).GetProperty("totalCount").GetInt64());
        Assert.Equal(HttpStatusCode.BadRequest, (await student.Client.GetAsync("/progress/goals?status=at_risk", Ct)).StatusCode);
    }

    [Fact]
    public async Task A_goal_expires_at_its_due_date_and_a_stale_expiry_is_ignored()
    {
        SkipWithoutDocker();
        var student = await _support.StudentAsync();
        var (goal, _) = await CreateGoalAsync(student.Client, student.UnitId, "practice_tests_completed", 3m);
        var goalId = goal.GetProperty("id").GetGuid();
        var dueAt = Now.AddMinutes(-1);
        await _support.WithDbAsync(db => db.Goals.Where(g => g.Id == goalId).ExecuteUpdateAsync(
            set => set.SetProperty(g => g.BaselineCapturedAt, dueAt.AddDays(-2)).SetProperty(g => g.DueAt, dueAt), Ct));

        await _support.DeliverAsync(new ExpireProgressGoal(goalId, dueAt.AddDays(3)));
        Assert.Equal("active", (await GetJsonAsync(student.Client, $"/progress/goals/{goalId}")).GetProperty("status").GetString());

        var session = await _support.DeliverAsync(new ExpireProgressGoal(goalId, dueAt));
        Assert.Single(MessagesOf<GoalExpired>(session));
        Assert.Equal("expired", (await GetJsonAsync(student.Client, $"/progress/goals/{goalId}")).GetProperty("status").GetString());
    }

    private static async Task<(JsonElement Body, string ETag)> GetWithTagAsync(HttpClient client, string url)
    {
        var response = await client.GetAsync(url, Ct);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        using var json = await ReadJsonAsync(response);
        return (json.RootElement.Clone(), response.Headers.ETag!.ToString());
    }
}
