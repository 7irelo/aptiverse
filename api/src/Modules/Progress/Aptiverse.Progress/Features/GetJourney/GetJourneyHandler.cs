using System.Buffers.Text;
using System.Globalization;
using System.Text;
using Aptiverse.Progress.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Progress.Features.GetJourney;

/// <summary>Keyset cursor over (occurred_at, id), base64url so it is opaque to clients.</summary>
internal static class JourneyCursor
{
    public static string Encode(DateTimeOffset occurredAt, Guid id) =>
        Base64Url.EncodeToString(Encoding.UTF8.GetBytes(string.Create(CultureInfo.InvariantCulture, $"{occurredAt.UtcTicks}:{id:N}")));

    public static bool TryDecode(string cursor, out (DateTimeOffset OccurredAt, Guid Id) position)
    {
        position = default;
        if (string.IsNullOrEmpty(cursor) || cursor.Length > 100 || !Base64Url.IsValid(cursor))
        {
            return false;
        }

        var parts = Encoding.UTF8.GetString(Base64Url.DecodeFromChars(cursor)).Split(':');
        if (parts.Length != 2
            || !long.TryParse(parts[0], NumberStyles.None, CultureInfo.InvariantCulture, out var ticks)
            || ticks < DateTimeOffset.MinValue.UtcTicks || ticks > DateTimeOffset.MaxValue.UtcTicks
            || !Guid.TryParseExact(parts[1], "N", out var id))
        {
            return false;
        }

        position = (new DateTimeOffset(ticks, TimeSpan.Zero), id);
        return true;
    }

    public static IReadOnlyList<string> Kinds(string kinds)
    {
        ArgumentNullException.ThrowIfNull(kinds);
        return kinds.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    }
}

internal sealed class GetJourneyHandler(ProgressDbContext db)
{
    public async Task<JourneyPage> HandleAsync(Guid userId, GetJourneyRequest request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var events = db.JourneyEvents.AsNoTracking().Where(e => e.UserId == userId);
        if (request.Kinds is { } kinds)
        {
            var wanted = JourneyCursor.Kinds(kinds).ToList();
            events = events.Where(e => wanted.Contains(e.Kind));
        }

        if (request.Before is { } before && JourneyCursor.TryDecode(before, out var position))
        {
            var (at, id) = position;
            events = events.Where(e => e.OccurredAt < at || (e.OccurredAt == at && e.Id.CompareTo(id) < 0));
        }

        var page = await events
            .OrderByDescending(e => e.OccurredAt)
            .ThenByDescending(e => e.Id)
            .Take(request.Take + 1)
            .ToListAsync(cancellationToken);
        var hasMore = page.Count > request.Take;
        var items = page.Take(request.Take).ToList();
        var next = hasMore ? JourneyCursor.Encode(items[^1].OccurredAt, items[^1].Id) : null;
        return new JourneyPage(items.Select(e => new JourneyItem(e.Kind, e.Title, e.Link, e.OccurredAt)).ToList(), next);
    }
}
