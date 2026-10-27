using Aptiverse.Academics.Contracts;
using Aptiverse.Practice.Contracts;
using Aptiverse.Progress.Contracts;
using Aptiverse.SharedKernel.Time;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.Mcp.Tools;

// Read tools. Each one is a thin call into another module's Contracts query interface with the user id from the
// token; outputs carry ids, names and numbers only (never email, date of birth or parent details).

/// <summary>get_topic_mastery: topics with evidence only, so a topic without marks is never shown as 0.</summary>
internal sealed class GetTopicMasteryTool() : AptiverseTool(PinnedTools.GetTopicMastery)
{
    public const int MaxTopics = 100;

    public override async Task<ToolOutcome> ExecuteAsync(ToolCall call, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(call);
        var (units, failure) = await StudentUnits.ResolveAsync(
            call.Services.GetRequiredService<IStudyUnitLookup>(), call.UserId, call.String("subject"), cancellationToken);
        if (failure is not null)
        {
            return failure;
        }

        var mastery = call.Services.GetRequiredService<IMasterySnapshot>();
        var topics = new List<TopicMasteryItem>();
        foreach (var unit in units)
        {
            foreach (var topic in await mastery.GetForUnitAsync(call.UserId, unit.StudyUnitId, cancellationToken))
            {
                if (topic.Score is { } score && topics.Count < MaxTopics)
                {
                    topics.Add(new TopicMasteryItem(unit.Name, topic.Topic, score, topic.Band, topic.EvidenceQuestions, topic.EarlyRead));
                }
            }
        }

        return ToolOutcome.Ok(new TopicMasteryResult(topics));
    }
}

internal sealed record TopicMasteryResult(IReadOnlyList<TopicMasteryItem> Topics);

/// <param name="Subject">The unit's name.</param>
/// <param name="Topic">The topic.</param>
/// <param name="Mastery">0 to 1.</param>
/// <param name="Band">"emerging", "developing", "secure" or "mastered".</param>
/// <param name="AnsweredQuestions">Questions behind the value.</param>
/// <param name="EarlyRead">True while fewer than 5 questions back the value.</param>
internal sealed record TopicMasteryItem(string Subject, string Topic, decimal Mastery, string? Band, int AnsweredQuestions, bool EarlyRead);

/// <summary>list_upcoming_assessments: the student's open assessments due within the window, soonest first.</summary>
internal sealed class ListUpcomingAssessmentsTool() : AptiverseTool(PinnedTools.ListUpcomingAssessments)
{
    public const int DefaultDays = 30;
    public const int MaxItems = 50;

    public override async Task<ToolOutcome> ExecuteAsync(ToolCall call, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(call);
        var now = call.Services.GetRequiredService<IClock>().UtcNow;
        var until = now.AddDays(call.Int("days") ?? DefaultDays);
        var open = await call.Services.GetRequiredService<IAssessmentLookup>().GetOpenForUserAsync(call.UserId, cancellationToken);

        var items = open
            .Where(a => a.DueAt >= now && a.DueAt <= until)
            .OrderBy(a => a.DueAt)
            .Take(MaxItems)
            .Select(a => new AssessmentItem(a.AssessmentId, a.Title, a.UnitName, a.DueAt))
            .ToList();
        return ToolOutcome.Ok(new AssessmentsResult(items));
    }
}

internal sealed record AssessmentsResult(IReadOnlyList<AssessmentItem> Assessments);

internal sealed record AssessmentItem(Guid AssessmentId, string Title, string Subject, DateTimeOffset DueAt);

/// <summary>get_attempt_mistakes: wrong answers from the student's own graded practice, newest first.</summary>
internal sealed class GetAttemptMistakesTool() : AptiverseTool(PinnedTools.GetAttemptMistakes)
{
    public const int DefaultLimit = 5;

    public override async Task<ToolOutcome> ExecuteAsync(ToolCall call, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(call);
        IReadOnlyCollection<Guid>? unitIds = null;
        if (call.String("subject") is { } subject)
        {
            var (units, failure) = await StudentUnits.ResolveAsync(
                call.Services.GetRequiredService<IStudyUnitLookup>(), call.UserId, subject, cancellationToken);
            if (failure is not null)
            {
                return failure;
            }

            unitIds = units.Select(u => u.StudyUnitId).ToList();
        }

        var mistakes = await call.Services.GetRequiredService<IPracticeMistakeLookup>()
            .GetRecentMistakesAsync(call.UserId, unitIds, call.Int("limit") ?? DefaultLimit, cancellationToken);
        return ToolOutcome.Ok(new MistakesResult(mistakes
            .Select(m => new MistakeItem(m.AttemptId, m.QuestionId, m.Subject, m.Topic, m.Question, m.ExpectedAnswer, m.StudentAnswer, m.MarksAwarded, m.Marks))
            .ToList()));
    }
}

internal sealed record MistakesResult(IReadOnlyList<MistakeItem> Mistakes);

internal sealed record MistakeItem(
    Guid AttemptId,
    Guid QuestionId,
    string Subject,
    string Topic,
    string Question,
    string ExpectedAnswer,
    string? StudentAnswer,
    int MarksAwarded,
    int Marks);
