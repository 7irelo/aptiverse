using Aptiverse.Academics.Domain;
using Aptiverse.Academics.Features.SearchCourses;
using Aptiverse.Academics.Seeding;
using Aptiverse.Identity.Contracts;

namespace Aptiverse.IntegrationTests;

/// <summary>Pure domain rules of the Academics module: no database, no host.</summary>
public sealed class AcademicsDomainTests
{
    private static readonly DateTimeOffset Now = new(2026, 10, 27, 10, 0, 0, TimeSpan.Zero);

    [Theory]
    [InlineData("Trig Identities", "trig-identities")]
    [InlineData("  trig   identities!! ", "trig-identities")]
    [InlineData("The Theory of Evolution", "theory-evolution")]
    [InlineData("Cells and Tissues", "cells-tissues")]
    [InlineData("Équations Différentielles", "equations-differentielles")]
    [InlineData("The", "the")]
    [InlineData("C++ / Java", "c-java")]
    [InlineData("!!!", "")]
    public void Topic_slugs_are_canonical(string label, string expected)
    {
        Assert.Equal(expected, Slugs.Topic(label));
    }

    [Fact]
    public void Topic_slugs_are_capped()
    {
        Assert.True(Slugs.Topic(string.Join(' ', Enumerable.Repeat("photosynthesis", 20))).Length <= Slugs.TopicSlugMaxLength);
    }

    [Fact]
    public void Course_keys_collide_on_the_code_whatever_the_spelling()
    {
        var uct = new InstitutionInfo(Guid.NewGuid(), "uct", "University of Cape Town", "UCT", "university", "western_cape");
        var a = StudyUnit.CourseKey(uct, Guid.NewGuid(), "Calculus I", "MAM1000W", "first_year");
        var b = StudyUnit.CourseKey(uct, Guid.NewGuid(), "calculus 1", "mam 1000w", "first_year");
        Assert.Equal(a, b);
        Assert.Equal("uct:code-mam1000w:first_year", a);

        Assert.NotEqual(a, StudyUnit.CourseKey(uct, Guid.NewGuid(), "Calculus I", "MAM1000W", "second_year"));
        Assert.NotEqual(
            StudyUnit.CourseKey(uct, Guid.NewGuid(), "Calculus I", null, "first_year"),
            StudyUnit.CourseKey(uct, Guid.NewGuid(), "Calculus 1", null, "first_year"));
        Assert.Equal(
            StudyUnit.CourseKey(uct, Guid.NewGuid(), "Calculus  I", null, "first_year"),
            StudyUnit.CourseKey(uct, Guid.NewGuid(), "calculus i", null, "first_year"));
    }

    [Fact]
    public void A_course_without_a_catalog_institution_is_private_to_its_owner()
    {
        var owner = Guid.NewGuid();
        var unit = StudyUnit.CreateCourse(null, owner, "Calculus I", null, "first_year");

        Assert.Equal(owner, unit.OwnerUserId);
        Assert.Null(unit.InstitutionId);
        Assert.False(unit.IsShared);
        Assert.StartsWith(owner.ToString("N"), unit.NormalizedKey, StringComparison.Ordinal);
        Assert.NotEqual(unit.NormalizedKey, StudyUnit.CreateCourse(null, Guid.NewGuid(), "Calculus I", null, "first_year").NormalizedKey);
    }

    [Fact]
    public void Normalized_keys_fit_the_column()
    {
        var unit = StudyUnit.CreateCourse(null, Guid.NewGuid(), new string('a', 160), null, "first_year");
        Assert.True(unit.NormalizedKey.Length <= StudyUnit.NormalizedKeyMaxLength);
    }

    public static TheoryData<string, bool> GateCases => new()
    {
        { "hs11nsc:caps11nsc", true },
        { "hs11nsc:caps12nsc", false },
        { "hs11nsc:caps11ieb", false },
        { "hs11nsc:course-uct", false },
        { "hs11nsc:course-private-own", false },
        { "tertiary-uct:course-uct", true },
        { "tertiary-uct:course-wits", false },
        { "tertiary-uct:course-private-own", true },
        { "tertiary-uct:course-private-other", false },
        { "tertiary-uct:caps11nsc", false },
        { "tertiary-none:course-uct", false },
        { "tertiary-none:course-private-own", true },
        { "hs-nograde:caps11nsc", false },
        { "none:caps11nsc", false },
        { "none:course-uct", false },
    };

    [Theory]
    [MemberData(nameof(GateCases))]
    public void Enrolment_gate_allows_only_the_students_own_stage(string scenario, bool expected)
    {
        var userId = Guid.NewGuid();
        var uct = new InstitutionInfo(Guid.NewGuid(), "uct", "University of Cape Town", "UCT", "university", "western_cape");
        var wits = new InstitutionInfo(Guid.NewGuid(), "wits", "University of the Witwatersrand", "Wits", "university", "gauteng");
        var parts = scenario.Split(':');

        StudentContext? student = parts[0] switch
        {
            "hs11nsc" => new(userId, new StudentProfile("high_school", 11, null, "nsc", "high_school", "Grade 11", null), null),
            "hs-nograde" => new(userId, new StudentProfile("high_school", null, null, "nsc", "high_school", "High school", null), null),
            "tertiary-uct" => new(userId, new StudentProfile("tertiary", null, 1, null, "university", "Year 1", "UCT"), uct),
            "tertiary-none" => new(userId, new StudentProfile("tertiary", null, 1, null, "university", "Year 1", null), null),
            _ => null,
        };

        var unit = parts[1] switch
        {
            "caps11nsc" => StudyUnit.CreateCaps(Guid.NewGuid(), "math", "Mathematics", "nsc", 11),
            "caps12nsc" => StudyUnit.CreateCaps(Guid.NewGuid(), "math", "Mathematics", "nsc", 12),
            "caps11ieb" => StudyUnit.CreateCaps(Guid.NewGuid(), "math", "Mathematics", "ieb", 11),
            "course-uct" => StudyUnit.CreateCourse(uct, userId, "Calculus", null, "first_year"),
            "course-wits" => StudyUnit.CreateCourse(wits, userId, "Calculus", null, "first_year"),
            "course-private-own" => StudyUnit.CreateCourse(null, userId, "Calculus", null, "first_year"),
            "course-private-other" => StudyUnit.CreateCourse(null, Guid.NewGuid(), "Calculus", null, "first_year"),
            _ => throw new InvalidOperationException(scenario),
        };

        Assert.Equal(expected, EnrolmentGate.CanEnrol(student, unit));
    }

    // Every action against every state: the expected state after it, "same" for an unchanged success, or null for 409.
    public static TheoryData<string, string, string?> TransitionCases => new()
    {
        { "start", AssessmentStates.Scheduled, AssessmentStates.InProgress },
        { "start", AssessmentStates.InProgress, "same" },
        { "start", AssessmentStates.Submitted, null },
        { "start", AssessmentStates.Graded, null },
        { "submit", AssessmentStates.Scheduled, AssessmentStates.Submitted },
        { "submit", AssessmentStates.InProgress, AssessmentStates.Submitted },
        { "submit", AssessmentStates.Submitted, "same" },
        { "submit", AssessmentStates.Graded, null },
        { "reopen", AssessmentStates.Scheduled, null },
        { "reopen", AssessmentStates.InProgress, AssessmentStates.Scheduled },
        { "reopen", AssessmentStates.Submitted, AssessmentStates.InProgress },
        { "reopen", AssessmentStates.Graded, null },
        { "remove_mark", AssessmentStates.Scheduled, null },
        { "remove_mark", AssessmentStates.InProgress, null },
        { "remove_mark", AssessmentStates.Submitted, "same" },
        { "remove_mark", AssessmentStates.Graded, AssessmentStates.Submitted },
    };

    [Theory]
    [MemberData(nameof(TransitionCases))]
    public void Lifecycle_covers_every_action_and_state(string action, string from, string? expected)
    {
        var assessment = InState(from);

        var result = assessment.Transition(action, Now.AddHours(1));

        if (expected is null)
        {
            Assert.True(result.IsFailure);
            Assert.Equal("academics.invalid_transition", result.Error!.Code);
            Assert.Equal(from, assessment.State);
        }
        else if (expected == "same")
        {
            Assert.False(result.Value);
            Assert.Equal(from, assessment.State);
        }
        else
        {
            Assert.True(result.Value);
            Assert.Equal(expected, assessment.State);
        }
    }

    [Fact]
    public void Lifecycle_timestamps_are_set_by_the_machine()
    {
        var assessment = InState(AssessmentStates.Scheduled);
        assessment.Transition("start", Now);
        Assert.Equal(Now, assessment.StartedAt);
        assessment.Transition("submit", Now.AddHours(1));
        Assert.Equal(Now.AddHours(1), assessment.SubmittedAt);
        assessment.Transition("reopen", Now.AddHours(2));
        Assert.Null(assessment.SubmittedAt);
        assessment.Transition("reopen", Now.AddHours(3));
        Assert.Null(assessment.StartedAt);
    }

    [Fact]
    public void Marks_compute_the_percent_and_the_same_mark_is_not_a_change()
    {
        var assessment = InState(AssessmentStates.Scheduled);

        Assert.True(assessment.RecordMark(2, 3, Now));
        Assert.Equal(66.67m, assessment.Percent);
        Assert.Equal(AssessmentStates.Graded, assessment.State);
        Assert.Equal(Now, assessment.GradedAt);
        Assert.NotNull(assessment.SubmittedAt);

        Assert.False(assessment.RecordMark(2, 3, Now.AddHours(1)));
        Assert.Equal(Now, assessment.GradedAt);
        Assert.True(assessment.RecordMark(3, 3, Now.AddHours(1)));
        Assert.Equal(100m, assessment.Percent);

        Assert.Throws<ArgumentOutOfRangeException>(() => assessment.RecordMark(4, 3, Now));

        assessment.Transition("remove_mark", Now.AddHours(2));
        Assert.Null(assessment.MarkObtained);
        Assert.Null(assessment.Percent);
        Assert.Null(assessment.GradedAt);
        Assert.Equal(AssessmentStates.Submitted, assessment.State);
    }

    [Fact]
    public void Allowed_actions_follow_the_state()
    {
        Assert.Equal(["start", "submit", "mark"], InState(AssessmentStates.Scheduled).AllowedActions());
        Assert.Equal(["submit", "reopen", "mark"], InState(AssessmentStates.InProgress).AllowedActions());
        Assert.Equal(["reopen", "mark"], InState(AssessmentStates.Submitted).AllowedActions());
        Assert.Equal(["remove_mark", "mark"], InState(AssessmentStates.Graded).AllowedActions());
    }

    [Fact]
    public void Weighting_is_null_without_evidence()
    {
        var empty = UnitWeighting.Compute([]);
        Assert.Null(empty.CurrentPercent);
        Assert.Null(empty.PredictedPercent);
        Assert.Empty(empty.Warnings);

        var ungraded = UnitWeighting.Compute([new WeightedItem(20m, false, null, null)]);
        Assert.Null(ungraded.CurrentPercent);
        Assert.Null(ungraded.PredictedPercent);
        Assert.Equal(0m, ungraded.GradedWeightPercent);
        Assert.Equal(20m, ungraded.WeightTotalPercent);
    }

    [Fact]
    public void Weighting_uses_equal_weights_when_none_are_set()
    {
        var result = UnitWeighting.Compute([new WeightedItem(null, true, 60m, null), new WeightedItem(null, true, 81m, null)]);
        Assert.Equal(70.5m, result.CurrentPercent);
        Assert.Equal(2, result.GradedCount);
    }

    [Fact]
    public void Weighting_normalises_over_the_weights_and_projects_predictions()
    {
        WeightedItem[] items =
        [
            new(25m, true, 80m, null),
            new(25m, true, 60m, null),
            new(50m, false, null, 90m),
        ];

        var result = UnitWeighting.Compute(items);

        Assert.Equal(70m, result.CurrentPercent);
        Assert.Equal(80m, result.PredictedPercent);
        Assert.Equal(50m, result.GradedWeightPercent);
        Assert.Equal(100m, result.WeightTotalPercent);
        Assert.Empty(result.Warnings);
    }

    [Fact]
    public void Weighting_warns_about_totals_above_100_and_missing_weights()
    {
        var over = UnitWeighting.Compute([new WeightedItem(60m, true, 50m, null), new WeightedItem(60m, true, 70m, null)]);
        Assert.Equal([UnitWeighting.TotalAbove100], over.Warnings);
        Assert.Equal(60m, over.CurrentPercent);

        var missing = UnitWeighting.Compute([new WeightedItem(40m, true, 50m, null), new WeightedItem(null, true, 100m, null)]);
        Assert.Equal([UnitWeighting.MissingWeights], missing.Warnings);
        Assert.Equal(50m, missing.CurrentPercent);
    }

    [Fact]
    public void Enrolment_end_follows_the_duration_and_completion_wins()
    {
        var course = StudyUnit.CreateCourse(null, Guid.NewGuid(), "Calculus", null, "first_year");
        var start = new DateOnly(2026, 2, 1);

        var semester = Enrolment.Create(Guid.NewGuid(), course, null, start, Durations.Semester, 0);
        Assert.Equal(new DateOnly(2026, 8, 1), semester.ExpectedEndOn);
        Assert.False(semester.IsFinished(new DateOnly(2026, 8, 1)));
        Assert.True(semester.IsFinished(new DateOnly(2026, 8, 2)));

        var year = Enrolment.Create(Guid.NewGuid(), course, null, start, Durations.FullYear, 0);
        Assert.Equal(new DateOnly(2027, 2, 1), year.ExpectedEndOn);
        year.Complete(Now);
        Assert.True(year.IsFinished(start));
        year.Reopen();
        Assert.False(year.IsFinished(start));

        var subject = Enrolment.Create(Guid.NewGuid(), StudyUnit.CreateCaps(Guid.NewGuid(), "math", "Mathematics", "nsc", 11), null, start, Durations.Semester, 0);
        Assert.Null(subject.Duration);
        Assert.Null(subject.ExpectedEndOn);
    }

    [Theory]
    [InlineData(0, null)]
    [InlineData(4, null)]
    [InlineData(5, 5)]
    [InlineData(9, 5)]
    [InlineData(23, 20)]
    public void Course_enrolment_counts_are_bucketed(int count, int? expected)
    {
        Assert.Equal(expected, SearchCoursesHandler.Bucket(count));
    }

    [Fact]
    public void Reference_data_files_are_consistent()
    {
        var data = ReferenceData.Load();

        Assert.Equal(["ieb", "nsc"], data.Curricula.Select(c => c.Code).Order());
        Assert.Equal(data.Subjects.Count, data.Subjects.Select(s => s.Slug).Distinct().Count());
        Assert.All(data.Subjects, s =>
        {
            Assert.InRange(s.Slug.Length, 1, CatalogSubject.SlugMaxLength);
            Assert.InRange(s.Code.Length, 1, CatalogSubject.CodeMaxLength);
            Assert.Contains(s.Category, SubjectCategories.All);
            Assert.True(s.LanguageType is null || LanguageTypes.All.Contains(s.LanguageType));
        });

        var slugs = data.Subjects.Select(s => s.Slug).ToHashSet();
        Assert.All(data.CurriculumSubjects, m =>
        {
            Assert.Contains(m.Subject, slugs);
            Assert.Contains(m.Curriculum, Curricula.All);
            Assert.InRange(m.MinGrade, (short)8, m.MaxGrade);
            Assert.InRange(m.MaxGrade, m.MinGrade, (short)12);
        });
        Assert.Equal(data.CurriculumSubjects.Count, data.CurriculumSubjects.Select(m => (m.Curriculum, m.Subject)).Distinct().Count());

        foreach (var grade in Enumerable.Range(8, 5))
        {
            foreach (var curriculum in Curricula.All)
            {
                Assert.Contains(data.CurriculumSubjects, m => m.Curriculum == curriculum && m.MinGrade <= grade && grade <= m.MaxGrade && m.Subject == "math");
            }
        }

        Assert.Equal(26, data.Institutions.Count);
        Assert.Equal(data.Institutions.Count, data.Institutions.Select(i => i.Slug).Distinct().Count());
        Assert.All(data.Institutions, i =>
        {
            Assert.Contains(i.Type, InstitutionTypes.All);
            Assert.Contains(i.Province!, Provinces.All);
            Assert.InRange(i.Slug.Length, 1, Institution.SlugMaxLength);
            Assert.InRange(i.ShortName!.Length, 1, Institution.ShortNameMaxLength);
        });
    }

    private static Assessment InState(string state)
    {
        var unit = StudyUnit.CreateCaps(Guid.NewGuid(), "math", "Mathematics", "nsc", 11);
        var enrolment = Enrolment.Create(Guid.NewGuid(), unit, null, new DateOnly(2026, 1, 15), null, 0);
        var assessment = Assessment.Create(enrolment, "Test", "test", null, null, Now.AddDays(5), null, null);
        switch (state)
        {
            case AssessmentStates.InProgress:
                assessment.Transition("start", Now);
                break;
            case AssessmentStates.Submitted:
                assessment.Transition("submit", Now);
                break;
            case AssessmentStates.Graded:
                assessment.RecordMark(7, 10, Now);
                break;
            default:
                break;
        }

        return assessment;
    }
}
