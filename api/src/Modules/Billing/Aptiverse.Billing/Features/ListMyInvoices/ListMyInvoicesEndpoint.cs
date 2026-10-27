using System.Security.Claims;
using Aptiverse.Billing.Persistence;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Paging;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Billing.Features.ListMyInvoices;

/// <summary>The caller's own invoices and receipts, newest first.</summary>
internal sealed class ListMyInvoicesHandler(BillingDbContext db)
{
    public async Task<PagedResult<InvoiceSummary>> HandleAsync(Guid userId, ListMyInvoicesRequest request, CancellationToken cancellationToken)
    {
        var query = db.Invoices.AsNoTracking().Where(i => i.UserId == userId);
        var total = await query.LongCountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(i => i.IssuedAt)
            .ThenByDescending(i => i.Id)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(i => new InvoiceSummary(i.Id, i.Number, i.IssuedAt, i.TotalCents, i.VatCents, i.Currency, i.Status, i.IsTaxInvoice, i.PeriodStart, i.PeriodEnd))
            .ToListAsync(cancellationToken);
        return new PagedResult<InvoiceSummary>(items, request.Page, request.PageSize, total);
    }
}

internal static class ListMyInvoicesEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/invoices", HandleAsync)
            .WithName("listMyInvoices")
            .WithSummary("Your invoices and receipts")
            .RequirePermission(Permissions.Billing.Manage)
            .WithValidation<ListMyInvoicesRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    private static async Task<Ok<PagedResult<InvoiceSummary>>> HandleAsync(
        [AsParameters] ListMyInvoicesRequest request,
        ClaimsPrincipal user,
        ListMyInvoicesHandler handler,
        CancellationToken cancellationToken) =>
        TypedResults.Ok(await handler.HandleAsync(user.GetRequiredUserId(), request, cancellationToken));
}
