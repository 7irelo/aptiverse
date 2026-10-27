using System.Globalization;
using Aptiverse.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Identity.Features.Common;

/// <summary>Strong ETags over the xmin row version, for optimistic concurrency on profile and onboarding writes (If-Match).</summary>
internal static class ETags
{
    public static string Format(uint version) => $"\"{version.ToString(CultureInfo.InvariantCulture)}\"";

    public static string Of(DbContext db, object entity)
    {
        ArgumentNullException.ThrowIfNull(db);
        return Format((uint)db.Entry(entity).Property(ModuleDbContext.ConcurrencyTokenProperty).CurrentValue!);
    }

    /// <summary>
    /// With no If-Match the write is unconditional. Otherwise the entity's original version becomes the If-Match value,
    /// so saving fails with a concurrency error when the row moved on. Returns false for a value this API never issued.
    /// </summary>
    public static bool ApplyIfMatch(DbContext db, object entity, string? ifMatch)
    {
        ArgumentNullException.ThrowIfNull(db);
        if (string.IsNullOrWhiteSpace(ifMatch))
        {
            return true;
        }

        var value = ifMatch.Trim();
        if (value.StartsWith("W/", StringComparison.Ordinal))
        {
            value = value[2..];
        }

        if (value.Length < 3 || value[0] != '"' || value[^1] != '"'
            || !uint.TryParse(value.AsSpan(1, value.Length - 2), NumberStyles.None, CultureInfo.InvariantCulture, out var version))
        {
            return false;
        }

        db.Entry(entity).Property(ModuleDbContext.ConcurrencyTokenProperty).OriginalValue = version;
        return true;
    }
}
