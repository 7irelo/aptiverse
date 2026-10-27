using System.Net;
using System.Net.Http.Headers;
using System.Net.ServerSentEvents;
using System.Runtime.CompilerServices;
using System.Text.Json;
using Aptiverse.Identity.Contracts;
using Microsoft.Extensions.Options;

namespace Aptiverse.AiTutor.AiService;

/// <summary>
/// Calls the internal ai service. Every call carries a fresh ES256 service token for one user and one scope,
/// minted by Identity, so the ai service never sees a user's access token and cannot be called without one.
/// </summary>
internal sealed class AiServiceClient(HttpClient http, IServiceTokenIssuer tokens, IOptions<AiServiceOptions> options)
{
    public const string HttpClientName = "aptiverse-ai";
    public const string TutorScope = "ai.tutor";
    public const string NotesScope = "ai.notes";
    public const string GenerateScope = "ai.generate";
    public const string GradeScope = "ai.grade";

    public static readonly TimeSpan TokenLifetime = TimeSpan.FromSeconds(60);

    private static readonly MediaTypeHeaderValue JsonMediaType = new("application/json") { CharSet = "utf-8" };
    private static readonly MediaTypeWithQualityHeaderValue EventStream = new("text/event-stream");

    /// <summary>
    /// Streams the events of one tutor turn. The whole stream is bounded by the configured timeout. Throws
    /// <see cref="AiServiceException"/> when the ai service refuses the call or answers with something other
    /// than an event stream.
    /// </summary>
    public async IAsyncEnumerable<AiTutorEvent> StreamTutorTurnAsync(
        AiCaller caller,
        TutorTurnRequest body,
        [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(caller);
        ArgumentNullException.ThrowIfNull(body);

        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeout.CancelAfter(TimeSpan.FromSeconds(options.Value.TimeoutSeconds));

        using var request = new HttpRequestMessage(HttpMethod.Post, "v1/tutor/turn");
        request.Content = new ByteArrayContent(JsonSerializer.SerializeToUtf8Bytes(body, AiServiceJson.Options));
        request.Content.Headers.ContentType = JsonMediaType;
        request.Headers.Accept.Add(EventStream);
        Authorize(request, caller, TutorScope);

        using var response = await http.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, timeout.Token);
        if (!response.IsSuccessStatusCode)
        {
            throw new AiServiceException($"The ai service refused the tutor turn with {(int)response.StatusCode}.", response.StatusCode);
        }

        if (response.Content.Headers.ContentType?.MediaType != EventStream.MediaType)
        {
            throw new AiServiceException("The ai service did not answer with an event stream.", response.StatusCode);
        }

        await using var stream = await response.Content.ReadAsStreamAsync(timeout.Token);
        await foreach (var item in SseParser.Create(stream).EnumerateAsync(timeout.Token))
        {
            if (AiServiceJson.Parse(item.EventType, item.Data) is { } parsed)
            {
                yield return parsed;
            }
        }
    }

    /// <summary>Removes the user's private notes and embeddings from the ai service. Safe to repeat.</summary>
    public async Task DeleteUserDataAsync(Guid userId, string? requestId, CancellationToken cancellationToken)
    {
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeout.CancelAfter(TimeSpan.FromSeconds(options.Value.TimeoutSeconds));

        using var request = new HttpRequestMessage(HttpMethod.Delete, "v1/users/me/data");
        Authorize(request, new AiCaller(userId, [], requestId), NotesScope);

        using var response = await http.SendAsync(request, timeout.Token);
        if (!response.IsSuccessStatusCode)
        {
            throw new AiServiceException($"The ai service refused to delete user data with {(int)response.StatusCode}.", response.StatusCode);
        }
    }

    /// <summary>Starts a generation job; the ai service answers 202 and runs it in the background.</summary>
    public async Task StartGenerationAsync(Guid userId, GenerationStartBody body, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(body);
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeout.CancelAfter(TimeSpan.FromSeconds(options.Value.TimeoutSeconds));

        using var request = new HttpRequestMessage(HttpMethod.Post, "v1/generations");
        request.Content = JsonContent(body);
        Authorize(request, new AiCaller(userId, [], null), GenerateScope);

        using var response = await http.SendAsync(request, timeout.Token);
        if (!response.IsSuccessStatusCode)
        {
            throw new AiServiceException($"The ai service refused the generation with {(int)response.StatusCode}.", response.StatusCode);
        }
    }

    /// <summary>The job's status, or null when the ai service does not know the job (404).</summary>
    public async Task<GenerationStatusWire?> GetGenerationAsync(Guid userId, string jobId, CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(jobId);
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeout.CancelAfter(TimeSpan.FromSeconds(options.Value.TimeoutSeconds));

        using var request = new HttpRequestMessage(HttpMethod.Get, "v1/generations/" + Uri.EscapeDataString(jobId));
        Authorize(request, new AiCaller(userId, [], null), GenerateScope);

        using var response = await http.SendAsync(request, timeout.Token);
        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }

        if (!response.IsSuccessStatusCode)
        {
            throw new AiServiceException($"The ai service refused the generation status with {(int)response.StatusCode}.", response.StatusCode);
        }

        return await ReadJsonAsync<GenerationStatusWire>(response, timeout.Token);
    }

    /// <summary>Marks answers. Safe to repeat for the same attempt id: the ai service returns the stored result.</summary>
    public async Task<GradeResultWire> GradeAsync(Guid userId, GradeBody body, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(body);
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeout.CancelAfter(TimeSpan.FromSeconds(options.Value.TimeoutSeconds));

        using var request = new HttpRequestMessage(HttpMethod.Post, "v1/grade");
        request.Content = JsonContent(body);
        Authorize(request, new AiCaller(userId, [], null), GradeScope);

        using var response = await http.SendAsync(request, timeout.Token);
        if (!response.IsSuccessStatusCode)
        {
            throw new AiServiceException($"The ai service refused to grade with {(int)response.StatusCode}.", response.StatusCode);
        }

        return await ReadJsonAsync<GradeResultWire>(response, timeout.Token);
    }

    private static ByteArrayContent JsonContent<T>(T body)
    {
        var content = new ByteArrayContent(JsonSerializer.SerializeToUtf8Bytes(body, AiServiceJson.Options));
        content.Headers.ContentType = JsonMediaType;
        return content;
    }

    private static async Task<T> ReadJsonAsync<T>(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        if (response.Content.Headers.ContentType?.MediaType != "application/json")
        {
            throw new AiServiceException("The ai service did not answer with JSON.", response.StatusCode);
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        return await JsonSerializer.DeserializeAsync<T>(stream, AiServiceJson.Options, cancellationToken)
            ?? throw new AiServiceException("The ai service sent an empty body.", response.StatusCode);
    }

    private void Authorize(HttpRequestMessage request, AiCaller caller, string scope)
    {
        var token = tokens.Issue(new ServiceTokenRequest(
            caller.UserId,
            caller.Roles,
            [scope],
            options.Value.Audience,
            TokenLifetime,
            caller.RequestId));
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }
}

/// <summary>The ai service was reachable but refused a call or answered in an unexpected shape.</summary>
internal sealed class AiServiceException : Exception
{
    public AiServiceException()
    {
    }

    public AiServiceException(string message)
        : base(message)
    {
    }

    public AiServiceException(string message, Exception innerException)
        : base(message, innerException)
    {
    }

    public AiServiceException(string message, HttpStatusCode statusCode)
        : base(message)
    {
        StatusCode = statusCode;
    }

    public HttpStatusCode? StatusCode { get; }
}
