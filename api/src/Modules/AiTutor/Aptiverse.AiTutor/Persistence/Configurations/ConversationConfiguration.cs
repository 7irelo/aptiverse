using Aptiverse.AiTutor.Domain;
using Aptiverse.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aptiverse.AiTutor.Persistence.Configurations;

internal sealed class ConversationConfiguration : IEntityTypeConfiguration<Conversation>
{
    public void Configure(EntityTypeBuilder<Conversation> builder)
    {
        builder.ToTable("conversations", t =>
        {
            t.HasCheckConstraint("ck_conversations_mode", CheckConstraints.In("mode", ConversationModes.All));
            t.HasCheckConstraint("ck_conversations_message_count", "message_count >= 0");
        });

        builder.Property(c => c.UserId).IsRequired();
        builder.Property(c => c.Title).HasMaxLength(Conversation.TitleMaxLength).IsRequired();
        builder.Property(c => c.Mode).HasMaxLength(Conversation.ModeMaxLength).IsRequired();
        builder.Property(c => c.Summary).HasMaxLength(Conversation.SummaryMaxLength);
        builder.Property(c => c.MessageCount).IsRequired();

        // Serves the owner's list, most recently active first.
        builder.HasIndex(c => new { c.UserId, c.UpdatedAt });
    }
}
