using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Aptiverse.IntegrationTests;

/// <summary>
/// The generation and grading half of the ai stub. The first requested topic picks the generation scenario:
/// "[down]" refuses the start with 503, "[slow]" stays running, "[fail]" fails, "[junk]" completes with only invalid
/// questions; anything else completes with a small paper for the requested format. Grading awards full marks for
/// an answer containing "full", otherwise half marks, and fails with 503 when an answer contains "[down]".
/// </summary>
public static class Generation
{
    public const string Down = "[down]";
    public const string Slow = "[slow]";
    public const string Fail = "[fail]";
    public const string Junk = "[junk]";

    /// <summary>Marks of the quiz paper: two 2-mark multiple choice and one 3-mark short answer.</summary>
    public const int QuizMarks = 7;

    public const long GenerationCostUsdMicros = 9_000;

    internal static HttpResponseMessage Start(StubAiService stub, RecordedRequest request)
    {
        using var body = JsonDocument.Parse(request.Body);
        var root = body.RootElement.Clone();
        if (FirstTopic(root) == Down)
        {
            return new HttpResponseMessage(HttpStatusCode.ServiceUnavailable);
        }

        var jobId = root.GetProperty("job_id").GetString()!;
        stub.Jobs[jobId] = root;
        return Json(HttpStatusCode.Accepted, new JsonObject { ["job_id"] = jobId, ["status"] = "running" });
    }

    internal static HttpResponseMessage Status(StubAiService stub, string jobId)
    {
        if (!stub.Jobs.TryGetValue(jobId, out var request))
        {
            return Json(HttpStatusCode.NotFound, new JsonObject { ["code"] = "generation.not_found" });
        }

        var topic = FirstTopic(request);
        var usage = new JsonObject { ["calls"] = 3, ["cost_usd_micros"] = GenerationCostUsdMicros };
        return topic switch
        {
            Slow => Json(HttpStatusCode.OK, new JsonObject { ["job_id"] = jobId, ["status"] = "running", ["usage"] = usage }),
            Fail => Json(HttpStatusCode.OK, new JsonObject { ["job_id"] = jobId, ["status"] = "failed", ["usage"] = usage }),
            _ => Json(HttpStatusCode.OK, new JsonObject
            {
                ["job_id"] = jobId,
                ["status"] = "completed",
                ["result"] = topic == Junk ? JunkPaper() : Paper(request.GetProperty("format").GetString()!, topic),
                ["usage"] = usage,
            }),
        };
    }

    internal static HttpResponseMessage Grade(RecordedRequest request)
    {
        using var body = JsonDocument.Parse(request.Body);
        var answers = body.RootElement.GetProperty("answers").EnumerateArray().ToList();
        if (answers.Any(a => a.GetProperty("student_answer").GetString()!.Contains(Down, StringComparison.Ordinal)))
        {
            return new HttpResponseMessage(HttpStatusCode.ServiceUnavailable);
        }

        var graded = new JsonArray();
        var awardedTotal = 0;
        var maxTotal = 0;
        foreach (var answer in answers)
        {
            var marks = answer.GetProperty("marks").GetInt32();
            var full = answer.GetProperty("student_answer").GetString()!.Contains("full", StringComparison.OrdinalIgnoreCase);
            var awarded = full ? marks : marks / 2;
            awardedTotal += awarded;
            maxTotal += marks;
            graded.Add(new JsonObject
            {
                ["question_id"] = answer.GetProperty("question_id").GetString(),
                ["awarded"] = awarded,
                ["max_marks"] = marks,
                ["method"] = "model",
                ["needs_review"] = false,
                ["confidence"] = 0.9,
                ["feedback"] = full ? "Every memo point is covered." : "Good start; one memo point is missing.",
                ["points"] = new JsonArray(),
            });
        }

        return Json(HttpStatusCode.OK, new JsonObject
        {
            ["attempt_id"] = body.RootElement.GetProperty("attempt_id").GetString(),
            ["answers"] = graded,
            ["awarded"] = awardedTotal,
            ["max_marks"] = maxTotal,
            ["needs_review"] = false,
            ["usage"] = new JsonObject { ["calls"] = 1, ["cost_usd_micros"] = 1_234 },
        });
    }

    private static string FirstTopic(JsonElement request) =>
        request.GetProperty("topics").EnumerateArray().Select(t => t.GetString()!).FirstOrDefault() ?? string.Empty;

    private static JsonObject Paper(string format, string topic) => format switch
    {
        "exam_paper" => PaperOf(
            ("Section A: short questions", [Mcq("a1", topic, 2), Short("a2", topic, 3)]),
            ("Section B: structured questions", [Written("b1", "long", topic, 8)])),
        "reading" => PaperOf(("Comprehension", [Short("r1", topic, 3), Written("r2", "long", topic, 8)])),
        "flashcards" => PaperOf(("Flashcards", [Card("f1", topic), Card("f2", topic), Card("f3", topic)])),
        "essay" => PaperOf(("Essay", [Written("e1", "essay", topic, 50)])),
        _ => PaperOf(("Quiz", [Mcq("q1", topic, 2), Mcq("q2", topic, 2), Short("q3", topic, 3), BrokenMcq("q4", topic)])),
    };

    private static JsonObject PaperOf(params (string Name, JsonObject[] Questions)[] sections)
    {
        var array = new JsonArray();
        foreach (var (name, questions) in sections)
        {
            array.Add(new JsonObject { ["name"] = name, ["questions"] = new JsonArray(questions.Cast<JsonNode>().ToArray()) });
        }

        return new JsonObject { ["sections"] = array, ["total_marks"] = 0, ["dropped"] = new JsonArray(), ["unchecked"] = new JsonArray() };
    }

    private static JsonObject JunkPaper() => PaperOf(("Quiz", [BrokenMcq("j1", "x"), Question("j2", "riddle", "x", 2, "What?", [], "", "memo")]));

    private static JsonObject Mcq(string id, string topic, int marks) => Question(
        id,
        "mcq",
        topic,
        marks,
        $"Which option is right for {id}?",
        [("A", "Wrong", false), ("B", "Right", true), ("C", "Also wrong", false)],
        "B",
        "B is right because it is.");

    /// <summary>Two correct options: the API must drop it.</summary>
    private static JsonObject BrokenMcq(string id, string topic) => Question(
        id,
        "mcq",
        topic,
        2,
        "Which two are right?",
        [("A", "One", true), ("B", "Two", true), ("C", "Three", false)],
        "A",
        "Ambiguous.");

    private static JsonObject Short(string id, string topic, int marks) => Written(id, "short", topic, marks);

    private static JsonObject Written(string id, string type, string topic, int marks) => Question(
        id, type, topic, marks, $"Explain the idea behind {id}.", [], "The idea", "Names the idea\nGives an example\nLinks it to the topic");

    private static JsonObject Card(string id, string topic) => Question(id, "flashcard", topic, 1, $"Front of {id}", [], $"Back of {id}", $"Back of {id}");

    private static JsonObject Question(
        string id,
        string type,
        string topic,
        int marks,
        string stem,
        (string Label, string Text, bool Correct)[] options,
        string answer,
        string memo) => new()
        {
            ["id"] = id,
            ["type"] = type,
            ["topic"] = topic,
            ["cognitive_level"] = "routine",
            ["marks"] = marks,
            ["stem"] = stem,
            ["options"] = new JsonArray(options.Select(o => (JsonNode)new JsonObject { ["label"] = o.Label, ["text"] = o.Text, ["correct"] = o.Correct }).ToArray()),
            ["answer"] = answer,
            ["memo"] = memo,
            ["explanation"] = $"Worked explanation for {id}.",
        };

    private static HttpResponseMessage Json(HttpStatusCode status, JsonNode body) => new(status)
    {
        Content = new StringContent(body.ToJsonString(), Encoding.UTF8, "application/json"),
    };
}
