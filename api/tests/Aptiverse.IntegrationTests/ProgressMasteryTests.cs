using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Aptiverse.Academics.Contracts;
using Aptiverse.Identity.Contracts;
using Aptiverse.Practice.Contracts;
using Aptiverse.Progress.Contracts;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using static Aptiverse.IntegrationTests.AcademicsTestSupport;
using static Aptiverse.IntegrationTests.ProgressTestSupport;

namespace Aptiverse.IntegrationTests;

/// <summary>Mastery from Practice and Academics events, the snapshot contract, the tutor context and erasure.</summary>
[Collection(ApiTestGroup.Name)]
public sealed class ProgressMasteryTests(ApiFactory factory)
{
    private readonly ProgressTestSupport _support = new(factory);

    private void SkipWithoutDocker() => Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);

    [Fact]
    public async Task Progress_routes_need_auth_and_the_student_permissions()
    {
        SkipWithoutDocker();
        var anonymous = factory.CreateClient();
        var parent = factory.CreateUserClient(Guid.CreateVersion7(), role: "parent");
        var id = Guid.CreateVersion7();
        string[] reads = ["/progress/mastery", "/progress/dashboard", "/progress/analytics", "/progress/journey", "/progress/goals", $"/progress/goals/{id}"];

        foreach (var url in reads)
        {
            Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync(url, Ct)).StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, (await parent.GetAsync(url, Ct)).StatusCode);
        }

        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.PostAsJsonAsync("/progress/goals", new { }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await parent.PostAsJsonAsync("/progress/goals", new { }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await parent.DeleteAsync($"/progress/goals/{id}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await parent.GetAsync($"/progress/goals/baseline?criteriaType=practice_tests_completed&studyUnitId={id}", Ct)).StatusCode);
    }

    [Fact]
    public async Task A_graded_attempt_feeds_recency_weighted_mastery_once_per_topic_even_when_redelivered()
    {
        SkipWithoutDocker();
        var student = await _support.StudentAsync();
        var recent = Graded(student, 50m, topics: [Topic("Algebra", 5, 4), Topic("Geometry", 4, 1)]);
        var monthOld = Graded(student, 0m, submittedAt: Now.AddDays(-30), topics: [Topic("algebra ", 5, 0)]);

        await _support.DeliverAsync(recent);
        await _support.DeliverAsync(recent);
        await _support.DeliverAsync(monthOld);

        var mastery = await GetJsonAsync(student.Client, $"/progress/mastery?studyUnitId={student.UnitId}");
        var unit = Assert.Single(mastery.GetProperty("units").EnumerateArray());
        var algebra = TopicNamed(unit, "Algebra");

        // (4 * 1 + 0 * 0.5) / (5 * 1 + 5 * 0.5): a month-old attempt counts half.
        Assert.Equal(0.5333m, algebra.GetProperty("score").GetDecimal(), 3);
        Assert.Equal("developing", algebra.GetProperty("band").GetString());
        Assert.Equal(10, algebra.GetProperty("evidenceQuestions").GetInt32());
        Assert.Equal(2, algebra.GetProperty("observationCount").GetInt32());
        Assert.False(algebra.GetProperty("earlyRead").GetBoolean());

        var geometry = TopicNamed(unit, "Geometry");
        Assert.Equal(0.25m, geometry.GetProperty("score").GetDecimal());
        Assert.True(geometry.GetProperty("earlyRead").GetBoolean());
        Assert.Equal(JsonValueKind.Null, unit.GetProperty("marks").ValueKind);

        await _support.WithDbAsync(async db =>
        {
            Assert.Equal(3, await db.MasteryObservations.CountAsync(o => o.UserId == student.UserId, Ct));
            Assert.Equal(2, await db.PracticeResults.CountAsync(r => r.UserId == student.UserId, Ct));
        });
    }

    [Fact]
    public async Task Submitting_a_real_practice_attempt_updates_mastery_through_the_graded_event()
    {
        SkipWithoutDocker();
        var practice = new PracticeTestSupport(factory);
        var student = await practice.HighSchoolStudentAsync();
        var (_, attempt) = await practice.StartedAsync(student);
        var attemptId = PracticeTestSupport.AttemptId(attempt);
        var mcqs = PracticeTestSupport.Questions(attempt).Where(q => q.Kind == "mcq").Select(q => q.Id).ToList();
        await PracticeTestSupport.SaveAsync(student.Client, attemptId, mcqs[0], new { selectedIndex = 1, baseRevision = 0 });
        await PracticeTestSupport.SaveAsync(student.Client, attemptId, mcqs[1], new { selectedIndex = 0, baseRevision = 0 });

        Assert.Equal(HttpStatusCode.OK, (await practice.SubmitAsync(student.Client, attemptId)).StatusCode);

        var unit = (await GetJsonAsync(student.Client, "/progress/mastery")).GetProperty("units")[0];
        var algebra = TopicNamed(unit, "Algebra");
        Assert.Equal(0.3333m, algebra.GetProperty("score").GetDecimal());
        Assert.Equal(3, algebra.GetProperty("evidenceQuestions").GetInt32());
        Assert.True(algebra.GetProperty("earlyRead").GetBoolean());
    }

    [Fact]
    public async Task A_partially_graded_attempt_counts_only_its_marked_questions()
    {
        SkipWithoutDocker();
        var student = await _support.StudentAsync();

        // 5 questions, 3 marked (2 of them correct), 2 still pending: the pending ones are neither right nor wrong.
        await _support.DeliverAsync(Graded(student, 40m, partial: true, topics: [Topic("Algebra", 5, 2, marked: 3)]));

        var unit = (await GetJsonAsync(student.Client, "/progress/mastery")).GetProperty("units")[0];
        var algebra = TopicNamed(unit, "Algebra");
        Assert.Equal(0.6667m, algebra.GetProperty("score").GetDecimal());
        Assert.Equal(3, algebra.GetProperty("evidenceQuestions").GetInt32());
    }

    [Fact]
    public async Task A_partially_graded_attempt_without_marked_counts_adds_no_mastery_evidence()
    {
        SkipWithoutDocker();
        var student = await _support.StudentAsync();

        // An event published before marked counts existed: nothing says which questions were marked.
        await _support.DeliverAsync(Graded(student, 40m, partial: true, topics: [new TopicAccuracy("Algebra", 5, 2, 5, 2)]));

        var unit = (await GetJsonAsync(student.Client, "/progress/mastery")).GetProperty("units")[0];
        Assert.DoesNotContain(unit.GetProperty("topics").EnumerateArray(), t => t.GetProperty("score").ValueKind != JsonValueKind.Null);
        Assert.Equal(JsonValueKind.Null, unit.GetProperty("score").ValueKind);
    }

    [Fact]
    public async Task A_recorded_mark_feeds_the_whole_unit_row_and_a_newer_mark_supersedes_it()
    {
        SkipWithoutDocker();
        var student = await _support.StudentAsync();
        var assessmentId = (await CreateAssessmentAsync(student.Client, student.EnrolmentId)).GetProperty("id").GetGuid();

        // Through the real route: Academics publishes AssessmentGraded and Progress consumes it.
        await _support.Academics.TrackAsync(async () =>
            Assert.Equal(HttpStatusCode.OK, (await student.Client.PostAsJsonAsync($"/academics/assessments/{assessmentId}/mark", new { percent = 60 }, Ct)).StatusCode));
        var marks = (await GetJsonAsync(student.Client, "/progress/mastery")).GetProperty("units")[0].GetProperty("marks");
        Assert.Equal(0.6m, marks.GetProperty("score").GetDecimal());
        Assert.Equal(10, marks.GetProperty("evidenceQuestions").GetInt32());

        var later = Now.AddMinutes(5);
        await _support.DeliverAsync(Mark(student, assessmentId, 80m, later));
        await _support.DeliverAsync(Mark(student, assessmentId, 80m, later));
        await _support.DeliverAsync(Mark(student, assessmentId, 10m, later.AddMinutes(-2)));

        var unit = (await GetJsonAsync(student.Client, "/progress/mastery")).GetProperty("units")[0];
        Assert.Equal(0.8m, unit.GetProperty("marks").GetProperty("score").GetDecimal());
        Assert.Equal(0.8m, unit.GetProperty("score").GetDecimal());
        await _support.WithDbAsync(async db =>
        {
            var rows = await db.MasteryObservations.Where(o => o.SourceId == assessmentId).ToListAsync(Ct);
            Assert.Single(rows, r => r.SupersededAt == null);
            Assert.Contains(rows, r => r.SupersededAt != null && r.SupersededById != null);
        });

        await _support.DeliverAsync(new AssessmentMarkRemoved(student.UserId, assessmentId, student.UnitId, later.AddMinutes(1)));
        unit = (await GetJsonAsync(student.Client, "/progress/mastery")).GetProperty("units")[0];
        Assert.Equal(JsonValueKind.Null, unit.GetProperty("marks").ValueKind);
        Assert.Equal(JsonValueKind.Null, unit.GetProperty("score").ValueKind);
    }

    [Fact]
    public async Task Weakest_topics_put_established_reads_first_lowest_score_first_and_never_another_users()
    {
        SkipWithoutDocker();
        var student = await _support.StudentAsync();
        var stranger = await _support.StudentAsync();
        await _support.DeliverAsync(Graded(student, 50m, topics:
        [
            Topic("Algebra", 10, 9),
            Topic("Functions", 10, 3),
            Topic("Probability", 2, 0),
            Topic("Geometry", 10, 6),
        ]));

        var weakest = await _support.WithScopeAsync(sp => sp.GetRequiredService<IMasterySnapshot>().GetWeakestTopicsAsync(student.UserId, 3, Ct));
        Assert.Equal(["Functions", "Geometry", "Algebra"], weakest.Select(t => t.Topic));
        Assert.All(weakest, t => Assert.Equal(10, t.EvidenceQuestions));
        Assert.Equal(0.3m, weakest[0].Score);

        var all = await _support.WithScopeAsync(sp => sp.GetRequiredService<IMasterySnapshot>().GetWeakestTopicsAsync(student.UserId, 20, Ct));
        Assert.Equal("Probability", all[^1].Topic);
        Assert.True(all[^1].EarlyRead);

        var forUnit = await _support.WithScopeAsync(sp => sp.GetRequiredService<IMasterySnapshot>().GetForUnitAsync(student.UserId, student.UnitId, Ct));
        Assert.Equal(4, forUnit.Count);
        Assert.Empty(await _support.WithScopeAsync(sp => sp.GetRequiredService<IMasterySnapshot>().GetWeakestTopicsAsync(stranger.UserId, 5, Ct)));
        Assert.Empty(await _support.WithScopeAsync(sp => sp.GetRequiredService<IMasterySnapshot>().GetForUnitAsync(stranger.UserId, student.UnitId, Ct)));
    }

    [Fact]
    public async Task The_tutor_context_carries_the_students_weakest_topics()
    {
        SkipWithoutDocker();
        var student = await _support.StudentAsync();
        await _support.DeliverAsync(Graded(student, 40m, topics: [Topic("Quadratic equations", 5, 2), Topic("Algebra", 10, 9)]));
        var create = await student.Client.PostAsJsonAsync("/ai/conversations", new { title = "Help" }, Ct);
        using var created = await ReadJsonAsync(create);
        var conversation = created.RootElement.GetProperty("id").GetGuid();
        var marker = $"Weakest check {Guid.NewGuid():N}";

        var response = await student.Client.PostAsJsonAsync($"/ai/conversations/{conversation}/messages", new { message = marker }, Ct);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await response.Content.ReadAsStringAsync(Ct);

        var call = Assert.Single(factory.AiStub.For("/v1/tutor/turn"), r => r.Body.Contains(marker, StringComparison.Ordinal));
        using var body = JsonDocument.Parse(call.Body);
        var weakest = body.RootElement.GetProperty("context").GetProperty("weakest_topics").EnumerateArray().Select(t => t.GetString()).ToList();
        Assert.Equal(["Quadratic equations (Mathematics): 40% over 5 questions", "Algebra (Mathematics): 90% over 10 questions"], weakest);
    }

    [Fact]
    public async Task A_new_student_sees_no_marks_yet_as_nulls_not_zeros()
    {
        SkipWithoutDocker();
        var student = await _support.StudentAsync();

        var dashboard = await GetJsonAsync(student.Client, "/progress/dashboard");
        Assert.Equal(JsonValueKind.Null, dashboard.GetProperty("activeAttempt").ValueKind);
        Assert.Equal(JsonValueKind.Null, dashboard.GetProperty("masteryScore").ValueKind);
        Assert.Empty(dashboard.GetProperty("weakestTopics").EnumerateArray());
        Assert.Empty(dashboard.GetProperty("activeGoals").EnumerateArray());
        var recent = dashboard.GetProperty("recentPractice");
        Assert.Equal(JsonValueKind.Null, recent.GetProperty("averageScorePercent").ValueKind);
        Assert.Equal(JsonValueKind.Null, recent.GetProperty("bestScorePercent").ValueKind);
        Assert.Equal(0, recent.GetProperty("attemptsGraded").GetInt32());
        Assert.Equal(7, dashboard.GetProperty("activityLast7Days").GetArrayLength());
        Assert.DoesNotContain("points", dashboard.GetRawText(), StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("streak", dashboard.GetRawText(), StringComparison.OrdinalIgnoreCase);

        var unit = (await GetJsonAsync(student.Client, "/progress/mastery")).GetProperty("units")[0];
        Assert.Equal(JsonValueKind.Null, unit.GetProperty("score").ValueKind);
        Assert.Equal(JsonValueKind.Null, unit.GetProperty("band").ValueKind);

        var analytics = await GetJsonAsync(student.Client, "/progress/analytics?rangeDays=7");
        Assert.Equal(0, analytics.GetProperty("totalMinutes").GetInt32());
        Assert.Empty(analytics.GetProperty("strengths").EnumerateArray());
        Assert.Empty(analytics.GetProperty("gaps").EnumerateArray());

        var (goal, _) = await CreateGoalAsync(student.Client, student.UnitId, "practice_score_best", 60m);
        Assert.Equal(JsonValueKind.Null, goal.GetProperty("currentValue").ValueKind);
        Assert.Equal(JsonValueKind.Null, goal.GetProperty("progressPercent").ValueKind);
        Assert.Equal(JsonValueKind.Null, goal.GetProperty("baselineValue").ValueKind);
    }

    [Fact]
    public async Task The_dashboard_shows_real_numbers_once_there_is_evidence()
    {
        SkipWithoutDocker();
        var student = await _support.StudentAsync();
        await _support.DeliverAsync(Graded(student, 70m, topics: [Topic("Algebra", 10, 7)]));
        // Partly graded: only its 2 marked questions count towards mastery, and it stays out of the score average.
        await _support.DeliverAsync(Graded(student, 30m, partial: true, topics: [Topic("Algebra", 4, 1, marked: 2)]));

        var dashboard = await GetJsonAsync(student.Client, "/progress/dashboard");
        var recent = dashboard.GetProperty("recentPractice");
        Assert.Equal(2, recent.GetProperty("attemptsGraded").GetInt32());
        Assert.Equal(70m, recent.GetProperty("averageScorePercent").GetDecimal());
        Assert.Equal(20, recent.GetProperty("minutesOnTask").GetInt32());
        Assert.Equal(0.6667m, dashboard.GetProperty("masteryScore").GetDecimal());
        Assert.Equal("Algebra", dashboard.GetProperty("weakestTopics")[0].GetProperty("topic").GetString());
    }

    [Fact]
    public async Task Mastery_for_a_unit_the_student_does_not_own_is_404()
    {
        SkipWithoutDocker();
        var owner = await _support.StudentAsync();
        var stranger = await _support.StudentAsync("acc");
        var response = await stranger.Client.GetAsync($"/progress/mastery?studyUnitId={owner.UnitId}", Ct);
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("progress.unit_not_found", await ProblemCodeAsync(response));
    }

    [Fact]
    public async Task The_journey_pages_newest_first_and_filters_by_kind()
    {
        SkipWithoutDocker();
        var student = await _support.StudentAsync();
        await _support.DeliverAsync(Graded(student, 50m, submittedAt: Now.AddHours(-2), topics: [Topic("Algebra", 4, 2)]));
        await _support.DeliverAsync(Graded(student, 90m, submittedAt: Now.AddHours(-1), topics: [Topic("Algebra", 10, 10)]));
        await CreateGoalAsync(student.Client, student.UnitId, "practice_tests_completed", 3m);

        var first = await GetJsonAsync(student.Client, "/progress/journey?take=1");
        Assert.Equal("goal_created", first.GetProperty("events")[0].GetProperty("kind").GetString());
        var cursor = first.GetProperty("nextCursor").GetString();
        var second = await GetJsonAsync(student.Client, $"/progress/journey?take=10&before={cursor}");
        Assert.DoesNotContain(second.GetProperty("events").EnumerateArray(), e => e.GetProperty("kind").GetString() == "goal_created");
        Assert.Contains(second.GetProperty("events").EnumerateArray(), e => e.GetProperty("kind").GetString() == "topic_band_up");

        var practice = await GetJsonAsync(student.Client, "/progress/journey?kinds=practice_completed");
        Assert.Equal(2, practice.GetProperty("events").GetArrayLength());
        Assert.Equal(JsonValueKind.Null, practice.GetProperty("nextCursor").ValueKind);
        Assert.Equal(HttpStatusCode.BadRequest, (await student.Client.GetAsync("/progress/journey?before=not-a-cursor", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await student.Client.GetAsync("/progress/journey?kinds=points_awarded", Ct)).StatusCode);
    }

    [Fact]
    public async Task Account_deletion_soft_deletes_progress_data_and_leaves_other_users_alone()
    {
        SkipWithoutDocker();
        var student = await _support.StudentAsync();
        var bystander = await _support.StudentAsync();
        var graded = Graded(student, 80m, topics: [Topic("Algebra", 5, 4)]);
        await _support.DeliverAsync(graded);
        await _support.DeliverAsync(Graded(bystander, 80m, topics: [Topic("Algebra", 5, 4)]));
        var (goal, _) = await CreateGoalAsync(student.Client, student.UnitId, "practice_tests_completed", 2m, milestones: [new { title = "First one", thresholdValue = 1 }]);
        await _support.DeliverAsync(Graded(student, 60m, topics: [Topic("Algebra", 5, 3)]));

        await _support.DeliverAsync(new AccountDeletionRequested(student.UserId, "gone@example.test", "Gone", Now));
        await _support.DeliverAsync(new AccountDeletionRequested(student.UserId, "gone@example.test", "Gone", Now));

        // A late redelivery of an event the student already had must not bring anything back.
        await _support.DeliverAsync(graded);

        await _support.WithDbAsync(async db =>
        {
            Assert.False(await db.Goals.AnyAsync(g => g.UserId == student.UserId, Ct));
            Assert.False(await db.Milestones.AnyAsync(m => m.GoalId == goal.GetProperty("id").GetGuid(), Ct));
            Assert.False(await db.GoalEvidence.AnyAsync(e => e.GoalId == goal.GetProperty("id").GetGuid(), Ct));
            Assert.False(await db.MasteryObservations.AnyAsync(o => o.UserId == student.UserId, Ct));
            Assert.False(await db.TopicMastery.AnyAsync(m => m.UserId == student.UserId, Ct));
            Assert.False(await db.PracticeResults.AnyAsync(r => r.UserId == student.UserId, Ct));
            Assert.False(await db.JourneyEvents.AnyAsync(j => j.UserId == student.UserId, Ct));
            Assert.True(await db.Goals.IgnoreQueryFilters().AnyAsync(g => g.UserId == student.UserId && g.DeletedAt != null, Ct));
            Assert.True(await db.TopicMastery.AnyAsync(m => m.UserId == bystander.UserId, Ct));
        });
        Assert.Empty(await _support.WithScopeAsync(sp => sp.GetRequiredService<IMasterySnapshot>().GetWeakestTopicsAsync(student.UserId, 5, Ct)));
        Assert.Equal(HttpStatusCode.NotFound, (await student.Client.GetAsync($"/progress/goals/{goal.GetProperty("id").GetGuid()}", Ct)).StatusCode);
    }

    private static JsonElement TopicNamed(JsonElement unit, string topic) =>
        unit.GetProperty("topics").EnumerateArray().Single(t => t.GetProperty("topic").GetString() == topic);
}
