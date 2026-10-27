using System.Collections.Concurrent;
using System.Net;
using System.Text;

namespace Aptiverse.IntegrationTests;

/// <summary>
/// Stands in for the Python ai service behind the typed client. The student's message picks the scenario:
/// "[break]" ends the stream without done, "[error]" sends an error event, "[down]" answers 503, anything
/// else streams a complete turn. Every request is recorded so tests can inspect the token and the body.
/// </summary>
public sealed class StubAiService
{
    public const string AnswerText = "Photosynthesis turns light into chemical energy.";
    public const long CostUsdMicros = 4_321;
    public const int InputTokens = 120;
    public const int CacheReadTokens = 30;
    public const int OutputTokens = 45;

    public ConcurrentQueue<RecordedRequest> Requests { get; } = new();

    public IEnumerable<RecordedRequest> For(string path) => Requests.Where(r => r.Path == path);

    internal static HttpResponseMessage Respond(RecordedRequest request)
    {
        if (request.Path == "/v1/users/me/data" && request.Method == HttpMethod.Delete)
        {
            return new HttpResponseMessage(HttpStatusCode.NoContent);
        }

        if (request.Path != "/v1/tutor/turn" || request.Method != HttpMethod.Post)
        {
            return new HttpResponseMessage(HttpStatusCode.NotFound);
        }

        if (request.Body.Contains("[down]", StringComparison.Ordinal))
        {
            return new HttpResponseMessage(HttpStatusCode.ServiceUnavailable);
        }

        var sse = new StringBuilder();
        sse.Append(": ping\n\n");
        Event(sse, "route", """{"type":"route","intent":"explain","graded_work":false}""");
        Event(sse, "token", """{"type":"token","text":"Photosynthesis turns "}""");

        if (request.Body.Contains("[break]", StringComparison.Ordinal))
        {
            // The connection drops mid-answer: no done event follows.
            return Stream(sse);
        }

        if (request.Body.Contains("[error]", StringComparison.Ordinal))
        {
            Event(sse, "error", """{"type":"error","code":"internal.secret_detail"}""");
            return Stream(sse);
        }

        Event(sse, "token", """{"type":"token","text":"light into chemical energy."}""");
        Event(sse, "tool_call", """{"type":"tool_call","name":"search_curriculum","ok":true}""");
        Event(sse, "citation", """{"type":"citation","chunk_id":"c1","title":"Life Sciences Grade 11","page":42,"heading_path":["Energy","Photosynthesis"],"licence":"cc-by","display_rule":"quote","private":false}""");
        Event(sse, "done", $$"""{"type":"done","route":"explain","usage":[{"provider":"anthropic","model":"m","tier":"standard","input_tokens":{{InputTokens}},"output_tokens":{{OutputTokens}},"cache_read_input_tokens":{{CacheReadTokens}},"cache_creation_input_tokens":0,"cost_usd_micros":{{CostUsdMicros}},"batch":false}],"cost_usd_micros":{{CostUsdMicros}},"citations":[],"tool_calls":[]}""");
        return Stream(sse);
    }

    private static void Event(StringBuilder sse, string name, string data) =>
        sse.Append("event: ").Append(name).Append("\ndata: ").Append(data).Append("\n\n");

    private static HttpResponseMessage Stream(StringBuilder sse) => new(HttpStatusCode.OK)
    {
        Content = new StringContent(sse.ToString(), Encoding.UTF8, "text/event-stream"),
    };
}

public sealed record RecordedRequest(HttpMethod Method, string Path, string? Authorization, string Body);

/// <summary>Primary handler of the ai client in tests. A new one per handler rotation; the state is shared.</summary>
internal sealed class StubAiHandler(StubAiService stub) : HttpMessageHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var body = request.Content is null ? string.Empty : await request.Content.ReadAsStringAsync(cancellationToken);
        var recorded = new RecordedRequest(
            request.Method,
            request.RequestUri!.AbsolutePath,
            request.Headers.Authorization?.ToString(),
            body);
        stub.Requests.Enqueue(recorded);
        return StubAiService.Respond(recorded);
    }
}
