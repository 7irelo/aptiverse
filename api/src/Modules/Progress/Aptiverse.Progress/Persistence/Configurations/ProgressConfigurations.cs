using Aptiverse.Progress.Domain;
using Aptiverse.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aptiverse.Progress.Persistence.Configurations;

internal sealed class GoalConfiguration : IEntityTypeConfiguration<Goal>
{
    public const string DuplicateActiveIndex = "ux_goals_duplicate_active";
    public const string IdempotencyIndex = "ux_goals_idempotency_key";

    public void Configure(EntityTypeBuilder<Goal> builder)
    {
        builder.ToTable("goals", t =>
        {
            t.HasCheckConstraint("ck_goals_criteria_type", CheckConstraints.In("criteria_type", CriteriaTypes.All));
            t.HasCheckConstraint("ck_goals_status", CheckConstraints.In("status", GoalStatuses.All));
            t.HasCheckConstraint("ck_goals_target", $"target_value BETWEEN {Goal.MinTarget} AND {Goal.MaxTarget}");
            t.HasCheckConstraint("ck_goals_topic", "topic IS NULL OR criteria_type = 'mastery_threshold'");
            t.HasCheckConstraint("ck_goals_due", "due_at > baseline_captured_at");
            t.HasCheckConstraint("ck_goals_achieved", "(status = 'achieved') = (achieved_at IS NOT NULL)");
        });

        builder.Property(g => g.Title).HasMaxLength(Goal.TitleMaxLength).IsRequired();
        builder.Property(g => g.Description).HasMaxLength(Goal.DescriptionMaxLength);
        builder.Property(g => g.CriteriaType).HasMaxLength(Goal.CodeMaxLength).IsRequired();
        builder.Property(g => g.Topic).HasMaxLength(TopicKeys.MaxLength);
        builder.Property(g => g.TopicKey).HasMaxLength(TopicKeys.MaxLength).IsRequired();
        builder.Property(g => g.Status).HasMaxLength(Goal.StatusMaxLength).IsRequired();
        builder.Property(g => g.TargetValue).HasPrecision(6, 2);
        builder.Property(g => g.BaselineValue).HasPrecision(6, 2);
        builder.Property(g => g.CurrentValue).HasPrecision(6, 2);
        builder.Property(g => g.IdempotencyKey).HasMaxLength(Goal.IdempotencyKeyMaxLength);

        builder.HasIndex(g => new { g.UserId, g.Status, g.DueAt });
        builder.HasIndex(g => new { g.UserId, g.StudyUnitId });
        builder.HasIndex(g => g.AssessmentId).HasFilter("assessment_id IS NOT NULL");

        // Backs goal.duplicate_active; NULLS NOT DISTINCT makes "no linked assessment" one value.
        builder.HasIndex(g => new { g.UserId, g.CriteriaType, g.StudyUnitId, g.TopicKey, g.AssessmentId })
            .HasDatabaseName(DuplicateActiveIndex)
            .IsUnique()
            .AreNullsDistinct(false)
            .HasFilter("status IN ('active', 'at_risk') AND deleted_at IS NULL");

        builder.HasIndex(g => new { g.UserId, g.IdempotencyKey })
            .HasDatabaseName(IdempotencyIndex)
            .IsUnique()
            .HasFilter("idempotency_key IS NOT NULL");
    }
}

internal sealed class MilestoneConfiguration : IEntityTypeConfiguration<Milestone>
{
    public void Configure(EntityTypeBuilder<Milestone> builder)
    {
        builder.ToTable("milestones", t =>
        {
            t.HasCheckConstraint("ck_milestones_position", $"position BETWEEN 1 AND {Milestone.MaxPosition}");
            t.HasCheckConstraint("ck_milestones_threshold", $"threshold_value > 0 AND threshold_value < {Goal.MaxTarget}");
        });

        builder.Property(m => m.Title).HasMaxLength(Goal.TitleMaxLength).IsRequired();
        builder.Property(m => m.ThresholdValue).HasPrecision(6, 2);

        // Positions are kept unique in code under the goal's version check; a unique index would make every
        // reorder a two-step update.
        builder.HasIndex(m => new { m.GoalId, m.Position });
        builder.HasOne<Goal>().WithMany().HasForeignKey(m => m.GoalId).OnDelete(DeleteBehavior.Cascade);
    }
}

internal sealed class GoalEvidenceConfiguration : IEntityTypeConfiguration<GoalEvidence>
{
    public void Configure(EntityTypeBuilder<GoalEvidence> builder)
    {
        builder.ToTable("goal_evidence", t =>
            t.HasCheckConstraint("ck_goal_evidence_source_type", CheckConstraints.In("source_type", EvidenceSources.All)));

        builder.Property(e => e.SourceType).HasMaxLength(GoalEvidence.SourceMaxLength).IsRequired();
        builder.Property(e => e.ValueAfter).HasPrecision(6, 2);
        builder.Property(e => e.Summary).HasMaxLength(GoalEvidence.SummaryMaxLength).IsRequired();
        builder.Property(e => e.Link).HasMaxLength(GoalEvidence.LinkMaxLength);

        builder.HasIndex(e => new { e.GoalId, e.OccurredAt });
        builder.HasIndex(e => new { e.GoalId, e.SourceType, e.SourceId }).IsUnique();
        builder.HasOne<Goal>().WithMany().HasForeignKey(e => e.GoalId).OnDelete(DeleteBehavior.Cascade);
    }
}

internal sealed class MasteryObservationConfiguration : IEntityTypeConfiguration<MasteryObservation>
{
    public const string LiveSourceIndex = "ux_mastery_observations_live_source";

    public void Configure(EntityTypeBuilder<MasteryObservation> builder)
    {
        builder.ToTable("mastery_observations", t =>
        {
            t.HasCheckConstraint("ck_mastery_observations_source_type", CheckConstraints.In("source_type", ObservationSources.All));
            t.HasCheckConstraint("ck_mastery_observations_total", "questions_total > 0");
            t.HasCheckConstraint("ck_mastery_observations_correct", "questions_correct BETWEEN 0 AND questions_total");
            t.HasCheckConstraint("ck_mastery_observations_superseded", "superseded_by_id IS NULL OR superseded_at IS NOT NULL");
        });

        builder.Property(o => o.TopicKey).HasMaxLength(TopicKeys.MaxLength).IsRequired();
        builder.Property(o => o.Topic).HasMaxLength(TopicKeys.MaxLength).IsRequired();
        builder.Property(o => o.SourceType).HasMaxLength(MasteryObservation.SourceMaxLength).IsRequired();
        builder.Property(o => o.QuestionsCorrect).HasPrecision(9, 3);

        builder.HasIndex(o => new { o.UserId, o.StudyUnitId, o.TopicKey, o.ObservedAt });

        // One live row per source and topic: a redelivered event can never count twice.
        builder.HasIndex(o => new { o.SourceType, o.SourceId, o.TopicKey })
            .HasDatabaseName(LiveSourceIndex)
            .IsUnique()
            .HasFilter("superseded_at IS NULL AND deleted_at IS NULL");

        builder.HasIndex(o => o.SupersededById).HasFilter("superseded_by_id IS NOT NULL");
        builder.HasOne<MasteryObservation>().WithMany().HasForeignKey(o => o.SupersededById).OnDelete(DeleteBehavior.Restrict);
    }
}

internal sealed class TopicMasteryConfiguration : IEntityTypeConfiguration<TopicMastery>
{
    public const string TopicIndex = "ux_topic_mastery_topic";

    public void Configure(EntityTypeBuilder<TopicMastery> builder)
    {
        builder.ToTable("topic_mastery", t =>
        {
            t.HasCheckConstraint("ck_topic_mastery_model", CheckConstraints.In("model", MasteryModels.All));
            t.HasCheckConstraint("ck_topic_mastery_band", "band IS NULL OR " + CheckConstraints.In("band", MasteryBands.All));
            t.HasCheckConstraint("ck_topic_mastery_score", "score IS NULL OR score BETWEEN 0 AND 1");
            t.HasCheckConstraint("ck_topic_mastery_null_together", "(score IS NULL) = (band IS NULL)");
            t.HasCheckConstraint("ck_topic_mastery_evidence", "evidence_questions >= 0 AND observation_count >= 0");
        });

        builder.Property(m => m.TopicKey).HasMaxLength(TopicKeys.MaxLength).IsRequired();
        builder.Property(m => m.Topic).HasMaxLength(TopicKeys.MaxLength).IsRequired();
        builder.Property(m => m.Model).HasMaxLength(TopicMastery.CodeMaxLength).IsRequired();
        builder.Property(m => m.Band).HasMaxLength(TopicMastery.CodeMaxLength);
        builder.Property(m => m.Score).HasPrecision(5, 4);
        builder.Property(m => m.PreviousScore).HasPrecision(5, 4);

        builder.HasIndex(m => new { m.UserId, m.StudyUnitId, m.TopicKey, m.Model })
            .HasDatabaseName(TopicIndex)
            .IsUnique()
            .HasFilter("deleted_at IS NULL");

        // Weakest topics across units.
        builder.HasIndex(m => new { m.UserId, m.Model, m.Score }).HasFilter("score IS NOT NULL AND deleted_at IS NULL");
    }
}

internal sealed class PracticeResultConfiguration : IEntityTypeConfiguration<PracticeResult>
{
    public void Configure(EntityTypeBuilder<PracticeResult> builder)
    {
        builder.ToTable("practice_results", t =>
        {
            t.HasCheckConstraint("ck_practice_results_score", "score_percent BETWEEN 0 AND 100");
            t.HasCheckConstraint("ck_practice_results_seconds", "seconds_on_task >= 0");
        });

        builder.Property(r => r.ScorePercent).HasPrecision(5, 2);

        builder.HasIndex(r => r.AttemptId).IsUnique();
        builder.HasIndex(r => new { r.UserId, r.StudyUnitId, r.SubmittedAt });
        builder.HasIndex(r => new { r.UserId, r.SubmittedAt });
    }
}

internal sealed class AssessmentRecordConfiguration : IEntityTypeConfiguration<AssessmentRecord>
{
    public void Configure(EntityTypeBuilder<AssessmentRecord> builder)
    {
        builder.ToTable("assessment_records", t =>
            t.HasCheckConstraint("ck_assessment_records_mark", "mark_percent IS NULL OR mark_percent BETWEEN 0 AND 100"));

        builder.Property(r => r.MarkPercent).HasPrecision(5, 2);

        builder.HasIndex(r => r.AssessmentId).IsUnique();
        builder.HasIndex(r => new { r.UserId, r.StudyUnitId });
    }
}

internal sealed class JourneyEventConfiguration : IEntityTypeConfiguration<JourneyEvent>
{
    public void Configure(EntityTypeBuilder<JourneyEvent> builder)
    {
        builder.ToTable("journey_events", t =>
            t.HasCheckConstraint("ck_journey_events_kind", CheckConstraints.In("kind", JourneyKinds.All)));

        builder.Property(e => e.Kind).HasMaxLength(JourneyEvent.KindMaxLength).IsRequired();
        builder.Property(e => e.Title).HasMaxLength(JourneyEvent.TitleMaxLength).IsRequired();
        builder.Property(e => e.Link).HasMaxLength(JourneyEvent.LinkMaxLength);
        builder.Property(e => e.SourceType).HasMaxLength(JourneyEvent.SourceMaxLength).IsRequired();

        builder.HasIndex(e => new { e.UserId, e.OccurredAt, e.Id }).IsDescending(false, true, true);
        builder.HasIndex(e => new { e.UserId, e.Kind, e.SourceType, e.SourceId }).IsUnique();
    }
}
