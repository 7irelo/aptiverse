using FluentValidation;

namespace Aptiverse.Billing.Features.ListMyInvoices;

internal sealed class ListMyInvoicesValidator : AbstractValidator<ListMyInvoicesRequest>
{
    public ListMyInvoicesValidator()
    {
        RuleFor(r => r.Page).InclusiveBetween(1, 10_000);
        RuleFor(r => r.PageSize).InclusiveBetween(1, ListMyInvoicesRequest.MaxPageSize);
    }
}
