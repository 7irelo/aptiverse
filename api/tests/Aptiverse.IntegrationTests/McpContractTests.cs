using System.Text.Json;
using System.Text.Json.Nodes;
using ModelContextProtocol.Protocol;

namespace Aptiverse.IntegrationTests;

/// <summary>
/// The server's tools must match what the ai service pins, or the tutor's model is told something the server does not
/// do (AI-195 tool poisoning). The expected JSON below is copied from PINNED in ai/src/aptiverse_ai/tools/mcp_tools.py;
/// change both together.
/// </summary>
[Collection(ApiTestGroup.Name)]
public sealed class McpContractTests(ApiFactory factory)
{
    // Copied from ai/src/aptiverse_ai/tools/mcp_tools.py (PINNED). Python's implicit string concatenation is joined here.
    private const string Pinned = """
        {
          "get_topic_mastery": {
            "description": "The student's measured mastery per topic (0 to 1) with the number of answered questions behind each value. Use before saying anything about their strengths or weak topics.",
            "inputSchema": {"type": "object", "additionalProperties": false, "properties": {"subject": {"type": "string", "maxLength": 60}}}
          },
          "list_upcoming_assessments": {
            "description": "The student's upcoming tests, assignments and exams (title, subject, date). Use for planning help and to recognise graded work.",
            "inputSchema": {"type": "object", "additionalProperties": false, "properties": {"days": {"type": "integer", "minimum": 1, "maximum": 90}}}
          },
          "get_attempt_mistakes": {
            "description": "Questions the student got wrong in recent practice, with the topic and what was expected. Use to target explanations at real mistakes.",
            "inputSchema": {
              "type": "object",
              "additionalProperties": false,
              "properties": {"subject": {"type": "string", "maxLength": 60}, "limit": {"type": "integer", "minimum": 1, "maximum": 10}}
            }
          },
          "create_practice_quiz": {
            "description": "Create a short practice quiz for the student on given topics. Needs the student's confirmation first; without it you get a proposal to show them.",
            "inputSchema": {
              "type": "object",
              "additionalProperties": false,
              "properties": {
                "subject": {"type": "string", "maxLength": 60},
                "topics": {"type": "array", "items": {"type": "string", "maxLength": 120}, "minItems": 1, "maxItems": 5},
                "question_count": {"type": "integer", "minimum": 3, "maximum": 10}
              },
              "required": ["subject", "topics"]
            }
          }
        }
        """;

    private readonly McpTestSupport _mcp = new(factory);

    [Fact]
    public async Task The_server_lists_exactly_the_pinned_tools_with_identical_descriptions_and_schemas()
    {
        Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);
        await using var client = await _mcp.ConnectAsync(_mcp.Token(Guid.CreateVersion7()));

        var listed = await client.ListToolsAsync(new ListToolsRequestParams(), McpTestSupport.Ct);
        var expected = JsonNode.Parse(Pinned)!.AsObject();

        Assert.Equal(expected.Select(p => p.Key).Order(StringComparer.Ordinal), listed.Tools.Select(t => t.Name).Order(StringComparer.Ordinal));
        foreach (var tool in listed.Tools)
        {
            var pinned = expected[tool.Name]!;
            Assert.Equal(pinned["description"]!.GetValue<string>(), tool.Description);
            var actual = JsonNode.Parse(tool.InputSchema.GetRawText());
            Assert.True(
                JsonNode.DeepEquals(pinned["inputSchema"], actual),
                $"{tool.Name}: expected {pinned["inputSchema"]!.ToJsonString()} but the server lists {tool.InputSchema.GetRawText()}");
        }
    }

    [Fact]
    public async Task Tool_results_carry_no_personal_details()
    {
        Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);
        var practice = new PracticeTestSupport(factory);
        var student = await practice.HighSchoolStudentAsync();
        await using var client = await _mcp.ConnectAsync(_mcp.Token(student.UserId));

        string[] forbidden = ["email", "name\"", "date_of_birth", "birth", "parent", "phone", "@"];
        foreach (var tool in new[] { "get_topic_mastery", "list_upcoming_assessments", "get_attempt_mistakes" })
        {
            var body = (await McpTestSupport.OkAsync(client, tool)).GetRawText();
            Assert.DoesNotContain(forbidden, f => body.Contains(f, StringComparison.OrdinalIgnoreCase));
        }

        var assessments = await McpTestSupport.OkAsync(client, "list_upcoming_assessments");
        var item = Assert.Single(assessments.GetProperty("assessments").EnumerateArray());
        Assert.Equal(["assessment_id", "title", "subject", "due_at"], item.EnumerateObject().Select(p => p.Name));
        Assert.Equal(JsonValueKind.String, item.GetProperty("due_at").ValueKind);
    }
}
