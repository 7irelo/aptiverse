using Aptiverse.Family.Domain;
using Aptiverse.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aptiverse.Family.Persistence.Configurations;

internal sealed class FamilyLinkConfiguration : IEntityTypeConfiguration<FamilyLink>
{
    public const string ActivePairIndex = "ux_links_active_pair";

    public void Configure(EntityTypeBuilder<FamilyLink> builder)
    {
        builder.ToTable("links", t =>
        {
            t.HasCheckConstraint("ck_links_status", CheckConstraints.In("status", LinkStatuses.All));
            t.HasCheckConstraint("ck_links_relationship", CheckConstraints.In("relationship", Relationships.All));
            t.HasCheckConstraint("ck_links_method", CheckConstraints.In("method", LinkMethods.All));
            t.HasCheckConstraint("ck_links_removed_by", $"removed_by_role IS NULL OR {CheckConstraints.In("removed_by_role", RemovedBy.All)}");
            t.HasCheckConstraint("ck_links_removed", "(status = 'removed') = (removed_at IS NOT NULL)");
            t.HasCheckConstraint("ck_links_not_self", "parent_user_id <> student_user_id");
        });

        builder.Property(l => l.Status).HasMaxLength(Codes.MaxLength).IsRequired();
        builder.Property(l => l.Relationship).HasMaxLength(Relationships.MaxLength).IsRequired();
        builder.Property(l => l.Method).HasMaxLength(Codes.MaxLength).IsRequired();
        builder.Property(l => l.RemovedByRole).HasMaxLength(Codes.MaxLength);
        builder.Ignore(l => l.Sharing);

        builder.HasIndex(l => new { l.ParentUserId, l.Status });
        builder.HasIndex(l => new { l.StudentUserId, l.Status });
        builder.HasIndex(l => new { l.ParentUserId, l.StudentUserId })
            .HasDatabaseName(ActivePairIndex)
            .IsUnique()
            .HasFilter("status = 'active' AND deleted_at IS NULL");
    }
}

internal sealed class FamilyInviteConfiguration : IEntityTypeConfiguration<FamilyInvite>
{
    public const string PendingIndex = "ux_invites_pending";

    public void Configure(EntityTypeBuilder<FamilyInvite> builder)
    {
        builder.ToTable("invites", t =>
        {
            t.HasCheckConstraint("ck_invites_status", CheckConstraints.In("status", InviteStatuses.All));
            t.HasCheckConstraint("ck_invites_relationship", CheckConstraints.In("relationship", Relationships.All));
            t.HasCheckConstraint("ck_invites_token_hash", $"char_length(token_hash) = {InviteTokens.HashLength}");
            t.HasCheckConstraint("ck_invites_email_lower", "invitee_email = lower(invitee_email)");
        });

        builder.Property(i => i.InviteeEmail).HasMaxLength(Emails.MaxLength).IsRequired();
        builder.Property(i => i.InviterDisplayName).HasMaxLength(FamilyInvite.DisplayNameMaxLength).IsRequired();
        builder.Property(i => i.Relationship).HasMaxLength(Relationships.MaxLength).IsRequired();
        builder.Property(i => i.TokenHash).HasMaxLength(InviteTokens.HashLength).IsFixedLength().IsRequired();
        builder.Property(i => i.Status).HasMaxLength(Codes.MaxLength).IsRequired();

        builder.HasIndex(i => i.TokenHash).IsUnique();
        builder.HasIndex(i => new { i.InviterUserId, i.Status });
        builder.HasIndex(i => new { i.InviteeEmail, i.Status });
        builder.HasIndex(i => new { i.InviterUserId, i.InviteeEmail })
            .HasDatabaseName(PendingIndex)
            .IsUnique()
            .HasFilter("status = 'pending' AND deleted_at IS NULL");
    }
}

internal sealed class LinkCodeConfiguration : IEntityTypeConfiguration<LinkCode>
{
    public const string ActivePerStudentIndex = "ux_link_codes_active_student";

    public void Configure(EntityTypeBuilder<LinkCode> builder)
    {
        builder.ToTable("link_codes", t =>
        {
            t.HasCheckConstraint("ck_link_codes_status", CheckConstraints.In("status", LinkCodeStatuses.All));
            t.HasCheckConstraint("ck_link_codes_hash", $"char_length(code_hash) = {LinkCodes.HashLength}");
            t.HasCheckConstraint("ck_link_codes_selector", $"char_length(selector) = {LinkCodes.SelectorLength}");
            t.HasCheckConstraint("ck_link_codes_failed_attempts", "failed_attempts >= 0");
        });

        builder.Property(c => c.Selector).HasMaxLength(LinkCodes.SelectorLength).IsFixedLength().IsRequired();
        builder.Property(c => c.CodeHash).HasMaxLength(LinkCodes.HashLength).IsFixedLength().IsRequired();
        builder.Property(c => c.Status).HasMaxLength(Codes.MaxLength).IsRequired();

        builder.HasIndex(c => new { c.Selector, c.Status });
        builder.HasIndex(c => c.StudentUserId)
            .HasDatabaseName(ActivePerStudentIndex)
            .IsUnique()
            .HasFilter("status = 'active' AND deleted_at IS NULL");
    }
}

internal sealed class LinkCodeFailureConfiguration : IEntityTypeConfiguration<LinkCodeFailure>
{
    public void Configure(EntityTypeBuilder<LinkCodeFailure> builder)
    {
        builder.ToTable("link_code_failures");
        builder.HasIndex(f => new { f.ParentUserId, f.OccurredAt });
    }
}

internal sealed class ParentalConsentRecordConfiguration : IEntityTypeConfiguration<ParentalConsentRecord>
{
    public void Configure(EntityTypeBuilder<ParentalConsentRecord> builder)
    {
        builder.ToTable("parental_consents", t =>
        {
            t.HasCheckConstraint("ck_parental_consents_action", CheckConstraints.In("action", ConsentActions.All));
            t.HasCheckConstraint("ck_parental_consents_source", CheckConstraints.In("source", ConsentRecordSources.All));
        });

        builder.Property(c => c.Action).HasMaxLength(Codes.MaxLength).IsRequired();
        builder.Property(c => c.Source).HasMaxLength(Codes.MaxLength).IsRequired();
        builder.Property(c => c.DocumentVersion).HasMaxLength(ParentalConsentRecord.DocumentVersionMaxLength).IsRequired();
        builder.Property(c => c.IpAddress).HasMaxLength(ParentalConsentRecord.IpAddressMaxLength);
        builder.Property(c => c.UserAgent).HasMaxLength(ParentalConsentRecord.UserAgentMaxLength);

        builder.HasIndex(c => new { c.StudentUserId, c.OccurredAt }).IsDescending(false, true);
        builder.HasIndex(c => c.ParentUserId);
    }
}
