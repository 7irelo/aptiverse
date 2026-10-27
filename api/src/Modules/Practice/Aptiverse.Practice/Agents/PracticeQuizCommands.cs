using System.Text.RegularExpressions;
using Aptiverse.Academics.Contracts;
using Aptiverse.Practice.Contracts;
using Aptiverse.Practice.Domain;
using Aptiverse.Practice.Features.GenerateTest;

namespace Aptiverse.Practice.Agents;

/// <summary>
/// The MCP create_practice_quiz command on top of <see cref="GeneratePracticeTestHandler"/>, so limits, the one active
/// generation rule and idempotency are exactly the web flow's. A test always belongs to an assessment, so the quiz is
/// tied to the soonest upcoming assessment of the unit; a unit with none gets no quiz.
/// </summary>
internal sealed partial class PracticeQuizCommands(IAssessmentLookup assessments, GeneratePracticeTestHandler generator) : IPracticeQuizCommands
{
    public const string NoUpcomingAssessment = "practice.no_upcoming_assessment";
    public const string InvalidQuiz = "practice.invalid_quiz";

    public async Task<PracticeQuizOutcome> CreateQuizAsync(CreatePracticeQuiz command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);
        if (command.UserId == Guid.Empty
            || command.Topics is null
            || command.Topics.Count is < CreatePracticeQuiz.MinTopics or > CreatePracticeQuiz.MaxTopics
            || !command.Topics.All(TopicText.IsValid)
            || command.QuestionCount is < CreatePracticeQuiz.MinQuestionCount or > CreatePracticeQuiz.MaxQuestionCount
            || command.IdempotencyKey is null
            || !Key().IsMatch(command.IdempotencyKey))
        {
            return Failed(InvalidQuiz);
        }

        var open = await assessments.GetOpenForUserAsync(command.UserId, cancellationToken);
        var assessment = open.Where(a => a.StudyUnitId == command.StudyUnitId).OrderBy(a => a.DueAt).FirstOrDefault();
        if (assessment is null)
        {
            return Failed(NoUpcomingAssessment);
        }

        var topics = command.Topics
            .Select(t => t.Trim())
            .Select(t => t.Length <= PracticeTest.TopicMaxLength ? t : t[..PracticeTest.TopicMaxLength])
            .ToList();
        var request = new GeneratePracticeTestRequest(
            assessment.AssessmentId,
            PracticeFormats.Quiz,
            topics,
            Mode: PracticeModes.Untimed,
            QuestionCount: command.QuestionCount);

        var result = await generator.HandleAsync(command.UserId, request, command.IdempotencyKey, cancellationToken);
        return result.IsSuccess
            ? new PracticeQuizOutcome(null, result.Value.TestId, result.Value.JobId, result.Value.Status)
            : Failed(result.Error!.Code);
    }

    private static PracticeQuizOutcome Failed(string code) => new(code, null, null, null);

    [GeneratedRegex("^[A-Za-z0-9_-]{8,64}$")]
    private static partial Regex Key();
}
