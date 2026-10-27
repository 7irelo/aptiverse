using Aptiverse.Practice.Domain;
using Aptiverse.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aptiverse.Practice.Persistence.Configurations;

internal sealed class PracticeTestConfiguration : IEntityTypeConfiguration<PracticeTest>
{
    public void Configure(EntityTypeBuilder<PracticeTest> builder)
    {
        builder.ToTable("tests", t =>
        {
            t.HasCheckConstraint("ck_tests_stage", CheckConstraints.In("stage_snapshot", Stages.All));
            t.HasCheckConstraint("ck_tests_format", CheckConstraints.In("format", PracticeFormats.All));
            t.HasCheckConstraint("ck_tests_mode", CheckConstraints.In("mode", PracticeModes.All));
            t.HasCheckConstraint("ck_tests_status", CheckConstraints.In("status", TestStatuses.All));
            t.HasCheckConstraint("ck_tests_source", CheckConstraints.In("source", TestSources.All));
            t.HasCheckConstraint("ck_tests_difficulty", CheckConstraints.In("difficulty", Difficulties.All));
            t.HasCheckConstraint(
                "ck_tests_duration",
                $"(mode = 'timed' AND duration_minutes BETWEEN {PracticeTest.MinDurationMinutes} AND {PracticeTest.MaxDurationMinutes}) " +
                "OR (mode = 'untimed' AND duration_minutes IS NULL)");
            t.HasCheckConstraint("ck_tests_exam_paper_timed", "format <> 'exam_paper' OR mode = 'timed'");
            t.HasCheckConstraint("ck_tests_flashcards_untimed", "format <> 'flashcards' OR mode = 'untimed'");
            t.HasCheckConstraint("ck_tests_reading_high_school", "format <> 'reading' OR stage_snapshot = 'high_school'");
            t.HasCheckConstraint("ck_tests_question_count", $"question_count BETWEEN 0 AND {PracticeTest.MaxQuestions}");
            t.HasCheckConstraint("ck_tests_total_marks", "total_marks >= 0");
            t.HasCheckConstraint("ck_tests_topics", $"cardinality(topics) <= {PracticeTest.MaxTopics}");
        });

        builder.Property(t => t.UserId).IsRequired();
        builder.Property(t => t.SubjectSnapshot).HasMaxLength(PracticeTest.SubjectMaxLength).IsRequired();
        builder.Property(t => t.LevelSnapshot).HasMaxLength(PracticeTest.LevelMaxLength).IsRequired();
        builder.Property(t => t.StageSnapshot).HasMaxLength(PracticeTest.CodeMaxLength).IsRequired();
        builder.Property(t => t.Title).HasMaxLength(PracticeTest.TitleMaxLength).IsRequired();
        builder.Property(t => t.Format).HasMaxLength(PracticeTest.CodeMaxLength).IsRequired();
        builder.Property(t => t.Mode).HasMaxLength(PracticeTest.CodeMaxLength).IsRequired();
        builder.Property(t => t.Status).HasMaxLength(PracticeTest.CodeMaxLength).IsRequired();
        builder.Property(t => t.Source).HasMaxLength(PracticeTest.CodeMaxLength).IsRequired();
        builder.Property(t => t.Difficulty).HasMaxLength(PracticeTest.CodeMaxLength).IsRequired();
        builder.Property(t => t.Topics).IsRequired();

        // The owner's list, newest first; also the daily generation count.
        builder.HasIndex(t => new { t.UserId, t.CreatedAt })
            .IsDescending(false, true)
            .HasFilter("deleted_at IS NULL");
        builder.HasIndex(t => new { t.UserId, t.Status });
        builder.HasIndex(t => new { t.UserId, t.StudyUnitId });
        builder.HasIndex(t => t.AssessmentId);
    }
}

internal sealed class QuestionConfiguration : IEntityTypeConfiguration<Question>
{
    public void Configure(EntityTypeBuilder<Question> builder)
    {
        builder.ToTable("questions", t =>
        {
            t.HasCheckConstraint("ck_questions_kind", CheckConstraints.In("kind", QuestionKinds.All));
            t.HasCheckConstraint("ck_questions_position", "position >= 1");
            t.HasCheckConstraint("ck_questions_marks", $"marks BETWEEN {Question.MinMarks} AND {Question.MaxMarks}");
            t.HasCheckConstraint("ck_questions_stem", $"char_length(stem) BETWEEN 1 AND {Question.StemMaxLength}");
            t.HasCheckConstraint(
                "ck_questions_mcq",
                $"(kind = 'mcq' AND answer_index IS NOT NULL AND cardinality(options) BETWEEN {Question.MinOptions} AND {Question.MaxOptions} " +
                "AND answer_index >= 0 AND answer_index < cardinality(options)) " +
                "OR (kind <> 'mcq' AND answer_index IS NULL AND cardinality(options) = 0)");
        });

        builder.Property(q => q.TestId).IsRequired();
        builder.Property(q => q.Kind).HasMaxLength(Question.KindMaxLength).IsRequired();
        builder.Property(q => q.Stem).HasMaxLength(Question.StemMaxLength).IsRequired();
        builder.Property(q => q.Options).IsRequired();
        builder.Property(q => q.ExpectedAnswer).HasMaxLength(Question.ExpectedAnswerMaxLength);
        builder.Property(q => q.Memo).HasMaxLength(Question.MemoMaxLength).IsRequired();
        builder.Property(q => q.Explanation).HasMaxLength(Question.ExplanationMaxLength).IsRequired();
        builder.Property(q => q.Topic).HasMaxLength(Question.TopicMaxLength).IsRequired();
        builder.Property(q => q.CognitiveLevel).HasMaxLength(Question.CognitiveLevelMaxLength);
        builder.Property(q => q.Section).HasMaxLength(Question.SectionMaxLength);

        // The FK index; also loads a test's questions in order.
        builder.HasIndex(q => new { q.TestId, q.Position }).IsUnique();
        builder.HasIndex(q => new { q.TestId, q.Topic });

        builder.HasOne<PracticeTest>().WithMany().HasForeignKey(q => q.TestId).OnDelete(DeleteBehavior.Cascade);
    }
}

internal sealed class GenerationJobConfiguration : IEntityTypeConfiguration<GenerationJob>
{
    public void Configure(EntityTypeBuilder<GenerationJob> builder)
    {
        builder.ToTable("generation_jobs", t =>
        {
            t.HasCheckConstraint("ck_generation_jobs_status", CheckConstraints.In("status", JobStatuses.All));
            t.HasCheckConstraint("ck_generation_jobs_attempts", $"attempts_made BETWEEN 0 AND {GenerationJob.MaxAttempts}");
            t.HasCheckConstraint("ck_generation_jobs_cost", "cost_usd_micros >= 0");
        });

        builder.Property(j => j.UserId).IsRequired();
        builder.Property(j => j.TestId).IsRequired();
        builder.Property(j => j.Status).HasMaxLength(GenerationJob.StatusMaxLength).IsRequired();
        builder.Property(j => j.LastErrorCode).HasMaxLength(GenerationJob.ErrorCodeMaxLength);
        builder.Property(j => j.Request).HasColumnType("jsonb").IsRequired();
        builder.Property(j => j.IdempotencyKey).HasMaxLength(GenerationJob.IdempotencyKeyMaxLength);

        builder.HasIndex(j => j.TestId).IsUnique();
        builder.HasIndex(j => new { j.UserId, j.Status });

        // One queued or running generation per student; the database settles races between devices.
        builder.HasIndex(j => j.UserId)
            .IsUnique()
            .HasFilter("status IN ('queued', 'running') AND deleted_at IS NULL")
            .HasDatabaseName("ux_generation_jobs_one_active_per_user");

        builder.HasIndex(j => new { j.UserId, j.IdempotencyKey })
            .IsUnique()
            .HasFilter("idempotency_key IS NOT NULL")
            .HasDatabaseName("ux_generation_jobs_idempotency_key");

        builder.HasOne<PracticeTest>().WithOne().HasForeignKey<GenerationJob>(j => j.TestId).OnDelete(DeleteBehavior.Cascade);
    }
}

internal sealed class AttemptConfiguration : IEntityTypeConfiguration<Attempt>
{
    public void Configure(EntityTypeBuilder<Attempt> builder)
    {
        builder.ToTable("attempts", t =>
        {
            t.HasCheckConstraint("ck_attempts_status", CheckConstraints.In("status", AttemptStatuses.All));
            t.HasCheckConstraint("ck_attempts_mode", CheckConstraints.In("mode", PracticeModes.All));
            t.HasCheckConstraint("ck_attempts_submit_source", "submit_source IS NULL OR " + CheckConstraints.In("submit_source", SubmitSources.All));
            t.HasCheckConstraint("ck_attempts_counters", "pause_count >= 0 AND paused_seconds_total >= 0 AND focus_loss_count >= 0 AND grading_attempts >= 0");
            t.HasCheckConstraint("ck_attempts_marks", "max_marks >= 0 AND (score_marks IS NULL OR score_marks >= 0) AND (marked_marks IS NULL OR marked_marks >= 0)");
            t.HasCheckConstraint("ck_attempts_deadline", "(mode = 'timed' AND deadline_at IS NOT NULL) OR (mode = 'untimed' AND deadline_at IS NULL)");
            t.HasCheckConstraint("ck_attempts_timed_never_paused", "mode = 'untimed' OR (paused_at IS NULL AND pause_count = 0 AND status <> 'paused')");
        });

        builder.Property(a => a.TestId).IsRequired();
        builder.Property(a => a.UserId).IsRequired();
        builder.Property(a => a.Mode).HasMaxLength(Attempt.CodeMaxLength).IsRequired();
        builder.Property(a => a.Status).HasMaxLength(Attempt.StatusMaxLength).IsRequired();
        builder.Property(a => a.SubmitSource).HasMaxLength(Attempt.CodeMaxLength);
        builder.Property(a => a.ScorePercent).HasPrecision(5, 2);

        // One attempt per test, ever: the index is not filtered, so soft-deleted attempts still count.
        builder.HasIndex(a => a.TestId).IsUnique();

        // One active attempt per student.
        builder.HasIndex(a => a.UserId)
            .IsUnique()
            .HasFilter("status IN ('in_progress', 'paused') AND deleted_at IS NULL")
            .HasDatabaseName("ux_attempts_one_active_per_user");

        builder.HasIndex(a => new { a.UserId, a.CreatedAt }).IsDescending(false, true);

        builder.HasOne<PracticeTest>().WithOne().HasForeignKey<Attempt>(a => a.TestId).OnDelete(DeleteBehavior.Restrict);
    }
}

internal sealed class AnswerConfiguration : IEntityTypeConfiguration<Answer>
{
    public void Configure(EntityTypeBuilder<Answer> builder)
    {
        builder.ToTable("answers", t =>
        {
            t.HasCheckConstraint("ck_answers_revision", "revision >= 0");
            t.HasCheckConstraint("ck_answers_awarded", "awarded_marks IS NULL OR awarded_marks >= 0");
            t.HasCheckConstraint("ck_answers_graded_by", "graded_by IS NULL OR " + CheckConstraints.In("graded_by", GradedBy.All));
            t.HasCheckConstraint("ck_answers_self_rating", "self_rating IS NULL OR " + CheckConstraints.In("self_rating", SelfRatings.All));
            t.HasCheckConstraint("ck_answers_selected_index", "selected_index IS NULL OR selected_index BETWEEN 0 AND 5");
        });

        builder.Property(a => a.AttemptId).IsRequired();
        builder.Property(a => a.QuestionId).IsRequired();
        builder.Property(a => a.UserId).IsRequired();
        builder.Property(a => a.TextAnswer).HasMaxLength(Answer.TextMaxLength);
        builder.Property(a => a.SelfRating).HasMaxLength(Answer.SelfRatingMaxLength);
        builder.Property(a => a.Feedback).HasMaxLength(Answer.FeedbackMaxLength);
        builder.Property(a => a.GradedBy).HasMaxLength(Answer.GradedByMaxLength);

        builder.HasIndex(a => new { a.AttemptId, a.QuestionId }).IsUnique();
        builder.HasIndex(a => a.QuestionId);
        builder.HasIndex(a => a.UserId);

        builder.HasOne<Attempt>().WithMany().HasForeignKey(a => a.AttemptId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne<Question>().WithMany().HasForeignKey(a => a.QuestionId).OnDelete(DeleteBehavior.Restrict);
    }
}

internal sealed class AttemptTopicScoreConfiguration : IEntityTypeConfiguration<AttemptTopicScore>
{
    public void Configure(EntityTypeBuilder<AttemptTopicScore> builder)
    {
        builder.ToTable("attempt_topic_scores", t =>
            t.HasCheckConstraint(
                "ck_attempt_topic_scores_counts",
                "questions_total >= 0 AND questions_correct BETWEEN 0 AND questions_total AND marks_available >= 0 " +
                "AND marks_awarded BETWEEN 0 AND marks_available"));

        builder.Property(s => s.AttemptId).IsRequired();
        builder.Property(s => s.UserId).IsRequired();
        builder.Property(s => s.Topic).HasMaxLength(Question.TopicMaxLength).IsRequired();

        builder.HasIndex(s => new { s.AttemptId, s.Topic }).IsUnique();

        // The weakest topics of a student in a unit.
        builder.HasIndex(s => new { s.UserId, s.StudyUnitId });

        builder.HasOne<Attempt>().WithMany().HasForeignKey(s => s.AttemptId).OnDelete(DeleteBehavior.Cascade);
    }
}
