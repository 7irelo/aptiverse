using Aptiverse.Identity.Domain;
using Aptiverse.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aptiverse.Identity.Persistence.Configurations;

internal sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users", t =>
        {
            t.HasCheckConstraint("ck_users_education_level", "education_level IS NULL OR " + CheckConstraints.In("education_level", EducationLevels.All));
            t.HasCheckConstraint("ck_users_curriculum", "curriculum IS NULL OR " + CheckConstraints.In("curriculum", Curricula.All));
            t.HasCheckConstraint("ck_users_grade", "grade IS NULL OR grade BETWEEN 8 AND 12");
            t.HasCheckConstraint("ck_users_year_of_study", "year_of_study IS NULL OR year_of_study BETWEEN 1 AND 7");
        });

        builder.Property(u => u.Email).HasMaxLength(User.EmailMaxLength).IsRequired();
        builder.Property(u => u.NormalizedEmail).HasMaxLength(User.EmailMaxLength).IsRequired();
        builder.Property(u => u.PasswordHash).HasMaxLength(512);
        builder.Property(u => u.SecurityStamp).HasMaxLength(64).IsRequired();
        builder.Property(u => u.Name).HasMaxLength(User.NameMaxLength).IsRequired();
        builder.Property(u => u.PhoneNumber).HasMaxLength(User.PhoneMaxLength);
        builder.Property(u => u.EducationLevel).HasMaxLength(16);
        builder.Property(u => u.Curriculum).HasMaxLength(16);
        builder.Property(u => u.InstitutionName).HasMaxLength(User.InstitutionMaxLength);
        builder.Ignore(u => u.RoleNames);
        builder.Ignore(u => u.RequiresOnboarding);

        builder.HasIndex(u => u.NormalizedEmail).IsUnique().HasFilter("deleted_at IS NULL");

        builder.HasMany(u => u.Roles).WithOne().HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Restrict);
        builder.Navigation(u => u.Roles).AutoInclude();
    }
}

internal sealed class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
{
    public void Configure(EntityTypeBuilder<UserRole> builder)
    {
        builder.ToTable("user_roles", t => t.HasCheckConstraint("ck_user_roles_role", CheckConstraints.In("role", SharedKernel.Authorization.Roles.Active)));
        builder.Property(r => r.Role).HasMaxLength(UserRole.RoleMaxLength).IsRequired();
        builder.HasIndex(r => new { r.UserId, r.Role }).IsUnique().HasFilter("deleted_at IS NULL");
    }
}

internal sealed class UserLoginConfiguration : IEntityTypeConfiguration<UserLogin>
{
    public void Configure(EntityTypeBuilder<UserLogin> builder)
    {
        builder.ToTable("user_logins");
        builder.Property(l => l.Provider).HasMaxLength(UserLogin.ProviderMaxLength).IsRequired();
        builder.Property(l => l.ProviderKey).HasMaxLength(UserLogin.ProviderKeyMaxLength).IsRequired();
        builder.HasIndex(l => new { l.Provider, l.ProviderKey }).IsUnique().HasFilter("deleted_at IS NULL");
        builder.HasIndex(l => l.UserId);
        builder.HasOne<User>().WithMany().HasForeignKey(l => l.UserId).OnDelete(DeleteBehavior.Restrict);
    }
}

internal sealed class SessionConfiguration : IEntityTypeConfiguration<Session>
{
    public void Configure(EntityTypeBuilder<Session> builder)
    {
        builder.ToTable("sessions", t => t.HasCheckConstraint("ck_sessions_auth_method", CheckConstraints.In("auth_method", AuthMethods.All)));
        builder.Property(s => s.AuthMethod).HasMaxLength(16).IsRequired();
        builder.Property(s => s.IpAddress).HasMaxLength(Session.IpMaxLength);
        builder.Property(s => s.UserAgent).HasMaxLength(Session.UserAgentMaxLength);
        builder.Property(s => s.RevokedReason).HasMaxLength(Session.ReasonMaxLength);
        builder.HasIndex(s => new { s.UserId, s.RevokedAt });
        builder.HasOne<User>().WithMany().HasForeignKey(s => s.UserId).OnDelete(DeleteBehavior.Restrict);
    }
}

internal sealed class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("refresh_tokens");
        builder.Property(t => t.TokenHash).HasMaxLength(RefreshToken.HashLength).IsFixedLength().IsRequired();
        builder.HasIndex(t => t.TokenHash).IsUnique();
        builder.HasIndex(t => t.SessionId);
        builder.HasIndex(t => t.UserId);
        builder.HasOne<User>().WithMany().HasForeignKey(t => t.UserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Session>().WithMany().HasForeignKey(t => t.SessionId).OnDelete(DeleteBehavior.Restrict);
    }
}

internal sealed class OneTimeTokenConfiguration : IEntityTypeConfiguration<OneTimeToken>
{
    public void Configure(EntityTypeBuilder<OneTimeToken> builder)
    {
        builder.ToTable("one_time_tokens", t => t.HasCheckConstraint("ck_one_time_tokens_purpose", CheckConstraints.In("purpose", TokenPurposes.All)));
        builder.Property(t => t.Purpose).HasMaxLength(OneTimeToken.PurposeMaxLength).IsRequired();
        builder.Property(t => t.TokenHash).HasMaxLength(RefreshToken.HashLength).IsFixedLength().IsRequired();
        builder.HasIndex(t => t.TokenHash).IsUnique();
        builder.HasIndex(t => new { t.UserId, t.Purpose });
        builder.HasOne<User>().WithMany().HasForeignKey(t => t.UserId).OnDelete(DeleteBehavior.Restrict);
    }
}

internal sealed class UserConsentConfiguration : IEntityTypeConfiguration<UserConsent>
{
    public void Configure(EntityTypeBuilder<UserConsent> builder)
    {
        builder.ToTable("user_consents");
        builder.Property(c => c.DocumentKey).HasMaxLength(UserConsent.DocumentKeyMaxLength).IsRequired();
        builder.Property(c => c.DocumentVersion).HasMaxLength(UserConsent.DocumentVersionMaxLength).IsRequired();
        builder.Property(c => c.Source).HasMaxLength(UserConsent.SourceMaxLength).IsRequired();
        builder.Property(c => c.IpAddress).HasMaxLength(Session.IpMaxLength);
        builder.Property(c => c.UserAgent).HasMaxLength(Session.UserAgentMaxLength);
        builder.HasIndex(c => new { c.UserId, c.DocumentKey });
        builder.HasOne<User>().WithMany().HasForeignKey(c => c.UserId).OnDelete(DeleteBehavior.Restrict);
    }
}

internal sealed class SecurityEventConfiguration : IEntityTypeConfiguration<SecurityEvent>
{
    public void Configure(EntityTypeBuilder<SecurityEvent> builder)
    {
        builder.ToTable("security_events", t => t.HasCheckConstraint("ck_security_events_type", CheckConstraints.In("type", SecurityEventTypes.All)));
        builder.Property(e => e.Type).HasMaxLength(SecurityEvent.TypeMaxLength).IsRequired();
        builder.Property(e => e.Email).HasMaxLength(User.EmailMaxLength);
        builder.Property(e => e.IpAddress).HasMaxLength(Session.IpMaxLength);
        builder.Property(e => e.UserAgent).HasMaxLength(Session.UserAgentMaxLength);
        builder.Property(e => e.Detail).HasMaxLength(SecurityEvent.DetailMaxLength);
        builder.HasIndex(e => new { e.UserId, e.CreatedAt });
        builder.HasIndex(e => e.CreatedAt);
        builder.HasOne<User>().WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Restrict);
    }
}

internal sealed class AccountDeletionRequestConfiguration : IEntityTypeConfiguration<AccountDeletionRequest>
{
    public void Configure(EntityTypeBuilder<AccountDeletionRequest> builder)
    {
        builder.ToTable("account_deletion_requests");
        builder.Property(r => r.Reason).HasMaxLength(AccountDeletionRequest.ReasonMaxLength);
        builder.Property(r => r.Status).HasMaxLength(AccountDeletionRequest.StatusMaxLength).IsRequired();
        builder.HasIndex(r => r.UserId);
        builder.HasOne<User>().WithMany().HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Restrict);
    }
}
