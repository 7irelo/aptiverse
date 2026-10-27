namespace Aptiverse.Practice.Contracts;

/// <summary>
/// Recent wrong answers of one student, for the tutor's MCP tools. Only graded answers of the student's own submitted
/// attempts are returned; answers not marked yet are never treated as wrong. Another user's id simply returns nothing.
/// </summary>
public interface IPracticeMistakeLookup
{
    /// <param name="userId">The student.</param>
    /// <param name="studyUnitIds">Limit to these units; null for every unit.</param>
    /// <param name="limit">1 to 10.</param>
    /// <param name="cancellationToken">Cancels the read.</param>
    Task<IReadOnlyList<PracticeMistake>> GetRecentMistakesAsync(
        Guid userId,
        IReadOnlyCollection<Guid>? studyUnitIds,
        int limit,
        CancellationToken cancellationToken);
}

/// <param name="AttemptId">The graded attempt.</param>
/// <param name="QuestionId">The question answered wrongly.</param>
/// <param name="StudyUnitId">The unit the test belongs to.</param>
/// <param name="Subject">The unit's name when the test was generated.</param>
/// <param name="Topic">The question's topic.</param>
/// <param name="Question">The question text, clipped.</param>
/// <param name="ExpectedAnswer">The expected answer (the correct option for multiple choice), clipped.</param>
/// <param name="StudentAnswer">What the student answered (the chosen option for multiple choice), clipped; null when blank.</param>
/// <param name="MarksAwarded">Marks the answer earned.</param>
/// <param name="Marks">Marks the question was worth.</param>
/// <param name="SubmittedAt">When the attempt was submitted.</param>
public sealed record PracticeMistake(
    Guid AttemptId,
    Guid QuestionId,
    Guid StudyUnitId,
    string Subject,
    string Topic,
    string Question,
    string ExpectedAnswer,
    string? StudentAnswer,
    int MarksAwarded,
    int Marks,
    DateTimeOffset SubmittedAt);

/// <summary>
/// Creates a practice quiz on the same generation path as POST /practice/tests/generate, for callers that are not the
/// web app (the MCP create_practice_quiz tool). Limits, the one-generation-at-a-time rule and idempotency all apply.
/// The result carries ids and a status, never questions.
/// </summary>
public interface IPracticeQuizCommands
{
    Task<PracticeQuizOutcome> CreateQuizAsync(CreatePracticeQuiz command, CancellationToken cancellationToken);
}

/// <param name="UserId">The student.</param>
/// <param name="StudyUnitId">One of the student's units; the quiz is tied to its soonest upcoming assessment.</param>
/// <param name="Topics">1 to 5 plain text topics.</param>
/// <param name="QuestionCount">3 to 10.</param>
/// <param name="IdempotencyKey">8 to 64 letters, digits, dashes or underscores; a replay returns the same job.</param>
public sealed record CreatePracticeQuiz(Guid UserId, Guid StudyUnitId, IReadOnlyList<string> Topics, int QuestionCount, string IdempotencyKey)
{
    public const int MinTopics = 1;
    public const int MaxTopics = 5;
    public const int MinQuestionCount = 3;
    public const int MaxQuestionCount = 10;
}

/// <param name="ErrorCode">Null on success; otherwise a stable code such as "practice.daily_limit_reached".</param>
/// <param name="TestId">The test being generated, on success.</param>
/// <param name="JobId">The generation job, on success.</param>
/// <param name="Status">"queued", "running", "ready" or "failed" on success.</param>
public sealed record PracticeQuizOutcome(string? ErrorCode, Guid? TestId, Guid? JobId, string? Status)
{
    public bool Succeeded => ErrorCode is null;
}
