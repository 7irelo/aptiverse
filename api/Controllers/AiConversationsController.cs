using System.Security.Claims;
using System.Text.Json.Serialization;
using Aptiverse.AI.Domain.Models;
using Aptiverse.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.AI.Controllers
{
    // Server-backed history for the /dashboard/chatbot AI tutor. Each
    // conversation is a jsonb transcript owned by the student; the tutor
    // endpoint itself stays stateless (pure generation) and the client saves
    // the transcript here after each turn.
    [ApiController]
    [Route("api/ai/conversations")]
    [Authorize]
    public class AiConversationsController(ApplicationDbContext db) : ControllerBase
    {
        private readonly ApplicationDbContext _db = db;

        private const int TitleMaxLength = 80;

        // A student's history is a convenience, not an archive. Past twenty the
        // list stops being scannable and the rows are just cost, so creating the
        // twenty-first drops the least recently touched one. Students who want
        // it gone sooner can clear the lot; nothing here is silently kept.
        private const int MaxConversationsPerStudent = 20;

        private string? CurrentUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value;

        // GET /api/ai/conversations — the history list, newest activity first.
        [HttpGet]
        public async Task<IActionResult> List()
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var rows = await _db.Set<TutorConversation>()
                .AsNoTracking()
                .Where(c => c.StudentId == userId)
                .OrderByDescending(c => c.UpdatedAt)
                .ToListAsync();

            var list = rows.Select(c => new ConversationSummaryDto
            {
                Id = c.Id.ToString(),
                Title = c.Title,
                MessageCount = c.Messages.Count,
                Preview = PreviewOf(c.Messages),
                UpdatedAt = c.UpdatedAt,
            }).ToList();

            return Ok(list);
        }

        // GET /api/ai/conversations/{id} — the full transcript.
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string id)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!Guid.TryParse(id, out var guid)) return NotFound();

            var convo = await _db.Set<TutorConversation>()
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == guid && c.StudentId == userId);
            if (convo is null) return NotFound();

            return Ok(ToDto(convo));
        }

        // POST /api/ai/conversations — create a new conversation.
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SaveConversationDto body)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var now = DateTimeOffset.UtcNow;
            var messages = MapMessages(body.Messages);
            var convo = new TutorConversation
            {
                Id = Guid.NewGuid(),
                StudentId = userId,
                Title = ResolveTitle(body.Title, messages),
                Messages = messages,
                CreatedAt = now,
                UpdatedAt = now,
            };

            _db.Set<TutorConversation>().Add(convo);
            await TrimHistoryAsync(userId);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = convo.Id.ToString() }, ToDto(convo));
        }

        // DELETE /api/ai/conversations — clear the whole history.
        [HttpDelete]
        public async Task<IActionResult> Clear()
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            await _db.Set<TutorConversation>()
                .Where(c => c.StudentId == userId)
                .ExecuteDeleteAsync();

            return NoContent();
        }

        // Keeps the newest MaxConversationsPerStudent and drops the rest. Called
        // as part of the create transaction so the cap can't drift: the new row
        // is already tracked but unsaved, hence the -1 when counting what stays.
        private async Task TrimHistoryAsync(string userId)
        {
            var existing = await _db.Set<TutorConversation>()
                .Where(c => c.StudentId == userId)
                .OrderByDescending(c => c.UpdatedAt)
                .Select(c => new { c.Id, c.UpdatedAt })
                .ToListAsync();

            var keep = MaxConversationsPerStudent - 1;
            if (existing.Count <= keep) return;

            var doomed = existing.Skip(keep).Select(c => c.Id).ToList();
            await _db.Set<TutorConversation>()
                .Where(c => c.StudentId == userId && doomed.Contains(c.Id))
                .ExecuteDeleteAsync();
        }

        // PUT /api/ai/conversations/{id} — replace the transcript (and,
        // optionally, rename). The client sends the whole message list after
        // each turn; we overwrite and bump UpdatedAt.
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] SaveConversationDto body)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!Guid.TryParse(id, out var guid)) return NotFound();

            var convo = await _db.Set<TutorConversation>()
                .FirstOrDefaultAsync(c => c.Id == guid && c.StudentId == userId);
            if (convo is null) return NotFound();

            if (body.Messages is not null)
            {
                convo.Messages = MapMessages(body.Messages);
            }
            // A non-empty title in the payload renames; otherwise keep the
            // existing one, or derive it if it was still the placeholder.
            if (!string.IsNullOrWhiteSpace(body.Title))
            {
                convo.Title = Truncate(body.Title.Trim(), TitleMaxLength);
            }
            else if (string.IsNullOrWhiteSpace(convo.Title) || convo.Title == "New chat")
            {
                convo.Title = ResolveTitle(null, convo.Messages);
            }
            convo.UpdatedAt = DateTimeOffset.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(ToDto(convo));
        }

        // DELETE /api/ai/conversations/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var userId = CurrentUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            if (!Guid.TryParse(id, out var guid)) return NotFound();

            var convo = await _db.Set<TutorConversation>()
                .FirstOrDefaultAsync(c => c.Id == guid && c.StudentId == userId);
            if (convo is null) return NotFound();

            _db.Set<TutorConversation>().Remove(convo);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        private static List<TutorConversationMessage> MapMessages(IList<ConversationMessageDto>? messages) =>
            (messages ?? [])
                .Where(m => !string.IsNullOrWhiteSpace(m.Content))
                .Select(m => new TutorConversationMessage
                {
                    Role = m.Role == "assistant" ? "assistant" : "user",
                    Content = m.Content,
                })
                .ToList();

        private static string ResolveTitle(string? given, List<TutorConversationMessage> messages)
        {
            if (!string.IsNullOrWhiteSpace(given)) return Truncate(given.Trim(), TitleMaxLength);
            var firstUser = messages.FirstOrDefault(m => m.Role == "user");
            if (firstUser is not null && !string.IsNullOrWhiteSpace(firstUser.Content))
                return Truncate(firstUser.Content.Trim(), TitleMaxLength);
            return "New chat";
        }

        private static string PreviewOf(List<TutorConversationMessage> messages)
        {
            var last = messages.LastOrDefault();
            return last is null ? "" : Truncate(last.Content.Trim(), 120);
        }

        private static string Truncate(string s, int max)
        {
            s = s.ReplaceLineEndings(" ").Trim();
            return s.Length <= max ? s : s[..max].TrimEnd() + "…";
        }

        private static ConversationDto ToDto(TutorConversation c) => new()
        {
            Id = c.Id.ToString(),
            Title = c.Title,
            Messages = c.Messages
                .Select(m => new ConversationMessageDto { Role = m.Role, Content = m.Content })
                .ToList(),
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt,
        };
    }

    public record ConversationSummaryDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("messageCount")] public int MessageCount { get; init; }
        [JsonPropertyName("preview")] public string Preview { get; init; } = "";
        [JsonPropertyName("updatedAt")] public DateTimeOffset UpdatedAt { get; init; }
    }

    public record ConversationDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("messages")] public IList<ConversationMessageDto> Messages { get; init; } = [];
        [JsonPropertyName("createdAt")] public DateTimeOffset CreatedAt { get; init; }
        [JsonPropertyName("updatedAt")] public DateTimeOffset UpdatedAt { get; init; }
    }

    public record ConversationMessageDto
    {
        [JsonPropertyName("role")] public string Role { get; init; } = "user";
        [JsonPropertyName("content")] public string Content { get; init; } = "";
    }

    public record SaveConversationDto
    {
        [JsonPropertyName("title")] public string? Title { get; init; }
        [JsonPropertyName("messages")] public IList<ConversationMessageDto>? Messages { get; init; }
    }
}
