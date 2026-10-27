using System.Globalization;
using System.Text;
using Aptiverse.AiTutor.Contracts;

namespace Aptiverse.Practice.Generation;

/// <summary>What the job stores: the exact ai request plus the student's choices, for status and retries.</summary>
internal sealed record StoredGenerationRequest(
    Guid AssessmentId,
    Guid StudyUnitId,
    string Format,
    string Mode,
    string Difficulty,
    int? QuestionCount,
    int? PaperMarks,
    QuestionGenerationRequest Ai);

/// <summary>Turns Academics' level keys and unit names into the labels the ai service expects.</summary>
internal static class GenerationText
{
    public const int MaxSubjectKeyLength = 80;

    /// <summary>"grade_11" to "Grade 11", "first_year" to "First year", "phd" to "PhD".</summary>
    public static string HumanLevel(string levelKey)
    {
        ArgumentNullException.ThrowIfNull(levelKey);
        if (levelKey == "phd")
        {
            return "PhD";
        }

        var words = levelKey.Replace('_', ' ').Trim();
        return words.Length == 0 ? "Unknown level" : char.ToUpperInvariant(words[0]) + words[1..];
    }

    /// <summary>The high school grade from a "grade_N" key, otherwise null.</summary>
    public static int? Grade(string levelKey) =>
        levelKey is { Length: > 6 } && levelKey.StartsWith("grade_", StringComparison.Ordinal)
            && int.TryParse(levelKey.AsSpan(6), NumberStyles.None, CultureInfo.InvariantCulture, out var grade)
            && grade is >= 8 and <= 12
            ? grade
            : null;

    /// <summary>"Life Sciences" to "life_sciences": lower case ASCII letters and digits joined by underscores.</summary>
    public static string SubjectKey(string name)
    {
        ArgumentNullException.ThrowIfNull(name);
        var builder = new StringBuilder(name.Length);
        var pendingSeparator = false;
        foreach (var ch in name.Normalize(NormalizationForm.FormKD))
        {
            if (char.IsAsciiLetterOrDigit(ch))
            {
                if (pendingSeparator && builder.Length > 0)
                {
                    builder.Append('_');
                }

                builder.Append(char.ToLowerInvariant(ch));
                pendingSeparator = false;
            }
            else if (char.GetUnicodeCategory(ch) != UnicodeCategory.NonSpacingMark)
            {
                pendingSeparator = true;
            }
        }

        var key = builder.Length == 0 ? "general" : builder.ToString();
        return key.Length <= MaxSubjectKeyLength ? key : key[..MaxSubjectKeyLength].TrimEnd('_');
    }

    /// <summary>
    /// Marks to ask the ai service for. It sizes papers by marks only, so a question count becomes marks at the
    /// format's average marks per question (2.5 for a quiz, 5.5 for reading, 1 for flashcards).
    /// </summary>
    public static int? TotalMarks(string format, int questionCount, int? paperMarks) => format switch
    {
        Domain.PracticeFormats.ExamPaper => paperMarks,
        Domain.PracticeFormats.Quiz => Math.Clamp((int)Math.Round(questionCount * 2.5, MidpointRounding.AwayFromZero), 5, 300),
        Domain.PracticeFormats.Reading => Math.Clamp((int)Math.Round(questionCount * 5.5, MidpointRounding.AwayFromZero), 5, 300),
        Domain.PracticeFormats.Flashcards => Math.Clamp(questionCount, 5, 300),
        _ => null,
    };
}
