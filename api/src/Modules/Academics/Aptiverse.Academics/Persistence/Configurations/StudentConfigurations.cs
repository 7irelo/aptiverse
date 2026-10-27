using Aptiverse.Academics.Domain;
using Aptiverse.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aptiverse.Academics.Persistence.Configurations;

internal sealed class StudyUnitConfiguration : IEntityTypeConfiguration<StudyUnit>
{
    public void Configure(EntityTypeBuilder<StudyUnit> builder)
    {
        builder.ToTable("study_units", t =>
        {
            t.HasCheckConstraint("ck_study_units_kind", CheckConstraints.In("kind", StudyUnitKinds.All));
            t.HasCheckConstraint("ck_study_units_curriculum_code", "curriculum_code IS NULL OR " + CheckConstraints.In("curriculum_code", Curricula.All));
            t.HasCheckConstraint("ck_study_units_grade", "grade IS NULL OR grade BETWEEN 8 AND 12");
            t.HasCheckConstraint("ck_study_units_level", "level IS NULL OR " + CheckConstraints.In("level", TertiaryLevels.All));
            t.HasCheckConstraint(
                "ck_study_units_shape",
                "(kind = 'caps_subject' AND catalog_subject_id IS NOT NULL AND curriculum_code IS NOT NULL AND grade IS NOT NULL"
                + " AND institution_id IS NULL AND owner_user_id IS NULL AND level IS NULL)"
                + " OR (kind = 'tertiary_course' AND level IS NOT NULL AND catalog_subject_id IS NULL AND grade IS NULL"
                + " AND curriculum_code IS NULL AND ((institution_id IS NULL) <> (owner_user_id IS NULL)))");
        });

        builder.Property(u => u.Kind).HasMaxLength(StudyUnit.KindMaxLength).IsRequired();
        builder.Property(u => u.CurriculumCode).HasMaxLength(StudyUnit.CurriculumMaxLength);
        builder.Property(u => u.Name).HasMaxLength(StudyUnit.NameMaxLength).IsRequired();
        builder.Property(u => u.NormalizedKey).HasMaxLength(StudyUnit.NormalizedKeyMaxLength).IsRequired();
        builder.Property(u => u.CourseCode).HasMaxLength(StudyUnit.CourseCodeMaxLength);
        builder.Property(u => u.Level).HasMaxLength(StudyUnit.LevelMaxLength);

        builder.HasIndex(u => u.NormalizedKey).IsUnique().HasFilter("deleted_at IS NULL");
        builder.HasIndex(u => u.CatalogSubjectId);

        // FK index; also serves the course search, which is always scoped to one institution.
        builder.HasIndex(u => new { u.InstitutionId, u.Level });
        builder.HasIndex(u => u.OwnerUserId);

        builder.HasOne<CatalogSubject>().WithMany().HasForeignKey(u => u.CatalogSubjectId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Institution>().WithMany().HasForeignKey(u => u.InstitutionId).OnDelete(DeleteBehavior.Restrict);
    }
}

internal sealed class EnrolmentConfiguration : IEntityTypeConfiguration<Enrolment>
{
    public void Configure(EntityTypeBuilder<Enrolment> builder)
    {
        builder.ToTable("enrolments", t =>
        {
            t.HasCheckConstraint("ck_enrolments_status", CheckConstraints.In("status", EnrolmentStatuses.All));
            t.HasCheckConstraint("ck_enrolments_duration", "duration IS NULL OR " + CheckConstraints.In("duration", Durations.All));
            t.HasCheckConstraint("ck_enrolments_colour_token", "colour_token IS NULL OR " + CheckConstraints.In("colour_token", ColourTokens.All));
            t.HasCheckConstraint("ck_enrolments_display_order", "display_order BETWEEN 0 AND 99");
            t.HasCheckConstraint("ck_enrolments_expected_end_on", "expected_end_on IS NULL OR expected_end_on >= started_on");
        });

        builder.Property(e => e.UserId).IsRequired();
        builder.Property(e => e.Status).HasMaxLength(Enrolment.StatusMaxLength).IsRequired();
        builder.Property(e => e.TeacherName).HasMaxLength(Enrolment.TeacherNameMaxLength);
        builder.Property(e => e.Duration).HasMaxLength(Enrolment.DurationMaxLength);
        builder.Property(e => e.ColourToken).HasMaxLength(Enrolment.ColourTokenMaxLength);

        // Serves "my units" lists and the active unit cap.
        builder.HasIndex(e => new { e.UserId, e.Status });
        builder.HasIndex(e => new { e.UserId, e.StudyUnitId }).IsUnique().HasFilter("deleted_at IS NULL");
        builder.HasIndex(e => e.StudyUnitId);

        builder.HasOne<StudyUnit>().WithMany().HasForeignKey(e => e.StudyUnitId).OnDelete(DeleteBehavior.Restrict);
    }
}

internal sealed class TopicConfiguration : IEntityTypeConfiguration<Topic>
{
    public void Configure(EntityTypeBuilder<Topic> builder)
    {
        builder.ToTable("topics", t => t.HasCheckConstraint("ck_topics_source", CheckConstraints.In("source", TopicSources.All)));

        builder.Property(t => t.Slug).HasMaxLength(Topic.SlugMaxLength).IsRequired();
        builder.Property(t => t.Name).HasMaxLength(Topic.NameMaxLength).IsRequired();
        builder.Property(t => t.Source).HasMaxLength(Topic.SourceMaxLength).IsRequired();

        // The leading column serves the study unit FK.
        builder.HasIndex(t => new { t.StudyUnitId, t.Slug }).IsUnique().HasFilter("deleted_at IS NULL");
        builder.HasIndex(t => t.MergedIntoTopicId);

        builder.HasOne<StudyUnit>().WithMany().HasForeignKey(t => t.StudyUnitId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Topic>().WithMany().HasForeignKey(t => t.MergedIntoTopicId).OnDelete(DeleteBehavior.Restrict);
    }
}

internal sealed class AssessmentConfiguration : IEntityTypeConfiguration<Assessment>
{
    public void Configure(EntityTypeBuilder<Assessment> builder)
    {
        builder.ToTable("assessments", t =>
        {
            t.HasCheckConstraint("ck_assessments_type", CheckConstraints.In("assessment_type", AssessmentTypes.All));
            t.HasCheckConstraint("ck_assessments_state", CheckConstraints.In("state", AssessmentStates.All));
            t.HasCheckConstraint("ck_assessments_weight_percent", "weight_percent IS NULL OR weight_percent BETWEEN 0 AND 100");
            t.HasCheckConstraint("ck_assessments_predicted_percent", "predicted_percent IS NULL OR predicted_percent BETWEEN 0 AND 100");
            t.HasCheckConstraint("ck_assessments_term", "term IS NULL OR term BETWEEN 1 AND 4");
            t.HasCheckConstraint(
                "ck_assessments_mark",
                "(mark_obtained IS NULL AND mark_total IS NULL AND percent IS NULL)"
                + " OR (mark_obtained >= 0 AND mark_total > 0 AND mark_total <= 10000 AND mark_obtained <= mark_total"
                + " AND percent BETWEEN 0 AND 100)");
            t.HasCheckConstraint("ck_assessments_graded", "state <> 'graded' OR (graded_at IS NOT NULL AND mark_obtained IS NOT NULL)");
        });

        builder.Property(a => a.UserId).IsRequired();
        builder.Property(a => a.Title).HasMaxLength(Assessment.TitleMaxLength).IsRequired();
        builder.Property(a => a.AssessmentType).HasMaxLength(Assessment.TypeMaxLength).IsRequired();
        builder.Property(a => a.State).HasMaxLength(Assessment.StateMaxLength).IsRequired();
        builder.Property(a => a.WeightPercent).HasPrecision(5, 2);
        builder.Property(a => a.PredictedPercent).HasPrecision(5, 2);
        builder.Property(a => a.Percent).HasPrecision(5, 2);
        builder.Property(a => a.Notes).HasMaxLength(Assessment.NotesMaxLength);

        // Serve the student's lists by due date and by state.
        builder.HasIndex(a => new { a.UserId, a.DueAt });
        builder.HasIndex(a => new { a.UserId, a.State });

        // FK index; also serves a unit's assessments in due order.
        builder.HasIndex(a => new { a.EnrolmentId, a.DueAt });

        builder.HasOne<Enrolment>().WithMany().HasForeignKey(a => a.EnrolmentId).OnDelete(DeleteBehavior.Restrict);
    }
}
