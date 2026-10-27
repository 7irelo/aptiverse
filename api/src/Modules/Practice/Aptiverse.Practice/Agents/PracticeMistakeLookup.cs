using Aptiverse.Practice.Contracts;
using Aptiverse.Practice.Domain;
using Aptiverse.Practice.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Practice.Agents;

/// <summary>
/// Wrong answers from the student's own graded attempts, newest attempt first. Every table is filtered by the user id,
/// so a forged unit id or another user's id finds nothing. Pending and flashcard answers are never mistakes.
/// </summary>
internal sealed class PracticeMistakeLookup(PracticeDbContext db) : IPracticeMistakeLookup
{
    public const int MaxLimit = 10;
    public const int MaxTextLength = 500;
    public const int MaxStudentAnswerLength = 300;

    public async Task<IReadOnlyList<PracticeMistake>> GetRecentMistakesAsync(
        Guid userId,
        IReadOnlyCollection<Guid>? studyUnitIds,
        int limit,
        CancellationToken cancellationToken)
    {
        var take = Math.Clamp(limit, 1, MaxLimit);
        var units = studyUnitIds?.ToList();

        var rows = await (from a in db.Answers.AsNoTracking()
                          join at in db.Attempts.AsNoTracking() on a.AttemptId equals at.Id
                          join q in db.Questions.AsNoTracking() on a.QuestionId equals q.Id
                          join t in db.Tests.AsNoTracking() on q.TestId equals t.Id
                          where a.UserId == userId && at.UserId == userId && t.UserId == userId
                              && at.TestId == t.Id
                              && at.Status == AttemptStatuses.Graded
                              && a.IsCorrect == false
                              && a.GradedBy != GradedBy.Pending
                              && q.Kind != QuestionKinds.Flashcard
                              && (units == null || units.Contains(t.StudyUnitId))
                          orderby at.SubmittedAt descending, q.Position
                          select new
                          {
                              AttemptId = at.Id,
                              QuestionId = q.Id,
                              t.StudyUnitId,
                              t.SubjectSnapshot,
                              q.Topic,
                              q.Stem,
                              q.Kind,
                              q.Options,
                              q.AnswerIndex,
                              q.ExpectedAnswer,
                              a.SelectedIndex,
                              a.TextAnswer,
                              Awarded = a.AwardedMarks ?? 0,
                              q.Marks,
                              SubmittedAt = at.SubmittedAt ?? at.StartedAt,
                          })
            .Take(take)
            .ToListAsync(cancellationToken);

        return rows.Select(r => new PracticeMistake(
                r.AttemptId,
                r.QuestionId,
                r.StudyUnitId,
                r.SubjectSnapshot,
                r.Topic,
                Clip(r.Stem, MaxTextLength),
                Clip(Expected(r.Kind, r.Options, r.AnswerIndex, r.ExpectedAnswer), MaxTextLength),
                StudentAnswer(r.Kind, r.Options, r.SelectedIndex, r.TextAnswer),
                r.Awarded,
                r.Marks,
                r.SubmittedAt))
            .ToList();
    }

    private static string Expected(string kind, List<string> options, int? answerIndex, string? expected) =>
        kind == QuestionKinds.Mcq && answerIndex is { } key && key >= 0 && key < options.Count
            ? $"{Marking.OptionLabel(key)}. {options[key]}"
            : expected ?? string.Empty;

    private static string? StudentAnswer(string kind, List<string> options, int? selected, string? text)
    {
        if (kind == QuestionKinds.Mcq)
        {
            return selected is { } index && index >= 0 && index < options.Count
                ? Clip($"{Marking.OptionLabel(index)}. {options[index]}", MaxStudentAnswerLength)
                : null;
        }

        return string.IsNullOrWhiteSpace(text) ? null : Clip(text.Trim(), MaxStudentAnswerLength);
    }

    private static string Clip(string text, int max) => text.Length <= max ? text : text[..max];
}
