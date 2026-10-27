namespace Aptiverse.Billing.Features.ListMyInvoices;

/// <param name="Page">1-based page.</param>
/// <param name="PageSize">1 to 50, default 20.</param>
internal sealed record ListMyInvoicesRequest(int Page = 1, int PageSize = ListMyInvoicesRequest.DefaultPageSize)
{
    public const int DefaultPageSize = 20;
    public const int MaxPageSize = 50;
}

/// <param name="Id">The invoice.</param>
/// <param name="Number">Gapless per year, for example APT-2026-000123.</param>
/// <param name="IssuedAt">When it was issued.</param>
/// <param name="TotalCents">What was paid, in cents.</param>
/// <param name="VatCents">VAT inside the total; 0 unless VAT registered.</param>
/// <param name="Currency">Always "ZAR" in v1.</param>
/// <param name="Status">"paid", "refunded", "partially_refunded" or "void".</param>
/// <param name="IsTaxInvoice">True only when VAT registered; otherwise it is a receipt.</param>
/// <param name="PeriodStart">The period paid for.</param>
/// <param name="PeriodEnd">The end of the period paid for.</param>
internal sealed record InvoiceSummary(
    Guid Id,
    string Number,
    DateTimeOffset IssuedAt,
    long TotalCents,
    long VatCents,
    string Currency,
    string Status,
    bool IsTaxInvoice,
    DateTimeOffset? PeriodStart,
    DateTimeOffset? PeriodEnd);
