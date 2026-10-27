using Aptiverse.Mcp.Contracts;

namespace Aptiverse.Mcp.Tools;

/// <summary>
/// Names, descriptions and input schemas of the tools, identical to PINNED in ai/src/aptiverse_ai/tools/mcp_tools.py.
/// The ai side pins them so a changed server cannot widen what the model is told; the contract test fails if these drift.
/// Arguments are validated against the same schema.
/// </summary>
internal static class PinnedTools
{
    public static readonly ToolDefinition GetTopicMastery = new(
        McpToolNames.GetTopicMastery,
        "The student's measured mastery per topic (0 to 1) with the number of answered questions behind each "
        + "value. Use before saying anything about their strengths or weak topics.",
        """{"type":"object","additionalProperties":false,"properties":{"subject":{"type":"string","maxLength":60}}}""",
        McpScopes.ReadProgress);

    public static readonly ToolDefinition ListUpcomingAssessments = new(
        McpToolNames.ListUpcomingAssessments,
        "The student's upcoming tests, assignments and exams (title, subject, date). Use for planning help and "
        + "to recognise graded work.",
        """{"type":"object","additionalProperties":false,"properties":{"days":{"type":"integer","minimum":1,"maximum":90}}}""",
        McpScopes.ReadAssessments);

    public static readonly ToolDefinition GetAttemptMistakes = new(
        McpToolNames.GetAttemptMistakes,
        "Questions the student got wrong in recent practice, with the topic and what was expected. Use to target "
        + "explanations at real mistakes.",
        """{"type":"object","additionalProperties":false,"properties":{"subject":{"type":"string","maxLength":60},"limit":{"type":"integer","minimum":1,"maximum":10}}}""",
        McpScopes.ReadProgress);

    public static readonly ToolDefinition CreatePracticeQuiz = new(
        McpToolNames.CreatePracticeQuiz,
        "Create a short practice quiz for the student on given topics. Needs the student's confirmation first; "
        + "without it you get a proposal to show them.",
        """{"type":"object","additionalProperties":false,"properties":{"subject":{"type":"string","maxLength":60},"topics":{"type":"array","items":{"type":"string","maxLength":120},"minItems":1,"maxItems":5},"question_count":{"type":"integer","minimum":3,"maximum":10}},"required":["subject","topics"]}""",
        McpScopes.WritePractice);
}

/// <param name="Name">The pinned tool name.</param>
/// <param name="Description">The pinned description, written for the model.</param>
/// <param name="InputSchema">The pinned JSON schema of the arguments.</param>
/// <param name="Scope">The one scope the tool requires.</param>
internal sealed record ToolDefinition(string Name, string Description, string InputSchema, string Scope);
