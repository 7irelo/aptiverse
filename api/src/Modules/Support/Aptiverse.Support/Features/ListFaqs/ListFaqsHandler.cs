using Aptiverse.Support.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Support.Features.ListFaqs;

internal sealed class ListFaqsHandler(SupportDbContext db)
{
    public async Task<IReadOnlyList<FaqResponse>> HandleAsync(CancellationToken cancellationToken) =>
        await db.Faqs
            .AsNoTracking()
            .Where(f => f.IsPublished)
            .OrderBy(f => f.Category)
            .ThenBy(f => f.SortOrder)
            .ThenBy(f => f.Question)
            .Select(f => new FaqResponse(f.Id, f.Question, f.Answer, f.Category, f.SortOrder))
            .ToListAsync(cancellationToken);
}
