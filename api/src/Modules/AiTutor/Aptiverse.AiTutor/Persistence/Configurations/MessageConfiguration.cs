using Aptiverse.AiTutor.Domain;
using Aptiverse.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aptiverse.AiTutor.Persistence.Configurations;

internal sealed class MessageConfiguration : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        builder.ToTable("messages", t =>
        {
            t.HasCheckConstraint("ck_messages_role", CheckConstraints.In("role", MessageRoles.All));
            t.HasCheckConstraint("ck_messages_status", CheckConstraints.In("status", MessageStatuses.All));
            t.HasCheckConstraint("ck_messages_usage", "input_tokens >= 0 AND output_tokens >= 0 AND cost_usd_micros >= 0");
        });

        builder.Property(m => m.ConversationId).IsRequired();
        builder.Property(m => m.UserId).IsRequired();
        builder.Property(m => m.Role).HasMaxLength(Message.RoleMaxLength).IsRequired();
        builder.Property(m => m.Content).HasMaxLength(Message.ContentMaxLength).IsRequired();
        builder.Property(m => m.Status).HasMaxLength(Message.StatusMaxLength).IsRequired();
        builder.Property(m => m.RouteIntent).HasMaxLength(Message.RouteIntentMaxLength);

        // The FK index; also serves loading a conversation's messages in order.
        builder.HasIndex(m => new { m.ConversationId, m.CreatedAt });

        // Serves the daily message limit: the user's messages since UTC midnight.
        builder.HasIndex(m => new { m.UserId, m.CreatedAt });

        builder.HasOne<Conversation>().WithMany().HasForeignKey(m => m.ConversationId).OnDelete(DeleteBehavior.Restrict);
    }
}
