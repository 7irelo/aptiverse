namespace Aptiverse.Mcp.Contracts;

/// <summary>
/// Scopes a delegated MCP token can carry. Each tool of the Aptiverse MCP server requires exactly one of them, and the
/// server checks it on every call whatever the model asked for. Parents and admins get no MCP scopes in v1.
/// </summary>
public static class McpScopes
{
    /// <summary>Read the student's own mastery and recent practice mistakes.</summary>
    public const string ReadProgress = "mcp.read.progress";

    /// <summary>Read the student's own upcoming assessments.</summary>
    public const string ReadAssessments = "mcp.read.assessments";

    /// <summary>Create a practice quiz for the student. Granted only for a turn that carries the student's confirmation.</summary>
    public const string WritePractice = "mcp.write.practice";

    public static IReadOnlyList<string> All { get; } = [ReadProgress, ReadAssessments, WritePractice];
}

/// <summary>Tool names of the Aptiverse MCP server, pinned on the ai side in aptiverse_ai/tools/mcp_tools.py.</summary>
public static class McpToolNames
{
    public const string GetTopicMastery = "get_topic_mastery";
    public const string ListUpcomingAssessments = "list_upcoming_assessments";
    public const string GetAttemptMistakes = "get_attempt_mistakes";
    public const string CreatePracticeQuiz = "create_practice_quiz";
}
