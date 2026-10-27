using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Aptiverse.Academics.Persistence;
using Aptiverse.Identity.Contracts;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Wolverine.Tracking;
using static Aptiverse.IntegrationTests.AcademicsTestSupport;
using static Aptiverse.IntegrationTests.PracticeTestSupport;

namespace Aptiverse.IntegrationTests;

/// <summary>Account erasure across Academics and Practice, and the tutor context Academics now feeds.</summary>
[Collection(ApiTestGroup.Name)]
public sealed class PracticeErasureTests(ApiFactory factory)
{
    private readonly PracticeTestSupport _support = new(factory);

    private void SkipWithoutDocker() => Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);

    [Fact]
    public async Task Account_deletion_soft_deletes_practice_rows_and_leaves_other_users_alone()
    {
        SkipWithoutDocker();
        var student = await _support.HighSchoolStudentAsync();
        var bystander = await _support.HighSchoolStudentAsync();
        var (testId, attempt) = await _support.StartedAsync(student);
        var attemptId = AttemptId(attempt);
        await SaveAsync(student.Client, attemptId, Questions(attempt)[0].Id, new { selectedIndex = 1, baseRevision = 0 });
        await _support.SubmitAsync(student.Client, attemptId);
        var bystanderTest = await _support.ReadyTestAsync(bystander);

        await factory.AppHost.InvokeMessageAndWaitAsync(new AccountDeletionRequested(student.UserId, "gone@example.test", "Gone", Now));

        Assert.Equal(HttpStatusCode.NotFound, (await student.Client.GetAsync($"/practice/tests/{testId}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await student.Client.GetAsync($"/practice/attempts/{attemptId}/results", Ct)).StatusCode);
        await _support.WithDbAsync(async db =>
        {
            Assert.False(await db.Tests.AnyAsync(t => t.UserId == student.UserId, Ct));
            Assert.False(await db.Attempts.AnyAsync(a => a.UserId == student.UserId, Ct));
            Assert.False(await db.Answers.AnyAsync(a => a.UserId == student.UserId, Ct));
            Assert.False(await db.AttemptTopicScores.AnyAsync(s => s.UserId == student.UserId, Ct));
            Assert.False(await db.Questions.AnyAsync(q => q.TestId == testId, Ct));
            Assert.True(await db.Answers.IgnoreQueryFilters().AnyAsync(a => a.UserId == student.UserId && a.DeletedAt != null, Ct));
            Assert.True(await db.Tests.AnyAsync(t => t.Id == bystanderTest, Ct));
        });

        // Repeating the message is harmless.
        await factory.AppHost.InvokeMessageAndWaitAsync(new AccountDeletionRequested(student.UserId, "gone@example.test", "Gone", Now));
    }

    [Fact]
    public async Task Account_deletion_soft_deletes_enrolments_assessments_and_private_courses()
    {
        SkipWithoutDocker();
        var student = await _support.TertiaryStudentAsync();
        var (_, privateClient) = await new AcademicsTestSupport(factory).TertiaryAsync(institutionName: "Nowhere College of Testing");
        var privateCourse = await CreateCourseAsync(privateClient, "Private course");
        var privateOwner = await OwnerOfAsync(privateCourse.GetProperty("unitId").GetGuid());

        await factory.AppHost.InvokeMessageAndWaitAsync(new AccountDeletionRequested(student.UserId, "gone@example.test", "Gone", Now));
        await factory.AppHost.InvokeMessageAndWaitAsync(new AccountDeletionRequested(privateOwner, "gone2@example.test", "Gone", Now));

        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AcademicsDbContext>();
        Assert.False(await db.Enrolments.AnyAsync(e => e.UserId == student.UserId, Ct));
        Assert.False(await db.Assessments.AnyAsync(a => a.UserId == student.UserId, Ct));
        Assert.True(await db.Assessments.IgnoreQueryFilters().AnyAsync(a => a.Id == student.AssessmentId && a.DeletedAt != null, Ct));
        Assert.False(await db.StudyUnits.AnyAsync(u => u.OwnerUserId == privateOwner, Ct));
        Assert.Equal(HttpStatusCode.NotFound, (await student.Client.GetAsync($"/academics/assessments/{student.AssessmentId}", Ct)).StatusCode);
    }

    [Fact]
    public async Task The_tutor_receives_the_students_subjects_and_open_assessments()
    {
        SkipWithoutDocker();
        var student = await _support.HighSchoolStudentAsync();
        var create = await student.Client.PostAsJsonAsync("/ai/conversations", new { title = "Context" }, Ct);
        using var created = await ReadJsonAsync(create);
        var conversation = created.RootElement.GetProperty("id").GetGuid();
        var marker = $"Context check {Guid.NewGuid():N}";

        var response = await student.Client.PostAsJsonAsync($"/ai/conversations/{conversation}/messages", new { message = marker }, Ct);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await response.Content.ReadAsStringAsync(Ct);

        var call = Assert.Single(factory.AiStub.For("/v1/tutor/turn"), r => r.Body.Contains(marker, StringComparison.Ordinal));
        using var body = JsonDocument.Parse(call.Body);
        var context = body.RootElement.GetProperty("context");
        Assert.Equal("high_school", context.GetProperty("stage").GetString());
        Assert.Equal(["Mathematics"], context.GetProperty("subjects").EnumerateArray().Select(s => s.GetString()));
        var open = Assert.Single(context.GetProperty("open_assessments").EnumerateArray()).GetString();
        Assert.StartsWith("June exam (Mathematics, due ", open, StringComparison.Ordinal);
        Assert.Empty(context.GetProperty("weakest_topics").EnumerateArray());
    }

    private async Task<Guid> OwnerOfAsync(Guid unitId)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AcademicsDbContext>();
        return await db.StudyUnits.Where(u => u.Id == unitId).Select(u => u.OwnerUserId!.Value).SingleAsync(Ct);
    }
}
