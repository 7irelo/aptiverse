namespace Aptiverse.AiTutor.Contracts;

/// <summary>
/// Starts and reads question generation jobs on the internal ai service. AiTutor owns the ai service edge (service
/// tokens, base URL, timeouts), so Practice never talks to the ai service directly. Every call is made for one user;
/// the ai service never reveals another user's job.
/// </summary>
public interface IQuestionGenerator
{
    /// <summary>
    /// Starts a generation job. Safe to repeat with the same job id: the ai service returns the existing job.
    /// Throws <see cref="AiServiceUnavailableException"/> when the ai service is unreachable or refuses the call.
    /// </summary>
    Task StartAsync(QuestionGenerationRequest request, CancellationToken cancellationToken);

    /// <summary>The job's current status. Throws <see cref="AiServiceUnavailableException"/> on transport failures.</summary>
    Task<QuestionGenerationStatus> GetStatusAsync(Guid userId, string jobId, CancellationToken cancellationToken);
}

/// <summary>Marks written answers through the ai service. Objective questions are marked by the caller.</summary>
public interface IGrader
{
    /// <summary>Throws <see cref="AiServiceUnavailableException"/> when the ai service cannot mark the answers.</summary>
    Task<WrittenGradingResult> GradeAsync(WrittenGradingRequest request, CancellationToken cancellationToken);
}

/// <param name="UserId">The student the job is for; becomes the subject of the service token.</param>
/// <param name="JobId">Idempotency key on the ai service, at most 64 characters.</param>
/// <param name="Stage">"high_school" or "university".</param>
/// <param name="Level">Human readable level, for example "Grade 11" or "First year".</param>
/// <param name="Subject">The study unit name.</param>
/// <param name="SubjectKey">A snake_case key for the subject, for example "life_sciences".</param>
/// <param name="Grade">High school grade 8 to 12, otherwise null.</param>
/// <param name="Curriculum">"caps" or "tertiary".</param>
/// <param name="Format">"quiz", "exam_paper", "reading", "flashcards" or "essay".</param>
/// <param name="Topics">1 to 20 topics.</param>
/// <param name="AssessmentTitle">The assessment the test prepares for.</param>
/// <param name="TotalMarks">5 to 300, or null for the format's default size.</param>
/// <param name="AvoidQuestionStems">Stems of earlier questions the generator should not repeat.</param>
public sealed record QuestionGenerationRequest(
    Guid UserId,
    string JobId,
    string Stage,
    string Level,
    string Subject,
    string SubjectKey,
    int? Grade,
    string Curriculum,
    string Format,
    IReadOnlyList<string> Topics,
    string? AssessmentTitle,
    int? TotalMarks,
    IReadOnlyList<string> AvoidQuestionStems);

/// <param name="Status">"running", "review", "completed", "failed" or "not_found".</param>
/// <param name="Result">The generated paper when completed.</param>
/// <param name="CostUsdMicros">Provider cost so far in millionths of a US dollar.</param>
public sealed record QuestionGenerationStatus(string Status, GeneratedPaper? Result, long CostUsdMicros)
{
    public const string Running = "running";
    public const string Review = "review";
    public const string Completed = "completed";
    public const string Failed = "failed";
    public const string NotFound = "not_found";
}

public sealed record GeneratedPaper(IReadOnlyList<GeneratedSection> Sections, int TotalMarks, IReadOnlyList<string> Dropped);

public sealed record GeneratedSection(string Name, IReadOnlyList<GeneratedQuestion> Questions);

/// <param name="Id">The ai service's id for the question.</param>
/// <param name="Type">"mcq", "short", "numeric", "long", "flashcard" or "essay".</param>
/// <param name="Topic">The topic the question tests.</param>
/// <param name="CognitiveLevel">"knowledge", "routine", "complex" or "problem_solving".</param>
/// <param name="Marks">Marks the question is worth.</param>
/// <param name="Stem">The question text (LaTeX between dollar signs).</param>
/// <param name="Options">Multiple choice options; empty for other types.</param>
/// <param name="Answer">The final answer; for flashcards the back of the card.</param>
/// <param name="Memo">Marking memo, one line per mark-earning point.</param>
/// <param name="Explanation">Worked explanation shown after marking.</param>
public sealed record GeneratedQuestion(
    string Id,
    string Type,
    string Topic,
    string CognitiveLevel,
    int Marks,
    string Stem,
    IReadOnlyList<GeneratedOption> Options,
    string Answer,
    string Memo,
    string Explanation);

public sealed record GeneratedOption(string Label, string Text, bool Correct);

/// <param name="UserId">The student whose answers are marked.</param>
/// <param name="AttemptId">Idempotency key on the ai service.</param>
/// <param name="Level">Human readable level, for example "Grade 11".</param>
/// <param name="Subject">The study unit name.</param>
/// <param name="Answers">1 to 100 answers.</param>
public sealed record WrittenGradingRequest(Guid UserId, string AttemptId, string Level, string Subject, IReadOnlyList<WrittenAnswer> Answers);

public sealed record WrittenAnswer(string QuestionId, string Type, string Stem, int Marks, string Memo, string Answer, string StudentAnswer);

public sealed record WrittenGradingResult(IReadOnlyList<GradedWrittenAnswer> Answers, long CostUsdMicros);

/// <param name="QuestionId">The id sent in the request.</param>
/// <param name="Awarded">Marks awarded, never trusted above the question's marks by the caller.</param>
/// <param name="MaxMarks">Marks available.</param>
/// <param name="Method">"deterministic", "model", "double", "escalated" or "blank".</param>
/// <param name="NeedsReview">The marker was not confident.</param>
/// <param name="Confidence">0 to 1.</param>
/// <param name="Feedback">Examiner-style feedback for the student.</param>
public sealed record GradedWrittenAnswer(
    string QuestionId,
    int Awarded,
    int MaxMarks,
    string Method,
    bool NeedsReview,
    double Confidence,
    string Feedback);

/// <summary>The ai service could not be reached, refused the call or answered in an unexpected shape.</summary>
public sealed class AiServiceUnavailableException : Exception
{
    public AiServiceUnavailableException()
    {
    }

    public AiServiceUnavailableException(string message)
        : base(message)
    {
    }

    public AiServiceUnavailableException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
