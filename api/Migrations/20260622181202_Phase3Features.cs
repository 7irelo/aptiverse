using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class Phase3Features : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "requester_user_id",
                schema: "support",
                table: "support_tickets",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "ai_generated",
                schema: "practice",
                table: "practice_tests",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "aligned_sba",
                schema: "practice",
                table: "practice_tests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "difficulty",
                schema: "practice",
                table: "practice_tests",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "duration_minutes",
                schema: "practice",
                table: "practice_tests",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "questions",
                schema: "practice",
                table: "practice_tests",
                type: "jsonb",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "subject_id",
                schema: "practice",
                table: "practice_tests",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "title",
                schema: "practice",
                table: "practice_tests",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "topics",
                schema: "practice",
                table: "practice_tests",
                type: "jsonb",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "score",
                schema: "practice",
                table: "practice_attempts",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "started_at",
                schema: "practice",
                table: "practice_attempts",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "status",
                schema: "practice",
                table: "practice_attempts",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "student_id",
                schema: "practice",
                table: "practice_attempts",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "submitted_at",
                schema: "practice",
                table: "practice_attempts",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "test_id",
                schema: "practice",
                table: "practice_attempts",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "answer_submission_id",
                schema: "practice",
                table: "practice_attempt_items",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "attempt_id",
                schema: "practice",
                table: "practice_attempt_items",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<int>(
                name: "correct_answer_idx",
                schema: "practice",
                table: "practice_attempt_items",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "given_answer_idx",
                schema: "practice",
                table: "practice_attempt_items",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "is_correct",
                schema: "practice",
                table: "practice_attempt_items",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "question_id",
                schema: "practice",
                table: "practice_attempt_items",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "time_ms",
                schema: "practice",
                table: "practice_attempt_items",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "topic",
                schema: "practice",
                table: "practice_attempt_items",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "sleep_hours",
                schema: "wellbeing",
                table: "mood_trackings",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "attempt_id",
                schema: "practice",
                table: "attempt_score_summaries",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<int>(
                name: "correct_count",
                schema: "practice",
                table: "attempt_score_summaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "incorrect_count",
                schema: "practice",
                table: "attempt_score_summaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "per_topic",
                schema: "practice",
                table: "attempt_score_summaries",
                type: "jsonb",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "score_percent",
                schema: "practice",
                table: "attempt_score_summaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "total_questions",
                schema: "practice",
                table: "attempt_score_summaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "total_time_ms",
                schema: "practice",
                table: "attempt_score_summaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "unanswered_count",
                schema: "practice",
                table: "attempt_score_summaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<long>(
                name: "attempt_id",
                schema: "practice",
                table: "answer_submissions",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<string>(
                name: "question_id",
                schema: "practice",
                table: "answer_submissions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "selected_idx",
                schema: "practice",
                table: "answer_submissions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "time_ms",
                schema: "practice",
                table: "answer_submissions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "contact_enquiries",
                schema: "sales",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    first_name = table.Column<string>(type: "text", nullable: false),
                    last_name = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    organisation = table.Column<string>(type: "text", nullable: true),
                    reason = table.Column<string>(type: "text", nullable: false),
                    message = table.Column<string>(type: "text", nullable: false),
                    submitted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    contacted = table.Column<bool>(type: "boolean", nullable: false),
                    contacted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_contact_enquiries", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_support_tickets_requester_user_id",
                schema: "support",
                table: "support_tickets",
                column: "requester_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_practice_tests_subject_id",
                schema: "practice",
                table: "practice_tests",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_practice_tests_subject_id_difficulty",
                schema: "practice",
                table: "practice_tests",
                columns: new[] { "subject_id", "difficulty" });

            migrationBuilder.CreateIndex(
                name: "ix_practice_attempts_student_id",
                schema: "practice",
                table: "practice_attempts",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_practice_attempts_student_id_status",
                schema: "practice",
                table: "practice_attempts",
                columns: new[] { "student_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_practice_attempts_student_id_test_id",
                schema: "practice",
                table: "practice_attempts",
                columns: new[] { "student_id", "test_id" });

            migrationBuilder.CreateIndex(
                name: "ix_practice_attempts_test_id",
                schema: "practice",
                table: "practice_attempts",
                column: "test_id");

            migrationBuilder.CreateIndex(
                name: "ix_practice_attempt_items_answer_submission_id",
                schema: "practice",
                table: "practice_attempt_items",
                column: "answer_submission_id");

            migrationBuilder.CreateIndex(
                name: "ix_practice_attempt_items_attempt_id",
                schema: "practice",
                table: "practice_attempt_items",
                column: "attempt_id");

            migrationBuilder.CreateIndex(
                name: "ix_practice_attempt_items_attempt_id_question_id",
                schema: "practice",
                table: "practice_attempt_items",
                columns: new[] { "attempt_id", "question_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_practice_attempt_items_topic",
                schema: "practice",
                table: "practice_attempt_items",
                column: "topic");

            migrationBuilder.CreateIndex(
                name: "ix_attempt_score_summaries_attempt_id",
                schema: "practice",
                table: "attempt_score_summaries",
                column: "attempt_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_answer_submissions_attempt_id",
                schema: "practice",
                table: "answer_submissions",
                column: "attempt_id");

            migrationBuilder.CreateIndex(
                name: "ix_answer_submissions_attempt_id_question_id",
                schema: "practice",
                table: "answer_submissions",
                columns: new[] { "attempt_id", "question_id" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "fk_answer_submissions_practice_attempt_attempt_id",
                schema: "practice",
                table: "answer_submissions",
                column: "attempt_id",
                principalSchema: "practice",
                principalTable: "practice_attempts",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_attempt_score_summaries_practice_attempt_attempt_id",
                schema: "practice",
                table: "attempt_score_summaries",
                column: "attempt_id",
                principalSchema: "practice",
                principalTable: "practice_attempts",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_practice_attempt_items_answer_submissions_answer_submission",
                schema: "practice",
                table: "practice_attempt_items",
                column: "answer_submission_id",
                principalSchema: "practice",
                principalTable: "answer_submissions",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_practice_attempt_items_practice_attempts_attempt_id",
                schema: "practice",
                table: "practice_attempt_items",
                column: "attempt_id",
                principalSchema: "practice",
                principalTable: "practice_attempts",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_practice_attempts_practice_test_test_id",
                schema: "practice",
                table: "practice_attempts",
                column: "test_id",
                principalSchema: "practice",
                principalTable: "practice_tests",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_answer_submissions_practice_attempt_attempt_id",
                schema: "practice",
                table: "answer_submissions");

            migrationBuilder.DropForeignKey(
                name: "fk_attempt_score_summaries_practice_attempt_attempt_id",
                schema: "practice",
                table: "attempt_score_summaries");

            migrationBuilder.DropForeignKey(
                name: "fk_practice_attempt_items_answer_submissions_answer_submission",
                schema: "practice",
                table: "practice_attempt_items");

            migrationBuilder.DropForeignKey(
                name: "fk_practice_attempt_items_practice_attempts_attempt_id",
                schema: "practice",
                table: "practice_attempt_items");

            migrationBuilder.DropForeignKey(
                name: "fk_practice_attempts_practice_test_test_id",
                schema: "practice",
                table: "practice_attempts");

            migrationBuilder.DropTable(
                name: "contact_enquiries",
                schema: "sales");

            migrationBuilder.DropIndex(
                name: "ix_support_tickets_requester_user_id",
                schema: "support",
                table: "support_tickets");

            migrationBuilder.DropIndex(
                name: "ix_practice_tests_subject_id",
                schema: "practice",
                table: "practice_tests");

            migrationBuilder.DropIndex(
                name: "ix_practice_tests_subject_id_difficulty",
                schema: "practice",
                table: "practice_tests");

            migrationBuilder.DropIndex(
                name: "ix_practice_attempts_student_id",
                schema: "practice",
                table: "practice_attempts");

            migrationBuilder.DropIndex(
                name: "ix_practice_attempts_student_id_status",
                schema: "practice",
                table: "practice_attempts");

            migrationBuilder.DropIndex(
                name: "ix_practice_attempts_student_id_test_id",
                schema: "practice",
                table: "practice_attempts");

            migrationBuilder.DropIndex(
                name: "ix_practice_attempts_test_id",
                schema: "practice",
                table: "practice_attempts");

            migrationBuilder.DropIndex(
                name: "ix_practice_attempt_items_answer_submission_id",
                schema: "practice",
                table: "practice_attempt_items");

            migrationBuilder.DropIndex(
                name: "ix_practice_attempt_items_attempt_id",
                schema: "practice",
                table: "practice_attempt_items");

            migrationBuilder.DropIndex(
                name: "ix_practice_attempt_items_attempt_id_question_id",
                schema: "practice",
                table: "practice_attempt_items");

            migrationBuilder.DropIndex(
                name: "ix_practice_attempt_items_topic",
                schema: "practice",
                table: "practice_attempt_items");

            migrationBuilder.DropIndex(
                name: "ix_attempt_score_summaries_attempt_id",
                schema: "practice",
                table: "attempt_score_summaries");

            migrationBuilder.DropIndex(
                name: "ix_answer_submissions_attempt_id",
                schema: "practice",
                table: "answer_submissions");

            migrationBuilder.DropIndex(
                name: "ix_answer_submissions_attempt_id_question_id",
                schema: "practice",
                table: "answer_submissions");

            migrationBuilder.DropColumn(
                name: "requester_user_id",
                schema: "support",
                table: "support_tickets");

            migrationBuilder.DropColumn(
                name: "ai_generated",
                schema: "practice",
                table: "practice_tests");

            migrationBuilder.DropColumn(
                name: "aligned_sba",
                schema: "practice",
                table: "practice_tests");

            migrationBuilder.DropColumn(
                name: "difficulty",
                schema: "practice",
                table: "practice_tests");

            migrationBuilder.DropColumn(
                name: "duration_minutes",
                schema: "practice",
                table: "practice_tests");

            migrationBuilder.DropColumn(
                name: "questions",
                schema: "practice",
                table: "practice_tests");

            migrationBuilder.DropColumn(
                name: "subject_id",
                schema: "practice",
                table: "practice_tests");

            migrationBuilder.DropColumn(
                name: "title",
                schema: "practice",
                table: "practice_tests");

            migrationBuilder.DropColumn(
                name: "topics",
                schema: "practice",
                table: "practice_tests");

            migrationBuilder.DropColumn(
                name: "score",
                schema: "practice",
                table: "practice_attempts");

            migrationBuilder.DropColumn(
                name: "started_at",
                schema: "practice",
                table: "practice_attempts");

            migrationBuilder.DropColumn(
                name: "status",
                schema: "practice",
                table: "practice_attempts");

            migrationBuilder.DropColumn(
                name: "student_id",
                schema: "practice",
                table: "practice_attempts");

            migrationBuilder.DropColumn(
                name: "submitted_at",
                schema: "practice",
                table: "practice_attempts");

            migrationBuilder.DropColumn(
                name: "test_id",
                schema: "practice",
                table: "practice_attempts");

            migrationBuilder.DropColumn(
                name: "answer_submission_id",
                schema: "practice",
                table: "practice_attempt_items");

            migrationBuilder.DropColumn(
                name: "attempt_id",
                schema: "practice",
                table: "practice_attempt_items");

            migrationBuilder.DropColumn(
                name: "correct_answer_idx",
                schema: "practice",
                table: "practice_attempt_items");

            migrationBuilder.DropColumn(
                name: "given_answer_idx",
                schema: "practice",
                table: "practice_attempt_items");

            migrationBuilder.DropColumn(
                name: "is_correct",
                schema: "practice",
                table: "practice_attempt_items");

            migrationBuilder.DropColumn(
                name: "question_id",
                schema: "practice",
                table: "practice_attempt_items");

            migrationBuilder.DropColumn(
                name: "time_ms",
                schema: "practice",
                table: "practice_attempt_items");

            migrationBuilder.DropColumn(
                name: "topic",
                schema: "practice",
                table: "practice_attempt_items");

            migrationBuilder.DropColumn(
                name: "sleep_hours",
                schema: "wellbeing",
                table: "mood_trackings");

            migrationBuilder.DropColumn(
                name: "attempt_id",
                schema: "practice",
                table: "attempt_score_summaries");

            migrationBuilder.DropColumn(
                name: "correct_count",
                schema: "practice",
                table: "attempt_score_summaries");

            migrationBuilder.DropColumn(
                name: "incorrect_count",
                schema: "practice",
                table: "attempt_score_summaries");

            migrationBuilder.DropColumn(
                name: "per_topic",
                schema: "practice",
                table: "attempt_score_summaries");

            migrationBuilder.DropColumn(
                name: "score_percent",
                schema: "practice",
                table: "attempt_score_summaries");

            migrationBuilder.DropColumn(
                name: "total_questions",
                schema: "practice",
                table: "attempt_score_summaries");

            migrationBuilder.DropColumn(
                name: "total_time_ms",
                schema: "practice",
                table: "attempt_score_summaries");

            migrationBuilder.DropColumn(
                name: "unanswered_count",
                schema: "practice",
                table: "attempt_score_summaries");

            migrationBuilder.DropColumn(
                name: "attempt_id",
                schema: "practice",
                table: "answer_submissions");

            migrationBuilder.DropColumn(
                name: "question_id",
                schema: "practice",
                table: "answer_submissions");

            migrationBuilder.DropColumn(
                name: "selected_idx",
                schema: "practice",
                table: "answer_submissions");

            migrationBuilder.DropColumn(
                name: "time_ms",
                schema: "practice",
                table: "answer_submissions");
        }
    }
}
