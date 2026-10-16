using Aptiverse.SharedKernel.Seeding;
using Aptiverse.Support.Domain;
using Aptiverse.Support.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Support.Seeding;

/// <summary>
/// Inserts the starter FAQs that are missing, matched by question. Rows an admin soft-deleted are not revived.
/// </summary>
internal sealed class SupportSeeder(SupportDbContext db, ILogger<SupportSeeder> logger) : IDataSeeder
{
    internal static readonly IReadOnlyList<(string Category, int SortOrder, string Question, string Answer)> Faqs =
    [
        ("Getting started", 10, "What is Aptiverse?",
            "Aptiverse is a study platform for high school and university students in South Africa. You add your subjects or courses, practise with tests built for your level, and track how your marks are moving."),
        ("Getting started", 20, "Is Aptiverse only for high school learners?",
            "No. High school learners pick their CAPS subjects, and university students add their own courses and year of study, so practice matches the level you are working at."),
        ("Studying", 10, "How should I use Aptiverse in a normal study week?",
            "Pick one or two subjects a day, do a short practice test, then review the questions you got wrong. Small daily sessions beat a single long session the night before a test."),
        ("Studying", 20, "Can I study on my phone?",
            "Yes. Aptiverse is built for mobile first, so practice tests, results and your study plan all work on a phone browser."),
        ("Practice tests", 10, "How are practice tests generated?",
            "Questions are generated for the subject, topic and level you choose, then checked for format before you see them. Each test is new, so you are not memorising the same paper."),
        ("Practice tests", 20, "Why can I only attempt a practice test once?",
            "One attempt keeps your results honest. Your score reflects what you actually know, which makes the progress tracking and recommendations useful."),
        ("Practice tests", 30, "What happens if I switch tabs during a test?",
            "Leaving the test tab is recorded on your attempt, the same way an invigilator would note it. It does not end the test, but it shows on your result."),
        ("Subscriptions", 10, "Do I need a subscription to use Aptiverse?",
            "You can explore Aptiverse for free. A subscription unlocks more practice tests and the full progress tools."),
        ("Subscriptions", 20, "How do I pay for a subscription?",
            "Payments are processed securely by Paystack in rand. You can pay by card, and your subscription renews automatically until you cancel."),
        ("Subscriptions", 30, "How do I cancel my subscription?",
            "Open your account settings and choose Manage subscription. You keep access until the end of the period you have already paid for."),
    ];

    public async Task SeedAsync(CancellationToken cancellationToken)
    {
        var existing = await db.Faqs
            .IgnoreQueryFilters()
            .Select(f => f.Question)
            .ToListAsync(cancellationToken);
        var known = existing.ToHashSet(StringComparer.Ordinal);

        var missing = Faqs.Where(f => !known.Contains(f.Question)).ToList();
        foreach (var (category, sortOrder, question, answer) in missing)
        {
            db.Faqs.Add(Faq.Create(question, answer, category, sortOrder, isPublished: true));
        }

        await db.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Support seed: {Inserted} FAQs inserted, {Skipped} already present", missing.Count, Faqs.Count - missing.Count);
    }
}
