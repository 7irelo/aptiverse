using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Support.Domain;

internal sealed class Faq : Entity
{
    public const int QuestionMaxLength = 300;
    public const int AnswerMaxLength = 4000;
    public const int CategoryMaxLength = 80;

    private Faq()
    {
    }

    public string Question { get; private set; } = string.Empty;

    public string Answer { get; private set; } = string.Empty;

    public string Category { get; private set; } = string.Empty;

    public int SortOrder { get; private set; }

    public bool IsPublished { get; private set; }

    public static Faq Create(string question, string answer, string category, int sortOrder, bool isPublished) => new()
    {
        Question = question.Trim(),
        Answer = answer.Trim(),
        Category = category.Trim(),
        SortOrder = sortOrder,
        IsPublished = isPublished,
    };
}
