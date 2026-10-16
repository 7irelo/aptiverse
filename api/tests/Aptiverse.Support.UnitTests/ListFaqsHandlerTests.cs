using Aptiverse.Support.Domain;
using Aptiverse.Support.Features.ListFaqs;

namespace Aptiverse.Support.UnitTests;

public sealed class ListFaqsHandlerTests
{
    [Fact]
    public async Task Returns_only_published_faqs_ordered_by_category_then_sort_order()
    {
        await using var db = TestDb.Create();
        db.Faqs.AddRange(
            Faq.Create("Second billing question", "a", "Subscriptions", 20, isPublished: true),
            Faq.Create("First billing question", "a", "Subscriptions", 10, isPublished: true),
            Faq.Create("Draft question", "a", "Getting started", 5, isPublished: false),
            Faq.Create("Practice question", "a", "Practice tests", 10, isPublished: true));
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var result = await new ListFaqsHandler(db).HandleAsync(TestContext.Current.CancellationToken);

        Assert.Equal(
            ["Practice question", "First billing question", "Second billing question"],
            result.Select(f => f.Question));
    }

    [Fact]
    public async Task Soft_deleted_faqs_are_hidden()
    {
        await using var db = TestDb.Create();
        var faq = Faq.Create("Old question", "a", "General", 1, isPublished: true);
        db.Faqs.Add(faq);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        db.Faqs.Remove(faq);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var result = await new ListFaqsHandler(db).HandleAsync(TestContext.Current.CancellationToken);

        Assert.Empty(result);
        Assert.NotNull(faq.DeletedAt);
    }
}
