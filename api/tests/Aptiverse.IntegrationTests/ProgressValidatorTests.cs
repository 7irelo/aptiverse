using Aptiverse.Progress.Domain;
using Aptiverse.Progress.Features.Common;
using Aptiverse.Progress.Features.CreateGoal;
using Aptiverse.Progress.Features.GetAnalytics;
using Aptiverse.Progress.Features.GetDashboard;
using Aptiverse.Progress.Features.GetGoalBaseline;
using Aptiverse.Progress.Features.GetJourney;
using Aptiverse.Progress.Features.ListGoals;
using Aptiverse.Progress.Features.UpdateGoal;
using Aptiverse.SharedKernel.Time;

namespace Aptiverse.IntegrationTests;

/// <summary>Validators and pure Progress rules; no database needed.</summary>
public sealed class ProgressValidatorTests
{
    private static readonly DateTimeOffset T0 = new(2026, 10, 27, 10, 0, 0, TimeSpan.Zero);
    private static readonly Guid Unit = Guid.CreateVersion7();

    [Theory]
    [InlineData("practice_tests_completed", 5, null, true)]
    [InlineData("practice_tests_completed", 2.5, null, false)]
    [InlineData("practice_tests_completed", 0, null, false)]
    [InlineData("practice_tests_completed", 101, null, false)]
    [InlineData("practice_score_best", 72.5, null, true)]
    [InlineData("practice_score_best", 72.555, null, false)]
    [InlineData("mastery_threshold", 80, "Algebra", true)]
    [InlineData("mastery_threshold", 80, null, true)]
    [InlineData("practice_score_best", 80, "Algebra", false)]
    [InlineData("assessment_mark_threshold", 100, null, true)]
    [InlineData("custom", 10, null, false)]
    [InlineData("checkin_streak", 10, null, false)]
    public void Create_goal_target_and_criteria(string criteria, double target, string? topic, bool valid)
    {
        var request = new CreateGoalRequest("Beat my score", null, criteria, Unit, topic, null, (decimal)target, T0.AddDays(10), null);
        Assert.Equal(valid, new CreateGoalValidator(new FixedClock(T0)).Validate(request).IsValid);
    }

    [Theory]
    [InlineData("ab", 10, true, false)]
    [InlineData("Pass June", 0.5, true, false)]
    [InlineData("Pass June", 1, true, true)]
    [InlineData("Pass June", 366, true, true)]
    [InlineData("Pass June", 367, true, false)]
    [InlineData("Line\u0007break", 10, true, false)]
    [InlineData("Pass June", 10, false, false)]
    public void Create_goal_title_due_and_unit(string title, double days, bool hasUnit, bool valid)
    {
        var request = new CreateGoalRequest(title, null, "practice_tests_completed", hasUnit ? Unit : Guid.Empty, null, null, 3m, T0.AddDays(days), null);
        Assert.Equal(valid, new CreateGoalValidator(new FixedClock(T0)).Validate(request).IsValid);
    }

    [Fact]
    public void Create_goal_milestones_increase_below_the_target_and_are_whole_for_counts()
    {
        var validator = new CreateGoalValidator(new FixedClock(T0));
        CreateGoalRequest With(string criteria, decimal target, params decimal[] thresholds) =>
            new("Goal title", null, criteria, Unit, null, null, target, T0.AddDays(10), thresholds.Select(t => new MilestoneInput("A step", t)).ToList());

        Assert.True(validator.Validate(With("practice_score_best", 80, 50, 60, 70)).IsValid);
        Assert.False(validator.Validate(With("practice_score_best", 80, 50, 50)).IsValid);
        Assert.False(validator.Validate(With("practice_score_best", 80, 60, 50)).IsValid);
        Assert.False(validator.Validate(With("practice_score_best", 80, 80)).IsValid);
        Assert.False(validator.Validate(With("practice_score_best", 80, 10, 20, 30, 40, 50, 60)).IsValid);
        Assert.False(validator.Validate(With("practice_tests_completed", 5, 2.5m)).IsValid);
        Assert.True(validator.Validate(With("practice_tests_completed", 5, 2, 4)).IsValid);
    }

    [Theory]
    [InlineData(null, null, null, true)]
    [InlineData("New title", 50.0, 5, true)]
    [InlineData("x", null, null, false)]
    [InlineData(null, 0.0, null, false)]
    [InlineData(null, null, -1, false)]
    public void Update_goal(string? title, double? target, int? sortOrder, bool valid)
    {
        var request = new UpdateGoalRequest(title, null, (decimal?)target, null, sortOrder);
        Assert.Equal(valid, new UpdateGoalValidator(new FixedClock(T0)).Validate(request).IsValid);
    }

    [Theory]
    [InlineData("mastery_threshold", "Algebra", true)]
    [InlineData("practice_tests_completed", "Algebra", false)]
    [InlineData("nonsense", null, false)]
    public void Baseline_request(string criteria, string? topic, bool valid) =>
        Assert.Equal(valid, new GetGoalBaselineValidator().Validate(new GetGoalBaselineRequest(criteria, Unit, topic, null)).IsValid);

    [Theory]
    [InlineData("active", 1, 20, true)]
    [InlineData("at_risk", 1, 20, false)]
    [InlineData(null, 0, 20, false)]
    [InlineData(null, 1, 51, false)]
    public void List_goals(string? status, int page, int pageSize, bool valid) =>
        Assert.Equal(valid, new ListGoalsValidator().Validate(new ListGoalsRequest(status, null, page, pageSize)).IsValid);

    [Theory]
    [InlineData(7, true)]
    [InlineData(28, true)]
    [InlineData(90, true)]
    [InlineData(30, false)]
    public void Analytics_range(int days, bool valid) =>
        Assert.Equal(valid, new GetAnalyticsValidator().Validate(new GetAnalyticsRequest(days)).IsValid);

    [Fact]
    public void Journey_cursor_round_trips_and_rejects_garbage()
    {
        var id = Guid.CreateVersion7();
        var cursor = JourneyCursor.Encode(T0, id);
        Assert.True(JourneyCursor.TryDecode(cursor, out var position));
        Assert.Equal((T0, id), position);
        Assert.False(JourneyCursor.TryDecode("not-a-cursor", out _));
        Assert.False(new GetJourneyValidator().Validate(new GetJourneyRequest(null, "points", 10)).IsValid);
        Assert.True(new GetJourneyValidator().Validate(new GetJourneyRequest(cursor, "goal_created,topic_band_up", 10)).IsValid);
        Assert.False(new GetJourneyValidator().Validate(new GetJourneyRequest(null, null, 51)).IsValid);
    }

    [Fact]
    public void Mastery_is_recency_weighted_and_null_without_evidence()
    {
        Assert.Equal(MasteryValue.None, MasteryMath.Compute([], T0));
        var value = MasteryMath.Compute([new(10, 8, T0), new(10, 0, T0.AddDays(-30))], T0);
        Assert.Equal(0.5333m, value.Score);
        Assert.Equal(20, value.EvidenceQuestions);
        Assert.Equal(2, value.ObservationCount);
        Assert.False(value.EarlyRead);
        Assert.True(MasteryMath.Compute([new(4, 4, T0)], T0).EarlyRead);
    }

    [Fact]
    public void Adding_a_correct_observation_never_lowers_the_score()
    {
        var random = new Random(42);
        for (var i = 0; i < 200; i++)
        {
            var points = Enumerable.Range(0, random.Next(1, 6))
                .Select(_ =>
                {
                    var total = random.Next(1, 10);
                    return new ObservationPoint(total, random.Next(0, total + 1), T0.AddDays(-random.Next(0, 90)));
                })
                .ToList();
            var before = MasteryMath.Compute(points, T0).Score!.Value;
            var after = MasteryMath.Compute([.. points, new ObservationPoint(3, 3, T0.AddDays(-random.Next(0, 90)))], T0).Score!.Value;
            Assert.InRange(before, 0m, 1m);
            Assert.True(after >= before, $"{after} < {before}");
        }
    }

    [Theory]
    [InlineData(0.4999, "emerging")]
    [InlineData(0.5, "developing")]
    [InlineData(0.6999, "developing")]
    [InlineData(0.7, "secure")]
    [InlineData(0.8499, "secure")]
    [InlineData(0.85, "mastered")]
    public void Bands_are_exact_at_the_boundaries(double score, string band) =>
        Assert.Equal(band, MasteryMath.BandOf((decimal)score));

    [Fact]
    public void Trend_needs_a_change_of_at_least_five_points()
    {
        Assert.Null(MasteryMath.Trend(0.5m, null));
        Assert.Equal("up", MasteryMath.Trend(0.55m, 0.5m));
        Assert.Equal("down", MasteryMath.Trend(0.45m, 0.5m));
        Assert.Equal("steady", MasteryMath.Trend(0.54m, 0.5m));
    }

    [Fact]
    public void Goal_rules_progress_baseline_and_at_risk()
    {
        Assert.Null(GoalEvaluator.ProgressPercent(null, 10));
        Assert.Equal(50m, GoalEvaluator.ProgressPercent(5, 10));
        Assert.Equal(100m, GoalEvaluator.ProgressPercent(15, 10));
        Assert.Equal(71m, GoalEvaluator.MinimumTarget(70m));
        Assert.Equal(71m, GoalEvaluator.MinimumTarget(70.4m));
        Assert.Equal(1m, GoalEvaluator.MinimumTarget(null));
        Assert.False(GoalEvaluator.IsAboveBaseline(70m, 70m));
        Assert.True(GoalEvaluator.IsAboveBaseline(70.01m, 70m));
        Assert.True(GoalEvaluator.IsAboveBaseline(1m, null));
        Assert.False(GoalEvaluator.IsAchieved(CriteriaTypes.MasteryThreshold, 90m, 80m, 4));
        Assert.True(GoalEvaluator.IsAchieved(CriteriaTypes.MasteryThreshold, 90m, 80m, 5));
        Assert.True(GoalEvaluator.IsAchieved(CriteriaTypes.PracticeTestsCompleted, 3m, 3m, null));

        Assert.True(GoalEvaluator.IsAtRisk(100m, T0.AddMinutes(-1), T0));
        Assert.False(GoalEvaluator.IsAtRisk(0m, T0.AddDays(8), T0));
        Assert.True(GoalEvaluator.IsAtRisk(70m, T0.AddDays(3.5), T0));
        Assert.False(GoalEvaluator.IsAtRisk(85m, T0.AddDays(3.5), T0));
        Assert.True(GoalEvaluator.IsAtRisk(null, T0.AddDays(6), T0));
    }

    [Fact]
    public void Milestone_rules_and_reorder_sets()
    {
        Assert.True(MilestoneRules.AreValid([], 10));
        Assert.True(MilestoneRules.AreValid([1, 2, 9.5m], 10));
        Assert.False(MilestoneRules.AreValid([0], 10));
        Assert.False(MilestoneRules.AreValid([5, 5], 10));
        Assert.False(MilestoneRules.AreValid([10], 10));
        var a = Guid.CreateVersion7();
        var b = Guid.CreateVersion7();
        Assert.True(MilestoneRules.IsExactSet([b, a], [a, b]));
        Assert.False(MilestoneRules.IsExactSet([a, a], [a, b]));
        Assert.False(MilestoneRules.IsExactSet([a], [a, b]));
        Assert.False(MilestoneRules.IsExactSet([a, Guid.CreateVersion7()], [a, b]));
    }

    [Fact]
    public void Topic_keys_fold_case_and_whitespace()
    {
        Assert.Equal("quadratic equations", TopicKeys.Key("  Quadratic   Equations "));
        Assert.Equal("Quadratic Equations", TopicKeys.Display("  Quadratic   Equations "));
        Assert.Equal(TopicKeys.MaxLength, TopicKeys.Display(new string('a', 200)).Length);
    }

    [Fact]
    public void Strengths_and_gaps_leave_out_early_reads()
    {
        var unit = Guid.CreateVersion7();
        DashboardTopic T(string name, decimal score, int questions) =>
            new(unit, name, score, MasteryMath.BandOf(score), questions < 5, questions);

        var (strengths, gaps) = GetAnalyticsHandler.Select([T("A", 0.95m, 10), T("B", 0.75m, 6), T("C", 0.2m, 3), T("D", 0.4m, 8), T("E", 1m, 2)]);
        Assert.Equal(["A", "B"], strengths.Select(s => s.Topic));
        Assert.Equal(["D"], gaps.Select(g => g.Topic));
    }

    [Fact]
    public void Stored_time_matches_postgres_microseconds_and_source_ids_are_stable()
    {
        var precise = T0.AddTicks(7);
        Assert.Equal(T0, StoredTime.Of(precise));
        var id = Guid.CreateVersion7();
        Assert.Equal(SourceIds.For(id, T0, "mark"), SourceIds.For(id, T0, "mark"));
        Assert.NotEqual(SourceIds.For(id, T0, "mark"), SourceIds.For(id, T0.AddSeconds(1), "mark"));
    }

    private sealed class FixedClock(DateTimeOffset now) : IClock
    {
        public DateTimeOffset UtcNow { get; } = now;
    }
}
