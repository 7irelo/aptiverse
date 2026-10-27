using System.Text.Json;
using Aptiverse.AiTutor.Contracts;

namespace Aptiverse.AiTutor.AiService;

/// <summary>
/// Practice's view of the ai service: question generation and written grading over the same service-token client
/// as the tutor. Every transport or shape failure surfaces as <see cref="AiServiceUnavailableException"/>, so the
/// caller has one thing to retry on and never sees ai service internals.
/// </summary>
internal sealed class PracticeAiGateway(AiServiceClient client) : IQuestionGenerator, IGrader
{
    public async Task StartAsync(QuestionGenerationRequest request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var body = new GenerationStartBody(
            request.JobId,
            request.Stage,
            request.Level,
            request.Subject,
            request.SubjectKey,
            request.Grade,
            request.Curriculum,
            request.Format,
            request.Topics,
            request.AssessmentTitle,
            request.TotalMarks,
            request.AvoidQuestionStems);

        await GuardAsync(() => client.StartGenerationAsync(request.UserId, body, cancellationToken), cancellationToken);
    }

    public async Task<QuestionGenerationStatus> GetStatusAsync(Guid userId, string jobId, CancellationToken cancellationToken)
    {
        var wire = await GuardAsync(() => client.GetGenerationAsync(userId, jobId, cancellationToken), cancellationToken);
        if (wire is null)
        {
            return new QuestionGenerationStatus(QuestionGenerationStatus.NotFound, null, 0);
        }

        var status = wire.Status switch
        {
            QuestionGenerationStatus.Running or QuestionGenerationStatus.Review or QuestionGenerationStatus.Completed
                or QuestionGenerationStatus.Failed => wire.Status,
            _ => QuestionGenerationStatus.Failed,
        };

        var paper = status == QuestionGenerationStatus.Completed && wire.Result is { } result ? ToPaper(result) : null;
        if (status == QuestionGenerationStatus.Completed && paper is null)
        {
            status = QuestionGenerationStatus.Failed;
        }

        return new QuestionGenerationStatus(status, paper, Math.Max(0, wire.Usage?.CostUsdMicros ?? 0));
    }

    public async Task<WrittenGradingResult> GradeAsync(WrittenGradingRequest request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var body = new GradeBody(
            request.AttemptId,
            request.Level,
            request.Subject,
            request.Answers
                .Select(a => new GradeItemWire(a.QuestionId, a.Type, a.Stem, a.Marks, a.Memo, a.Answer, a.StudentAnswer))
                .ToList());

        var wire = await GuardAsync(() => client.GradeAsync(request.UserId, body, cancellationToken), cancellationToken);
        var answers = (wire.Answers ?? [])
            .Where(a => !string.IsNullOrEmpty(a.QuestionId))
            .Select(a => new GradedWrittenAnswer(
                a.QuestionId!,
                a.Awarded,
                a.MaxMarks,
                a.Method ?? string.Empty,
                a.NeedsReview,
                double.IsFinite(a.Confidence) ? Math.Clamp(a.Confidence, 0, 1) : 0,
                a.Feedback ?? string.Empty))
            .ToList();

        return new WrittenGradingResult(answers, Math.Max(0, wire.Usage?.CostUsdMicros ?? 0));
    }

    private static GeneratedPaper ToPaper(GeneratedPaperWire result) => new(
        (result.Sections ?? [])
            .Select(s => new GeneratedSection(
                s.Name ?? string.Empty,
                (s.Questions ?? [])
                    .Select(q => new GeneratedQuestion(
                        q.Id ?? string.Empty,
                        q.Type ?? string.Empty,
                        q.Topic ?? string.Empty,
                        q.CognitiveLevel ?? string.Empty,
                        q.Marks,
                        q.Stem ?? string.Empty,
                        (q.Options ?? []).Select(o => new GeneratedOption(o.Label ?? string.Empty, o.Text ?? string.Empty, o.Correct)).ToList(),
                        q.Answer ?? string.Empty,
                        q.Memo ?? string.Empty,
                        q.Explanation ?? string.Empty))
                    .ToList()))
            .ToList(),
        result.TotalMarks,
        result.Dropped ?? []);

    private static async Task GuardAsync(Func<Task> call, CancellationToken cancellationToken) =>
        await GuardAsync(async () =>
        {
            await call();
            return true;
        }, cancellationToken);

    private static async Task<T> GuardAsync<T>(Func<Task<T>> call, CancellationToken cancellationToken)
    {
        try
        {
            return await call();
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex) when (ex is HttpRequestException or AiServiceException or OperationCanceledException or JsonException)
        {
            throw new AiServiceUnavailableException("The ai service could not complete the call.", ex);
        }
    }
}
