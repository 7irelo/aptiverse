using System.Globalization;
using System.Text;

namespace Aptiverse.Academics.Domain;

/// <summary>
/// Canonical keys for topics and courses. Two spellings that should be the same thing ("Trig Identities",
/// "trig  identities!") must produce the same key, and nothing a student types can produce a separator or a
/// non-ASCII character in a key.
/// </summary>
internal static class Slugs
{
    public const int TopicSlugMaxLength = 80;
    public const int KeyPartMaxLength = 120;

    private static readonly HashSet<string> StopWords = new(StringComparer.Ordinal) { "the", "and", "of" };

    /// <summary>
    /// Lowercase, ASCII fold, collapse separators to single hyphens and drop the stop words "the", "and" and "of"
    /// (unless the label is nothing but stop words). Empty when the label has no letters or digits.
    /// </summary>
    public static string Topic(string label)
    {
        var words = Words(label);
        var meaningful = words.Where(w => !StopWords.Contains(w)).ToList();
        return Join(meaningful.Count > 0 ? meaningful : words, TopicSlugMaxLength);
    }

    /// <summary>A course name as a key part: like <see cref="Topic"/> but keeps every word.</summary>
    public static string Name(string name) => Join(Words(name), KeyPartMaxLength);

    /// <summary>A course code as a key part: letters and digits only, so "MAM 1000W" and "mam1000w" match.</summary>
    public static string Code(string code) => string.Concat(Words(code));

    /// <summary>Trims and collapses inner whitespace so stored names never carry stray spacing.</summary>
    public static string CleanText(string text) =>
        string.Join(' ', text.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries));

    private static List<string> Words(string text)
    {
        var folded = new StringBuilder(text.Length);
        foreach (var c in text.Normalize(NormalizationForm.FormD))
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) == UnicodeCategory.NonSpacingMark)
            {
                continue;
            }

            folded.Append(char.IsAsciiLetterOrDigit(c) ? char.ToLowerInvariant(c) : ' ');
        }

        return folded.ToString().Split(' ', StringSplitOptions.RemoveEmptyEntries).ToList();
    }

    private static string Join(IEnumerable<string> words, int maxLength)
    {
        var joined = string.Join('-', words);
        return joined.Length <= maxLength ? joined : joined[..maxLength].TrimEnd('-');
    }
}

/// <summary>Day boundaries in South African Standard Time (UTC+2, no daylight saving), which v1 shows everywhere.</summary>
internal static class Sast
{
    public static readonly TimeSpan Offset = TimeSpan.FromHours(2);

    public static DateOnly Today(DateTimeOffset utcNow) => DateOnly.FromDateTime(utcNow.ToOffset(Offset).DateTime);

    public static DateTimeOffset StartOfDay(DateOnly date) => new(date.ToDateTime(TimeOnly.MinValue), Offset);
}

/// <summary>The window a unit's start date may fall in.</summary>
internal static class StartDates
{
    public static bool IsAllowed(DateOnly date, DateTimeOffset utcNow)
    {
        var today = Sast.Today(utcNow);
        return date >= today.AddYears(-6) && date <= today.AddYears(1);
    }
}
