using Aptiverse.SharedKernel.Paging;
using FluentValidation;

namespace Aptiverse.AiTutor.Features.ListConversations;

internal sealed class ListConversationsValidator : AbstractValidator<ListConversationsRequest>
{
    public ListConversationsValidator()
    {
        RuleFor(r => r.Page).GreaterThanOrEqualTo(1);
        RuleFor(r => r.PageSize).InclusiveBetween(1, PageRequest.MaxPageSize);
    }
}
