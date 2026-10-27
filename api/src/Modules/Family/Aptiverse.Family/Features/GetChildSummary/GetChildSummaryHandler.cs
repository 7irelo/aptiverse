using Aptiverse.Academics.Contracts;
using Aptiverse.AiTutor.Contracts;
using Aptiverse.Family.Domain;
using Aptiverse.Family.Features.Common;
using Aptiverse.Family.Persistence;
using Aptiverse.Identity.Contracts;
using Aptiverse.Progress.Contracts;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;

namespace Aptiverse.Family.Features.GetChildSummary;

/// <summary>
/// The parent's view of one child, scoped by the link: an unlinked child is 404 before anything is read, and a block
/// the child does not share is never fetched from its module, so hidden data cannot leak through a bug in a mapper.
/// </summary>
internal sealed class GetChildSummaryHandler(
    FamilyDbContext db,
    IUserDirectory directory,
    IStudentProfileLookup profiles,
    IStudyUnitLookup units,
    IAssessmentLookup assessments,
    IMasterySnapshot mastery,
    IProgressSummary progress,
    ITutorActivityLookup tutor,
    IClock clock)
{
    public const int UpcomingDays = 14;
    public const int UpcomingMax = 10;
    public const int WindowDays = 30;
    public const int RecentPractice = 5;
    public const int WeakestTopics = 5;
    public const int ActiveGoals = 10;

    public async Task<Result<ChildSummary>> HandleAsync(Guid parentUserId, Guid studentUserId, CancellationToken cancellationToken)
    {
        var link = await db.ActiveLinkAsync(parentUserId, studentUserId, cancellationToken);
        if (link is null)
        {
            return FamilyErrors.ChildNotFound;
        }

        var contact = await directory.GetContactAsync(studentUserId, cancellationToken);
        if (contact is null)
        {
            return FamilyErrors.ChildNotFound;
        }

        var sharing = link.Sharing;
        var now = clock.UtcNow;
        var since = now.AddDays(-WindowDays);
        var profile = await profiles.GetAsync(studentUserId, cancellationToken);

        var unitNames = new Dictionary<Guid, string>();
        IReadOnlyList<StudyUnitContext> enrolled = [];
        if (sharing.Academics || sharing.Practice || sharing.Goals)
        {
            enrolled = await units.GetForUserAsync(studentUserId, cancellationToken);
            foreach (var unit in enrolled)
            {
                unitNames[unit.StudyUnitId] = unit.Name;
            }
        }

        var academics = AcademicsBlock.Hidden;
        var topics = MasteryBlock.Hidden;
        if (sharing.Academics)
        {
            var open = await assessments.GetOpenForUserAsync(studentUserId, cancellationToken);
            var horizon = now.AddDays(UpcomingDays);
            academics = new AcademicsBlock(
                true,
                enrolled.Select(u => new UnitItem(u.StudyUnitId, u.Name, u.Kind, u.Level)).ToList(),
                open.Where(a => a.DueAt >= now && a.DueAt <= horizon)
                    .OrderBy(a => a.DueAt)
                    .Take(UpcomingMax)
                    .Select(a => new UpcomingAssessmentItem(a.AssessmentId, a.Title, a.UnitName, a.DueAt))
                    .ToList());

            var weakest = await mastery.GetWeakestTopicsAsync(studentUserId, WeakestTopics, cancellationToken);
            topics = new MasteryBlock(true, weakest.Select(t => new TopicItem(t.StudyUnitId, t.Topic, t.Score, t.Band)).ToList());
        }
        else
        {
            FamilyMetrics.BlockHidden("academics");
        }

        var practice = PracticeBlock.Hidden;
        if (sharing.Practice)
        {
            var summary = await progress.GetPracticeAsync(studentUserId, since, RecentPractice, cancellationToken);
            practice = new PracticeBlock(
                true,
                summary.Completed,
                summary.AverageScorePercent,
                summary.Recent
                    .Select(r => new PracticeItem(r.StudyUnitId, unitNames.GetValueOrDefault(r.StudyUnitId), r.ScorePercent, ToHour(r.GradedAt)))
                    .ToList());
        }
        else
        {
            FamilyMetrics.BlockHidden("practice");
        }

        var goals = GoalsBlock.Hidden;
        if (sharing.Goals)
        {
            var active = await progress.GetActiveGoalsAsync(studentUserId, ActiveGoals, cancellationToken);
            goals = new GoalsBlock(
                true,
                active.Select(g => new GoalItem(g.Title, g.CriteriaType, g.Status, g.TargetValue, g.CurrentValue, g.DueAt, unitNames.GetValueOrDefault(g.StudyUnitId)))
                    .ToList());
        }
        else
        {
            FamilyMetrics.BlockHidden("goals");
        }

        var tutorBlock = TutorBlock.Hidden;
        if (sharing.TutorActivity)
        {
            var activity = await tutor.GetAsync(studentUserId, since, cancellationToken);
            tutorBlock = new TutorBlock(true, activity.Conversations, activity.QuestionsAsked);
        }
        else
        {
            FamilyMetrics.BlockHidden("tutor_activity");
        }

        return new ChildSummary(studentUserId, contact.Name, profile?.Stage, profile?.Level, academics, topics, practice, goals, tutorBlock);
    }

    public static DateTimeOffset ToHour(DateTimeOffset value)
    {
        var utc = value.ToUniversalTime();
        return new DateTimeOffset(utc.Year, utc.Month, utc.Day, utc.Hour, 0, 0, TimeSpan.Zero);
    }
}
