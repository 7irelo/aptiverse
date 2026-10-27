using Aptiverse.Academics.Contracts;
using Aptiverse.AiTutor.Contracts;
using Aptiverse.Family.Contracts;
using Aptiverse.Family.Domain;
using Aptiverse.Family.Features.GetChildSummary;
using Aptiverse.Family.Persistence;
using Aptiverse.Identity.Contracts;
using Aptiverse.Progress.Contracts;
using NSubstitute;

namespace Aptiverse.Family.UnitTests;

public sealed class GetChildSummaryHandlerTests : IAsyncDisposable
{
    private readonly FamilyDbContext _db = TestDb.Create();
    private readonly IUserDirectory _directory = Substitute.For<IUserDirectory>();
    private readonly IStudentProfileLookup _profiles = Substitute.For<IStudentProfileLookup>();
    private readonly IStudyUnitLookup _units = Substitute.For<IStudyUnitLookup>();
    private readonly IAssessmentLookup _assessments = Substitute.For<IAssessmentLookup>();
    private readonly IMasterySnapshot _mastery = Substitute.For<IMasterySnapshot>();
    private readonly IProgressSummary _progress = Substitute.For<IProgressSummary>();
    private readonly ITutorActivityLookup _tutor = Substitute.For<ITutorActivityLookup>();
    private readonly Guid _parent = Guid.NewGuid();
    private readonly Guid _student = Guid.NewGuid();
    private readonly Guid _unit = Guid.NewGuid();

    public GetChildSummaryHandlerTests()
    {
        _directory.GetContactAsync(_student, Arg.Any<CancellationToken>())
            .Returns(new UserContact(_student, "kid@example.test", "Sipho", true, ["student"]));
        _units.GetForUserAsync(_student, Arg.Any<CancellationToken>())
            .Returns([new StudyUnitContext(_unit, "caps_subject", "high_school", "Mathematics", "grade_11", "nsc", [], Guid.NewGuid(), [])]);
        _assessments.GetOpenForUserAsync(_student, Arg.Any<CancellationToken>()).Returns(
        [
            new OpenAssessment(Guid.NewGuid(), "Algebra test", _unit, "Mathematics", TestDb.Now.AddDays(3)),
            new OpenAssessment(Guid.NewGuid(), "Far away exam", _unit, "Mathematics", TestDb.Now.AddDays(40)),
            new OpenAssessment(Guid.NewGuid(), "Overdue task", _unit, "Mathematics", TestDb.Now.AddDays(-1)),
        ]);
        _mastery.GetWeakestTopicsAsync(_student, Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns([new TopicMasteryView(_unit, "Functions", 0.41m, "developing", 12, 3, false, TestDb.Now)]);
        _progress.GetPracticeAsync(_student, Arg.Any<DateTimeOffset>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new PracticeSummary(2, 71.5m, [new PracticeResultSummary(Guid.NewGuid(), _unit, 80m, false, TestDb.Now)]));
        _progress.GetActiveGoalsAsync(_student, Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns([new ActiveGoalSummary(Guid.NewGuid(), _unit, "Pass algebra", "practice_score_best", "active", 75m, 60m, TestDb.Now.AddDays(20))]);
        _tutor.GetAsync(_student, Arg.Any<DateTimeOffset>(), Arg.Any<CancellationToken>()).Returns(new TutorActivity(3, 17));
    }

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task An_unlinked_or_removed_child_is_not_found_and_nothing_is_read()
    {
        var stranger = await Handler().HandleAsync(_parent, _student, Ct);
        Assert.Equal("family.child_not_found", stranger.Error!.Code);

        var link = await LinkAsync(new SharingFlags(true, true, true, true));
        link.Remove(RemovedBy.Student, TestDb.Now);
        await _db.SaveChangesAsync(Ct);

        var removed = await Handler().HandleAsync(_parent, _student, Ct);
        Assert.Equal("family.child_not_found", removed.Error!.Code);
        Assert.Empty(_directory.ReceivedCalls());
        Assert.Empty(_progress.ReceivedCalls());
    }

    [Fact]
    public async Task Everything_shared_fills_every_block_with_counts_only_for_the_tutor()
    {
        await LinkAsync(new SharingFlags(true, true, true, true));

        var summary = (await Handler().HandleAsync(_parent, _student, Ct)).Value;

        Assert.Equal("Sipho", summary.DisplayName);
        Assert.True(summary.Academics.Shared);
        Assert.Equal("Mathematics", Assert.Single(summary.Academics.Units!).Name);
        Assert.Equal("Algebra test", Assert.Single(summary.Academics.Upcoming!).Title);
        Assert.Equal("Functions", Assert.Single(summary.Mastery.WeakestTopics!).Topic);
        Assert.Equal(2, summary.Practice.CompletedLast30Days);
        var practice = Assert.Single(summary.Practice.Recent!);
        Assert.Equal("Mathematics", practice.UnitName);
        Assert.Equal(new DateTimeOffset(2026, 10, 28, 9, 0, 0, TimeSpan.Zero), practice.GradedHour);
        Assert.Equal("Pass algebra", Assert.Single(summary.Goals.Active!).Title);
        Assert.Equal(new TutorBlock(true, 3, 17), summary.Tutor);
    }

    [Fact]
    public async Task Unshared_blocks_carry_no_data_and_their_modules_are_never_asked()
    {
        await LinkAsync(new SharingFlags(false, false, false, false));

        var summary = (await Handler().HandleAsync(_parent, _student, Ct)).Value;

        Assert.Equal(AcademicsBlock.Hidden, summary.Academics);
        Assert.Equal(MasteryBlock.Hidden, summary.Mastery);
        Assert.Equal(PracticeBlock.Hidden, summary.Practice);
        Assert.Equal(GoalsBlock.Hidden, summary.Goals);
        Assert.Equal(TutorBlock.Hidden, summary.Tutor);
        Assert.Empty(_units.ReceivedCalls());
        Assert.Empty(_assessments.ReceivedCalls());
        Assert.Empty(_mastery.ReceivedCalls());
        Assert.Empty(_progress.ReceivedCalls());
        Assert.Empty(_tutor.ReceivedCalls());
    }

    [Theory]
    [InlineData(true, false, false, false)]
    [InlineData(false, true, false, false)]
    [InlineData(false, false, true, false)]
    [InlineData(false, false, false, true)]
    public async Task Each_flag_opens_only_its_own_block(bool academics, bool practice, bool goals, bool tutor)
    {
        await LinkAsync(new SharingFlags(academics, practice, goals, tutor));

        var summary = (await Handler().HandleAsync(_parent, _student, Ct)).Value;

        Assert.Equal(academics, summary.Academics.Shared);
        Assert.Equal(academics, summary.Mastery.Shared);
        Assert.Equal(practice, summary.Practice.Shared);
        Assert.Equal(goals, summary.Goals.Shared);
        Assert.Equal(tutor, summary.Tutor.Shared);
    }

    [Fact]
    public void No_summary_field_can_carry_tutor_conversation_content()
    {
        var names = typeof(ChildSummary).Assembly.GetTypes()
            .Where(t => t.Namespace == typeof(ChildSummary).Namespace)
            .SelectMany(t => t.GetProperties())
            .Select(p => p.Name)
            .ToList();

        Assert.DoesNotContain(names, n => n.Contains("Message", StringComparison.Ordinal) || n.Contains("Content", StringComparison.Ordinal)
            || (n.Contains("Conversation", StringComparison.Ordinal) && !n.EndsWith("Last30Days", StringComparison.Ordinal)));
    }

    public async ValueTask DisposeAsync() => await _db.DisposeAsync();

    private async Task<FamilyLink> LinkAsync(SharingFlags flags)
    {
        var link = FamilyLink.Create(_parent, _student, Relationships.Mother, LinkMethods.Invite, Guid.NewGuid(), TestDb.Now);
        link.SetSharing(flags, TestDb.Now);
        _db.Links.Add(link);
        await _db.SaveChangesAsync(Ct);
        return link;
    }

    private GetChildSummaryHandler Handler() =>
        new(_db, _directory, _profiles, _units, _assessments, _mastery, _progress, _tutor, new FixedClock(TestDb.Now));
}
