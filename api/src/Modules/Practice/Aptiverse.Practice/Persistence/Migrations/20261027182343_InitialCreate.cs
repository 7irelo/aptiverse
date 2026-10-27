using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aptiverse.Practice.Persistence.Migrations
{
    /// <inheritdoc />
    internal partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "practice");

            migrationBuilder.CreateTable(
                name: "tests",
                schema: "practice",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    study_unit_id = table.Column<Guid>(type: "uuid", nullable: false),
                    assessment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    subject_snapshot = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    level_snapshot = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    stage_snapshot = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    title = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    format = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    mode = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    duration_minutes = table.Column<int>(type: "integer", nullable: true),
                    status = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    source = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    topics = table.Column<List<string>>(type: "text[]", nullable: false),
                    question_count = table.Column<int>(type: "integer", nullable: false),
                    difficulty = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    focus_on_weakest = table.Column<bool>(type: "boolean", nullable: false),
                    total_marks = table.Column<int>(type: "integer", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tests", x => x.id);
                    table.CheckConstraint("ck_tests_difficulty", "difficulty IN ('foundation', 'core', 'stretch')");
                    table.CheckConstraint("ck_tests_duration", "(mode = 'timed' AND duration_minutes BETWEEN 5 AND 180) OR (mode = 'untimed' AND duration_minutes IS NULL)");
                    table.CheckConstraint("ck_tests_exam_paper_timed", "format <> 'exam_paper' OR mode = 'timed'");
                    table.CheckConstraint("ck_tests_flashcards_untimed", "format <> 'flashcards' OR mode = 'untimed'");
                    table.CheckConstraint("ck_tests_format", "format IN ('quiz', 'exam_paper', 'reading', 'flashcards', 'essay')");
                    table.CheckConstraint("ck_tests_mode", "mode IN ('timed', 'untimed')");
                    table.CheckConstraint("ck_tests_question_count", "question_count BETWEEN 0 AND 60");
                    table.CheckConstraint("ck_tests_reading_high_school", "format <> 'reading' OR stage_snapshot = 'high_school'");
                    table.CheckConstraint("ck_tests_source", "source IN ('ai', 'legacy')");
                    table.CheckConstraint("ck_tests_stage", "stage_snapshot IN ('high_school', 'university')");
                    table.CheckConstraint("ck_tests_status", "status IN ('generating', 'ready', 'failed', 'archived')");
                    table.CheckConstraint("ck_tests_topics", "cardinality(topics) <= 8");
                    table.CheckConstraint("ck_tests_total_marks", "total_marks >= 0");
                });

            migrationBuilder.CreateTable(
                name: "attempts",
                schema: "practice",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    test_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    study_unit_id = table.Column<Guid>(type: "uuid", nullable: false),
                    mode = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    started_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deadline_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    paused_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    pause_count = table.Column<int>(type: "integer", nullable: false),
                    paused_seconds_total = table.Column<int>(type: "integer", nullable: false),
                    submitted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    submit_source = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: true),
                    focus_loss_count = table.Column<int>(type: "integer", nullable: false),
                    last_focus_loss_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    last_activity_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    score_marks = table.Column<int>(type: "integer", nullable: true),
                    max_marks = table.Column<int>(type: "integer", nullable: false),
                    marked_marks = table.Column<int>(type: "integer", nullable: true),
                    score_percent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    partially_graded = table.Column<bool>(type: "boolean", nullable: false),
                    grading_attempts = table.Column<int>(type: "integer", nullable: false),
                    graded_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_attempts", x => x.id);
                    table.CheckConstraint("ck_attempts_counters", "pause_count >= 0 AND paused_seconds_total >= 0 AND focus_loss_count >= 0 AND grading_attempts >= 0");
                    table.CheckConstraint("ck_attempts_deadline", "(mode = 'timed' AND deadline_at IS NOT NULL) OR (mode = 'untimed' AND deadline_at IS NULL)");
                    table.CheckConstraint("ck_attempts_marks", "max_marks >= 0 AND (score_marks IS NULL OR score_marks >= 0) AND (marked_marks IS NULL OR marked_marks >= 0)");
                    table.CheckConstraint("ck_attempts_mode", "mode IN ('timed', 'untimed')");
                    table.CheckConstraint("ck_attempts_status", "status IN ('in_progress', 'paused', 'submitted', 'grading', 'graded')");
                    table.CheckConstraint("ck_attempts_submit_source", "submit_source IS NULL OR submit_source IN ('student', 'deadline')");
                    table.CheckConstraint("ck_attempts_timed_never_paused", "mode = 'untimed' OR (paused_at IS NULL AND pause_count = 0 AND status <> 'paused')");
                    table.ForeignKey(
                        name: "fk_attempts_tests_test_id",
                        column: x => x.test_id,
                        principalSchema: "practice",
                        principalTable: "tests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "generation_jobs",
                schema: "practice",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    test_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    attempts_made = table.Column<int>(type: "integer", nullable: false),
                    claimed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    poll_deadline_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    finished_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    last_error_code = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    request = table.Column<string>(type: "jsonb", nullable: false),
                    idempotency_key = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    cost_usd_micros = table.Column<long>(type: "bigint", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_generation_jobs", x => x.id);
                    table.CheckConstraint("ck_generation_jobs_attempts", "attempts_made BETWEEN 0 AND 5");
                    table.CheckConstraint("ck_generation_jobs_cost", "cost_usd_micros >= 0");
                    table.CheckConstraint("ck_generation_jobs_status", "status IN ('queued', 'running', 'succeeded', 'failed')");
                    table.ForeignKey(
                        name: "fk_generation_jobs_tests_test_id",
                        column: x => x.test_id,
                        principalSchema: "practice",
                        principalTable: "tests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "questions",
                schema: "practice",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    test_id = table.Column<Guid>(type: "uuid", nullable: false),
                    position = table.Column<int>(type: "integer", nullable: false),
                    kind = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    stem = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    options = table.Column<List<string>>(type: "text[]", nullable: false),
                    answer_index = table.Column<int>(type: "integer", nullable: true),
                    expected_answer = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    memo = table.Column<string>(type: "character varying(6000)", maxLength: 6000, nullable: false),
                    explanation = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    topic = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    cognitive_level = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: true),
                    marks = table.Column<int>(type: "integer", nullable: false),
                    section = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_questions", x => x.id);
                    table.CheckConstraint("ck_questions_kind", "kind IN ('mcq', 'short', 'numeric', 'long', 'flashcard', 'essay')");
                    table.CheckConstraint("ck_questions_marks", "marks BETWEEN 1 AND 50");
                    table.CheckConstraint("ck_questions_mcq", "(kind = 'mcq' AND answer_index IS NOT NULL AND cardinality(options) BETWEEN 2 AND 6 AND answer_index >= 0 AND answer_index < cardinality(options)) OR (kind <> 'mcq' AND answer_index IS NULL AND cardinality(options) = 0)");
                    table.CheckConstraint("ck_questions_position", "position >= 1");
                    table.CheckConstraint("ck_questions_stem", "char_length(stem) BETWEEN 1 AND 4000");
                    table.ForeignKey(
                        name: "fk_questions_tests_test_id",
                        column: x => x.test_id,
                        principalSchema: "practice",
                        principalTable: "tests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "attempt_topic_scores",
                schema: "practice",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    attempt_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    study_unit_id = table.Column<Guid>(type: "uuid", nullable: false),
                    topic = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    questions_total = table.Column<int>(type: "integer", nullable: false),
                    questions_correct = table.Column<int>(type: "integer", nullable: false),
                    marks_available = table.Column<int>(type: "integer", nullable: false),
                    marks_awarded = table.Column<int>(type: "integer", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_attempt_topic_scores", x => x.id);
                    table.CheckConstraint("ck_attempt_topic_scores_counts", "questions_total >= 0 AND questions_correct BETWEEN 0 AND questions_total AND marks_available >= 0 AND marks_awarded BETWEEN 0 AND marks_available");
                    table.ForeignKey(
                        name: "fk_attempt_topic_scores_attempts_attempt_id",
                        column: x => x.attempt_id,
                        principalSchema: "practice",
                        principalTable: "attempts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "answers",
                schema: "practice",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    attempt_id = table.Column<Guid>(type: "uuid", nullable: false),
                    question_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    selected_index = table.Column<int>(type: "integer", nullable: true),
                    text_answer = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: true),
                    self_rating = table.Column<string>(type: "character varying(12)", maxLength: 12, nullable: true),
                    revision = table.Column<int>(type: "integer", nullable: false),
                    saved_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    is_correct = table.Column<bool>(type: "boolean", nullable: true),
                    awarded_marks = table.Column<int>(type: "integer", nullable: true),
                    feedback = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    graded_by = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: true),
                    needs_review = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_answers", x => x.id);
                    table.CheckConstraint("ck_answers_awarded", "awarded_marks IS NULL OR awarded_marks >= 0");
                    table.CheckConstraint("ck_answers_graded_by", "graded_by IS NULL OR graded_by IN ('auto', 'ai', 'pending')");
                    table.CheckConstraint("ck_answers_revision", "revision >= 0");
                    table.CheckConstraint("ck_answers_selected_index", "selected_index IS NULL OR selected_index BETWEEN 0 AND 5");
                    table.CheckConstraint("ck_answers_self_rating", "self_rating IS NULL OR self_rating IN ('knew', 'unsure', 'did_not_know')");
                    table.ForeignKey(
                        name: "fk_answers_attempts_attempt_id",
                        column: x => x.attempt_id,
                        principalSchema: "practice",
                        principalTable: "attempts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_answers_questions_question_id",
                        column: x => x.question_id,
                        principalSchema: "practice",
                        principalTable: "questions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_answers_attempt_id_question_id",
                schema: "practice",
                table: "answers",
                columns: new[] { "attempt_id", "question_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_answers_question_id",
                schema: "practice",
                table: "answers",
                column: "question_id");

            migrationBuilder.CreateIndex(
                name: "ix_answers_user_id",
                schema: "practice",
                table: "answers",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_attempt_topic_scores_attempt_id_topic",
                schema: "practice",
                table: "attempt_topic_scores",
                columns: new[] { "attempt_id", "topic" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_attempt_topic_scores_user_id_study_unit_id",
                schema: "practice",
                table: "attempt_topic_scores",
                columns: new[] { "user_id", "study_unit_id" });

            migrationBuilder.CreateIndex(
                name: "ix_attempts_test_id",
                schema: "practice",
                table: "attempts",
                column: "test_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_attempts_user_id_created_at",
                schema: "practice",
                table: "attempts",
                columns: new[] { "user_id", "created_at" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "ux_attempts_one_active_per_user",
                schema: "practice",
                table: "attempts",
                column: "user_id",
                unique: true,
                filter: "status IN ('in_progress', 'paused') AND deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_generation_jobs_test_id",
                schema: "practice",
                table: "generation_jobs",
                column: "test_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_generation_jobs_user_id_status",
                schema: "practice",
                table: "generation_jobs",
                columns: new[] { "user_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ux_generation_jobs_idempotency_key",
                schema: "practice",
                table: "generation_jobs",
                columns: new[] { "user_id", "idempotency_key" },
                unique: true,
                filter: "idempotency_key IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ux_generation_jobs_one_active_per_user",
                schema: "practice",
                table: "generation_jobs",
                column: "user_id",
                unique: true,
                filter: "status IN ('queued', 'running') AND deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_questions_test_id_position",
                schema: "practice",
                table: "questions",
                columns: new[] { "test_id", "position" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_questions_test_id_topic",
                schema: "practice",
                table: "questions",
                columns: new[] { "test_id", "topic" });

            migrationBuilder.CreateIndex(
                name: "ix_tests_assessment_id",
                schema: "practice",
                table: "tests",
                column: "assessment_id");

            migrationBuilder.CreateIndex(
                name: "ix_tests_user_id_created_at",
                schema: "practice",
                table: "tests",
                columns: new[] { "user_id", "created_at" },
                descending: new[] { false, true },
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_tests_user_id_status",
                schema: "practice",
                table: "tests",
                columns: new[] { "user_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_tests_user_id_study_unit_id",
                schema: "practice",
                table: "tests",
                columns: new[] { "user_id", "study_unit_id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "answers",
                schema: "practice");

            migrationBuilder.DropTable(
                name: "attempt_topic_scores",
                schema: "practice");

            migrationBuilder.DropTable(
                name: "generation_jobs",
                schema: "practice");

            migrationBuilder.DropTable(
                name: "questions",
                schema: "practice");

            migrationBuilder.DropTable(
                name: "attempts",
                schema: "practice");

            migrationBuilder.DropTable(
                name: "tests",
                schema: "practice");
        }
    }
}
