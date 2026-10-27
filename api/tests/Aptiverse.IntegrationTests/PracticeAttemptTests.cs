using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Aptiverse.Practice.Contracts;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Wolverine.Tracking;
using static Aptiverse.IntegrationTests.AcademicsTestSupport;
using static Aptiverse.IntegrationTests.PracticeTestSupport;

namespace Aptiverse.IntegrationTests;

[Collection(ApiTestGroup.Name)]
public sealed class PracticeAttemptTests(ApiFactory factory)
{
    private readonly PracticeTestSupport _support = new(factory);

    private void SkipWithoutDocker() => Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);

    [Fact]
    public async Task Starting_returns_questions_without_answer_keys_and_a_test_has_one_attempt_only()
    {
        SkipWithoutDocker();
        var student = await _support.HighSchoolStudentAsync();
        var testId = await _support.ReadyTestAsync(student);

        var response = await student.Client.PostAsJsonAsync($"/practice/tests/{testId}/attempts", new { startedAt = "2000-01-01T00:00:00Z" }, Ct);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var raw = await response.Content.ReadAsStringAsync(Ct);
        foreach (var leak in new[] { "answerIndex", "expectedAnswer", "memo", "explanation", "B is right" })
        {
            Assert.DoesNotContain(leak, raw, StringComparison.OrdinalIgnoreCase);
        }

        using var json = JsonDocument.Parse(raw);
        var attempt = json.RootElement;
        var attemptId = AttemptId(attempt);
        Assert.Equal($"/practice/attempts/{attemptId}", response.Headers.Location?.OriginalString);
        Assert.Equal("in_progress", attempt.GetProperty("status").GetString());
        Assert.Equal(3, attempt.GetProperty("questions").GetArrayLength());
        Assert.Equal(JsonValueKind.Null, attempt.GetProperty("remainingSeconds").ValueKind);

        // Client-supplied times are ignored: the start is the server's.
        Assert.True(attempt.GetProperty("startedAt").GetDateTimeOffset() > Now.AddMinutes(-1));

        var again = await student.Client.PostAsync($"/practice/tests/{testId}/attempts", null, Ct);
        Assert.Equal(HttpStatusCode.Conflict, again.StatusCode);
        Assert.Equal("practice.attempt_exists", await ProblemCodeAsync(again));
        using (var problem = await ReadJsonAsync(again))
        {
            Assert.Equal(attemptId, problem.RootElement.GetProperty("attemptId").GetGuid());
        }

        // A reload of the instructions recovers the runner from one call.
        using var reload = await ReadJsonAsync(await student.Client.GetAsync($"/practice/tests/{testId}", Ct));
        Assert.Equal(attemptId, reload.RootElement.GetProperty("activeAttempt").GetProperty("attemptId").GetGuid());
        Assert.Equal(3, reload.RootElement.GetProperty("activeAttempt").GetProperty("questions").GetArrayLength());
    }

    [Fact]
    public async Task Only_one_attempt_can_be_active_at_a_time()
    {
        SkipWithoutDocker();
        var student = await _support.HighSchoolStudentAsync();
        var (_, attempt) = await _support.StartedAsync(student);
        var other = await _support.ReadyTestAsync(student);

        var blocked = await student.Client.PostAsync($"/practice/tests/{other}/attempts", null, Ct);
        Assert.Equal(HttpStatusCode.Conflict, blocked.StatusCode);
        Assert.Equal("practice.other_attempt_active", await ProblemCodeAsync(blocked));
        using (var problem = await ReadJsonAsync(blocked))
        {
            Assert.Equal(AttemptId(attempt), problem.RootElement.GetProperty("attemptId").GetGuid());
        }

        await _support.SubmitAsync(student.Client, AttemptId(attempt));
        Assert.Equal(HttpStatusCode.Created, (await student.Client.PostAsync($"/practice/tests/{other}/attempts", null, Ct)).StatusCode);
    }

    [Fact]
    public async Task Every_attempt_route_is_404_for_another_user()
    {
        SkipWithoutDocker();
        var owner = await _support.HighSchoolStudentAsync();
        var stranger = await _support.HighSchoolStudentAsync();
        var (_, attempt) = await _support.StartedAsync(owner);
        var attemptId = AttemptId(attempt);
        var questionId = Questions(attempt)[0].Id;
        var client = stranger.Client;

        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/practice/attempts/{attemptId}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await SaveAsync(client, attemptId, questionId, new { selectedIndex = 1, baseRevision = 0 })).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsJsonAsync($"/practice/attempts/{attemptId}/focus-loss", new { kind = "window_blur" }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsync($"/practice/attempts/{attemptId}/pause", null, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsync($"/practice/attempts/{attemptId}/resume", null, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsync($"/practice/attempts/{attemptId}/submit", null, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/practice/attempts/{attemptId}/results", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.GetAsync("/practice/attempts/active", Ct)).StatusCode);

        // The owner's attempt is untouched.
        using var own = await ReadJsonAsync(await owner.Client.GetAsync($"/practice/attempts/{attemptId}", Ct));
        Assert.Equal("in_progress", own.RootElement.GetProperty("status").GetString());
        Assert.Equal(0, own.RootElement.GetProperty("answers").GetArrayLength());
    }

    [Fact]
    public async Task Autosave_tracks_revisions_and_refuses_stale_or_mismatched_answers()
    {
        SkipWithoutDocker();
        var student = await _support.HighSchoolStudentAsync();
        var (_, attempt) = await _support.StartedAsync(student);
        var attemptId = AttemptId(attempt);
        var questions = Questions(attempt);
        var mcq = questions.First(q => q.Kind == "mcq").Id;
        var written = questions.First(q => q.Kind == "short").Id;

        using (var first = await ReadJsonAsync(await SaveAsync(student.Client, attemptId, mcq, new { selectedIndex = 0, baseRevision = 0 })))
        {
            Assert.Equal(1, first.RootElement.GetProperty("revision").GetInt32());
        }

        // A replay of the same save is a success with no change.
        using (var replay = await ReadJsonAsync(await SaveAsync(student.Client, attemptId, mcq, new { selectedIndex = 0, baseRevision = 0 })))
        {
            Assert.Equal(1, replay.RootElement.GetProperty("revision").GetInt32());
        }

        var stale = await SaveAsync(student.Client, attemptId, mcq, new { selectedIndex = 2, baseRevision = 0 });
        Assert.Equal(HttpStatusCode.Conflict, stale.StatusCode);
        Assert.Equal("practice.revision_conflict", await ProblemCodeAsync(stale));
        using (var problem = await ReadJsonAsync(stale))
        {
            Assert.Equal(1, problem.RootElement.GetProperty("currentRevision").GetInt32());
        }

        using (var second = await ReadJsonAsync(await SaveAsync(student.Client, attemptId, mcq, new { selectedIndex = 1, baseRevision = 1 })))
        {
            Assert.Equal(2, second.RootElement.GetProperty("revision").GetInt32());
        }

        var mismatch = await SaveAsync(student.Client, attemptId, written, new { selectedIndex = 1, baseRevision = 0 });
        Assert.Equal(HttpStatusCode.BadRequest, mismatch.StatusCode);
        Assert.Equal("practice.answer_kind_mismatch", await ProblemCodeAsync(mismatch));
        Assert.Equal(HttpStatusCode.BadRequest, (await SaveAsync(student.Client, attemptId, mcq, new { selectedIndex = 5, baseRevision = 2 })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await SaveAsync(student.Client, attemptId, mcq, new { selectedIndex = 1, textAnswer = "x", baseRevision = 2 })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await SaveAsync(student.Client, attemptId, written, new { textAnswer = new string('a', 5001), baseRevision = 0 })).StatusCode);

        // A question of another test is not part of this attempt.
        var otherTest = await _support.ReadyTestAsync(student);
        await _support.WithDbAsync(async db =>
        {
            var foreignQuestion = await db.Questions.Where(q => q.TestId == otherTest).Select(q => q.Id).FirstAsync(Ct);
            var foreign = await SaveAsync(student.Client, attemptId, foreignQuestion, new { selectedIndex = 0, baseRevision = 0 });
            Assert.Equal(HttpStatusCode.NotFound, foreign.StatusCode);
            Assert.Equal("practice.question_not_found", await ProblemCodeAsync(foreign));
        });

        using var state = await ReadJsonAsync(await student.Client.GetAsync($"/practice/attempts/{attemptId}", Ct));
        var saved = Assert.Single(state.RootElement.GetProperty("answers").EnumerateArray());
        Assert.Equal(1, saved.GetProperty("selectedIndex").GetInt32());
        Assert.Equal(2, saved.GetProperty("revision").GetInt32());
    }

    [Fact]
    public async Task Multiple_choice_is_marked_deterministically_and_results_appear_after_submit()
    {
        SkipWithoutDocker();
        var student = await _support.HighSchoolStudentAsync();
        var (testId, attempt) = await _support.StartedAsync(student);
        var attemptId = AttemptId(attempt);
        var mcqs = Questions(attempt).Where(q => q.Kind == "mcq").Select(q => q.Id).ToList();

        Assert.Equal(HttpStatusCode.OK, (await SaveAsync(student.Client, attemptId, mcqs[0], new { selectedIndex = 1, baseRevision = 0 })).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await SaveAsync(student.Client, attemptId, mcqs[1], new { selectedIndex = 0, baseRevision = 0 })).StatusCode);

        var early = await student.Client.GetAsync($"/practice/attempts/{attemptId}/results", Ct);
        Assert.Equal(HttpStatusCode.Conflict, early.StatusCode);
        Assert.Equal("practice.results_not_ready", await ProblemCodeAsync(early));

        ITrackedSession? session = null;
        HttpResponseMessage? submitted = null;
        session = await _support.TrackAsync(async () => submitted = await student.Client.PostAsync($"/practice/attempts/{attemptId}/submit", null, Ct));
        Assert.Equal(HttpStatusCode.OK, submitted!.StatusCode);
        using (var body = await ReadJsonAsync(submitted))
        {
            Assert.Equal("graded", body.RootElement.GetProperty("status").GetString());
        }

        var submittedEvent = Assert.Single(MessagesOf<PracticeAttemptSubmitted>(session));
        Assert.Equal("student", submittedEvent.SubmitSource);
        var graded = Assert.Single(MessagesOf<PracticeAttemptGraded>(session));
        Assert.Equal(2, graded.ScoreMarks);
        Assert.Equal(Generation.QuizMarks, graded.MaxMarks);
        Assert.Equal(28.57m, graded.ScorePercent);
        Assert.False(graded.PartiallyGraded);
        var topic = Assert.Single(graded.Topics);
        Assert.Equal(new TopicAccuracy("Algebra", 3, 1, Generation.QuizMarks, 2, 3), topic);
        Assert.Equal(3, graded.QuestionsMarked);

        // No grading call: the written answer was blank, so it is a real zero without the model.
        Assert.DoesNotContain(factory.AiStub.For("/v1/grade"), r => r.Body.Contains(attemptId.ToString(), StringComparison.Ordinal));

        using var results = await ReadJsonAsync(await student.Client.GetAsync($"/practice/attempts/{attemptId}/results", Ct));
        var root = results.RootElement;
        Assert.Equal(2, root.GetProperty("scoreMarks").GetInt32());
        Assert.Equal(28.57m, root.GetProperty("scorePercent").GetDecimal());
        var questions = root.GetProperty("questions").EnumerateArray().ToList();
        Assert.Equal(1, questions[0].GetProperty("correctIndex").GetInt32());
        Assert.True(questions[0].GetProperty("isCorrect").GetBoolean());
        Assert.False(questions[1].GetProperty("isCorrect").GetBoolean());
        Assert.Equal("The correct option is B.", questions[1].GetProperty("feedback").GetString());
        Assert.Equal("marked", questions[2].GetProperty("markingStatus").GetString());
        Assert.Equal(0, questions[2].GetProperty("awardedMarks").GetInt32());
        Assert.StartsWith("Worked explanation", questions[0].GetProperty("explanation").GetString(), StringComparison.Ordinal);

        // Submitting again changes nothing and grades nothing twice.
        var again = await _support.TrackAsync(async () => submitted = await student.Client.PostAsync($"/practice/attempts/{attemptId}/submit", null, Ct));
        Assert.Equal(HttpStatusCode.OK, submitted!.StatusCode);
        Assert.Empty(MessagesOf<PracticeAttemptGraded>(again));

        using var state = await ReadJsonAsync(await student.Client.GetAsync($"/practice/attempts/{attemptId}", Ct));
        Assert.Equal(0, state.RootElement.GetProperty("questions").GetArrayLength());
        Assert.Equal($"/practice/attempts/{attemptId}/results", state.RootElement.GetProperty("resultsUrl").GetString());
        using var test = await ReadJsonAsync(await student.Client.GetAsync($"/practice/tests/{testId}", Ct));
        Assert.Equal(JsonValueKind.Null, test.RootElement.GetProperty("activeAttempt").ValueKind);
    }

    [Fact]
    public async Task Written_answers_are_graded_through_the_ai_service_after_submit()
    {
        SkipWithoutDocker();
        var student = await _support.HighSchoolStudentAsync();
        var (_, attempt) = await _support.StartedAsync(student);
        var attemptId = AttemptId(attempt);
        var questions = Questions(attempt);
        var written = questions.First(q => q.Kind == "short").Id;
        await SaveAsync(student.Client, attemptId, questions[0].Id, new { selectedIndex = 1, baseRevision = 0 });
        await SaveAsync(student.Client, attemptId, written, new { textAnswer = "A full answer naming the idea", baseRevision = 0 });

        HttpResponseMessage? submitted = null;
        var session = await _support.TrackAsync(async () => submitted = await student.Client.PostAsync($"/practice/attempts/{attemptId}/submit", null, Ct));
        using (var body = await ReadJsonAsync(submitted!))
        {
            Assert.Equal("grading", body.RootElement.GetProperty("status").GetString());
        }

        var graded = Assert.Single(MessagesOf<PracticeAttemptGraded>(session));
        Assert.Equal(5, graded.ScoreMarks);

        var call = Assert.Single(factory.AiStub.For("/v1/grade"), r => r.Body.Contains(attemptId.ToString(), StringComparison.Ordinal));
        var token = new JsonWebToken(call.Authorization!["Bearer ".Length..]);
        Assert.Equal(student.UserId.ToString(), token.Subject);
        Assert.Equal("ai.grade", token.GetClaim("scope").Value);
        using (var request = JsonDocument.Parse(call.Body))
        {
            var item = Assert.Single(request.RootElement.GetProperty("answers").EnumerateArray());
            Assert.Equal(written.ToString(), item.GetProperty("question_id").GetString());
            Assert.Contains("Names the idea", item.GetProperty("memo").GetString(), StringComparison.Ordinal);
            Assert.Equal("Grade 11", request.RootElement.GetProperty("level").GetString());
        }

        using var results = await ReadJsonAsync(await student.Client.GetAsync($"/practice/attempts/{attemptId}/results", Ct));
        Assert.Equal("graded", results.RootElement.GetProperty("status").GetString());
        var marked = results.RootElement.GetProperty("questions").EnumerateArray().Single(q => q.GetProperty("id").GetGuid() == written);
        Assert.Equal(3, marked.GetProperty("awardedMarks").GetInt32());
        Assert.Equal("Every memo point is covered.", marked.GetProperty("feedback").GetString());
    }

    [Fact]
    public async Task Failed_grading_leaves_answers_not_marked_yet_and_never_zero()
    {
        SkipWithoutDocker();
        var student = await _support.HighSchoolStudentAsync();
        var (_, attempt) = await _support.StartedAsync(student);
        var attemptId = AttemptId(attempt);
        var written = Questions(attempt).First(q => q.Kind == "short").Id;
        await SaveAsync(student.Client, attemptId, written, new { textAnswer = $"My answer {Generation.Down}", baseRevision = 0 });

        await _support.SubmitAsync(student.Client, attemptId);
        await factory.AppHost.InvokeMessageAndWaitAsync(new GradePracticeAttempt(attemptId));
        var last = await factory.AppHost.InvokeMessageAndWaitAsync(new GradePracticeAttempt(attemptId));
        Assert.True(Assert.Single(MessagesOf<PracticeAttemptGraded>(last)).PartiallyGraded);

        using var results = await ReadJsonAsync(await student.Client.GetAsync($"/practice/attempts/{attemptId}/results", Ct));
        var root = results.RootElement;
        Assert.True(root.GetProperty("partiallyGraded").GetBoolean());
        Assert.Equal(JsonValueKind.Null, root.GetProperty("scoreMarks").ValueKind);
        Assert.Equal(JsonValueKind.Null, root.GetProperty("scorePercent").ValueKind);
        Assert.Equal(4, root.GetProperty("markedMarks").GetInt32());
        var pending = root.GetProperty("questions").EnumerateArray().Single(q => q.GetProperty("id").GetGuid() == written);
        Assert.Equal("not_marked_yet", pending.GetProperty("markingStatus").GetString());
        Assert.Equal(JsonValueKind.Null, pending.GetProperty("awardedMarks").ValueKind);
    }

    [Fact]
    public async Task A_timed_attempt_cannot_pause_and_an_untimed_one_pauses_and_resumes()
    {
        SkipWithoutDocker();
        var timedStudent = await _support.HighSchoolStudentAsync();
        var (_, timed) = await _support.StartedAsync(timedStudent, mode: "timed", durationMinutes: 30);
        var refused = await timedStudent.Client.PostAsync($"/practice/attempts/{AttemptId(timed)}/pause", null, Ct);
        Assert.Equal(HttpStatusCode.Conflict, refused.StatusCode);
        Assert.Equal("practice.pause_not_allowed", await ProblemCodeAsync(refused));

        var student = await _support.HighSchoolStudentAsync();
        var (_, untimed) = await _support.StartedAsync(student);
        var attemptId = AttemptId(untimed);
        var mcq = Questions(untimed)[0].Id;

        using (var paused = await ReadJsonAsync(await student.Client.PostAsync($"/practice/attempts/{attemptId}/pause", null, Ct)))
        {
            Assert.True(paused.RootElement.GetProperty("paused").GetBoolean());
            Assert.Equal("paused", paused.RootElement.GetProperty("status").GetString());
        }

        Assert.Equal(HttpStatusCode.OK, (await student.Client.PostAsync($"/practice/attempts/{attemptId}/pause", null, Ct)).StatusCode);
        var whilePaused = await SaveAsync(student.Client, attemptId, mcq, new { selectedIndex = 1, baseRevision = 0 });
        Assert.Equal(HttpStatusCode.Conflict, whilePaused.StatusCode);
        Assert.Equal("practice.attempt_paused", await ProblemCodeAsync(whilePaused));

        using (var active = await ReadJsonAsync(await student.Client.GetAsync("/practice/attempts/active", Ct)))
        {
            Assert.True(active.RootElement.GetProperty("paused").GetBoolean());
        }

        // Ninety seconds of pause are excluded from time on task.
        await _support.WithDbAsync(db => db.Attempts.Where(a => a.Id == attemptId)
            .ExecuteUpdateAsync(set => set.SetProperty(a => a.PausedAt, Now.AddSeconds(-90)), Ct));
        using (var resumed = await ReadJsonAsync(await student.Client.PostAsync($"/practice/attempts/{attemptId}/resume", null, Ct)))
        {
            Assert.False(resumed.RootElement.GetProperty("paused").GetBoolean());
            Assert.InRange(resumed.RootElement.GetProperty("pausedSecondsTotal").GetInt32(), 90, 100);
        }

        Assert.Equal(HttpStatusCode.OK, (await student.Client.PostAsync($"/practice/attempts/{attemptId}/resume", null, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await SaveAsync(student.Client, attemptId, mcq, new { selectedIndex = 1, baseRevision = 0 })).StatusCode);

        await _support.SubmitAsync(student.Client, attemptId);
        var after = await student.Client.PostAsync($"/practice/attempts/{attemptId}/pause", null, Ct);
        Assert.Equal("practice.attempt_not_active", await ProblemCodeAsync(after));
    }

    [Fact]
    public async Task A_timed_attempt_has_a_server_deadline_and_schedules_its_auto_submit()
    {
        SkipWithoutDocker();
        var student = await _support.HighSchoolStudentAsync();
        var testId = await _support.ReadyTestAsync(student, mode: "timed", durationMinutes: 30);

        HttpResponseMessage? response = null;
        var session = await _support.TrackAsync(async () => response = await student.Client.PostAsync($"/practice/tests/{testId}/attempts", null, Ct));
        using var json = await ReadJsonAsync(response!);
        var attempt = json.RootElement;
        var startedAt = attempt.GetProperty("startedAt").GetDateTimeOffset();
        var deadline = attempt.GetProperty("deadlineAt").GetDateTimeOffset();
        Assert.Equal(TimeSpan.FromMinutes(30), deadline - startedAt);
        Assert.InRange(attempt.GetProperty("remainingSeconds").GetInt32(), 1790, 1800);

        var scheduled = Assert.Single(session.Scheduled.MessagesOf<AutoSubmitPracticeAttempt>());
        Assert.Equal(AttemptId(attempt), scheduled.AttemptId);
        Assert.Equal(deadline, scheduled.DeadlineAt);
        Assert.Single(MessagesOf<PracticeAttemptStarted>(session));

        using var active = await ReadJsonAsync(await student.Client.GetAsync("/practice/attempts/active", Ct));
        Assert.Equal(AttemptId(attempt), active.RootElement.GetProperty("attemptId").GetGuid());
        Assert.Equal("timed", active.RootElement.GetProperty("mode").GetString());
    }

    [Fact]
    public async Task After_the_deadline_plus_grace_saves_and_submits_are_refused_and_the_auto_submit_grades_saved_answers()
    {
        SkipWithoutDocker();
        var student = await _support.HighSchoolStudentAsync();
        var (_, attempt) = await _support.StartedAsync(student, mode: "timed", durationMinutes: 10);
        var attemptId = AttemptId(attempt);
        var mcqs = Questions(attempt).Where(q => q.Kind == "mcq").Select(q => q.Id).ToList();
        await SaveAsync(student.Client, attemptId, mcqs[0], new { selectedIndex = 1, baseRevision = 0 });

        // Within the 10 second network grace an in-flight save still lands.
        await _support.ExpireAsync(attemptId, TimeSpan.FromSeconds(3));
        Assert.Equal(HttpStatusCode.OK, (await SaveAsync(student.Client, attemptId, mcqs[1], new { selectedIndex = 1, baseRevision = 0 })).StatusCode);

        var deadline = await _support.ExpireAsync(attemptId, TimeSpan.FromSeconds(30));
        var late = await SaveAsync(student.Client, attemptId, mcqs[0], new { selectedIndex = 0, baseRevision = 1 });
        Assert.Equal(HttpStatusCode.Conflict, late.StatusCode);
        Assert.Equal("practice.deadline_passed", await ProblemCodeAsync(late));
        var lateSubmit = await student.Client.PostAsync($"/practice/attempts/{attemptId}/submit", null, Ct);
        Assert.Equal("practice.deadline_passed", await ProblemCodeAsync(lateSubmit));

        // A deadline message for another deadline is stale and does nothing.
        await factory.AppHost.InvokeMessageAndWaitAsync(new AutoSubmitPracticeAttempt(attemptId, deadline.AddMinutes(-5)));
        using (var still = await ReadJsonAsync(await student.Client.GetAsync($"/practice/attempts/{attemptId}", Ct)))
        {
            Assert.Equal("in_progress", still.RootElement.GetProperty("status").GetString());
        }

        var session = await factory.AppHost.InvokeMessageAndWaitAsync(new AutoSubmitPracticeAttempt(attemptId, deadline));
        Assert.Equal("deadline", Assert.Single(MessagesOf<PracticeAttemptSubmitted>(session)).SubmitSource);
        var graded = Assert.Single(MessagesOf<PracticeAttemptGraded>(session));
        Assert.Equal(4, graded.ScoreMarks);
        Assert.True(graded.SecondsOnTask <= 600);

        using var results = await ReadJsonAsync(await student.Client.GetAsync($"/practice/attempts/{attemptId}/results", Ct));
        Assert.Equal("deadline", results.RootElement.GetProperty("submitSource").GetString());

        // Repeating the message is a no-op.
        var repeat = await factory.AppHost.InvokeMessageAndWaitAsync(new AutoSubmitPracticeAttempt(attemptId, deadline));
        Assert.Empty(MessagesOf<PracticeAttemptGraded>(repeat));
    }

    [Fact]
    public async Task Focus_losses_are_counted_coalesced_and_refused_after_submit()
    {
        SkipWithoutDocker();
        var student = await _support.HighSchoolStudentAsync();
        var (_, attempt) = await _support.StartedAsync(student);
        var attemptId = AttemptId(attempt);

        using (var first = await ReadJsonAsync(await student.Client.PostAsJsonAsync($"/practice/attempts/{attemptId}/focus-loss", new { kind = "visibility_hidden" }, Ct)))
        {
            Assert.Equal(1, first.RootElement.GetProperty("focusLossCount").GetInt32());
        }

        using (var burst = await ReadJsonAsync(await student.Client.PostAsJsonAsync($"/practice/attempts/{attemptId}/focus-loss", new { kind = "window_blur" }, Ct)))
        {
            Assert.Equal(1, burst.RootElement.GetProperty("focusLossCount").GetInt32());
        }

        await _support.WithDbAsync(db => db.Attempts.Where(a => a.Id == attemptId)
            .ExecuteUpdateAsync(set => set.SetProperty(a => a.LastFocusLossAt, Now.AddSeconds(-5)), Ct));
        using (var second = await ReadJsonAsync(await student.Client.PostAsJsonAsync($"/practice/attempts/{attemptId}/focus-loss", new { kind = "window_blur" }, Ct)))
        {
            Assert.Equal(2, second.RootElement.GetProperty("focusLossCount").GetInt32());
        }

        Assert.Equal(HttpStatusCode.BadRequest, (await student.Client.PostAsJsonAsync($"/practice/attempts/{attemptId}/focus-loss", new { kind = "nap" }, Ct)).StatusCode);

        var session = await _support.TrackAsync(() => student.Client.PostAsync($"/practice/attempts/{attemptId}/submit", null, Ct));
        Assert.Equal(2, Assert.Single(MessagesOf<PracticeAttemptSubmitted>(session)).FocusLossCount);
        var after = await student.Client.PostAsJsonAsync($"/practice/attempts/{attemptId}/focus-loss", new { kind = "window_blur" }, Ct);
        Assert.Equal(HttpStatusCode.Conflict, after.StatusCode);
        Assert.Equal("practice.attempt_not_active", await ProblemCodeAsync(after));
    }

    [Fact]
    public async Task Flashcards_are_self_rated_and_publish_no_grade()
    {
        SkipWithoutDocker();
        var student = await _support.HighSchoolStudentAsync();
        var (_, attempt) = await _support.StartedAsync(student, format: "flashcards", mode: null);
        var attemptId = AttemptId(attempt);
        var card = attempt.GetProperty("questions")[0];
        Assert.Equal("Back of f1", card.GetProperty("flashcardBack").GetString());

        Assert.Equal(HttpStatusCode.OK, (await SaveAsync(student.Client, attemptId, card.GetProperty("id").GetGuid(), new { selfRating = "knew", baseRevision = 0 })).StatusCode);
        var session = await _support.TrackAsync(() => student.Client.PostAsync($"/practice/attempts/{attemptId}/submit", null, Ct));
        Assert.Single(MessagesOf<PracticeAttemptSubmitted>(session));
        Assert.Empty(MessagesOf<PracticeAttemptGraded>(session));

        using var results = await ReadJsonAsync(await student.Client.GetAsync($"/practice/attempts/{attemptId}/results", Ct));
        Assert.Equal(JsonValueKind.Null, results.RootElement.GetProperty("scoreMarks").ValueKind);
        var first = results.RootElement.GetProperty("questions")[0];
        Assert.Equal("self_rated", first.GetProperty("markingStatus").GetString());
        Assert.Equal("knew", first.GetProperty("yourSelfRating").GetString());
    }

    [Fact]
    public async Task The_tutor_is_blocked_while_an_attempt_is_active()
    {
        SkipWithoutDocker();
        var student = await _support.HighSchoolStudentAsync();
        var conversation = await CreateConversationAsync(student.Client);
        var (_, attempt) = await _support.StartedAsync(student);
        var calls = factory.AiStub.For("/v1/tutor/turn").Count();

        var blocked = await student.Client.PostAsJsonAsync($"/ai/conversations/{conversation}/messages", new { message = "What is the answer to question 2?" }, Ct);
        Assert.Equal(HttpStatusCode.Conflict, blocked.StatusCode);
        Assert.Equal("ai.blocked_during_attempt", await ProblemCodeAsync(blocked));
        Assert.Equal(calls, factory.AiStub.For("/v1/tutor/turn").Count());

        // Nothing was counted against the daily limit or saved.
        using (var detail = await ReadJsonAsync(await student.Client.GetAsync($"/ai/conversations/{conversation}", Ct)))
        {
            Assert.Equal(0, detail.RootElement.GetProperty("messages").GetArrayLength());
        }

        // Paused still counts as active.
        await student.Client.PostAsync($"/practice/attempts/{AttemptId(attempt)}/pause", null, Ct);
        Assert.Equal(HttpStatusCode.Conflict, (await student.Client.PostAsJsonAsync($"/ai/conversations/{conversation}/messages", new { message = "Hint?" }, Ct)).StatusCode);

        await _support.SubmitAsync(student.Client, AttemptId(attempt));
        var allowed = await student.Client.PostAsJsonAsync($"/ai/conversations/{conversation}/messages", new { message = "Explain question 2 now" }, Ct);
        Assert.Equal(HttpStatusCode.OK, allowed.StatusCode);
        await allowed.Content.ReadAsStringAsync(Ct);
    }

    [Fact]
    public async Task The_tutor_is_not_blocked_by_an_attempt_past_its_deadline_or_another_users_attempt()
    {
        SkipWithoutDocker();
        var student = await _support.HighSchoolStudentAsync();
        var other = await _support.HighSchoolStudentAsync();
        var conversation = await CreateConversationAsync(student.Client);
        await _support.StartedAsync(other);

        var free = await student.Client.PostAsJsonAsync($"/ai/conversations/{conversation}/messages", new { message = "Explain fractions" }, Ct);
        Assert.Equal(HttpStatusCode.OK, free.StatusCode);
        await free.Content.ReadAsStringAsync(Ct);

        var (_, timed) = await _support.StartedAsync(student, mode: "timed", durationMinutes: 10);
        await _support.ExpireAsync(AttemptId(timed), TimeSpan.FromMinutes(1));
        var afterDeadline = await student.Client.PostAsJsonAsync($"/ai/conversations/{conversation}/messages", new { message = "Explain decimals" }, Ct);
        Assert.Equal(HttpStatusCode.OK, afterDeadline.StatusCode);
        await afterDeadline.Content.ReadAsStringAsync(Ct);
    }

    private static async Task<Guid> CreateConversationAsync(HttpClient client)
    {
        var response = await client.PostAsJsonAsync("/ai/conversations", new { title = "Practice help" }, Ct);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        using var json = await ReadJsonAsync(response);
        return json.RootElement.GetProperty("id").GetGuid();
    }
}
