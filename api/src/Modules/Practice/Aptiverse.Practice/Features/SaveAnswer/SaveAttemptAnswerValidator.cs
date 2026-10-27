using Aptiverse.Practice.Domain;
using FluentValidation;

namespace Aptiverse.Practice.Features.SaveAnswer;

internal sealed class SaveAttemptAnswerValidator : AbstractValidator<SaveAttemptAnswerRequest>
{
    public const int MaxRevision = 100_000;

    public SaveAttemptAnswerValidator()
    {
        RuleFor(r => r)
            .Must(r => (r.SelectedIndex is not null ? 1 : 0) + (r.TextAnswer is not null ? 1 : 0) + (r.SelfRating is not null ? 1 : 0) == 1)
            .WithName("answer")
            .WithMessage("Send exactly one of selectedIndex, textAnswer or selfRating.");
        RuleFor(r => r.SelectedIndex).InclusiveBetween(0, Question.MaxOptions - 1);
        RuleFor(r => r.TextAnswer).MaximumLength(Answer.TextMaxLength)
            .Must(t => t is null || !t.Any(ch => char.IsControl(ch) && ch is not '\n' and not '\r' and not '\t'))
            .WithMessage("The answer contains characters that are not allowed.");
        RuleFor(r => r.SelfRating).Must(s => s is null || SelfRatings.All.Contains(s))
            .WithMessage($"Self rating must be one of: {string.Join(", ", SelfRatings.All)}.");
        RuleFor(r => r.BaseRevision).InclusiveBetween(0, MaxRevision);
    }
}
