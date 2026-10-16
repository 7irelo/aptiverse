using Aptiverse.Support.Domain;
using FluentValidation;

namespace Aptiverse.Support.Features.CreateFaq;

internal sealed class CreateFaqValidator : AbstractValidator<CreateFaqRequest>
{
    public const int MaxSortOrder = 10_000;

    public CreateFaqValidator()
    {
        RuleFor(r => r.Question).NotEmpty().MaximumLength(Faq.QuestionMaxLength);
        RuleFor(r => r.Answer).NotEmpty().MaximumLength(Faq.AnswerMaxLength);
        RuleFor(r => r.Category).NotEmpty().MaximumLength(Faq.CategoryMaxLength);
        RuleFor(r => r.SortOrder).InclusiveBetween(0, MaxSortOrder);
    }
}
