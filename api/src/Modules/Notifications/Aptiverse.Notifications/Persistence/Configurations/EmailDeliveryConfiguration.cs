using Aptiverse.Notifications.Delivery;
using Aptiverse.Notifications.Email;
using Aptiverse.Notifications.Templates;
using Aptiverse.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aptiverse.Notifications.Persistence.Configurations;

internal sealed class EmailDeliveryConfiguration : IEntityTypeConfiguration<EmailDelivery>
{
    public void Configure(EntityTypeBuilder<EmailDelivery> builder)
    {
        builder.ToTable("email_deliveries", t =>
        {
            t.HasCheckConstraint("ck_email_deliveries_status", CheckConstraints.In("status", DeliveryStatuses.All));
            t.HasCheckConstraint("ck_email_deliveries_category", CheckConstraints.In("category", [.. EmailTemplates.Categories, "internal"]));
            t.HasCheckConstraint("ck_email_deliveries_attempts", "attempts >= 0");
            t.HasCheckConstraint("ck_email_deliveries_hash", $"char_length(to_address_hash) = {RecipientPrivacy.HashLength}");
        });

        builder.Property(d => d.ToAddressHash).HasMaxLength(RecipientPrivacy.HashLength).IsFixedLength().IsRequired();
        builder.Property(d => d.ToAddressMasked).HasMaxLength(RecipientPrivacy.MaskMaxLength).IsRequired();
        builder.Property(d => d.TemplateKey).HasMaxLength(EmailDelivery.TemplateKeyMaxLength).IsRequired();
        builder.Property(d => d.Category).HasMaxLength(EmailDelivery.CategoryMaxLength).IsRequired();
        builder.Property(d => d.Status).HasMaxLength(EmailDelivery.StatusMaxLength).IsRequired();
        builder.Property(d => d.ProviderMessageId).HasMaxLength(EmailDelivery.ProviderMessageIdMaxLength);
        builder.Property(d => d.LastErrorCode).HasMaxLength(EmailDelivery.ErrorCodeMaxLength);
        builder.Ignore(d => d.IsPending);

        // The idempotency guard: one row per logical email, whatever the outbox redelivers.
        builder.HasIndex(d => new { d.DedupeKey, d.TemplateKey }).IsUnique();
        builder.HasIndex(d => d.ProviderMessageId).IsUnique().HasFilter("provider_message_id IS NOT NULL");
        builder.HasIndex(d => new { d.UserId, d.CreatedAt }).IsDescending(false, true);
        builder.HasIndex(d => d.ToAddressHash);
        builder.HasIndex(d => new { d.Status, d.StatusChangedAt });
    }
}
