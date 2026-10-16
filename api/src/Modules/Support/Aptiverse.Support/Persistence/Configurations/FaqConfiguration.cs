using Aptiverse.Support.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aptiverse.Support.Persistence.Configurations;

internal sealed class FaqConfiguration : IEntityTypeConfiguration<Faq>
{
    public void Configure(EntityTypeBuilder<Faq> builder)
    {
        builder.ToTable("faqs");

        builder.Property(f => f.Question).HasMaxLength(Faq.QuestionMaxLength).IsRequired();
        builder.Property(f => f.Answer).HasMaxLength(Faq.AnswerMaxLength).IsRequired();
        builder.Property(f => f.Category).HasMaxLength(Faq.CategoryMaxLength).IsRequired();
        builder.Property(f => f.SortOrder).IsRequired();
        builder.Property(f => f.IsPublished).IsRequired();

        // Serves the public list query: published rows ordered by category, then sort order.
        builder.HasIndex(f => new { f.IsPublished, f.Category, f.SortOrder });

        builder.HasIndex(f => f.Question).IsUnique().HasFilter("deleted_at IS NULL");
    }
}
