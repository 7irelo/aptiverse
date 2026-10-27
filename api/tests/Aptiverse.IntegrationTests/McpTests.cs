using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Persistence;
using Aptiverse.Practice.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using static Aptiverse.IntegrationTests.McpTestSupport;

namespace Aptiverse.IntegrationTests;

/// <summary>
/// The Aptiverse MCP server as the tool boundary where a model acts for a student: who may call it, what each token
/// may do, that every tool sees only the token's student, the block during an attempt, the write tool's limits and
/// the audit trail.
/// </summary>
[Collection(ApiTestGroup.Name)]
public sealed class McpTests(ApiFactory factory)
{
    private static readonly string[] Algebra = ["Algebra"];
    private static readonly string[] AlgebraAndFunctions = ["Algebra", "Functions"];

    private readonly McpTestSupport _mcp = new(factory);
    private readonly PracticeTestSupport _practice = new(factory);

    private void SkipWithoutDocker() => Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);

    [Fact]
    public async Task A_delegated_token_initializes_and_other_credentials_are_refused_at_mcp()
    {
        SkipWithoutDocker();
        var userId = Guid.CreateVersion7();

        Assert.Equal(HttpStatusCode.OK, (await _mcp.RawInitializeAsync(_mcp.Token(userId))).StatusCode);

        Assert.Equal(HttpStatusCode.Unauthorized, (await _mcp.RawInitializeAsync(null)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await _mcp.RawInitializeAsync(_mcp.ExpiredToken(userId))).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await _mcp.RawInitializeAsync(_mcp.LongLivedToken(userId))).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await _mcp.RawInitializeAsync(_mcp.AiServiceToken(userId))).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await _mcp.RawInitializeAsync("not-a-token")).StatusCode);

        // The test sign-in scheme authenticates everywhere else in this suite; it must not open /mcp.
        Assert.Equal(HttpStatusCode.Unauthorized, (await _mcp.RawInitializeAsync(null, r =>
        {
            r.Headers.Add(TestAuthHandler.RoleHeader, "student");
            r.Headers.Add(TestAuthHandler.UserHeader, userId.ToString());
        })).StatusCode);

        // Parents and admins get no MCP access in v1, even holding a correctly signed token with scopes.
        Assert.Equal(HttpStatusCode.Forbidden, (await _mcp.RawInitializeAsync(_mcp.Token(userId, role: "parent"))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await _mcp.RawInitializeAsync(_mcp.Token(userId, role: "admin"))).StatusCode);
    }

    [Fact]
    public async Task A_real_access_token_is_refused_at_mcp_and_an_mcp_token_is_refused_everywhere_else()
    {
        SkipWithoutDocker();
        var identity = new IdentityTestSupport(factory);
        var account = await identity.RegisterAsync();
        Assert.Equal(HttpStatusCode.OK, await identity.MeStatusAsync(account.AccessToken));

        Assert.Equal(HttpStatusCode.Unauthorized, (await _mcp.RawInitializeAsync(account.AccessToken)).StatusCode);

        var mcpToken = _mcp.Token(account.UserId);
        Assert.Equal(HttpStatusCode.Unauthorized, await identity.MeStatusAsync(mcpToken));
        var client = identity.Bearer(mcpToken);
        foreach (var url in new[] { "/progress/mastery", "/academics/units", "/practice/tests", "/ai/conversations" })
        {
            Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync(url, Ct)).StatusCode);
        }

        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/practice/tests/generate", new { }, Ct)).StatusCode);
    }

    [Fact]
    public async Task Each_tool_needs_its_own_scope()
    {
        SkipWithoutDocker();
        var student = await _practice.HighSchoolStudentAsync();
        var subject = await _mcp.SubjectNameAsync(student.UserId);

        await using (var assessmentsOnly = await _mcp.ConnectAsync(_mcp.Token(student.UserId, ["mcp.read.assessments"])))
        {
            await OkAsync(assessmentsOnly, "list_upcoming_assessments");
            Assert.Equal("missing_scope", await ErrorCodeAsync(assessmentsOnly, "get_topic_mastery"));
            Assert.Equal("missing_scope", await ErrorCodeAsync(assessmentsOnly, "get_attempt_mistakes"));
        }

        await using var readOnly = await _mcp.ConnectAsync(_mcp.Token(student.UserId, ReadScopes));
        await OkAsync(readOnly, "get_topic_mastery");
        Assert.Equal(
            "missing_scope",
            await ErrorCodeAsync(readOnly, "create_practice_quiz", JsonSerializer.Serialize(new { subject, topics = Algebra })));
        await _practice.WithDbAsync(async db => Assert.Equal(0, await db.GenerationJobs.CountAsync(j => j.UserId == student.UserId, Ct)));
    }

    [Fact]
    public async Task Every_tool_returns_only_the_token_students_data_whatever_the_arguments()
    {
        SkipWithoutDocker();

        // Student A: mastery, an upcoming assessment and a graded attempt with wrong answers.
        var a = await _practice.HighSchoolStudentAsync();
        var (_, attempt) = await _practice.StartedAsync(a);
        var attemptId = PracticeTestSupport.AttemptId(attempt);
        var questions = PracticeTestSupport.Questions(attempt);
        var mcqs = questions.Where(q => q.Kind == "mcq").Select(q => q.Id).ToList();
        await PracticeTestSupport.SaveAsync(a.Client, attemptId, mcqs[0], new { selectedIndex = 1, baseRevision = 0 });
        await PracticeTestSupport.SaveAsync(a.Client, attemptId, mcqs[1], new { selectedIndex = 0, baseRevision = 0 });
        await PracticeTestSupport.SaveAsync(a.Client, attemptId, questions.Single(q => q.Kind == "short").Id, new { textAnswer = "photosynthesis", baseRevision = 0 });
        Assert.Equal(HttpStatusCode.OK, (await _practice.SubmitAsync(a.Client, attemptId)).StatusCode);
        var subject = await _mcp.SubjectNameAsync(a.UserId);

        await using (var asA = await _mcp.ConnectAsync(_mcp.Token(a.UserId, ReadScopes)))
        {
            var mastery = await OkAsync(asA, "get_topic_mastery", JsonSerializer.Serialize(new { subject }));
            var algebra = Assert.Single(mastery.GetProperty("topics").EnumerateArray());
            Assert.Equal("Algebra", algebra.GetProperty("topic").GetString());
            Assert.Equal(subject, algebra.GetProperty("subject").GetString());
            Assert.True(algebra.GetProperty("answered_questions").GetInt32() > 0);

            var assessments = await OkAsync(asA, "list_upcoming_assessments", """{"days": 30}""");
            Assert.Equal(a.AssessmentId, Assert.Single(assessments.GetProperty("assessments").EnumerateArray()).GetProperty("assessment_id").GetGuid());
            Assert.Empty((await OkAsync(asA, "list_upcoming_assessments", """{"days": 1}""")).GetProperty("assessments").EnumerateArray());

            var mistakes = (await OkAsync(asA, "get_attempt_mistakes", JsonSerializer.Serialize(new { subject, limit = 10 })))
                .GetProperty("mistakes").EnumerateArray().ToList();
            Assert.InRange(mistakes.Count, 2, 3);
            Assert.All(mistakes, m =>
            {
                Assert.Equal(attemptId, m.GetProperty("attempt_id").GetGuid());
                Assert.Equal("Algebra", m.GetProperty("topic").GetString());
                Assert.False(string.IsNullOrEmpty(m.GetProperty("expected_answer").GetString()));
            });
            Assert.Single((await OkAsync(asA, "get_attempt_mistakes", """{"limit": 1}""")).GetProperty("mistakes").EnumerateArray());
        }

        // Student B is enrolled in the same subject (the same shared study unit) but has done nothing.
        var b = await _practice.HighSchoolStudentAsync();
        await using var asB = await _mcp.ConnectAsync(_mcp.Token(b.UserId, AllScopes));
        Assert.Empty((await OkAsync(asB, "get_topic_mastery")).GetProperty("topics").EnumerateArray());
        Assert.Empty((await OkAsync(asB, "get_topic_mastery", JsonSerializer.Serialize(new { subject }))).GetProperty("topics").EnumerateArray());
        Assert.Empty((await OkAsync(asB, "get_attempt_mistakes", JsonSerializer.Serialize(new { subject, limit = 10 }))).GetProperty("mistakes").EnumerateArray());
        var bAssessments = (await OkAsync(asB, "list_upcoming_assessments", """{"days": 90}""")).GetProperty("assessments").EnumerateArray().ToList();
        Assert.DoesNotContain(bAssessments, x => x.GetProperty("assessment_id").GetGuid() == a.AssessmentId);

        // Crafted arguments: ids where names belong, and arguments naming a user, never reach A's data.
        Assert.Equal("unknown_subject", await ErrorCodeAsync(asB, "get_attempt_mistakes", JsonSerializer.Serialize(new { subject = attemptId.ToString() })));
        Assert.Equal("unknown_subject", await ErrorCodeAsync(asB, "get_topic_mastery", JsonSerializer.Serialize(new { subject = a.UserId.ToString() })));
        Assert.Equal("invalid_arguments", await ErrorCodeAsync(asB, "get_topic_mastery", JsonSerializer.Serialize(new { user_id = a.UserId })));
        Assert.Equal("invalid_arguments", await ErrorCodeAsync(asB, "get_attempt_mistakes", JsonSerializer.Serialize(new { attempt_id = attemptId })));
        Assert.Equal(
            "invalid_arguments",
            await ErrorCodeAsync(asB, "create_practice_quiz", JsonSerializer.Serialize(new { subject, topics = Algebra, assessment_id = a.AssessmentId })));
    }

    [Fact]
    public async Task Arguments_are_held_to_the_pinned_schema()
    {
        SkipWithoutDocker();
        await using var client = await _mcp.ConnectAsync(_mcp.Token(Guid.CreateVersion7()));

        Assert.Equal("invalid_arguments", await ErrorCodeAsync(client, "list_upcoming_assessments", """{"days": 91}"""));
        Assert.Equal("invalid_arguments", await ErrorCodeAsync(client, "list_upcoming_assessments", """{"days": "7"}"""));
        Assert.Equal("invalid_arguments", await ErrorCodeAsync(client, "list_upcoming_assessments", """{"days": 2.5}"""));
        Assert.Equal("invalid_arguments", await ErrorCodeAsync(client, "get_attempt_mistakes", """{"limit": 11}"""));
        Assert.Equal("invalid_arguments", await ErrorCodeAsync(client, "get_topic_mastery", JsonSerializer.Serialize(new { subject = new string('x', 61) })));
        Assert.Equal("invalid_arguments", await ErrorCodeAsync(client, "get_topic_mastery", """{"subject": null}"""));
        Assert.Equal("invalid_arguments", await ErrorCodeAsync(client, "create_practice_quiz", """{"subject": "Mathematics"}"""));
        Assert.Equal("invalid_arguments", await ErrorCodeAsync(client, "create_practice_quiz", """{"subject": "Mathematics", "topics": []}"""));
        Assert.Equal("invalid_arguments", await ErrorCodeAsync(client, "create_practice_quiz", """{"subject": "Mathematics", "topics": ["a","b","c","d","e","f"]}"""));
        Assert.Equal("invalid_arguments", await ErrorCodeAsync(client, "create_practice_quiz", """{"subject": "Mathematics", "topics": ["Algebra"], "question_count": 2}"""));
        Assert.Equal("invalid_arguments", await ErrorCodeAsync(client, "create_practice_quiz", """{"subject": "Mathematics", "topics": ["line\nbreak"]}"""));
    }

    [Fact]
    public async Task Every_tool_is_blocked_while_the_student_has_an_attempt_in_progress()
    {
        SkipWithoutDocker();
        var student = await _practice.HighSchoolStudentAsync();
        await _practice.StartedAsync(student);
        var subject = await _mcp.SubjectNameAsync(student.UserId);
        await using var client = await _mcp.ConnectAsync(_mcp.Token(student.UserId));

        Assert.Equal("blocked_during_attempt", await ErrorCodeAsync(client, "get_topic_mastery"));
        Assert.Equal("blocked_during_attempt", await ErrorCodeAsync(client, "list_upcoming_assessments"));
        Assert.Equal("blocked_during_attempt", await ErrorCodeAsync(client, "get_attempt_mistakes"));
        Assert.Equal(
            "blocked_during_attempt",
            await ErrorCodeAsync(client, "create_practice_quiz", JsonSerializer.Serialize(new { subject, topics = Algebra })));
    }

    [Fact]
    public async Task Create_practice_quiz_starts_one_generation_per_confirmed_token_and_returns_no_questions()
    {
        SkipWithoutDocker();
        var student = await _practice.HighSchoolStudentAsync();
        var subject = await _mcp.SubjectNameAsync(student.UserId);
        var token = _mcp.Token(student.UserId);
        var args = JsonSerializer.Serialize(new { subject, topics = AlgebraAndFunctions, question_count = 3 });

        await using var client = await _mcp.ConnectAsync(token);
        var first = await _mcp.TrackAsync(() => OkAsync(client, "create_practice_quiz", args));
        Assert.Equal(["job_id", "status"], first.EnumerateObject().Select(p => p.Name));
        var jobId = first.GetProperty("job_id").GetGuid();

        // The agent retries the same confirmed action: the same job comes back and nothing new is generated.
        var replay = await OkAsync(client, "create_practice_quiz", args);
        Assert.Equal(jobId, replay.GetProperty("job_id").GetGuid());

        await _practice.WithDbAsync(async db =>
        {
            var job = await db.GenerationJobs.SingleAsync(j => j.UserId == student.UserId, Ct);
            Assert.Equal(jobId, job.Id);
            var test = await db.Tests.SingleAsync(t => t.Id == job.TestId, Ct);
            Assert.Equal(student.AssessmentId, test.AssessmentId);
            Assert.Equal("quiz", test.Format);
            Assert.Equal(["Algebra", "Functions"], test.Topics);
        });

        // A new turn (a new token) while the first quiz is still generating is refused, not queued behind it.
        await using var nextTurn = await _mcp.ConnectAsync(_mcp.Token(student.UserId));
        Assert.Equal("generation_in_progress", await ErrorCodeAsync(nextTurn, "create_practice_quiz", args));

        var audit = await _mcp.WithDbAsync(db => db.ToolCalls.AsNoTracking()
            .Where(c => c.UserId == student.UserId && c.Tool == "create_practice_quiz")
            .OrderBy(c => c.CreatedAt)
            .ToListAsync(Ct));
        Assert.Equal(["ok", "ok", "generation_in_progress"], audit.Select(c => c.Outcome));
        Assert.All(audit.Take(2), c => Assert.Equal(jobId, c.ResourceId));
        Assert.All(audit, c => Assert.Equal("mcp.write.practice", c.Scope));
    }

    [Fact]
    public async Task Create_practice_quiz_respects_the_daily_limit_and_needs_an_upcoming_assessment()
    {
        SkipWithoutDocker();
        var student = await _practice.HighSchoolStudentAsync();
        var subject = await _mcp.SubjectNameAsync(student.UserId);
        await _practice.WithDbAsync(async db =>
        {
            for (var i = 0; i < ApiFactory.DailyGenerationLimit; i++)
            {
                var test = PracticeTest.CreateGenerating(
                    student.UserId, Guid.CreateVersion7(), student.AssessmentId, subject, "grade_11", "high_school",
                    "Earlier", "quiz", "untimed", null, ["Algebra"], "core", false);
                test.MarkFailed();
                db.Tests.Add(test);
            }

            await db.SaveChangesAsync(Ct);
        });

        await using var client = await _mcp.ConnectAsync(_mcp.Token(student.UserId));
        Assert.Equal(
            "daily_limit_reached",
            await ErrorCodeAsync(client, "create_practice_quiz", JsonSerializer.Serialize(new { subject, topics = Algebra })));

        // A student whose subject has no upcoming assessment gets no quiz.
        var academics = new AcademicsTestSupport(factory);
        var (lonelyId, lonelyClient) = await academics.HighSchoolAsync();
        await academics.EnrolCapsAsync(lonelyClient, "math");
        await using var lonely = await _mcp.ConnectAsync(_mcp.Token(lonelyId));
        Assert.Equal(
            "no_upcoming_assessment",
            await ErrorCodeAsync(lonely, "create_practice_quiz", JsonSerializer.Serialize(new { subject, topics = Algebra })));
        Assert.Equal(
            "unknown_subject",
            await ErrorCodeAsync(lonely, "create_practice_quiz", JsonSerializer.Serialize(new { subject = "Astrology", topics = Algebra })));
    }

    [Fact]
    public async Task Every_call_writes_an_audit_row_with_ids_and_outcome_only()
    {
        SkipWithoutDocker();
        var student = await _practice.HighSchoolStudentAsync();
        var token = _mcp.Token(student.UserId, ReadScopes);
        await using var client = await _mcp.ConnectAsync(token);
        const string secretish = "Thandi's private note";

        await OkAsync(client, "list_upcoming_assessments");
        Assert.Equal("missing_scope", await ErrorCodeAsync(client, "create_practice_quiz", JsonSerializer.Serialize(new { subject = secretish, topics = new List<string> { secretish } })));
        Assert.Equal("unknown_subject", await ErrorCodeAsync(client, "get_topic_mastery", JsonSerializer.Serialize(new { subject = secretish })));

        var rows = await _mcp.WithDbAsync(db => db.ToolCalls.AsNoTracking().Where(c => c.UserId == student.UserId).OrderBy(c => c.CreatedAt).ToListAsync(Ct));
        Assert.Equal(["list_upcoming_assessments", "create_practice_quiz", "get_topic_mastery"], rows.Select(r => r.Tool));
        Assert.Equal(["ok", "missing_scope", "unknown_subject"], rows.Select(r => r.Outcome));
        Assert.Equal(["mcp.read.assessments", "mcp.write.practice", "mcp.read.progress"], rows.Select(r => r.Scope));
        var jti = new JsonWebToken(token).Id;
        Assert.All(rows, r =>
        {
            Assert.Equal(jti, r.TokenId);
            Assert.Equal("test-request", r.RequestId);
            Assert.Equal("aptiverse-tutor", r.Client);
            Assert.True(r.LatencyMs >= 0);
            Assert.Null(r.ResourceId);
        });
        Assert.DoesNotContain(rows, r => JsonSerializer.Serialize(r).Contains("private note", StringComparison.Ordinal));
    }

    [Fact]
    public async Task A_tutor_turn_sends_a_delegated_mcp_token_with_read_scopes_and_write_only_when_confirmed()
    {
        SkipWithoutDocker();
        var userId = await SeedStudentAsync();
        var client = factory.CreateUserClient(userId);
        var created = await client.PostAsJsonAsync("/ai/conversations", new { title = "Quiz me" }, Ct);
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var conversationId = (await created.Content.ReadFromJsonAsync<JsonElement>(Ct)).GetProperty("id").GetGuid();

        var plain = await client.PostAsJsonAsync($"/ai/conversations/{conversationId}/messages", new { message = "How am I doing?" }, Ct);
        Assert.Equal(HttpStatusCode.OK, plain.StatusCode);
        await plain.Content.ReadAsStringAsync(Ct);
        var confirmed = await client.PostAsJsonAsync(
            $"/ai/conversations/{conversationId}/messages",
            new { message = "Yes, make it", confirmedAction = new { tool = "create_practice_quiz", arguments = new { subject = "Mathematics", topics = Algebra } } },
            Ct);
        Assert.Equal(HttpStatusCode.OK, confirmed.StatusCode);
        await confirmed.Content.ReadAsStringAsync(Ct);

        var calls = factory.AiStub.For("/v1/tutor/turn").Where(r => r.Body.Contains(conversationId.ToString(), StringComparison.Ordinal)).ToList();
        Assert.Equal(2, calls.Count);
        var readToken = await AssertMcpTokenAsync(calls[0], userId, "mcp.read.progress mcp.read.assessments");
        await AssertMcpTokenAsync(calls[1], userId, "mcp.read.progress mcp.read.assessments mcp.write.practice");

        // The header is the ai service's MCP credential: it opens /mcp for this student and nothing else.
        await using var mcp = await _mcp.ConnectAsync(readToken);
        await OkAsync(mcp, "list_upcoming_assessments");
        Assert.Equal(HttpStatusCode.Unauthorized, (await new IdentityTestSupport(factory).Bearer(readToken).GetAsync("/me", Ct)).StatusCode);
    }

    private async Task<string> AssertMcpTokenAsync(RecordedRequest call, Guid userId, string scopes)
    {
        Assert.NotNull(call.McpToken);
        Assert.NotEqual(call.Authorization, "Bearer " + call.McpToken);

        var jwks = new JsonWebKeySet(await factory.CreateClient().GetStringAsync("/.well-known/jwks.json", Ct));
        var result = await new JsonWebTokenHandler().ValidateTokenAsync(call.McpToken, new TokenValidationParameters
        {
            ValidIssuer = factory.Services.GetRequiredService<IConfiguration>()["Auth:Issuer"],
            ValidAudience = DelegatedMcpTokens.Audience,
            IssuerSigningKeys = jwks.GetSigningKeys(),
            ValidAlgorithms = [SecurityAlgorithms.EcdsaSha256],
            RequireExpirationTime = true,
        });

        Assert.True(result.IsValid, result.Exception?.Message);
        var jwt = (JsonWebToken)result.SecurityToken;
        Assert.Equal(userId.ToString(), jwt.Subject);
        Assert.Equal(scopes, jwt.GetClaim("scope").Value);
        Assert.Equal(TimeSpan.FromMinutes(5), jwt.ValidTo - jwt.IssuedAt);
        Assert.False(jwt.TryGetClaim("sid", out _));
        Assert.False(jwt.TryGetClaim("email", out _));
        return call.McpToken;
    }

    private async Task<Guid> SeedStudentAsync()
    {
        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();
        var email = $"mcp-{Guid.NewGuid():N}@example.test";
        var user = User.Create(email, email.ToUpperInvariant(), "Ayanda Agent", emailConfirmed: true);
        user.CompleteOnboarding(EducationLevels.HighSchool, 11, null, Curricula.Nsc, null, TimeProvider.System.GetUtcNow());
        db.Users.Add(user);
        await db.SaveChangesAsync(Ct);
        return user.Id;
    }
}
