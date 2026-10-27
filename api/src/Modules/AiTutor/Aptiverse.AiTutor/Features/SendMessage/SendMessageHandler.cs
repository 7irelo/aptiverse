using System.Data.Common;
using System.Net.ServerSentEvents;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using Aptiverse.AiTutor.AiService;
using Aptiverse.AiTutor.Contracts;
using Aptiverse.AiTutor.Domain;
using Aptiverse.AiTutor.Persistence;
using Aptiverse.Identity.Contracts;
using Aptiverse.SharedKernel.Persistence;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.AiTutor.Features.SendMessage;

/// <summary>A turn that passed every check: the user message is saved and counted against the daily limit.</summary>
internal sealed record PreparedTurn(
    Conversation Conversation,
    Message UserMessage,
    SendMessageRequest Request,
    StudentProfile Profile,
    IReadOnlyList<HistoryTurn> History);

/// <summary>
/// Runs one tutor turn in two steps. <see cref="PrepareAsync"/> checks ownership, the profile and the daily
/// limit and saves the user message, so failures are plain ProblemDetails. <see cref="StreamAsync"/> then
/// relays the ai service's events to the client and always saves the assistant message, complete or not.
/// </summary>
internal sealed partial class SendMessageHandler(
    IDbContextOutbox<AiTutorDbContext> outbox,
    IStudentProfileLookup profiles,
    AiServiceClient ai,
    IClock clock,
    IOptions<AiServiceOptions> options,
    ILogger<SendMessageHandler> logger)
{
    public static readonly Error DailyLimitReached = Error.TooManyRequests(
        "ai.daily_limit_reached",
        "You have reached today's tutor message limit. It resets at midnight UTC.");

    public static readonly Error LimitUnavailable = Error.Unavailable(
        "ai.limit_unavailable",
        "The tutor is unavailable right now. Please try again in a moment.");

    public static readonly Error ProfileRequired = Error.Conflict(
        "ai.profile_required",
        "Finish setting up your study profile before chatting with the tutor.");

    // Keeps the advisory lock keys of this module apart from any other module's.
    private const long LockNamespace = 0x0041_6954_7574_6F72;
    private const int MaxSaveAttempts = 3;

    private AiTutorDbContext Db => outbox.DbContext;

    public async Task<Result<PreparedTurn>> PrepareAsync(
        Guid userId,
        Guid conversationId,
        SendMessageRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var conversation = await Db.Conversations
            .SingleOrDefaultAsync(c => c.Id == conversationId && c.UserId == userId, cancellationToken);
        if (conversation is null)
        {
            return ConversationErrors.NotFound;
        }

        var profile = await profiles.GetAsync(userId, cancellationToken);
        if (profile is null)
        {
            return ProfileRequired;
        }

        var history = await LoadHistoryAsync(conversation, cancellationToken);

        var reserved = await ReserveAsync(conversation, request.Message.Trim(), cancellationToken);
        if (reserved.IsFailure)
        {
            return reserved.Error!;
        }

        return new PreparedTurn(conversation, reserved.Value, request, profile, history);
    }

    public async IAsyncEnumerable<SseItem<object>> StreamAsync(
        PreparedTurn turn,
        AiCaller caller,
        [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(turn);

        var outcome = new TurnOutcome();
        var saved = false;
        var events = ai.StreamTutorTurnAsync(caller, BuildRequest(turn), cancellationToken).GetAsyncEnumerator(cancellationToken);
        try
        {
            while (outcome.Done is null && outcome.ErrorCode is null)
            {
                var next = await NextAsync(events, outcome, cancellationToken);
                if (next is null)
                {
                    break;
                }

                if (Relay(next, outcome) is { } item)
                {
                    yield return item;
                }
            }

            // An event stream that ends without done is a broken turn, however politely it closed.
            if (outcome.Done is null)
            {
                outcome.ErrorCode ??= TutorStreamErrorCodes.Interrupted;
            }

            var message = await PersistAsync(turn, outcome);
            saved = true;

            if (outcome.ErrorCode is null && message is not null)
            {
                yield return new SseItem<object>(new TutorDoneEvent(message.Id, outcome.Route), "done");
            }
            else if (outcome.ErrorCode != TutorStreamErrorCodes.Cancelled)
            {
                yield return new SseItem<object>(
                    new TutorErrorEvent(outcome.ErrorCode ?? TutorStreamErrorCodes.TurnFailed, message?.Id),
                    "error");
            }
        }
        finally
        {
            // The client can go away at any yield; whatever arrived is still saved.
            if (!saved)
            {
                outcome.ErrorCode ??= TutorStreamErrorCodes.Cancelled;
                await PersistAsync(turn, outcome);
            }

            await events.DisposeAsync();
        }
    }

    private async Task<AiTutorEvent?> NextAsync(IAsyncEnumerator<AiTutorEvent> events, TurnOutcome outcome, CancellationToken cancellationToken)
    {
        try
        {
            return await events.MoveNextAsync() ? events.Current : null;
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            outcome.ErrorCode = TutorStreamErrorCodes.Cancelled;
        }
        catch (OperationCanceledException ex)
        {
            outcome.ErrorCode = TutorStreamErrorCodes.Timeout;
            LogAiFailure(logger, outcome.ErrorCode, ex);
        }
        catch (AiServiceException ex)
        {
            outcome.ErrorCode = TutorStreamErrorCodes.Unavailable;
            LogAiFailure(logger, outcome.ErrorCode, ex);
        }
        catch (HttpRequestException ex)
        {
            outcome.ErrorCode = outcome.Received ? TutorStreamErrorCodes.Interrupted : TutorStreamErrorCodes.Unavailable;
            LogAiFailure(logger, outcome.ErrorCode, ex);
        }
        catch (Exception ex) when (ex is IOException or JsonException)
        {
            outcome.ErrorCode = TutorStreamErrorCodes.Interrupted;
            LogAiFailure(logger, outcome.ErrorCode, ex);
        }

        return null;
    }

    private static SseItem<object>? Relay(AiTutorEvent next, TurnOutcome outcome)
    {
        outcome.Received = true;
        switch (next)
        {
            case AiRouteEvent route:
                outcome.Route = CleanIntent(route.Intent);
                return new SseItem<object>(new TutorRouteEvent(outcome.Route ?? string.Empty, route.GradedWork), "route");
            case AiTokenEvent token when !string.IsNullOrEmpty(token.Text):
                return RelayToken(token.Text, outcome);
            case AiToolCallEvent tool:
                return new SseItem<object>(new TutorToolCallEvent(tool.Name ?? string.Empty, tool.Ok), "tool_call");
            case AiCitationEvent c:
                return new SseItem<object>(
                    new TutorCitationEvent(c.ChunkId, c.Title, c.Page, c.HeadingPath ?? [], c.Licence, c.DisplayRule, c.Private),
                    "citation");
            case AiConfirmEvent confirm:
                return new SseItem<object>(new TutorConfirmEvent(confirm.Tool ?? string.Empty, confirm.Arguments.Clone()), "confirm");
            case AiDoneEvent done:
                outcome.Done = done;
                outcome.Route ??= CleanIntent(done.Route);
                return null;
            case AiErrorEvent:
                // The ai service's own code can name internals; the client always gets a stable one.
                outcome.ErrorCode = TutorStreamErrorCodes.TurnFailed;
                return null;
            default:
                return null;
        }
    }

    private static SseItem<object>? RelayToken(string token, TurnOutcome outcome)
    {
        var room = Message.ContentMaxLength - outcome.Text.Length;
        if (room <= 0)
        {
            outcome.Truncated = true;
            return null;
        }

        var text = token.Length <= room ? token : token[..room];
        outcome.Truncated |= text.Length < token.Length;
        outcome.Text.Append(text);
        return new SseItem<object>(new TutorTokenEvent(text), "token");
    }

    private static TutorTurnRequest BuildRequest(PreparedTurn turn)
    {
        var profile = turn.Profile;
        var university = profile.Stage == "university";
        var curriculum = university
            ? "tertiary"
            : profile.Curriculum is { Length: > 0 } examBody ? $"caps ({examBody})" : "caps";

        // Subjects, weakest topics and open assessments join once the modules that own them exist.
        var context = new StudentContext(profile.Stage, profile.Level, curriculum, [], [], []);
        var action = turn.Request.ConfirmedAction is { } confirmed
            ? new ConfirmedActionPayload(confirmed.Tool, confirmed.Arguments.Clone())
            : null;

        return new TutorTurnRequest(
            turn.Conversation.Id.ToString(),
            turn.Conversation.Mode,
            turn.UserMessage.Content,
            turn.History,
            turn.Conversation.Summary,
            context,
            turn.Request.AllowPrivateNotes && university,
            action);
    }

    private async Task<IReadOnlyList<HistoryTurn>> LoadHistoryAsync(Conversation conversation, CancellationToken cancellationToken)
    {
        var take = options.Value.HistoryTurns;
        if (take == 0)
        {
            return [];
        }

        var recent = await Db.Messages
            .AsNoTracking()
            .Where(m => m.ConversationId == conversation.Id && m.UserId == conversation.UserId)
            .Where(m => m.Content != string.Empty && (m.Role == MessageRoles.User || m.Status != MessageStatuses.Failed))
            .OrderByDescending(m => m.CreatedAt)
            .ThenByDescending(m => m.Id)
            .Take(take)
            .Select(m => new { m.Role, m.Content })
            .ToListAsync(cancellationToken);

        recent.Reverse();
        return recent
            .Select(m => new HistoryTurn(
                m.Role,
                m.Content.Length <= HistoryTurn.ContentMaxLength ? m.Content : m.Content[..HistoryTurn.ContentMaxLength]))
            .ToList();
    }

    /// <summary>
    /// Counts today's messages and saves the new one under a per-user advisory lock, so parallel requests
    /// cannot overshoot the limit. Deleted messages still count, or deleting a chat would reset the limit.
    /// Fails closed: if the count cannot be made, the message is refused.
    /// </summary>
    private async Task<Result<Message>> ReserveAsync(Conversation conversation, string text, CancellationToken cancellationToken)
    {
        var userId = conversation.UserId;
        var since = new DateTimeOffset(clock.UtcNow.UtcDateTime.Date, TimeSpan.Zero);
        try
        {
            await using var transaction = await Db.Database.BeginTransactionAsync(cancellationToken);
            await Db.Database.ExecuteSqlAsync($"SELECT pg_advisory_xact_lock({LockKey(userId)})", cancellationToken);

            var used = await Db.Messages
                .IgnoreQueryFilters([ModuleDbContext.SoftDeleteFilter])
                .CountAsync(m => m.UserId == userId && m.Role == MessageRoles.User && m.CreatedAt >= since, cancellationToken);
            if (used >= options.Value.DailyMessageLimit)
            {
                return DailyLimitReached;
            }

            var message = Message.FromUser(conversation, text);
            Db.Messages.Add(message);
            await SaveCountingAsync(conversation, text, ct => Db.SaveChangesAsync(ct), cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return message;
        }
        catch (Exception ex) when (ex is DbException or DbUpdateException or InvalidOperationException or TimeoutException)
        {
            LogLimitUnavailable(logger, ex);
            return LimitUnavailable;
        }
    }

    private async Task<Message?> PersistAsync(PreparedTurn turn, TurnOutcome outcome)
    {
        var text = outcome.Text.ToString();
        var status = outcome.ErrorCode is null && !outcome.Truncated
            ? MessageStatuses.Complete
            : text.Length > 0 ? MessageStatuses.Incomplete : MessageStatuses.Failed;
        var done = outcome.Done;
        var message = Message.FromAssistant(
            turn.Conversation,
            text,
            status,
            outcome.Route,
            done?.InputTokens ?? 0,
            done?.OutputTokens ?? 0,
            done?.CostUsdMicros ?? 0);

        try
        {
            Db.Messages.Add(message);
            if (done is not null)
            {
                await outbox.PublishAsync(new TutorTurnCompleted(
                    turn.Conversation.UserId,
                    turn.Conversation.Id,
                    message.Id,
                    turn.Conversation.Mode,
                    message.InputTokens,
                    message.OutputTokens,
                    message.CostUsdMicros,
                    clock.UtcNow));
            }

            // Not the request token: a client that disconnected still gets its partial answer saved.
            await SaveCountingAsync(turn.Conversation, null, ct => outbox.SaveChangesAndFlushMessagesAsync(ct), CancellationToken.None);
            return message;
        }
        catch (Exception ex) when (ex is DbException or DbUpdateException or InvalidOperationException)
        {
            LogPersistFailed(logger, turn.Conversation.Id, ex);
            return null;
        }
    }

    private async Task SaveCountingAsync(
        Conversation conversation,
        string? firstUserMessage,
        Func<CancellationToken, Task> save,
        CancellationToken cancellationToken)
    {
        for (var attempt = 1; ; attempt++)
        {
            conversation.RecordMessage(firstUserMessage);
            try
            {
                await save(cancellationToken);
                return;
            }
            catch (DbUpdateConcurrencyException) when (attempt < MaxSaveAttempts)
            {
                // Another turn in the same conversation bumped the count first; take its value and retry.
                await Db.Entry(conversation).ReloadAsync(cancellationToken);
            }
        }
    }

    private static long LockKey(Guid userId)
    {
        Span<byte> bytes = stackalloc byte[16];
        userId.TryWriteBytes(bytes);
        return BitConverter.ToInt64(bytes[..8]) ^ BitConverter.ToInt64(bytes[8..]) ^ LockNamespace;
    }

    private static string? CleanIntent(string? intent)
    {
        if (string.IsNullOrWhiteSpace(intent))
        {
            return null;
        }

        var trimmed = intent.Trim();
        return trimmed.Length <= Message.RouteIntentMaxLength && trimmed.All(ch => char.IsAsciiLetterOrDigit(ch) || ch == '_')
            ? trimmed
            : null;
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "Tutor turn ended early with {Code}")]
    private static partial void LogAiFailure(ILogger logger, string code, Exception exception);

    [LoggerMessage(Level = LogLevel.Error, Message = "Could not check the daily tutor limit; refusing the message")]
    private static partial void LogLimitUnavailable(ILogger logger, Exception exception);

    [LoggerMessage(Level = LogLevel.Error, Message = "Could not save the assistant message of conversation {ConversationId}")]
    private static partial void LogPersistFailed(ILogger logger, Guid conversationId, Exception exception);

    private sealed class TurnOutcome
    {
        public StringBuilder Text { get; } = new();

        public bool Received { get; set; }

        public bool Truncated { get; set; }

        public string? Route { get; set; }

        public AiDoneEvent? Done { get; set; }

        public string? ErrorCode { get; set; }
    }
}
