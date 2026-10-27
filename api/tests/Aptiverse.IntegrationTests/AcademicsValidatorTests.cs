using Aptiverse.Academics.Features.CreateAssessment;
using Aptiverse.Academics.Features.CreateTertiaryCourse;
using Aptiverse.Academics.Features.EnrolInCapsSubjects;
using Aptiverse.Academics.Features.GetCatalog;
using Aptiverse.Academics.Features.ListMyAssessments;
using Aptiverse.Academics.Features.ListMyUnits;
using Aptiverse.Academics.Features.ListUnitTopics;
using Aptiverse.Academics.Features.RecordAssessmentMark;
using Aptiverse.Academics.Features.SearchCourses;
using Aptiverse.Academics.Features.SearchInstitutions;
using Aptiverse.Academics.Features.TransitionAssessment;
using Aptiverse.Academics.Features.UpdateMyAssessment;
using Aptiverse.Academics.Features.UpdateMyUnit;
using Aptiverse.SharedKernel.Time;

namespace Aptiverse.IntegrationTests;

public sealed class AcademicsValidatorTests
{
    private static readonly FixedClock Clock = new(new DateTimeOffset(2026, 10, 27, 10, 0, 0, TimeSpan.Zero));

    [Theory]
    [InlineData("nsc", 8, null, true)]
    [InlineData("ieb", 12, "language", true)]
    [InlineData("nsc", 7, null, false)]
    [InlineData("nsc", 13, null, false)]
    [InlineData("NSC", 10, null, false)]
    [InlineData(null, 10, null, false)]
    [InlineData("nsc", null, null, false)]
    [InlineData("nsc", 10, "sport", false)]
    public void Catalog_request(string? curriculum, int? grade, string? category, bool valid)
    {
        Assert.Equal(valid, new GetCatalogValidator().Validate(new GetCatalogRequest(curriculum, grade, category)).IsValid);
    }

    [Theory]
    [InlineData(null, null, null, 20, true)]
    [InlineData("uct", "university", "western_cape", 50, true)]
    [InlineData("u", null, null, 20, false)]
    [InlineData(null, "school", null, 20, false)]
    [InlineData(null, null, "Gauteng", 20, false)]
    [InlineData(null, null, null, 0, false)]
    [InlineData(null, null, null, 51, false)]
    public void Institution_search(string? q, string? type, string? province, int limit, bool valid)
    {
        Assert.Equal(valid, new SearchInstitutionsValidator().Validate(new SearchInstitutionsRequest(q, type, province, limit)).IsValid);
    }

    [Theory]
    [InlineData("calc", null, 10, true)]
    [InlineData("calc", "honours", 25, true)]
    [InlineData(null, null, 10, false)]
    [InlineData("c", null, 10, false)]
    [InlineData("calc", "nqf_7", 10, false)]
    [InlineData("calc", null, 26, false)]
    public void Course_search(string? q, string? level, int limit, bool valid)
    {
        Assert.Equal(valid, new SearchCoursesValidator().Validate(new SearchCoursesRequest(q, level, limit)).IsValid);
    }

    [Fact]
    public void Caps_enrolment()
    {
        var validator = new EnrolInCapsSubjectsValidator();
        var one = Guid.NewGuid();

        Assert.True(validator.Validate(new EnrolInCapsSubjectsRequest([new(one, "Mr Dlamini")])).IsValid);
        Assert.False(validator.Validate(new EnrolInCapsSubjectsRequest(null)).IsValid);
        Assert.False(validator.Validate(new EnrolInCapsSubjectsRequest([])).IsValid);
        Assert.False(validator.Validate(new EnrolInCapsSubjectsRequest([new(one, null), new(one, null)])).IsValid);
        Assert.False(validator.Validate(new EnrolInCapsSubjectsRequest([new(Guid.Empty, null)])).IsValid);
        Assert.False(validator.Validate(new EnrolInCapsSubjectsRequest([new(one, new string('t', 121))])).IsValid);
        Assert.False(validator.Validate(new EnrolInCapsSubjectsRequest(Enumerable.Range(0, 13).Select(_ => new CapsSubjectChoice(Guid.NewGuid(), null)).ToList())).IsValid);
    }

    [Theory]
    [InlineData("Calculus I", "MAM1000W", "first_year", "semester", true)]
    [InlineData("Calculus I", "MAM 1000-W", null, null, true)]
    [InlineData("C", null, null, null, false)]
    [InlineData("   ", null, null, null, false)]
    [InlineData("Calculus", "M", null, null, false)]
    [InlineData("Calculus", "MAM_1000", null, null, false)]
    [InlineData("Calculus", "--", null, null, false)]
    [InlineData("Calculus", null, "year_one", null, false)]
    [InlineData("Calculus", null, null, "term", false)]
    public void Course_creation(string name, string? code, string? level, string? duration, bool valid)
    {
        var validator = new CreateTertiaryCourseValidator(Clock);
        Assert.Equal(valid, validator.Validate(new CreateTertiaryCourseRequest(name, code, level, duration, null, null)).IsValid);
    }

    [Fact]
    public void Course_start_dates_are_bounded()
    {
        var validator = new CreateTertiaryCourseValidator(Clock);
        Assert.True(validator.Validate(new CreateTertiaryCourseRequest("Calculus", null, null, null, new DateOnly(2021, 1, 1), null)).IsValid);
        Assert.False(validator.Validate(new CreateTertiaryCourseRequest("Calculus", null, null, null, new DateOnly(2020, 10, 1), null)).IsValid);
        Assert.False(validator.Validate(new CreateTertiaryCourseRequest("Calculus", null, null, null, new DateOnly(2027, 11, 1), null)).IsValid);
        Assert.False(validator.Validate(new CreateTertiaryCourseRequest("Calculus", null, null, null, null, new string('l', 121))).IsValid);
    }

    [Theory]
    [InlineData(null, true)]
    [InlineData("active", true)]
    [InlineData("all", true)]
    [InlineData("dropped", false)]
    public void Unit_list(string? status, bool valid)
    {
        Assert.Equal(valid, new ListMyUnitsValidator().Validate(new ListMyUnitsRequest(status)).IsValid);
    }

    [Fact]
    public void Unit_update()
    {
        var validator = new UpdateMyUnitValidator(Clock);
        Assert.True(validator.Validate(new UpdateMyUnitRequest("", "full_year", new DateOnly(2026, 2, 1), true, "mint", 99)).IsValid);
        Assert.True(validator.Validate(new UpdateMyUnitRequest(null, null, null, null, null, null)).IsValid);
        Assert.False(validator.Validate(new UpdateMyUnitRequest(null, null, null, null, null, 100)).IsValid);
        Assert.False(validator.Validate(new UpdateMyUnitRequest(null, null, null, null, null, -1)).IsValid);
        Assert.False(validator.Validate(new UpdateMyUnitRequest(null, null, null, null, "neon", null)).IsValid);
        Assert.False(validator.Validate(new UpdateMyUnitRequest(null, "quarter", null, null, null, null)).IsValid);
        Assert.False(validator.Validate(new UpdateMyUnitRequest(new string('t', 121), null, null, null, null, null)).IsValid);
        Assert.False(validator.Validate(new UpdateMyUnitRequest(null, null, new DateOnly(2000, 1, 1), null, null, null)).IsValid);
    }

    [Theory]
    [InlineData(null, 100, true)]
    [InlineData("a", 1, true)]
    [InlineData("", 100, false)]
    [InlineData(null, 0, false)]
    [InlineData(null, 201, false)]
    public void Topic_list(string? q, int limit, bool valid)
    {
        Assert.Equal(valid, new ListUnitTopicsValidator().Validate(new ListUnitTopicsRequest(q, limit)).IsValid);
    }

    [Fact]
    public void Assessment_creation()
    {
        var validator = new CreateAssessmentValidator(Clock);
        var enrolment = Guid.NewGuid();
        var due = Clock.UtcNow.AddDays(7);

        Assert.True(validator.Validate(new CreateAssessmentRequest(enrolment, "Term test", "test", 12.25m, 2, due, 70m, "Notes")).IsValid);
        Assert.True(validator.Validate(new CreateAssessmentRequest(enrolment, "Old exam", "exam", 0m, null, Clock.UtcNow.AddYears(-5).AddDays(1), 100m, null)).IsValid);

        Assert.False(validator.Validate(new CreateAssessmentRequest(Guid.Empty, "Term test", "test", null, null, due, null, null)).IsValid);
        Assert.False(validator.Validate(new CreateAssessmentRequest(enrolment, null, "test", null, null, due, null, null)).IsValid);
        Assert.False(validator.Validate(new CreateAssessmentRequest(enrolment, "T", "test", null, null, due, null, null)).IsValid);
        Assert.False(validator.Validate(new CreateAssessmentRequest(enrolment, "Term test", null, null, null, due, null, null)).IsValid);
        Assert.False(validator.Validate(new CreateAssessmentRequest(enrolment, "Term test", "TEST", null, null, due, null, null)).IsValid);
        Assert.False(validator.Validate(new CreateAssessmentRequest(enrolment, "Term test", "test", 100.01m, null, due, null, null)).IsValid);
        Assert.False(validator.Validate(new CreateAssessmentRequest(enrolment, "Term test", "test", 1.005m, null, due, null, null)).IsValid);
        Assert.False(validator.Validate(new CreateAssessmentRequest(enrolment, "Term test", "test", null, 0, due, null, null)).IsValid);
        Assert.False(validator.Validate(new CreateAssessmentRequest(enrolment, "Term test", "test", null, null, null, null, null)).IsValid);
        Assert.False(validator.Validate(new CreateAssessmentRequest(enrolment, "Term test", "test", null, null, Clock.UtcNow.AddYears(2).AddDays(1), null, null)).IsValid);
        Assert.False(validator.Validate(new CreateAssessmentRequest(enrolment, "Term test", "test", null, null, due, 100.5m, null)).IsValid);
        Assert.False(validator.Validate(new CreateAssessmentRequest(enrolment, "Term test", "test", null, null, due, null, new string('n', 2001))).IsValid);
    }

    [Fact]
    public void Assessment_update()
    {
        var validator = new UpdateMyAssessmentValidator(Clock);

        Assert.True(validator.Validate(new UpdateMyAssessmentRequest(null, null, null, null, null, null, null)).IsValid);
        Assert.True(validator.Validate(new UpdateMyAssessmentRequest("Renamed", "essay", null, null, null, null, "", ClearWeightPercent: true, ClearTerm: true)).IsValid);
        Assert.False(validator.Validate(new UpdateMyAssessmentRequest(null, null, 10m, null, null, null, null, ClearWeightPercent: true)).IsValid);
        Assert.False(validator.Validate(new UpdateMyAssessmentRequest(null, null, null, 2, null, null, null, ClearTerm: true)).IsValid);
        Assert.False(validator.Validate(new UpdateMyAssessmentRequest(null, null, null, null, null, 50m, null, ClearPredictedPercent: true)).IsValid);
        Assert.False(validator.Validate(new UpdateMyAssessmentRequest("x", null, null, null, null, null, null)).IsValid);
        Assert.False(validator.Validate(new UpdateMyAssessmentRequest(null, "quiz", null, null, null, null, null)).IsValid);
        Assert.False(validator.Validate(new UpdateMyAssessmentRequest(null, null, null, null, Clock.UtcNow.AddYears(-6), null, null)).IsValid);
    }

    [Theory]
    [InlineData(null, 20, 1, true)]
    [InlineData("due_desc", 100, 3, true)]
    [InlineData("title", 20, 1, false)]
    [InlineData(null, 101, 1, false)]
    [InlineData(null, 20, 0, false)]
    public void Assessment_list_paging_and_sort(string? sort, int pageSize, int page, bool valid)
    {
        var request = new ListMyAssessmentsRequest(null, null, null, null, null, sort, page, pageSize);
        Assert.Equal(valid, new ListMyAssessmentsValidator().Validate(request).IsValid);
    }

    [Fact]
    public void Assessment_list_filters()
    {
        var validator = new ListMyAssessmentsValidator();
        var from = new DateOnly(2026, 1, 1);

        Assert.True(validator.Validate(new ListMyAssessmentsRequest(Guid.NewGuid(), ["scheduled", "graded"], from, from.AddDays(400), "test", null)).IsValid);
        Assert.False(validator.Validate(new ListMyAssessmentsRequest(null, null, from, from.AddDays(401), null, null)).IsValid);
        Assert.False(validator.Validate(new ListMyAssessmentsRequest(null, null, from, from.AddDays(-1), null, null)).IsValid);
        Assert.False(validator.Validate(new ListMyAssessmentsRequest(null, ["done"], null, null, null, null)).IsValid);
        Assert.False(validator.Validate(new ListMyAssessmentsRequest(Guid.Empty, null, null, null, null, null)).IsValid);
        Assert.False(validator.Validate(new ListMyAssessmentsRequest(null, null, null, null, "quiz", null)).IsValid);
    }

    [Theory]
    [InlineData("start", true)]
    [InlineData("remove_mark", true)]
    [InlineData("mark", false)]
    [InlineData("", false)]
    [InlineData(null, false)]
    public void Transition(string? action, bool valid)
    {
        Assert.Equal(valid, new TransitionAssessmentValidator().Validate(new TransitionAssessmentRequest(action)).IsValid);
    }

    [Theory]
    [InlineData(45, 50, null, true)]
    [InlineData(0, 1, null, true)]
    [InlineData(10_000, 10_000, null, true)]
    [InlineData(null, null, 0, true)]
    [InlineData(null, null, 100, true)]
    [InlineData(51, 50, null, false)]
    [InlineData(-1, 50, null, false)]
    [InlineData(1, 0, null, false)]
    [InlineData(1, 10_001, null, false)]
    [InlineData(45, null, null, false)]
    [InlineData(null, 50, null, false)]
    [InlineData(45, 50, 90, false)]
    [InlineData(null, null, 101, false)]
    [InlineData(null, null, null, false)]
    public void Mark(int? obtained, int? total, int? percent, bool valid)
    {
        Assert.Equal(valid, new RecordAssessmentMarkValidator().Validate(new RecordAssessmentMarkRequest(obtained, total, percent)).IsValid);
    }

    private sealed class FixedClock(DateTimeOffset now) : IClock
    {
        public DateTimeOffset UtcNow { get; } = now;
    }
}
