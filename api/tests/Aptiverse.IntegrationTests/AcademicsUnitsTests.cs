using System.Net;
using System.Net.Http.Json;
using Aptiverse.Academics.Contracts;
using Aptiverse.Academics.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using static Aptiverse.IntegrationTests.AcademicsTestSupport;

namespace Aptiverse.IntegrationTests;

[Collection(ApiTestGroup.Name)]
public sealed class AcademicsUnitsTests(ApiFactory factory)
{
    private readonly AcademicsTestSupport _support = new(factory);

    private void SkipWithoutDocker() => Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);

    [Fact]
    public async Task Student_routes_without_auth_are_401()
    {
        SkipWithoutDocker();
        var client = factory.CreateClient();
        var id = Guid.CreateVersion7();

        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/academics/units", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync($"/academics/units/{id}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PatchAsJsonAsync($"/academics/units/{id}", new { }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.DeleteAsync($"/academics/units/{id}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync($"/academics/units/{id}/topics", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/academics/units/caps", new { subjects = new[] { new { subjectId = id } } }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/academics/units/courses", new { name = "Calculus" }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/academics/courses?q=calc", Ct)).StatusCode);
    }

    [Fact]
    public async Task Parents_are_403_on_every_student_route()
    {
        SkipWithoutDocker();
        var parent = factory.CreateUserClient(Guid.CreateVersion7(), role: "parent");
        var id = Guid.CreateVersion7();

        Assert.Equal(HttpStatusCode.Forbidden, (await parent.GetAsync("/academics/units", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await parent.GetAsync($"/academics/units/{id}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await parent.PatchAsJsonAsync($"/academics/units/{id}", new { }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await parent.DeleteAsync($"/academics/units/{id}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await parent.GetAsync($"/academics/units/{id}/topics", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await parent.PostAsJsonAsync("/academics/units/caps", new { subjects = new[] { new { subjectId = id } } }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await parent.PostAsJsonAsync("/academics/units/courses", new { name = "Calculus" }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await parent.GetAsync("/academics/courses?q=calc", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await parent.GetAsync("/academics/assessments", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await parent.PostAsJsonAsync("/academics/assessments", new { enrolmentId = id }, Ct)).StatusCode);
    }

    [Fact]
    public async Task Catalog_is_public_cached_and_filtered_by_curriculum_and_grade()
    {
        SkipWithoutDocker();
        var anonymous = factory.CreateClient();

        var response = await anonymous.GetAsync("/academics/catalog?curriculum=nsc&grade=11", Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("public, max-age=3600", response.Headers.CacheControl?.ToString());
        using var json = await ReadJsonAsync(response);
        var subjects = json.RootElement.GetProperty("subjects").EnumerateArray().ToList();
        var slugs = subjects.Select(s => s.GetProperty("slug").GetString()).ToList();
        Assert.Contains("math", slugs);
        Assert.Contains("physci", slugs);
        Assert.DoesNotContain("ns", slugs);
        Assert.DoesNotContain("ap_math", slugs);
        Assert.True(subjects[0].GetProperty("isCompulsory").GetBoolean());
        Assert.Equal("lo", subjects[0].GetProperty("slug").GetString());

        using var senior = await ReadJsonAsync(await anonymous.GetAsync("/academics/catalog?curriculum=nsc&grade=8", Ct));
        var seniorSlugs = senior.RootElement.GetProperty("subjects").EnumerateArray().Select(s => s.GetProperty("slug").GetString()).ToList();
        Assert.Contains("ns", seniorSlugs);
        Assert.DoesNotContain("physci", seniorSlugs);

        using var ieb = await ReadJsonAsync(await anonymous.GetAsync("/academics/catalog?curriculum=ieb&grade=12&category=mathematics", Ct));
        var iebSlugs = ieb.RootElement.GetProperty("subjects").EnumerateArray().Select(s => s.GetProperty("slug").GetString()).ToList();
        Assert.Equal(["ap_math", "math", "math_lit"], iebSlugs.Order());
    }

    [Theory]
    [InlineData("/academics/catalog?curriculum=nsc&grade=13")]
    [InlineData("/academics/catalog?curriculum=nsc&grade=7")]
    [InlineData("/academics/catalog?curriculum=cambridge&grade=11")]
    [InlineData("/academics/catalog?grade=11")]
    [InlineData("/academics/catalog?curriculum=nsc")]
    [InlineData("/academics/catalog?curriculum=nsc&grade=11&category=sport")]
    [InlineData("/academics/institutions?q=u")]
    [InlineData("/academics/institutions?limit=51")]
    [InlineData("/academics/institutions?type=college")]
    [InlineData("/academics/institutions?province=national")]
    public async Task Invalid_reference_queries_are_400(string url)
    {
        SkipWithoutDocker();
        Assert.Equal(HttpStatusCode.BadRequest, (await factory.CreateClient().GetAsync(url, Ct)).StatusCode);
    }

    [Fact]
    public async Task Institutions_search_by_short_name_and_filter_by_type()
    {
        SkipWithoutDocker();
        var anonymous = factory.CreateClient();

        using var uct = await ReadJsonAsync(await anonymous.GetAsync("/academics/institutions?q=UCT", Ct));
        Assert.Equal("uct", uct.RootElement[0].GetProperty("slug").GetString());

        using var all = await ReadJsonAsync(await anonymous.GetAsync("/academics/institutions?limit=50", Ct));
        Assert.Equal(26, all.RootElement.GetArrayLength());

        using var comprehensive = await ReadJsonAsync(await anonymous.GetAsync("/academics/institutions?type=comprehensive_university&limit=50", Ct));
        var types = comprehensive.RootElement.EnumerateArray().Select(i => i.GetProperty("type").GetString()).Distinct().ToList();
        Assert.Equal(["comprehensive_university"], types);
        Assert.Equal(6, comprehensive.RootElement.GetArrayLength());
    }

    [Fact]
    public async Task High_school_student_enrols_in_caps_subjects_and_re_enrolling_is_unchanged()
    {
        SkipWithoutDocker();
        var (userId, client) = await _support.HighSchoolAsync();
        var math = await _support.SubjectIdAsync("math");
        var physics = await _support.SubjectIdAsync("physci");
        var body = new { subjects = new object[] { new { subjectId = math, teacherName = "Mr Dlamini" }, new { subjectId = physics } } };

        HttpResponseMessage? response = null;
        var session = await _support.TrackAsync(async () => response = await client.PostAsJsonAsync("/academics/units/caps", body, Ct));

        Assert.Equal(HttpStatusCode.Created, response!.StatusCode);
        using (var json = await ReadJsonAsync(response))
        {
            var enrolments = json.RootElement.GetProperty("enrolments").EnumerateArray().ToList();
            Assert.Equal(2, enrolments.Count);
            Assert.All(enrolments, e => Assert.False(e.GetProperty("alreadyEnrolled").GetBoolean()));
            var unit = enrolments[0].GetProperty("unit");
            Assert.Equal("Mathematics", unit.GetProperty("name").GetString());
            Assert.Equal("caps_subject", unit.GetProperty("kind").GetString());
            Assert.Equal("grade_11", unit.GetProperty("level").GetString());
            Assert.Equal("nsc", unit.GetProperty("curriculum").GetString());
            Assert.Equal("MATH", unit.GetProperty("code").GetString());
            Assert.Equal("Mr Dlamini", unit.GetProperty("teacherName").GetString());
            Assert.Equal(System.Text.Json.JsonValueKind.Null, unit.GetProperty("weighting").GetProperty("currentPercent").ValueKind);
        }

        var events = MessagesOf<StudyUnitEnrolled>(session);
        Assert.Equal(2, events.Count);
        Assert.All(events, e => Assert.Equal(userId, e.UserId));

        var replay = await client.PostAsJsonAsync("/academics/units/caps", body, Ct);
        Assert.Equal(HttpStatusCode.OK, replay.StatusCode);
        using (var json = await ReadJsonAsync(replay))
        {
            Assert.All(json.RootElement.GetProperty("enrolments").EnumerateArray(), e => Assert.True(e.GetProperty("alreadyEnrolled").GetBoolean()));
        }

        using var list = await ReadJsonAsync(await client.GetAsync("/academics/units", Ct));
        Assert.Equal(2, list.RootElement.GetArrayLength());
    }

    [Fact]
    public async Task Two_learners_in_the_same_grade_share_one_caps_unit()
    {
        SkipWithoutDocker();
        var (_, first) = await _support.HighSchoolAsync(grade: 10);
        var (_, second) = await _support.HighSchoolAsync(grade: 10);
        var geo = await _support.SubjectIdAsync("geo", grade: 10);

        var a = await first.PostAsJsonAsync("/academics/units/caps", new { subjects = new[] { new { subjectId = geo } } }, Ct);
        var b = await second.PostAsJsonAsync("/academics/units/caps", new { subjects = new[] { new { subjectId = geo } } }, Ct);

        using var ja = await ReadJsonAsync(a);
        using var jb = await ReadJsonAsync(b);
        var unitA = ja.RootElement.GetProperty("enrolments")[0].GetProperty("unit");
        var unitB = jb.RootElement.GetProperty("enrolments")[0].GetProperty("unit");
        Assert.Equal(unitA.GetProperty("unitId").GetGuid(), unitB.GetProperty("unitId").GetGuid());
        Assert.NotEqual(unitA.GetProperty("enrolmentId").GetGuid(), unitB.GetProperty("enrolmentId").GetGuid());
    }

    [Fact]
    public async Task Caps_enrolment_rejects_bad_requests_and_the_wrong_stage()
    {
        SkipWithoutDocker();
        var (_, learner) = await _support.HighSchoolAsync();
        var math = await _support.SubjectIdAsync("math");

        Assert.Equal(HttpStatusCode.BadRequest, (await learner.PostAsJsonAsync("/academics/units/caps", new { subjects = Array.Empty<object>() }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await learner.PostAsJsonAsync("/academics/units/caps", new { subjects = new[] { new { subjectId = math }, new { subjectId = math } } }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await learner.PostAsJsonAsync("/academics/units/caps", new { subjects = Enumerable.Range(0, 13).Select(_ => new { subjectId = Guid.NewGuid() }) }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await learner.PostAsJsonAsync("/academics/units/caps", new { subjects = new[] { new { subjectId = math, teacherName = new string('t', 121) } } }, Ct)).StatusCode);

        // Natural Sciences is a Grade 8 and 9 subject; the grade comes from the profile, not the request.
        var seniorOnly = await _support.SubjectIdAsync("ns", grade: 8);
        var wrongGrade = await learner.PostAsJsonAsync("/academics/units/caps", new { subjects = new[] { new { subjectId = seniorOnly } } }, Ct);
        Assert.Equal(HttpStatusCode.NotFound, wrongGrade.StatusCode);
        Assert.Equal("academics.subject_not_found", await ProblemCodeAsync(wrongGrade));

        var (_, tertiary) = await _support.TertiaryAsync();
        var mismatch = await tertiary.PostAsJsonAsync("/academics/units/caps", new { subjects = new[] { new { subjectId = math } } }, Ct);
        Assert.Equal(HttpStatusCode.Forbidden, mismatch.StatusCode);
        Assert.Equal("academics.stage_mismatch", await ProblemCodeAsync(mismatch));

        var noProfile = factory.CreateUserClient(Guid.CreateVersion7());
        Assert.Equal(HttpStatusCode.Forbidden, (await noProfile.PostAsJsonAsync("/academics/units/caps", new { subjects = new[] { new { subjectId = math } } }, Ct)).StatusCode);
    }

    [Fact]
    public async Task Active_unit_cap_is_enforced()
    {
        SkipWithoutDocker();
        var (_, learner) = await _support.HighSchoolAsync();
        string[] first = ["eng_hl", "afr_fal", "math", "physci", "lifesci", "acc", "bus", "eco", "geo", "hist", "lo", "cat"];
        string[] more = ["it", "egd", "visual_arts", "drama"];

        await _support.EnrolCapsAsync(learner, first);
        var subjects = new List<object>();
        foreach (var slug in more)
        {
            subjects.Add(new { subjectId = await _support.SubjectIdAsync(slug) });
        }

        var response = await learner.PostAsJsonAsync("/academics/units/caps", new { subjects }, Ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal("academics.too_many_units", await ProblemCodeAsync(response));
    }

    [Fact]
    public async Task Students_at_one_institution_share_a_course_and_a_private_course_stays_private()
    {
        SkipWithoutDocker();
        var (_, first) = await _support.TertiaryAsync();
        var (_, second) = await _support.TertiaryAsync("uct");
        var (_, elsewhere) = await _support.TertiaryAsync("Some College Not In The Catalog");
        var code = $"MAM{Random.Shared.Next(1000, 9999)}W";

        HttpResponseMessage? created = null;
        var session = await _support.TrackAsync(async () =>
            created = await first.PostAsJsonAsync("/academics/units/courses", new { name = "Calculus I", courseCode = code, level = "first_year", duration = "semester" }, Ct));
        Assert.Equal(HttpStatusCode.Created, created!.StatusCode);
        using var a = await ReadJsonAsync(created);
        var unitId = a.RootElement.GetProperty("unitId").GetGuid();
        Assert.True(a.RootElement.GetProperty("isShared").GetBoolean());
        Assert.Equal("University of Cape Town", a.RootElement.GetProperty("institutionName").GetString());
        Assert.Equal("semester", a.RootElement.GetProperty("duration").GetString());
        Assert.Single(MessagesOf<StudyUnitEnrolled>(session), e => e.StudyUnitId == unitId);

        // Same code, different spelling: the same course.
        var joined = await CreateCourseAsync(second, "calculus 1", code.ToLowerInvariant().Insert(3, " "));
        Assert.Equal(unitId, joined.GetProperty("unitId").GetGuid());
        Assert.Equal("Calculus I", joined.GetProperty("name").GetString());

        var again = await first.PostAsJsonAsync("/academics/units/courses", new { name = "Calculus I", courseCode = code, level = "first_year" }, Ct);
        Assert.Equal(HttpStatusCode.Conflict, again.StatusCode);
        Assert.Equal("academics.already_enrolled", await ProblemCodeAsync(again));

        var own = await CreateCourseAsync(elsewhere, "Calculus I", code);
        Assert.NotEqual(unitId, own.GetProperty("unitId").GetGuid());
        Assert.False(own.GetProperty("isShared").GetBoolean());
        Assert.Equal(System.Text.Json.JsonValueKind.Null, own.GetProperty("institutionName").ValueKind);

        // The level defaults to the profile's year of study.
        var defaulted = await CreateCourseAsync(elsewhere, "Statistics", level: null);
        Assert.Equal("first_year", defaulted.GetProperty("level").GetString());
    }

    [Fact]
    public async Task Course_creation_rejects_bad_requests_and_high_school_students()
    {
        SkipWithoutDocker();
        var (_, student) = await _support.TertiaryAsync();

        Assert.Equal(HttpStatusCode.BadRequest, (await student.PostAsJsonAsync("/academics/units/courses", new { name = "C" }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await student.PostAsJsonAsync("/academics/units/courses", new { name = new string('c', 161) }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await student.PostAsJsonAsync("/academics/units/courses", new { name = "Calculus", courseCode = "MAM$100" }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await student.PostAsJsonAsync("/academics/units/courses", new { name = "Calculus", level = "nqf_7" }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await student.PostAsJsonAsync("/academics/units/courses", new { name = "Calculus", duration = "quarter" }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await student.PostAsJsonAsync("/academics/units/courses", new { name = "Calculus", startedOn = "2010-01-01" }, Ct)).StatusCode);

        var (_, learner) = await _support.HighSchoolAsync();
        var refused = await learner.PostAsJsonAsync("/academics/units/courses", new { name = "Calculus", level = "first_year" }, Ct);
        Assert.Equal(HttpStatusCode.Forbidden, refused.StatusCode);
        Assert.Equal("academics.stage_mismatch", await ProblemCodeAsync(refused));
    }

    [Fact]
    public async Task Course_search_is_scoped_to_the_callers_institution_and_hides_small_counts()
    {
        SkipWithoutDocker();
        var (_, creator) = await _support.TertiaryAsync();
        var (_, classmate) = await _support.TertiaryAsync();
        var (_, wits) = await _support.TertiaryAsync("University of the Witwatersrand");
        var name = $"Quantum Basket Weaving {Guid.NewGuid():N}"[..40];
        await CreateCourseAsync(creator, name, level: "second_year");

        using var found = await ReadJsonAsync(await classmate.GetAsync($"/academics/courses?q={Uri.EscapeDataString("basket weaving")}&limit=25", Ct));
        var option = found.RootElement.EnumerateArray().Single(o => o.GetProperty("name").GetString() == name);
        Assert.Equal("second_year", option.GetProperty("level").GetString());
        Assert.Equal(System.Text.Json.JsonValueKind.Null, option.GetProperty("enrolledCount").ValueKind);

        using var other = await ReadJsonAsync(await wits.GetAsync($"/academics/courses?q={Uri.EscapeDataString("basket weaving")}", Ct));
        Assert.DoesNotContain(other.RootElement.EnumerateArray(), o => o.GetProperty("name").GetString() == name);

        var (_, learner) = await _support.HighSchoolAsync();
        using var none = await ReadJsonAsync(await learner.GetAsync("/academics/courses?q=basket", Ct));
        Assert.Equal(0, none.RootElement.GetArrayLength());

        Assert.Equal(HttpStatusCode.BadRequest, (await classmate.GetAsync("/academics/courses?q=b", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await classmate.GetAsync("/academics/courses?q=basket&limit=26", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await classmate.GetAsync("/academics/courses", Ct)).StatusCode);
    }

    [Fact]
    public async Task Another_users_unit_is_404_for_read_change_and_delete()
    {
        SkipWithoutDocker();
        var (_, owner) = await _support.HighSchoolAsync();
        var (_, stranger) = await _support.HighSchoolAsync();
        var enrolmentId = (await _support.EnrolCapsAsync(owner, "hist"))[0];

        var own = await owner.GetAsync($"/academics/units/{enrolmentId}", Ct);
        Assert.Equal(HttpStatusCode.OK, own.StatusCode);
        Assert.NotNull(own.Headers.ETag);

        var peek = await stranger.GetAsync($"/academics/units/{enrolmentId}", Ct);
        Assert.Equal(HttpStatusCode.NotFound, peek.StatusCode);
        Assert.Equal("academics.unit_not_found", await ProblemCodeAsync(peek));
        Assert.Equal(HttpStatusCode.NotFound, (await stranger.PatchAsJsonAsync($"/academics/units/{enrolmentId}", new { completed = true }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await stranger.DeleteAsync($"/academics/units/{enrolmentId}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await stranger.GetAsync($"/academics/units/{enrolmentId}/topics", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await owner.GetAsync($"/academics/units/{Guid.CreateVersion7()}", Ct)).StatusCode);

        using var strangerList = await ReadJsonAsync(await stranger.GetAsync("/academics/units", Ct));
        Assert.Equal(0, strangerList.RootElement.GetArrayLength());

        // Still the owner's, untouched.
        using var detail = await ReadJsonAsync(await owner.GetAsync($"/academics/units/{enrolmentId}", Ct));
        Assert.Equal("active", detail.RootElement.GetProperty("unit").GetProperty("status").GetString());
    }

    [Fact]
    public async Task Patching_a_unit_completes_reopens_and_honours_if_match()
    {
        SkipWithoutDocker();
        var (_, learner) = await _support.HighSchoolAsync();
        var enrolmentId = (await _support.EnrolCapsAsync(learner, "tourism"))[0];
        var url = $"/academics/units/{enrolmentId}";

        var completed = await learner.PatchAsJsonAsync(url, new { completed = true, colourToken = "sky", displayOrder = 3 }, Ct);
        Assert.Equal(HttpStatusCode.OK, completed.StatusCode);
        var staleTag = completed.Headers.ETag!.ToString();
        using (var json = await ReadJsonAsync(completed))
        {
            Assert.Equal("completed", json.RootElement.GetProperty("status").GetString());
            Assert.True(json.RootElement.GetProperty("isFinished").GetBoolean());
            Assert.Equal("sky", json.RootElement.GetProperty("colourToken").GetString());
            Assert.Equal(3, json.RootElement.GetProperty("displayOrder").GetInt32());
        }

        using (var active = await ReadJsonAsync(await learner.GetAsync("/academics/units", Ct)))
        {
            Assert.Equal(0, active.RootElement.GetArrayLength());
        }

        using var reopenRequest = new HttpRequestMessage(HttpMethod.Patch, url) { Content = JsonContent.Create(new { completed = false }) };
        reopenRequest.Headers.TryAddWithoutValidation("If-Match", staleTag);
        var reopened = await learner.SendAsync(reopenRequest, Ct);
        Assert.Equal(HttpStatusCode.OK, reopened.StatusCode);
        using (var json = await ReadJsonAsync(reopened))
        {
            Assert.Equal("active", json.RootElement.GetProperty("status").GetString());
        }

        using var staleRequest = new HttpRequestMessage(HttpMethod.Patch, url) { Content = JsonContent.Create(new { teacherName = "Ms Naidoo" }) };
        staleRequest.Headers.TryAddWithoutValidation("If-Match", staleTag);
        var stale = await learner.SendAsync(staleRequest, Ct);
        Assert.Equal(HttpStatusCode.Conflict, stale.StatusCode);
        Assert.Equal("academics.concurrency_conflict", await ProblemCodeAsync(stale));

        var duration = await learner.PatchAsJsonAsync(url, new { duration = "semester" }, Ct);
        Assert.Equal(HttpStatusCode.BadRequest, duration.StatusCode);
        Assert.Equal("academics.duration_not_allowed", await ProblemCodeAsync(duration));
        Assert.Equal(HttpStatusCode.BadRequest, (await learner.PatchAsJsonAsync(url, new { colourToken = "neon" }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await learner.PatchAsJsonAsync(url, new { displayOrder = 100 }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await learner.PatchAsJsonAsync(url, new { teacherName = new string('t', 121) }, Ct)).StatusCode);
    }

    [Fact]
    public async Task Unenrolling_with_marks_needs_confirmation_and_publishes_events()
    {
        SkipWithoutDocker();
        var (userId, learner) = await _support.HighSchoolAsync();
        var enrolmentId = (await _support.EnrolCapsAsync(learner, "religion"))[0];
        var graded = await CreateAssessmentAsync(learner, enrolmentId, "Graded test");
        var gradedId = graded.GetProperty("id").GetGuid();
        Assert.Equal(HttpStatusCode.OK, (await learner.PostAsJsonAsync($"/academics/assessments/{gradedId}/mark", new { percent = 70 }, Ct)).StatusCode);
        await CreateAssessmentAsync(learner, enrolmentId, "Upcoming test");

        var refused = await learner.DeleteAsync($"/academics/units/{enrolmentId}", Ct);
        Assert.Equal(HttpStatusCode.Conflict, refused.StatusCode);
        Assert.Equal("academics.unit_has_marks", await ProblemCodeAsync(refused));

        HttpResponseMessage? deleted = null;
        var session = await _support.TrackAsync(async () => deleted = await learner.DeleteAsync($"/academics/units/{enrolmentId}?confirm=true", Ct));

        Assert.Equal(HttpStatusCode.NoContent, deleted!.StatusCode);
        var unenrolled = Assert.Single(MessagesOf<StudyUnitUnenrolled>(session));
        Assert.Equal(userId, unenrolled.UserId);
        var removed = MessagesOf<AssessmentDeleted>(session);
        Assert.Equal(2, removed.Count);
        Assert.Single(removed, r => r.WasGraded && r.AssessmentId == gradedId);

        Assert.Equal(HttpStatusCode.NoContent, (await learner.DeleteAsync($"/academics/units/{enrolmentId}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await learner.GetAsync($"/academics/units/{enrolmentId}", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await learner.GetAsync($"/academics/assessments/{gradedId}", Ct)).StatusCode);
    }

    [Fact]
    public async Task Topics_are_shared_by_a_course_resolve_merges_and_are_404_when_not_enrolled()
    {
        SkipWithoutDocker();
        var (_, first) = await _support.TertiaryAsync();
        var (_, second) = await _support.TertiaryAsync();
        var (_, stranger) = await _support.TertiaryAsync();
        var name = $"Organic Chemistry {Guid.NewGuid():N}"[..36];
        var created = await CreateCourseAsync(first, name);
        var unitId = created.GetProperty("unitId").GetGuid();
        var joined = await CreateCourseAsync(second, name);

        IReadOnlyList<TopicRef> refs;
        await using (var scope = factory.Services.CreateAsyncScope())
        {
            var registry = scope.ServiceProvider.GetRequiredService<ITopicRegistry>();
            refs = await registry.UpsertAsync(unitId, ["Alkenes", "Trig", "Trigonometry", "Stereo chemistry"], "generation", Ct);
        }

        Assert.Equal(4, refs.Count);
        await using (var scope = factory.Services.CreateAsyncScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AcademicsDbContext>();
            var trig = refs.Single(r => r.Name == "Trig").TopicId;
            var target = refs.Single(r => r.Name == "Trigonometry").TopicId;
            await db.Topics.Where(t => t.Id == trig).ExecuteUpdateAsync(s => s.SetProperty(t => t.MergedIntoTopicId, target), Ct);
        }

        using var topics = await ReadJsonAsync(await second.GetAsync($"/academics/units/{joined.GetProperty("enrolmentId").GetGuid()}/topics", Ct));
        var names = topics.RootElement.EnumerateArray().Select(t => t.GetProperty("name").GetString()).ToList();
        Assert.Equal(["Alkenes", "Stereo chemistry", "Trigonometry"], names);

        using var filtered = await ReadJsonAsync(await second.GetAsync($"/academics/units/{joined.GetProperty("enrolmentId").GetGuid()}/topics?q=alk", Ct));
        Assert.Equal(["Alkenes"], filtered.RootElement.EnumerateArray().Select(t => t.GetProperty("name").GetString()));

        using var summary = await ReadJsonAsync(await first.GetAsync($"/academics/units/{created.GetProperty("enrolmentId").GetGuid()}", Ct));
        Assert.Equal(3, summary.RootElement.GetProperty("unit").GetProperty("topicCount").GetInt32());

        Assert.Equal(HttpStatusCode.NotFound, (await stranger.GetAsync($"/academics/units/{created.GetProperty("enrolmentId").GetGuid()}/topics", Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await first.GetAsync($"/academics/units/{created.GetProperty("enrolmentId").GetGuid()}/topics?limit=201", Ct)).StatusCode);
    }

    [Fact]
    public async Task Topic_registry_dedupes_by_slug_and_keeps_the_first_spelling()
    {
        SkipWithoutDocker();
        var (_, student) = await _support.TertiaryAsync("Not A Catalog Place");
        var unitId = (await CreateCourseAsync(student, $"Linear Algebra {Guid.NewGuid():N}"[..30])).GetProperty("unitId").GetGuid();

        await using var scope = factory.Services.CreateAsyncScope();
        var registry = scope.ServiceProvider.GetRequiredService<ITopicRegistry>();

        IReadOnlyList<TopicRef> first = [];
        var session = await _support.TrackAsync(async () => first = await registry.UpsertAsync(unitId, ["Eigen Values", "x"], "generation", Ct));
        var registered = Assert.Single(MessagesOf<TopicRegistered>(session));
        Assert.Equal("Eigen Values", registered.Name);

        var second = await registry.UpsertAsync(unitId, ["eigen  values!", "The Eigen Values"], "student", Ct);
        Assert.Equal(first.Single().TopicId, Assert.Single(second).TopicId);
        Assert.Equal("Eigen Values", second.Single().Name);
        Assert.Equal("eigen-values", second.Single().Slug);

        await Assert.ThrowsAsync<ArgumentException>(() => registry.UpsertAsync(unitId, Enumerable.Range(0, 21).Select(i => $"Topic {i}").ToList(), "generation", Ct));
        await Assert.ThrowsAsync<ArgumentException>(() => registry.UpsertAsync(unitId, ["Matrices"], "hacker", Ct));
        Assert.Empty(await registry.UpsertAsync(Guid.CreateVersion7(), ["Matrices"], "generation", Ct));
    }

    [Fact]
    public async Task Study_unit_lookup_returns_active_units_with_level_topics_and_open_assessments()
    {
        SkipWithoutDocker();
        var (userId, learner) = await _support.HighSchoolAsync(grade: 12, curriculum: "ieb");
        var subjects = new[] { new { subjectId = await _support.SubjectIdAsync("ap_math", grade: 12, curriculum: "ieb") } };
        var response = await learner.PostAsJsonAsync("/academics/units/caps", new { subjects }, Ct);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        using var json = await ReadJsonAsync(response);
        var unit = json.RootElement.GetProperty("enrolments")[0].GetProperty("unit");
        var enrolmentId = unit.GetProperty("enrolmentId").GetGuid();
        var unitId = unit.GetProperty("unitId").GetGuid();
        var open = await CreateAssessmentAsync(learner, enrolmentId, "Calculus test");
        var done = await CreateAssessmentAsync(learner, enrolmentId, "Done test");
        await learner.PostAsJsonAsync($"/academics/assessments/{done.GetProperty("id").GetGuid()}/transition", new { action = "submit" }, Ct);

        await using var scope = factory.Services.CreateAsyncScope();
        var lookup = scope.ServiceProvider.GetRequiredService<IStudyUnitLookup>();
        var assessments = scope.ServiceProvider.GetRequiredService<IAssessmentLookup>();

        var context = Assert.Single(await lookup.GetForUserAsync(userId, Ct));
        Assert.Equal(unitId, context.StudyUnitId);
        Assert.Equal("caps_subject", context.Kind);
        Assert.Equal("high_school", context.Stage);
        Assert.Equal("grade_12", context.Level);
        Assert.Equal("ieb", context.Curriculum);
        Assert.Equal("Advanced Programme Mathematics", context.Name);
        Assert.Equal(open.GetProperty("id").GetGuid(), Assert.Single(context.OpenAssessments).AssessmentId);

        Assert.NotNull(await lookup.GetAsync(unitId, userId, Ct));
        Assert.Null(await lookup.GetAsync(unitId, Guid.CreateVersion7(), Ct));

        var openList = await assessments.GetOpenForUserAsync(userId, Ct);
        Assert.Equal("Calculus test", Assert.Single(openList).Title);
        Assert.NotNull(await assessments.GetForUserAsync(userId, open.GetProperty("id").GetGuid(), Ct));
        Assert.Null(await assessments.GetForUserAsync(Guid.CreateVersion7(), open.GetProperty("id").GetGuid(), Ct));
    }
}
