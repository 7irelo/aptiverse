using Aptiverse.Academics.Domain;
using Aptiverse.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aptiverse.Academics.Persistence.Configurations;

internal sealed class CurriculumConfiguration : IEntityTypeConfiguration<Curriculum>
{
    public void Configure(EntityTypeBuilder<Curriculum> builder)
    {
        builder.ToTable("curricula", t => t.HasCheckConstraint("ck_curricula_code", CheckConstraints.In("code", Curricula.All)));

        builder.Property(c => c.Code).HasMaxLength(Curriculum.CodeMaxLength).IsRequired();
        builder.Property(c => c.Name).HasMaxLength(Curriculum.NameMaxLength).IsRequired();
        builder.Property(c => c.ShortName).HasMaxLength(Curriculum.ShortNameMaxLength).IsRequired();
        builder.Property(c => c.Description).HasMaxLength(Curriculum.DescriptionMaxLength);

        builder.HasIndex(c => c.Code).IsUnique();
    }
}

internal sealed class CatalogSubjectConfiguration : IEntityTypeConfiguration<CatalogSubject>
{
    public void Configure(EntityTypeBuilder<CatalogSubject> builder)
    {
        builder.ToTable("catalog_subjects", t =>
        {
            t.HasCheckConstraint("ck_catalog_subjects_category", CheckConstraints.In("category", SubjectCategories.All));
            t.HasCheckConstraint("ck_catalog_subjects_language_type", "language_type IS NULL OR " + CheckConstraints.In("language_type", LanguageTypes.All));
        });

        builder.Property(s => s.Slug).HasMaxLength(CatalogSubject.SlugMaxLength).IsRequired();
        builder.Property(s => s.Code).HasMaxLength(CatalogSubject.CodeMaxLength).IsRequired();
        builder.Property(s => s.Name).HasMaxLength(CatalogSubject.NameMaxLength).IsRequired();
        builder.Property(s => s.Category).HasMaxLength(CatalogSubject.CategoryMaxLength).IsRequired();
        builder.Property(s => s.LanguageType).HasMaxLength(CatalogSubject.LanguageTypeMaxLength);
        builder.Property(s => s.Description).HasMaxLength(CatalogSubject.DescriptionMaxLength);
        builder.Property(s => s.IsActive).IsRequired();

        builder.HasIndex(s => s.Slug).IsUnique().HasFilter("deleted_at IS NULL");
    }
}

internal sealed class CurriculumSubjectConfiguration : IEntityTypeConfiguration<CurriculumSubject>
{
    public void Configure(EntityTypeBuilder<CurriculumSubject> builder)
    {
        builder.ToTable("curriculum_subjects", t =>
        {
            t.HasCheckConstraint("ck_curriculum_subjects_min_grade", "min_grade BETWEEN 8 AND 12");
            t.HasCheckConstraint("ck_curriculum_subjects_max_grade", "max_grade BETWEEN min_grade AND 12");
        });

        builder.Property(cs => cs.Notes).HasMaxLength(CurriculumSubject.NotesMaxLength);

        // The leading column serves the curriculum FK.
        builder.HasIndex(cs => new { cs.CurriculumId, cs.SubjectId }).IsUnique().HasFilter("deleted_at IS NULL");
        builder.HasIndex(cs => cs.SubjectId);

        builder.HasOne<Curriculum>().WithMany().HasForeignKey(cs => cs.CurriculumId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<CatalogSubject>().WithMany().HasForeignKey(cs => cs.SubjectId).OnDelete(DeleteBehavior.Restrict);
    }
}

internal sealed class InstitutionConfiguration : IEntityTypeConfiguration<Institution>
{
    public void Configure(EntityTypeBuilder<Institution> builder)
    {
        builder.ToTable("institutions", t =>
        {
            t.HasCheckConstraint("ck_institutions_type", CheckConstraints.In("type", InstitutionTypes.All));
            t.HasCheckConstraint("ck_institutions_province", "province IS NULL OR " + CheckConstraints.In("province", Provinces.All));
        });

        builder.Property(i => i.Slug).HasMaxLength(Institution.SlugMaxLength).IsRequired();
        builder.Property(i => i.Name).HasMaxLength(Institution.NameMaxLength).IsRequired();
        builder.Property(i => i.ShortName).HasMaxLength(Institution.ShortNameMaxLength);
        builder.Property(i => i.Type).HasMaxLength(Institution.TypeMaxLength).IsRequired();
        builder.Property(i => i.Province).HasMaxLength(Institution.ProvinceMaxLength);
        builder.Property(i => i.IsActive).IsRequired();

        builder.HasIndex(i => i.Slug).IsUnique();
    }
}
