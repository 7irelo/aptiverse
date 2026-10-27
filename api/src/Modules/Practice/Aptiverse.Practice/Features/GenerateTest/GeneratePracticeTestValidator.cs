using Aptiverse.Practice.Domain;
using FluentValidation;

namespace Aptiverse.Practice.Features.GenerateTest;

internal sealed class GeneratePracticeTestValidator : AbstractValidator<GeneratePracticeTestRequest>
{
    public const int MinQuestionCount = 5;
    public const int MaxQuestionCount = 40;
    public const int MinPaperMarks = 30;
    public const int MaxPaperMarks = 150;

    public GeneratePracticeTestValidator()
    {
        RuleFor(r => r.AssessmentId).NotEmpty();
        RuleFor(r => r.Format).NotEmpty().Must(f => PracticeFormats.All.Contains(f))
            .WithMessage($"Format must be one of: {string.Join(", ", PracticeFormats.All)}.");

        RuleFor(r => r.Topics).Must(t => t is null || t.Count <= PracticeTest.MaxTopics)
            .WithMessage($"At most {PracticeTest.MaxTopics} topics.");
        RuleForEach(r => r.Topics).Must(TopicText.IsValid)
            .WithMessage($"Each topic must be 1 to {PracticeTest.TopicMaxLength} characters of plain text.");

        RuleFor(r => r.Mode).Must(m => m is null || PracticeModes.All.Contains(m))
            .WithMessage($"Mode must be one of: {string.Join(", ", PracticeModes.All)}.");
        RuleFor(r => r.Mode).Must((r, m) => m is null || PracticeFormats.ForcedMode(r.Format) is not { } forced || forced == m)
            .WithMessage("An exam paper is always timed and flashcards are always untimed.");
        RuleFor(r => r.Mode).NotNull()
            .When(r => PracticeFormats.All.Contains(r.Format) && PracticeFormats.ForcedMode(r.Format) is null)
            .WithMessage("Choose timed or untimed.");

        RuleFor(r => r.Difficulty).Must(d => d is null || Difficulties.All.Contains(d))
            .WithMessage($"Difficulty must be one of: {string.Join(", ", Difficulties.All)}.");

        RuleFor(r => r.DurationMinutes)
            .NotNull().InclusiveBetween(PracticeTest.MinDurationMinutes, PracticeTest.MaxDurationMinutes)
            .When(r => r.Format != PracticeFormats.ExamPaper && PracticeFormats.EffectiveMode(r.Format, r.Mode) == PracticeModes.Timed)
            .WithMessage($"A timed test needs a duration of {PracticeTest.MinDurationMinutes} to {PracticeTest.MaxDurationMinutes} minutes.");
        RuleFor(r => r.DurationMinutes).Null()
            .When(r => r.Format == PracticeFormats.ExamPaper || PracticeFormats.EffectiveMode(r.Format, r.Mode) == PracticeModes.Untimed)
            .WithMessage("Duration applies to timed tests only (an exam paper is timed by its marks).");

        RuleFor(r => r.QuestionCount).InclusiveBetween(MinQuestionCount, MaxQuestionCount)
            .When(r => PracticeFormats.UsesQuestionCount(r.Format) && r.QuestionCount is not null);
        RuleFor(r => r.QuestionCount).Null()
            .When(r => !PracticeFormats.UsesQuestionCount(r.Format))
            .WithMessage("Question count applies to quizzes, reading and flashcards only.");

        RuleFor(r => r.PaperMarks).NotNull().InclusiveBetween(MinPaperMarks, MaxPaperMarks)
            .When(r => r.Format == PracticeFormats.ExamPaper)
            .WithMessage($"An exam paper needs {MinPaperMarks} to {MaxPaperMarks} marks.");
        RuleFor(r => r.PaperMarks).Null()
            .When(r => r.Format != PracticeFormats.ExamPaper)
            .WithMessage("Paper marks apply to exam papers only.");
    }
}

/// <summary>Topic labels are plain text: no markup, no control characters, sensible length after trimming.</summary>
internal static class TopicText
{
    public static bool IsValid(string? topic)
    {
        if (topic is null)
        {
            return false;
        }

        var trimmed = topic.Trim();
        return trimmed.Length is >= 1 and <= PracticeTest.TopicMaxLength
            && !trimmed.Any(ch => char.IsControl(ch) || ch is '<' or '>' or '{' or '}' or '`');
    }
}
