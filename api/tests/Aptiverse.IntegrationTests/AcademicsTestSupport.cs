using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Wolverine.Tracking;

namespace Aptiverse.IntegrationTests;

/// <summary>Seeds students through Identity and wraps the academics routes the tests call repeatedly.</summary>
internal sealed class AcademicsTestSupport(ApiFactory factory)
{
    public static CancellationToken Ct => TestContext.Current.CancellationToken;

    public static DateTimeOffset Now => TimeProvider.System.GetUtcNow();

    public async Task<Guid> SeedHighSchoolStudentAsync(int grade = 11, string curriculum = "nsc")
    {
        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();
        var email = $"learner-{Guid.NewGuid():N}@example.test";
        var user = User.Create(email, email.ToUpperInvariant(), "Lerato Learner", emailConfirmed: true);
        user.CompleteOnboarding(EducationLevels.HighSchool, grade, null, curriculum, null, Now);
        db.Users.Add(user);
        await db.SaveChangesAsync(Ct);
        return user.Id;
    }

    public async Task<Guid> SeedTertiaryStudentAsync(string? institutionName = "University of Cape Town", int? yearOfStudy = 1)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();
        var email = $"student-{Guid.NewGuid():N}@example.test";
        var user = User.Create(email, email.ToUpperInvariant(), "Sipho Student", emailConfirmed: true);
        user.CompleteOnboarding(EducationLevels.Tertiary, null, yearOfStudy, null, institutionName, Now);
        db.Users.Add(user);
        await db.SaveChangesAsync(Ct);
        return user.Id;
    }

    public async Task<(Guid UserId, HttpClient Client)> HighSchoolAsync(int grade = 11, string curriculum = "nsc")
    {
        var id = await SeedHighSchoolStudentAsync(grade, curriculum);
        return (id, factory.CreateUserClient(id));
    }

    public async Task<(Guid UserId, HttpClient Client)> TertiaryAsync(string? institutionName = "University of Cape Town")
    {
        var id = await SeedTertiaryStudentAsync(institutionName);
        return (id, factory.CreateUserClient(id));
    }

    public async Task<Guid> SubjectIdAsync(string slug, int grade = 11, string curriculum = "nsc")
    {
        using var json = await ReadJsonAsync(await factory.CreateClient().GetAsync($"/academics/catalog?curriculum={curriculum}&grade={grade}", Ct));
        return json.RootElement.GetProperty("subjects").EnumerateArray()
            .Single(s => s.GetProperty("slug").GetString() == slug)
            .GetProperty("id").GetGuid();
    }

    /// <summary>Enrols in the given subjects and returns the enrolment ids in the same order.</summary>
    public async Task<List<Guid>> EnrolCapsAsync(HttpClient client, params string[] slugs)
    {
        var subjects = new List<object>();
        foreach (var slug in slugs)
        {
            subjects.Add(new { subjectId = await SubjectIdAsync(slug) });
        }

        var response = await client.PostAsJsonAsync("/academics/units/caps", new { subjects }, Ct);
        Assert.True(response.StatusCode is HttpStatusCode.Created or HttpStatusCode.OK, await response.Content.ReadAsStringAsync(Ct));
        using var json = await ReadJsonAsync(response);
        return json.RootElement.GetProperty("enrolments").EnumerateArray()
            .Select(e => e.GetProperty("unit").GetProperty("enrolmentId").GetGuid())
            .ToList();
    }

    public static async Task<JsonElement> CreateCourseAsync(HttpClient client, string name, string? courseCode = null, string? level = "first_year")
    {
        var response = await client.PostAsJsonAsync("/academics/units/courses", new { name, courseCode, level }, Ct);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        using var json = await ReadJsonAsync(response);
        return json.RootElement.Clone();
    }

    public static async Task<JsonElement> CreateAssessmentAsync(
        HttpClient client,
        Guid enrolmentId,
        string title = "Term test",
        decimal? weightPercent = null,
        DateTimeOffset? dueAt = null)
    {
        var response = await client.PostAsJsonAsync(
            "/academics/assessments",
            new { enrolmentId, title, type = "test", weightPercent, dueAt = dueAt ?? Now.AddDays(7) },
            Ct);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        using var json = await ReadJsonAsync(response);
        return json.RootElement.Clone();
    }

    public async Task<ITrackedSession> TrackAsync(Func<Task> action) =>
        await factory.AppHost.ExecuteAndWaitAsync(action, timeoutInMilliseconds: 30_000);

    public static List<T> MessagesOf<T>(ITrackedSession session) =>
        session.AllRecordsInOrder()
            .Select(r => r.Envelope?.Message)
            .OfType<T>()
            .DistinctBy(m => m)
            .ToList();

    public static async Task<JsonDocument> ReadJsonAsync(HttpResponseMessage response) =>
        JsonDocument.Parse(await response.Content.ReadAsStringAsync(Ct));

    public static async Task<string> ProblemCodeAsync(HttpResponseMessage response)
    {
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        using var json = await ReadJsonAsync(response);
        return json.RootElement.GetProperty("code").GetString()!;
    }
}
