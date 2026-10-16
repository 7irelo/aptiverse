using Aptiverse.Support.Features.CreateFaq;

namespace Aptiverse.Support.UnitTests;

public sealed class CreateFaqValidatorTests
{
    private static readonly CreateFaqRequest Valid =
        new("How do I reset my password?", "Use the Forgot password link on the sign-in page.", "Account", 10, true);

    private readonly CreateFaqValidator _validator = new();

    [Fact]
    public void Valid_request_passes()
    {
        Assert.True(_validator.Validate(Valid).IsValid);
    }

    [Theory]
    [InlineData("", "answer", "category", nameof(CreateFaqRequest.Question))]
    [InlineData("question", " ", "category", nameof(CreateFaqRequest.Answer))]
    [InlineData("question", "answer", "", nameof(CreateFaqRequest.Category))]
    public void Blank_fields_fail(string question, string answer, string category, string expectedProperty)
    {
        var result = _validator.Validate(Valid with { Question = question, Answer = answer, Category = category });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == expectedProperty);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(CreateFaqValidator.MaxSortOrder + 1)]
    public void Sort_order_out_of_range_fails(int sortOrder)
    {
        var result = _validator.Validate(Valid with { SortOrder = sortOrder });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(CreateFaqRequest.SortOrder));
    }

    [Fact]
    public void Question_longer_than_column_fails()
    {
        var result = _validator.Validate(Valid with { Question = new string('q', 301) });

        Assert.False(result.IsValid);
    }
}
