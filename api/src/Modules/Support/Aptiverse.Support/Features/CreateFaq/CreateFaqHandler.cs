using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Aptiverse.Support.Contracts;
using Aptiverse.Support.Domain;
using Aptiverse.Support.Persistence;
using Microsoft.EntityFrameworkCore;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Support.Features.CreateFaq;

internal sealed class CreateFaqHandler(IDbContextOutbox<SupportDbContext> outbox, IClock clock)
{
    public static readonly Error DuplicateQuestion =
        Error.Conflict("support.faq.duplicate_question", "An FAQ with this question already exists.");

    public async Task<Result<CreateFaqResponse>> HandleAsync(CreateFaqRequest request, CancellationToken cancellationToken)
    {
        var db = outbox.DbContext;
        var question = request.Question.Trim();

        if (await db.Faqs.AnyAsync(f => f.Question == question, cancellationToken))
        {
            return DuplicateQuestion;
        }

        var faq = Faq.Create(question, request.Answer, request.Category, request.SortOrder, request.IsPublished);
        db.Faqs.Add(faq);

        if (faq.IsPublished)
        {
            // Stored in the outbox in the same transaction as the row, delivered after commit.
            await outbox.PublishAsync(new FaqPublished(faq.Id, faq.Category, clock.UtcNow));
        }

        await outbox.SaveChangesAndFlushMessagesAsync(cancellationToken);

        return new CreateFaqResponse(faq.Id, faq.Question, faq.Answer, faq.Category, faq.SortOrder, faq.IsPublished);
    }
}
