using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aptiverse.Progress.Persistence.Migrations
{
    /// <inheritdoc />
    internal partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "progress");

            migrationBuilder.CreateTable(
                name: "assessment_records",
                schema: "progress",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    study_unit_id = table.Column<Guid>(type: "uuid", nullable: false),
                    assessment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    submitted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    mark_percent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    mark_recorded_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    last_mark_event_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    withdrawn_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_assessment_records", x => x.id);
                    table.CheckConstraint("ck_assessment_records_mark", "mark_percent IS NULL OR mark_percent BETWEEN 0 AND 100");
                });

            migrationBuilder.CreateTable(
                name: "goals",
                schema: "progress",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    study_unit_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    criteria_type = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    topic = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    topic_key = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    assessment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    target_value = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: false),
                    baseline_value = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: true),
                    baseline_captured_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    current_value = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: true),
                    status = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    due_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    achieved_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    locked_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    idempotency_key = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_goals", x => x.id);
                    table.CheckConstraint("ck_goals_achieved", "(status = 'achieved') = (achieved_at IS NOT NULL)");
                    table.CheckConstraint("ck_goals_criteria_type", "criteria_type IN ('practice_tests_completed', 'practice_score_best', 'mastery_threshold', 'assessments_submitted', 'assessment_mark_threshold')");
                    table.CheckConstraint("ck_goals_due", "due_at > baseline_captured_at");
                    table.CheckConstraint("ck_goals_status", "status IN ('active', 'at_risk', 'achieved', 'expired', 'abandoned')");
                    table.CheckConstraint("ck_goals_target", "target_value BETWEEN 1 AND 100");
                    table.CheckConstraint("ck_goals_topic", "topic IS NULL OR criteria_type = 'mastery_threshold'");
                });

            migrationBuilder.CreateTable(
                name: "journey_events",
                schema: "progress",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    kind = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    title = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    link = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    source_type = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: false),
                    source_id = table.Column<Guid>(type: "uuid", nullable: false),
                    occurred_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_journey_events", x => x.id);
                    table.CheckConstraint("ck_journey_events_kind", "kind IN ('practice_completed', 'assessment_graded', 'goal_created', 'goal_achieved', 'milestone_reached', 'topic_band_up')");
                });

            migrationBuilder.CreateTable(
                name: "mastery_observations",
                schema: "progress",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    study_unit_id = table.Column<Guid>(type: "uuid", nullable: false),
                    topic_key = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    topic = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    source_type = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: false),
                    source_id = table.Column<Guid>(type: "uuid", nullable: false),
                    questions_total = table.Column<int>(type: "integer", nullable: false),
                    questions_correct = table.Column<decimal>(type: "numeric(9,3)", precision: 9, scale: 3, nullable: false),
                    observed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    source_event_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    superseded_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    superseded_by_id = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_mastery_observations", x => x.id);
                    table.CheckConstraint("ck_mastery_observations_correct", "questions_correct BETWEEN 0 AND questions_total");
                    table.CheckConstraint("ck_mastery_observations_source_type", "source_type IN ('practice_attempt', 'assessment_graded')");
                    table.CheckConstraint("ck_mastery_observations_superseded", "superseded_by_id IS NULL OR superseded_at IS NOT NULL");
                    table.CheckConstraint("ck_mastery_observations_total", "questions_total > 0");
                    table.ForeignKey(
                        name: "fk_mastery_observations_mastery_observations_superseded_by_id",
                        column: x => x.superseded_by_id,
                        principalSchema: "progress",
                        principalTable: "mastery_observations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "practice_results",
                schema: "progress",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    study_unit_id = table.Column<Guid>(type: "uuid", nullable: false),
                    attempt_id = table.Column<Guid>(type: "uuid", nullable: false),
                    test_id = table.Column<Guid>(type: "uuid", nullable: false),
                    score_percent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    partially_graded = table.Column<bool>(type: "boolean", nullable: false),
                    seconds_on_task = table.Column<int>(type: "integer", nullable: false),
                    submitted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    graded_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_practice_results", x => x.id);
                    table.CheckConstraint("ck_practice_results_score", "score_percent BETWEEN 0 AND 100");
                    table.CheckConstraint("ck_practice_results_seconds", "seconds_on_task >= 0");
                });

            migrationBuilder.CreateTable(
                name: "topic_mastery",
                schema: "progress",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    study_unit_id = table.Column<Guid>(type: "uuid", nullable: false),
                    topic_key = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    topic = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    model = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    score = table.Column<decimal>(type: "numeric(5,4)", precision: 5, scale: 4, nullable: true),
                    band = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: true),
                    evidence_questions = table.Column<int>(type: "integer", nullable: false),
                    observation_count = table.Column<int>(type: "integer", nullable: false),
                    early_read = table.Column<bool>(type: "boolean", nullable: false),
                    previous_score = table.Column<decimal>(type: "numeric(5,4)", precision: 5, scale: 4, nullable: true),
                    last_evidence_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_topic_mastery", x => x.id);
                    table.CheckConstraint("ck_topic_mastery_band", "band IS NULL OR band IN ('emerging', 'developing', 'secure', 'mastered')");
                    table.CheckConstraint("ck_topic_mastery_evidence", "evidence_questions >= 0 AND observation_count >= 0");
                    table.CheckConstraint("ck_topic_mastery_model", "model IN ('recency_weighted_v1', 'bkt_v1')");
                    table.CheckConstraint("ck_topic_mastery_null_together", "(score IS NULL) = (band IS NULL)");
                    table.CheckConstraint("ck_topic_mastery_score", "score IS NULL OR score BETWEEN 0 AND 1");
                });

            migrationBuilder.CreateTable(
                name: "goal_evidence",
                schema: "progress",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    goal_id = table.Column<Guid>(type: "uuid", nullable: false),
                    source_type = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: false),
                    source_id = table.Column<Guid>(type: "uuid", nullable: false),
                    value_after = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: true),
                    summary = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    link = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    occurred_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_goal_evidence", x => x.id);
                    table.CheckConstraint("ck_goal_evidence_source_type", "source_type IN ('practice_attempt', 'assessment_submitted', 'assessment_graded', 'mastery_update', 'regrade')");
                    table.ForeignKey(
                        name: "fk_goal_evidence_goals_goal_id",
                        column: x => x.goal_id,
                        principalSchema: "progress",
                        principalTable: "goals",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "milestones",
                schema: "progress",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    goal_id = table.Column<Guid>(type: "uuid", nullable: false),
                    position = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    threshold_value = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: false),
                    reached_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_milestones", x => x.id);
                    table.CheckConstraint("ck_milestones_position", "position BETWEEN 1 AND 5");
                    table.CheckConstraint("ck_milestones_threshold", "threshold_value > 0 AND threshold_value < 100");
                    table.ForeignKey(
                        name: "fk_milestones_goals_goal_id",
                        column: x => x.goal_id,
                        principalSchema: "progress",
                        principalTable: "goals",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_assessment_records_assessment_id",
                schema: "progress",
                table: "assessment_records",
                column: "assessment_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_assessment_records_user_id_study_unit_id",
                schema: "progress",
                table: "assessment_records",
                columns: new[] { "user_id", "study_unit_id" });

            migrationBuilder.CreateIndex(
                name: "ix_goal_evidence_goal_id_occurred_at",
                schema: "progress",
                table: "goal_evidence",
                columns: new[] { "goal_id", "occurred_at" });

            migrationBuilder.CreateIndex(
                name: "ix_goal_evidence_goal_id_source_type_source_id",
                schema: "progress",
                table: "goal_evidence",
                columns: new[] { "goal_id", "source_type", "source_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_goals_assessment_id",
                schema: "progress",
                table: "goals",
                column: "assessment_id",
                filter: "assessment_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_goals_user_id_status_due_at",
                schema: "progress",
                table: "goals",
                columns: new[] { "user_id", "status", "due_at" });

            migrationBuilder.CreateIndex(
                name: "ix_goals_user_id_study_unit_id",
                schema: "progress",
                table: "goals",
                columns: new[] { "user_id", "study_unit_id" });

            migrationBuilder.CreateIndex(
                name: "ux_goals_duplicate_active",
                schema: "progress",
                table: "goals",
                columns: new[] { "user_id", "criteria_type", "study_unit_id", "topic_key", "assessment_id" },
                unique: true,
                filter: "status IN ('active', 'at_risk') AND deleted_at IS NULL")
                .Annotation("Npgsql:NullsDistinct", false);

            migrationBuilder.CreateIndex(
                name: "ux_goals_idempotency_key",
                schema: "progress",
                table: "goals",
                columns: new[] { "user_id", "idempotency_key" },
                unique: true,
                filter: "idempotency_key IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_journey_events_user_id_kind_source_type_source_id",
                schema: "progress",
                table: "journey_events",
                columns: new[] { "user_id", "kind", "source_type", "source_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_journey_events_user_id_occurred_at_id",
                schema: "progress",
                table: "journey_events",
                columns: new[] { "user_id", "occurred_at", "id" },
                descending: new[] { false, true, true });

            migrationBuilder.CreateIndex(
                name: "ix_mastery_observations_superseded_by_id",
                schema: "progress",
                table: "mastery_observations",
                column: "superseded_by_id",
                filter: "superseded_by_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_mastery_observations_user_id_study_unit_id_topic_key_observ",
                schema: "progress",
                table: "mastery_observations",
                columns: new[] { "user_id", "study_unit_id", "topic_key", "observed_at" });

            migrationBuilder.CreateIndex(
                name: "ux_mastery_observations_live_source",
                schema: "progress",
                table: "mastery_observations",
                columns: new[] { "source_type", "source_id", "topic_key" },
                unique: true,
                filter: "superseded_at IS NULL AND deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_milestones_goal_id_position",
                schema: "progress",
                table: "milestones",
                columns: new[] { "goal_id", "position" });

            migrationBuilder.CreateIndex(
                name: "ix_practice_results_attempt_id",
                schema: "progress",
                table: "practice_results",
                column: "attempt_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_practice_results_user_id_study_unit_id_submitted_at",
                schema: "progress",
                table: "practice_results",
                columns: new[] { "user_id", "study_unit_id", "submitted_at" });

            migrationBuilder.CreateIndex(
                name: "ix_practice_results_user_id_submitted_at",
                schema: "progress",
                table: "practice_results",
                columns: new[] { "user_id", "submitted_at" });

            migrationBuilder.CreateIndex(
                name: "ix_topic_mastery_user_id_model_score",
                schema: "progress",
                table: "topic_mastery",
                columns: new[] { "user_id", "model", "score" },
                filter: "score IS NOT NULL AND deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ux_topic_mastery_topic",
                schema: "progress",
                table: "topic_mastery",
                columns: new[] { "user_id", "study_unit_id", "topic_key", "model" },
                unique: true,
                filter: "deleted_at IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "assessment_records",
                schema: "progress");

            migrationBuilder.DropTable(
                name: "goal_evidence",
                schema: "progress");

            migrationBuilder.DropTable(
                name: "journey_events",
                schema: "progress");

            migrationBuilder.DropTable(
                name: "mastery_observations",
                schema: "progress");

            migrationBuilder.DropTable(
                name: "milestones",
                schema: "progress");

            migrationBuilder.DropTable(
                name: "practice_results",
                schema: "progress");

            migrationBuilder.DropTable(
                name: "topic_mastery",
                schema: "progress");

            migrationBuilder.DropTable(
                name: "goals",
                schema: "progress");
        }
    }
}
