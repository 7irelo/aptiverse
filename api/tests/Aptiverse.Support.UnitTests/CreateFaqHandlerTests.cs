using Aptiverse.SharedKernel.Results;
using Aptiverse.Support.Contracts;
using Aptiverse.Support.Domain;
using Aptiverse.Support.Features.CreateFaq;
using Aptiverse.Support.Persistence;
using NSubstitute;
using Wolverine;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Support.UnitTests;

public sealed class CreateFaqHandlerTests : IAsyncDisposable
{
    private readonly FixedClock _clock = new(TestDb.Now);
    private readonly SupportDbContext _db;
    private readonly IDbContextOutbox<SupportDbContext> _outbox = Substitute.For<IDbContextOutbox<SupportDbContext>>();

    public CreateFaqHandlerTests()
    {
        _db = TestDb.Create(_clock);
        _outbox.DbContext.Returns(_db);
        _outbox.SaveChangesAndFlushMessagesAsync(Arg.Any<CancellationToken>())
            .Returns(call => _db.SaveChangesAsync(call.Arg<CancellationToken>()));
    }

    [Fact]
    public async Task Creates_faq_with_audit_timestamps_and_publishes_event()
    {
        var request = new CreateFaqRequest("  How long is a practice test?  ", "Most take 20 minutes.", "Practice tests", 40, true);

        var result = await Handler().HandleAsync(request, TestContext.Current.CancellationToken);

        Assert.True(result.IsSuccess);
        Assert.Equal("How long is a practice test?", result.Value.Question);

        var saved = Assert.Single(_db.Faqs);
        Assert.Equal(result.Value.Id, saved.Id);
        Assert.Equal(7, saved.Id.Version);
        Assert.Equal(TestDb.Now, saved.CreatedAt);
        Assert.Equal(TestDb.Now, saved.UpdatedAt);

        await _outbox.Received(1).PublishAsync(
            Arg.Is<FaqPublished>(e => e.FaqId == saved.Id && e.Category == "Practice tests"),
            Arg.Any<DeliveryOptions?>());
    }

    [Fact]
    public async Task Unpublished_faq_does_not_raise_event()
    {
        var request = new CreateFaqRequest("Draft?", "Not yet.", "General", 1, false);

        var result = await Handler().HandleAsync(request, TestContext.Current.CancellationToken);

        Assert.True(result.IsSuccess);
        await _outbox.DidNotReceive().PublishAsync(Arg.Any<FaqPublished>(), Arg.Any<DeliveryOptions?>());
    }

    [Fact]
    public async Task Duplicate_question_is_a_conflict()
    {
        _db.Faqs.Add(Faq.Create("What is Aptiverse?", "A study platform.", "Getting started", 10, true));
        await _db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var result = await Handler().HandleAsync(
            new CreateFaqRequest("What is Aptiverse?", "Duplicate.", "Getting started", 20, true),
            TestContext.Current.CancellationToken);

        Assert.True(result.IsFailure);
        Assert.Equal(ErrorType.Conflict, result.Error!.Type);
        Assert.Single(_db.Faqs);
    }

    public ValueTask DisposeAsync() => _db.DisposeAsync();

    private CreateFaqHandler Handler() => new(_outbox, _clock);
}
