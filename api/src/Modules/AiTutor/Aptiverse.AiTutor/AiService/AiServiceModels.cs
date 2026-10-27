using System.Text.Json;
using System.Text.Json.Serialization;

namespace Aptiverse.AiTutor.AiService;

// Wire models for the ai service (snake_case JSON). They mirror aptiverse_ai.graphs.tutor and stay internal:
// nothing here is part of this API's public contract.

/// <summary>Body of POST /v1/tutor/turn. Holds no email, name or date of birth by construction.</summary>
internal sealed record TutorTurnRequest(
    string ConversationId,
    string Mode,
    string Message,
    IReadOnlyList<HistoryTurn> History,
    string? Summary,
    StudentContext Context,
    bool AllowPrivateNotes,
    ConfirmedActionPayload? ConfirmedAction);

internal sealed record HistoryTurn(string Role, string Content)
{
    public const int ContentMaxLength = 12_000;
}

/// <summary>Built on the server from the student's own records, never from request fields.</summary>
internal sealed record StudentContext(
    string Stage,
    string Level,
    string Curriculum,
    IReadOnlyList<string> Subjects,
    IReadOnlyList<string> WeakestTopics,
    IReadOnlyList<string> OpenAssessments);

internal sealed record ConfirmedActionPayload(string Tool, JsonElement Arguments);

/// <summary>Identity and correlation for one call; becomes the claims of the service token.</summary>
internal sealed record AiCaller(Guid UserId, IReadOnlyCollection<string> Roles, string? RequestId);

/// <summary>An event streamed by the ai service during a tutor turn.</summary>
internal abstract record AiTutorEvent;

internal sealed record AiRouteEvent(string Intent, bool GradedWork) : AiTutorEvent;

internal sealed record AiTokenEvent(string Text) : AiTutorEvent;

internal sealed record AiToolCallEvent(string Name, bool Ok) : AiTutorEvent;

internal sealed record AiCitationEvent(
    string? ChunkId,
    string? Title,
    int? Page,
    IReadOnlyList<string>? HeadingPath,
    string? Licence,
    string? DisplayRule,
    bool Private) : AiTutorEvent;

internal sealed record AiConfirmEvent(string Tool, JsonElement Arguments) : AiTutorEvent;

internal sealed record AiDoneEvent(string? Route, IReadOnlyList<AiUsage>? Usage, long CostUsdMicros) : AiTutorEvent
{
    public int InputTokens => Sum(u => u.InputTokens + u.CacheReadInputTokens + u.CacheCreationInputTokens);

    public int OutputTokens => Sum(u => u.OutputTokens);

    private int Sum(Func<AiUsage, long> selector) =>
        (int)Math.Clamp((Usage ?? []).Sum(u => Math.Max(0, selector(u))), 0, int.MaxValue);
}

internal sealed record AiUsage(
    long InputTokens,
    long OutputTokens,
    long CacheReadInputTokens,
    long CacheCreationInputTokens,
    long CostUsdMicros);

internal sealed record AiErrorEvent(string Code) : AiTutorEvent;

internal static class AiServiceJson
{
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
        RespectNullableAnnotations = true,
        NumberHandling = JsonNumberHandling.Strict,
    };

    /// <summary>Parses one SSE event. Unknown event types return null so new ai events do not break the relay.</summary>
    public static AiTutorEvent? Parse(string eventType, string data) => eventType switch
    {
        "route" => Deserialize<AiRouteEvent>(data),
        "token" => Deserialize<AiTokenEvent>(data),
        "tool_call" => Deserialize<AiToolCallEvent>(data),
        "citation" => Deserialize<AiCitationEvent>(data),
        "confirm" => Deserialize<AiConfirmEvent>(data),
        "done" => Deserialize<AiDoneEvent>(data),
        "error" => Deserialize<AiErrorEvent>(data),
        _ => null,
    };

    private static T Deserialize<T>(string data) =>
        JsonSerializer.Deserialize<T>(data, Options) ?? throw new JsonException($"The ai service sent an empty {typeof(T).Name}.");
}

// Wire models for question generation and grading (aptiverse_ai.graphs.generation and aptiverse_ai.graphs.grading).
// Optional strings are nullable so a missing field becomes a dropped question, never a deserialisation crash.

/// <summary>Body of POST /v1/generations.</summary>
internal sealed record GenerationStartBody(
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

/// <summary>Body of GET /v1/generations/{job_id} and of the POST answer.</summary>
internal sealed record GenerationStatusWire(string? JobId, string? Status, GeneratedPaperWire? Result, UsageSummaryWire? Usage);

internal sealed record GeneratedPaperWire(IReadOnlyList<GeneratedSectionWire>? Sections, int TotalMarks, IReadOnlyList<string>? Dropped);

internal sealed record GeneratedSectionWire(string? Name, IReadOnlyList<GeneratedQuestionWire>? Questions);

internal sealed record GeneratedQuestionWire(
    string? Id,
    string? Type,
    string? Topic,
    string? CognitiveLevel,
    int Marks,
    string? Stem,
    IReadOnlyList<GeneratedOptionWire>? Options,
    string? Answer,
    string? Memo,
    string? Explanation);

internal sealed record GeneratedOptionWire(string? Label, string? Text, bool Correct);

/// <summary>The usage summary the ai service attaches to results; only the cost is kept.</summary>
internal sealed record UsageSummaryWire(long CostUsdMicros);

/// <summary>Body of POST /v1/grade.</summary>
internal sealed record GradeBody(string AttemptId, string Level, string Subject, IReadOnlyList<GradeItemWire> Answers);

internal sealed record GradeItemWire(string QuestionId, string Type, string Stem, int Marks, string Memo, string Answer, string StudentAnswer);

internal sealed record GradeResultWire(IReadOnlyList<GradedAnswerWire>? Answers, UsageSummaryWire? Usage);

internal sealed record GradedAnswerWire(
    string? QuestionId,
    int Awarded,
    int MaxMarks,
    string? Method,
    bool NeedsReview,
    double Confidence,
    string? Feedback);
