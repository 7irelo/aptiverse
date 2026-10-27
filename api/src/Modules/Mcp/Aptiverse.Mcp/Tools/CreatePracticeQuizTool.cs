using System.Security.Cryptography;
using System.Text;
using Aptiverse.Academics.Contracts;
using Aptiverse.Practice.Contracts;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.Mcp.Tools;

/// <summary>
/// create_practice_quiz: starts a quiz generation on Practice's web path and returns the job id and status, never the
/// questions. The idempotency key is derived from the student and the delegated token's id, so one confirmed action
/// (one token, minted for one turn) creates at most one quiz however often the agent retries.
/// </summary>
internal sealed class CreatePracticeQuizTool() : AptiverseTool(PinnedTools.CreatePracticeQuiz)
{
    public const int DefaultQuestionCount = 5;

    public override bool Writes => true;

    public override async Task<ToolOutcome> ExecuteAsync(ToolCall call, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(call);
        var (units, failure) = await StudentUnits.ResolveAsync(
            call.Services.GetRequiredService<IStudyUnitLookup>(), call.UserId, call.String("subject"), cancellationToken);
        if (failure is not null)
        {
            return failure;
        }

        if (units.Count != 1)
        {
            return ToolOutcome.Fail(ToolOutcomes.UnknownSubject, "Name exactly one of the student's subjects or courses.");
        }

        var outcome = await call.Services.GetRequiredService<IPracticeQuizCommands>().CreateQuizAsync(
            new CreatePracticeQuiz(
                call.UserId,
                units[0].StudyUnitId,
                call.Strings("topics"),
                call.Int("question_count") ?? DefaultQuestionCount,
                IdempotencyKey(call.UserId, call.TokenId)),
            cancellationToken);

        return outcome.Succeeded
            ? ToolOutcome.Ok(new QuizResult(outcome.JobId!.Value, outcome.Status!), outcome.JobId)
            : outcome.ErrorCode switch
            {
                "practice.daily_limit_reached" => ToolOutcome.Fail(ToolOutcomes.DailyLimitReached, "The student has reached today's practice test limit."),
                "practice.generation_in_progress" => ToolOutcome.Fail(ToolOutcomes.GenerationInProgress, "Another practice test is still being generated. Wait for it to finish."),
                "practice.no_upcoming_assessment" => ToolOutcome.Fail(ToolOutcomes.NoUpcomingAssessment, "Practice quizzes are made for an upcoming assessment, and this subject has none."),
                "practice.invalid_quiz" => ToolOutcome.Fail(ToolOutcomes.InvalidArguments, "Topics must be plain text without markup."),
                "practice.limit_unavailable" => ToolOutcome.Fail(ToolOutcomes.Unavailable, "Practice is unavailable right now."),
                _ => ToolOutcome.Fail(ToolOutcomes.Failed, "The quiz could not be created."),
            };
    }

    /// <summary>"mcp-" plus 40 hex characters: inside Practice's 8 to 64 character key rule and not guessable from ids alone.</summary>
    internal static string IdempotencyKey(Guid userId, string tokenId)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes($"{userId:N}:{tokenId}"));
        return "mcp-" + Convert.ToHexStringLower(hash)[..40];
    }
}

internal sealed record QuizResult(Guid JobId, string Status);
