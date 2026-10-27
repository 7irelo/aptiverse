using Aptiverse.Billing.Domain;
using Aptiverse.Billing.Persistence;
using Aptiverse.Identity.Contracts;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Aptiverse.Billing.Invoicing;

/// <summary>
/// Issues the receipt (a tax invoice only when VAT registered) for a payment. Must run inside the caller's
/// transaction: the number is taken under the year's row lock, so numbering stays gapless when the transaction commits
/// and nothing is used up when it rolls back.
/// </summary>
internal sealed class InvoiceIssuer(BillingDbContext db, IUserDirectory users, IOptions<BillingOptions> options, IClock clock)
{
    public const string DeletedUserName = "Deleted user";

    private static readonly TimeZoneInfo Johannesburg = TimeZoneInfo.FindSystemTimeZoneById("Africa/Johannesburg");

    public async Task<Invoice> IssueAsync(Payment payment, string lineDescription, DateTimeOffset? periodStart, DateTimeOffset? periodEnd, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(payment);
        if (db.Database.CurrentTransaction is null)
        {
            throw new InvalidOperationException("Invoices are issued inside the payment's transaction.");
        }

        var now = clock.UtcNow;
        var year = TimeZoneInfo.ConvertTime(payment.PaidAt, Johannesburg).Year;
        await db.Database.ExecuteSqlAsync(
            $"""
            INSERT INTO billing.invoice_sequences (id, year, next_value, created_at, updated_at)
            VALUES ({Guid.CreateVersion7()}, {year}, 1, {now}, {now})
            ON CONFLICT (year) DO NOTHING
            """,
            cancellationToken);
        var taken = await db.Database.SqlQuery<int>(
            $"""
            UPDATE billing.invoice_sequences SET next_value = next_value + 1, updated_at = {now}
            WHERE year = {year}
            RETURNING next_value - 1 AS "Value"
            """).ToListAsync(cancellationToken);

        var contact = await users.GetContactAsync(payment.UserId, cancellationToken);
        var vat = options.Value.Vat;
        var split = MoneyMath.SplitInclusive(payment.AmountCents, vat.Registered, vat.RateBps);
        var invoice = Invoice.Issue(
            MoneyMath.InvoiceNumber(year, taken.Single()),
            payment.UserId,
            payment.SubscriptionId,
            split,
            payment.Currency,
            contact?.Name ?? DeletedUserName,
            contact?.Email ?? string.Empty,
            periodStart,
            periodEnd,
            payment.PaidAt);

        db.Invoices.Add(invoice);
        db.InvoiceLines.Add(InvoiceLine.Create(invoice.Id, lineDescription, 1, payment.AmountCents));
        payment.AttachInvoice(invoice.Id);
        return invoice;
    }
}
