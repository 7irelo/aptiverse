using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class EnterpriseSweep : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_plan_quotas_plan_code",
                schema: "entitlements",
                table: "plan_quotas");

            migrationBuilder.EnsureSchema(
                name: "events");

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "workspace",
                table: "workspace_drafts",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "workspace",
                table: "workspace_drafts",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "marketplace",
                table: "users",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "identity",
                table: "users",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "identity",
                table: "user_tokens",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "identity",
                table: "user_roles",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "identity",
                table: "user_logins",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "identity",
                table: "user_claims",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "marketplace",
                table: "tutors",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "marketplace",
                table: "tutors",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "booking",
                table: "tutors",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "marketplace",
                table: "tutor_subjects",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "marketplace",
                table: "tutor_students",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "booking",
                table: "tutor_students",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "booking",
                table: "tutor_students",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "booking",
                table: "tutor_students",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "marketplace",
                table: "tutor_availabilities",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AlterColumn<string>(
                name: "day_of_week",
                schema: "booking",
                table: "tutor_availabilities",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "booking",
                table: "tutor_availabilities",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "booking",
                table: "tutor_availabilities",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "booking",
                table: "tutor_availabilities",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "practice",
                table: "topics",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "mastery",
                table: "topic_masteries",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "mastery",
                table: "topic_masteries",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "mastery",
                table: "topic_masteries",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "auth",
                table: "teachers",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "auth",
                table: "teachers",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "auth",
                table: "teachers",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<string>(
                name: "requester_user_id",
                schema: "support",
                table: "support_tickets",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "support",
                table: "support_tickets",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "support",
                table: "support_messages",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "support",
                table: "support_messages",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "support",
                table: "support_categories",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "auth",
                table: "superusers",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "auth",
                table: "superusers",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "auth",
                table: "superusers",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "entitlements",
                table: "subscriptions",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "entitlements",
                table: "subscription_members",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "entitlements",
                table: "subscription_members",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "entitlements",
                table: "subscription_members",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "practice",
                table: "subjects",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "marketplace",
                table: "subjects",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "goals",
                table: "subjects",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "academic_planning",
                table: "subjects",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "wellbeing",
                table: "students",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "support",
                table: "students",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "practice",
                table: "students",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "goals",
                table: "students",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "calendar",
                table: "students",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "booking",
                table: "students",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "auth",
                table: "students",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "auth",
                table: "students",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "auth",
                table: "students",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "auth",
                table: "student_teachers",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "mastery",
                table: "student_subjects",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "insights",
                table: "student_subjects",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "academic_planning",
                table: "student_subjects",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "mastery",
                table: "student_subject_topics",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "insights",
                table: "student_subject_topics",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "mastery",
                table: "student_subject_analytics",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "mastery",
                table: "student_subject_analytics",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "mastery",
                table: "student_subject_analytics",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "goals",
                table: "student_rewards",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "goals",
                table: "student_rewards",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "goals",
                table: "student_rewards",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "goals",
                table: "student_points",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "goals",
                table: "student_points",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "goals",
                table: "student_points",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "auth",
                table: "student_parents",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "auth",
                table: "student_admins",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "sales",
                table: "school_enquiries",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "identity",
                table: "roles",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "identity",
                table: "role_claims",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "goals",
                table: "rewards",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "goals",
                table: "rewards",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "goals",
                table: "reward_features",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "marketplace",
                table: "resources",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "marketplace",
                table: "resources",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "marketplace",
                table: "resource_downloads",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "calendar",
                table: "reminders",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "calendar",
                table: "reminders",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

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

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "practice",
                table: "practice_tests",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

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

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "practice",
                table: "practice_tests",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "practice",
                table: "practice_tests",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "practice",
                table: "practice_attempts",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

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

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "practice",
                table: "practice_attempts",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "practice",
                table: "practice_attempts",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

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

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "practice",
                table: "practice_attempt_items",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

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

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "practice",
                table: "practice_attempt_items",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "practice",
                table: "practice_attempt_items",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "goals",
                table: "points_transactions",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "goals",
                table: "points_transactions",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "goals",
                table: "points_transactions",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "entitlements",
                table: "plans",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "entitlements",
                table: "plan_quotas",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "entitlements",
                table: "plan_features",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "auth",
                table: "parents",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "auth",
                table: "parents",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "auth",
                table: "parents",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "notifications",
                table: "notifications",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "notifications",
                table: "notifications",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<double>(
                name: "sleep_hours",
                schema: "wellbeing",
                table: "mood_trackings",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "wellbeing",
                table: "mood_trackings",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "wellbeing",
                table: "mood_trackings",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "marketplace",
                table: "module_lessons",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "moderation",
                table: "moderation_actions",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "moderation",
                table: "moderation_actions",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "mastery",
                table: "knowledge_gaps",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "mastery",
                table: "knowledge_gaps",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "mastery",
                table: "knowledge_gaps",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "insights",
                table: "improvement_tips",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "insights",
                table: "improvement_tips",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "insights",
                table: "improvement_tips",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "goals",
                table: "growth_trackings",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "goals",
                table: "growth_trackings",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "goals",
                table: "growth_trackings",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "insights",
                table: "grade_distributions",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "insights",
                table: "grade_distributions",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "insights",
                table: "grade_distributions",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "goals",
                table: "goals",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "goals",
                table: "goal_milestones",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "practice",
                table: "generated_tests",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "entitlements",
                table: "feature_usages",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "entitlements",
                table: "feature_usages",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "feature_flags",
                table: "feature_flags",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "feature_flags",
                table: "feature_flag_rules",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "feature_flags",
                table: "feature_flag_rules",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "feature_flags",
                table: "feature_flag_evaluations",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "wellbeing",
                table: "diary_goals",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "wellbeing",
                table: "diary_entries",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "academic_planning",
                table: "curriculum_subjects",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "academic_planning",
                table: "curricula",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "marketplace",
                table: "courses",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "marketplace",
                table: "course_modules",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "marketplace",
                table: "course_enrollments",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "marketplace",
                table: "course_enrollments",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "marketplace",
                table: "course_enrollments",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "moderation",
                table: "content_reports",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "moderation",
                table: "content_filters",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "calendar",
                table: "calendar_syncs",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "calendar",
                table: "calendar_syncs",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "calendar",
                table: "calendar_events",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "audit",
                table: "audit_logs",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "audit",
                table: "audit_actions",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "audit",
                table: "audit_actions",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

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

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "practice",
                table: "attempt_score_summaries",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

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

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "practice",
                table: "attempt_score_summaries",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "practice",
                table: "attempt_score_summaries",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "academic_planning",
                table: "assessments",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<long>(
                name: "attempt_id",
                schema: "practice",
                table: "answer_submissions",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "practice",
                table: "answer_submissions",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

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

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "practice",
                table: "answer_submissions",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "practice",
                table: "answer_submissions",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "auth",
                table: "admins",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "auth",
                table: "admins",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                schema: "auth",
                table: "admins",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.CreateTable(
                name: "assessment_uploads",
                schema: "academic_planning",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    assessment_id = table.Column<long>(type: "bigint", nullable: false),
                    student_id = table.Column<string>(type: "text", nullable: false),
                    filename = table.Column<string>(type: "text", nullable: false),
                    content_type = table.Column<string>(type: "text", nullable: false),
                    size_bytes = table.Column<long>(type: "bigint", nullable: false),
                    storage_path = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_assessment_uploads", x => x.id);
                });

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

            migrationBuilder.CreateTable(
                name: "outbox_messages",
                schema: "events",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    type = table.Column<string>(type: "text", nullable: false),
                    payload = table.Column<string>(type: "text", nullable: false),
                    occurred_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    processed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_outbox_messages", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_tutors_is_verified",
                schema: "marketplace",
                table: "tutors",
                column: "is_verified");

            migrationBuilder.CreateIndex(
                name: "ix_tutors_user_id",
                schema: "marketplace",
                table: "tutors",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_tutor_subjects_subject_id",
                schema: "marketplace",
                table: "tutor_subjects",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_tutor_subjects_tutor_id_subject_id",
                schema: "marketplace",
                table: "tutor_subjects",
                columns: new[] { "tutor_id", "subject_id" });

            migrationBuilder.CreateIndex(
                name: "ix_tutor_students_student_id_is_active",
                schema: "booking",
                table: "tutor_students",
                columns: new[] { "student_id", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_tutor_students_tutor_id_is_active",
                schema: "booking",
                table: "tutor_students",
                columns: new[] { "tutor_id", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_tutor_availabilities_tutor_id_day_of_week",
                schema: "booking",
                table: "tutor_availabilities",
                columns: new[] { "tutor_id", "day_of_week" });

            migrationBuilder.CreateIndex(
                name: "ix_tutor_availabilities_tutor_id_is_available",
                schema: "booking",
                table: "tutor_availabilities",
                columns: new[] { "tutor_id", "is_available" });

            migrationBuilder.CreateIndex(
                name: "ix_topic_masteries_student_subject_id_topic_id",
                schema: "mastery",
                table: "topic_masteries",
                columns: new[] { "student_subject_id", "topic_id" });

            migrationBuilder.CreateIndex(
                name: "ix_topic_masteries_topic_id",
                schema: "mastery",
                table: "topic_masteries",
                column: "topic_id");

            migrationBuilder.CreateIndex(
                name: "ix_support_tickets_assigned_to_user_id",
                schema: "support",
                table: "support_tickets",
                column: "assigned_to_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_support_tickets_priority",
                schema: "support",
                table: "support_tickets",
                column: "priority");

            migrationBuilder.CreateIndex(
                name: "ix_support_tickets_requester_user_id",
                schema: "support",
                table: "support_tickets",
                column: "requester_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_support_tickets_status",
                schema: "support",
                table: "support_tickets",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_support_tickets_student_id",
                schema: "support",
                table: "support_tickets",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_support_tickets_student_id_status",
                schema: "support",
                table: "support_tickets",
                columns: new[] { "student_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_support_messages_sender_user_id",
                schema: "support",
                table: "support_messages",
                column: "sender_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_support_messages_ticket_id_created_at",
                schema: "support",
                table: "support_messages",
                columns: new[] { "ticket_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "ix_support_categories_is_active",
                schema: "support",
                table: "support_categories",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_subscriptions_owner_user_id",
                schema: "entitlements",
                table: "subscriptions",
                column: "owner_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_subscriptions_status",
                schema: "entitlements",
                table: "subscriptions",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_subscription_members_user_id",
                schema: "entitlements",
                table: "subscription_members",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_subjects_category",
                schema: "academic_planning",
                table: "subjects",
                column: "category");

            migrationBuilder.CreateIndex(
                name: "ix_students_user_id1",
                schema: "wellbeing",
                table: "students",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_subjects_student_id",
                schema: "academic_planning",
                table: "student_subjects",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_subjects_student_id_grade",
                schema: "academic_planning",
                table: "student_subjects",
                columns: new[] { "student_id", "grade" });

            migrationBuilder.CreateIndex(
                name: "ix_student_subject_analytics_student_subject_id_topic_id",
                schema: "mastery",
                table: "student_subject_analytics",
                columns: new[] { "student_subject_id", "topic_id" });

            migrationBuilder.CreateIndex(
                name: "ix_student_rewards_status",
                schema: "goals",
                table: "student_rewards",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_student_rewards_student_id_status",
                schema: "goals",
                table: "student_rewards",
                columns: new[] { "student_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_student_points_current_rank",
                schema: "goals",
                table: "student_points",
                column: "current_rank");

            migrationBuilder.CreateIndex(
                name: "ix_rewards_is_active",
                schema: "goals",
                table: "rewards",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_rewards_reward_type",
                schema: "goals",
                table: "rewards",
                column: "reward_type");

            migrationBuilder.CreateIndex(
                name: "ix_resources_grade_level",
                schema: "marketplace",
                table: "resources",
                column: "grade_level");

            migrationBuilder.CreateIndex(
                name: "ix_resources_is_approved",
                schema: "marketplace",
                table: "resources",
                column: "is_approved");

            migrationBuilder.CreateIndex(
                name: "ix_resources_is_free",
                schema: "marketplace",
                table: "resources",
                column: "is_free");

            migrationBuilder.CreateIndex(
                name: "ix_resources_resource_type",
                schema: "marketplace",
                table: "resources",
                column: "resource_type");

            migrationBuilder.CreateIndex(
                name: "ix_resources_subject_id",
                schema: "marketplace",
                table: "resources",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_resources_user_id",
                schema: "marketplace",
                table: "resources",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_resource_downloads_user_id",
                schema: "marketplace",
                table: "resource_downloads",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_resource_downloads_user_id_resource_id",
                schema: "marketplace",
                table: "resource_downloads",
                columns: new[] { "user_id", "resource_id" });

            migrationBuilder.CreateIndex(
                name: "ix_reminders_is_sent",
                schema: "calendar",
                table: "reminders",
                column: "is_sent");

            migrationBuilder.CreateIndex(
                name: "ix_reminders_reminder_type",
                schema: "calendar",
                table: "reminders",
                column: "reminder_type");

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
                name: "ix_points_transactions_source",
                schema: "goals",
                table: "points_transactions",
                column: "source");

            migrationBuilder.CreateIndex(
                name: "ix_points_transactions_student_points_id_transaction_type",
                schema: "goals",
                table: "points_transactions",
                columns: new[] { "student_points_id", "transaction_type" });

            migrationBuilder.CreateIndex(
                name: "ix_points_transactions_transaction_type",
                schema: "goals",
                table: "points_transactions",
                column: "transaction_type");

            migrationBuilder.CreateIndex(
                name: "ix_plans_kind",
                schema: "entitlements",
                table: "plans",
                column: "kind");

            migrationBuilder.CreateIndex(
                name: "ix_plan_quotas_plan_code_quota_key",
                schema: "entitlements",
                table: "plan_quotas",
                columns: new[] { "plan_code", "quota_key" });

            migrationBuilder.CreateIndex(
                name: "ix_plan_features_feature_key",
                schema: "entitlements",
                table: "plan_features",
                column: "feature_key");

            migrationBuilder.CreateIndex(
                name: "ix_notifications_user_id_kind",
                schema: "notifications",
                table: "notifications",
                columns: new[] { "user_id", "kind" });

            migrationBuilder.CreateIndex(
                name: "ix_mood_trackings_student_id",
                schema: "wellbeing",
                table: "mood_trackings",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_mood_trackings_student_id_tracked_at",
                schema: "wellbeing",
                table: "mood_trackings",
                columns: new[] { "student_id", "tracked_at" });

            migrationBuilder.CreateIndex(
                name: "ix_mood_trackings_tracked_at",
                schema: "wellbeing",
                table: "mood_trackings",
                column: "tracked_at");

            migrationBuilder.CreateIndex(
                name: "ix_module_lessons_module_id_order",
                schema: "marketplace",
                table: "module_lessons",
                columns: new[] { "module_id", "order" });

            migrationBuilder.CreateIndex(
                name: "ix_moderation_actions_action_type",
                schema: "moderation",
                table: "moderation_actions",
                column: "action_type");

            migrationBuilder.CreateIndex(
                name: "ix_moderation_actions_moderator_user_id",
                schema: "moderation",
                table: "moderation_actions",
                column: "moderator_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_knowledge_gaps_severity",
                schema: "mastery",
                table: "knowledge_gaps",
                column: "severity");

            migrationBuilder.CreateIndex(
                name: "ix_knowledge_gaps_student_subject_id_severity",
                schema: "mastery",
                table: "knowledge_gaps",
                columns: new[] { "student_subject_id", "severity" });

            migrationBuilder.CreateIndex(
                name: "ix_improvement_tips_student_subject_id_priority",
                schema: "insights",
                table: "improvement_tips",
                columns: new[] { "student_subject_id", "priority" });

            migrationBuilder.CreateIndex(
                name: "ix_growth_trackings_student_id_tracking_date",
                schema: "goals",
                table: "growth_trackings",
                columns: new[] { "student_id", "tracking_date" });

            migrationBuilder.CreateIndex(
                name: "ix_goals_category",
                schema: "goals",
                table: "goals",
                column: "category");

            migrationBuilder.CreateIndex(
                name: "ix_goals_status",
                schema: "goals",
                table: "goals",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_goals_student_id",
                schema: "goals",
                table: "goals",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_goals_student_id_status",
                schema: "goals",
                table: "goals",
                columns: new[] { "student_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_goals_subject_id",
                schema: "goals",
                table: "goals",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_goal_milestones_is_completed",
                schema: "goals",
                table: "goal_milestones",
                column: "is_completed");

            migrationBuilder.CreateIndex(
                name: "ix_feature_usages_user_id_quota_key_period_start",
                schema: "entitlements",
                table: "feature_usages",
                columns: new[] { "user_id", "quota_key", "period_start" });

            migrationBuilder.CreateIndex(
                name: "ix_feature_flags_environment",
                schema: "feature_flags",
                table: "feature_flags",
                column: "environment");

            migrationBuilder.CreateIndex(
                name: "ix_feature_flags_is_enabled",
                schema: "feature_flags",
                table: "feature_flags",
                column: "is_enabled");

            migrationBuilder.CreateIndex(
                name: "ix_feature_flags_key",
                schema: "feature_flags",
                table: "feature_flags",
                column: "key");

            migrationBuilder.CreateIndex(
                name: "ix_feature_flag_rules_feature_flag_id_is_enabled",
                schema: "feature_flags",
                table: "feature_flag_rules",
                columns: new[] { "feature_flag_id", "is_enabled" });

            migrationBuilder.CreateIndex(
                name: "ix_feature_flag_rules_feature_flag_id_priority",
                schema: "feature_flags",
                table: "feature_flag_rules",
                columns: new[] { "feature_flag_id", "priority" });

            migrationBuilder.CreateIndex(
                name: "ix_feature_flag_evaluations_evaluated_at",
                schema: "feature_flags",
                table: "feature_flag_evaluations",
                column: "evaluated_at");

            migrationBuilder.CreateIndex(
                name: "ix_feature_flag_evaluations_feature_flag_id_user_id",
                schema: "feature_flags",
                table: "feature_flag_evaluations",
                columns: new[] { "feature_flag_id", "user_id" });

            migrationBuilder.CreateIndex(
                name: "ix_feature_flag_evaluations_user_id",
                schema: "feature_flags",
                table: "feature_flag_evaluations",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_diary_goals_category",
                schema: "wellbeing",
                table: "diary_goals",
                column: "category");

            migrationBuilder.CreateIndex(
                name: "ix_diary_goals_is_completed",
                schema: "wellbeing",
                table: "diary_goals",
                column: "is_completed");

            migrationBuilder.CreateIndex(
                name: "ix_diary_goals_student_id",
                schema: "wellbeing",
                table: "diary_goals",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_diary_goals_student_id_is_completed",
                schema: "wellbeing",
                table: "diary_goals",
                columns: new[] { "student_id", "is_completed" });

            migrationBuilder.CreateIndex(
                name: "ix_diary_goals_target_date",
                schema: "wellbeing",
                table: "diary_goals",
                column: "target_date");

            migrationBuilder.CreateIndex(
                name: "ix_diary_entries_entry_date",
                schema: "wellbeing",
                table: "diary_entries",
                column: "entry_date");

            migrationBuilder.CreateIndex(
                name: "ix_diary_entries_entry_type",
                schema: "wellbeing",
                table: "diary_entries",
                column: "entry_type");

            migrationBuilder.CreateIndex(
                name: "ix_diary_entries_needs_follow_up",
                schema: "wellbeing",
                table: "diary_entries",
                column: "needs_follow_up");

            migrationBuilder.CreateIndex(
                name: "ix_diary_entries_student_id",
                schema: "wellbeing",
                table: "diary_entries",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_diary_entries_student_id_entry_date",
                schema: "wellbeing",
                table: "diary_entries",
                columns: new[] { "student_id", "entry_date" });

            migrationBuilder.CreateIndex(
                name: "ix_curriculum_subjects_curriculum_id_subject_id",
                schema: "academic_planning",
                table: "curriculum_subjects",
                columns: new[] { "curriculum_id", "subject_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_courses_is_published",
                schema: "marketplace",
                table: "courses",
                column: "is_published");

            migrationBuilder.CreateIndex(
                name: "ix_courses_level",
                schema: "marketplace",
                table: "courses",
                column: "level");

            migrationBuilder.CreateIndex(
                name: "ix_courses_subject_id",
                schema: "marketplace",
                table: "courses",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_modules_course_id_order",
                schema: "marketplace",
                table: "course_modules",
                columns: new[] { "course_id", "order" });

            migrationBuilder.CreateIndex(
                name: "ix_course_enrollments_payment_status",
                schema: "marketplace",
                table: "course_enrollments",
                column: "payment_status");

            migrationBuilder.CreateIndex(
                name: "ix_course_enrollments_user_id",
                schema: "marketplace",
                table: "course_enrollments",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_enrollments_user_id_course_id",
                schema: "marketplace",
                table: "course_enrollments",
                columns: new[] { "user_id", "course_id" });

            migrationBuilder.CreateIndex(
                name: "ix_content_reports_content_type_content_id",
                schema: "moderation",
                table: "content_reports",
                columns: new[] { "content_type", "content_id" });

            migrationBuilder.CreateIndex(
                name: "ix_content_reports_reported_user_id",
                schema: "moderation",
                table: "content_reports",
                column: "reported_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_content_reports_reporter_user_id",
                schema: "moderation",
                table: "content_reports",
                column: "reporter_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_content_reports_severity",
                schema: "moderation",
                table: "content_reports",
                column: "severity");

            migrationBuilder.CreateIndex(
                name: "ix_content_reports_status",
                schema: "moderation",
                table: "content_reports",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_content_reports_status_severity",
                schema: "moderation",
                table: "content_reports",
                columns: new[] { "status", "severity" });

            migrationBuilder.CreateIndex(
                name: "ix_content_filters_category",
                schema: "moderation",
                table: "content_filters",
                column: "category");

            migrationBuilder.CreateIndex(
                name: "ix_content_filters_filter_type",
                schema: "moderation",
                table: "content_filters",
                column: "filter_type");

            migrationBuilder.CreateIndex(
                name: "ix_content_filters_is_active",
                schema: "moderation",
                table: "content_filters",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_content_filters_severity",
                schema: "moderation",
                table: "content_filters",
                column: "severity");

            migrationBuilder.CreateIndex(
                name: "ix_calendar_syncs_provider",
                schema: "calendar",
                table: "calendar_syncs",
                column: "provider");

            migrationBuilder.CreateIndex(
                name: "ix_calendar_syncs_student_id",
                schema: "calendar",
                table: "calendar_syncs",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_calendar_syncs_student_id_provider",
                schema: "calendar",
                table: "calendar_syncs",
                columns: new[] { "student_id", "provider" });

            migrationBuilder.CreateIndex(
                name: "ix_calendar_syncs_sync_status",
                schema: "calendar",
                table: "calendar_syncs",
                column: "sync_status");

            migrationBuilder.CreateIndex(
                name: "ix_calendar_events_event_type",
                schema: "calendar",
                table: "calendar_events",
                column: "event_type");

            migrationBuilder.CreateIndex(
                name: "ix_calendar_events_related_entity_type_related_entity_id",
                schema: "calendar",
                table: "calendar_events",
                columns: new[] { "related_entity_type", "related_entity_id" });

            migrationBuilder.CreateIndex(
                name: "ix_calendar_events_start_time",
                schema: "calendar",
                table: "calendar_events",
                column: "start_time");

            migrationBuilder.CreateIndex(
                name: "ix_calendar_events_status",
                schema: "calendar",
                table: "calendar_events",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_calendar_events_student_id",
                schema: "calendar",
                table: "calendar_events",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_calendar_events_student_id_start_time",
                schema: "calendar",
                table: "calendar_events",
                columns: new[] { "student_id", "start_time" });

            migrationBuilder.CreateIndex(
                name: "ix_calendar_events_student_id_status",
                schema: "calendar",
                table: "calendar_events",
                columns: new[] { "student_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_correlation_id",
                schema: "audit",
                table: "audit_logs",
                column: "correlation_id");

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_entity_type_entity_id",
                schema: "audit",
                table: "audit_logs",
                columns: new[] { "entity_type", "entity_id" });

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_service_name",
                schema: "audit",
                table: "audit_logs",
                column: "service_name");

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_user_id_created_at",
                schema: "audit",
                table: "audit_logs",
                columns: new[] { "user_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "ix_audit_actions_category",
                schema: "audit",
                table: "audit_actions",
                column: "category");

            migrationBuilder.CreateIndex(
                name: "ix_audit_actions_is_active",
                schema: "audit",
                table: "audit_actions",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_audit_actions_severity",
                schema: "audit",
                table: "audit_actions",
                column: "severity");

            migrationBuilder.CreateIndex(
                name: "ix_attempt_score_summaries_attempt_id",
                schema: "practice",
                table: "attempt_score_summaries",
                column: "attempt_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_assessments_status",
                schema: "academic_planning",
                table: "assessments",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_assessments_student_id",
                schema: "academic_planning",
                table: "assessments",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_assessments_student_id_due_date",
                schema: "academic_planning",
                table: "assessments",
                columns: new[] { "student_id", "due_date" });

            migrationBuilder.CreateIndex(
                name: "ix_assessments_student_id_status",
                schema: "academic_planning",
                table: "assessments",
                columns: new[] { "student_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_assessments_student_id_subject_id",
                schema: "academic_planning",
                table: "assessments",
                columns: new[] { "student_id", "subject_id" });

            migrationBuilder.CreateIndex(
                name: "ix_assessments_subject_id",
                schema: "academic_planning",
                table: "assessments",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_assessments_type",
                schema: "academic_planning",
                table: "assessments",
                column: "type");

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

            migrationBuilder.CreateIndex(
                name: "ix_assessment_uploads_assessment_id",
                schema: "academic_planning",
                table: "assessment_uploads",
                column: "assessment_id");

            migrationBuilder.CreateIndex(
                name: "ix_assessment_uploads_student_id",
                schema: "academic_planning",
                table: "assessment_uploads",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_outbox_messages_processed_at_occurred_at",
                schema: "events",
                table: "outbox_messages",
                columns: new[] { "processed_at", "occurred_at" });

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
                name: "assessment_uploads",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "contact_enquiries",
                schema: "sales");

            migrationBuilder.DropTable(
                name: "outbox_messages",
                schema: "events");

            migrationBuilder.DropIndex(
                name: "ix_tutors_is_verified",
                schema: "marketplace",
                table: "tutors");

            migrationBuilder.DropIndex(
                name: "ix_tutors_user_id",
                schema: "marketplace",
                table: "tutors");

            migrationBuilder.DropIndex(
                name: "ix_tutor_subjects_subject_id",
                schema: "marketplace",
                table: "tutor_subjects");

            migrationBuilder.DropIndex(
                name: "ix_tutor_subjects_tutor_id_subject_id",
                schema: "marketplace",
                table: "tutor_subjects");

            migrationBuilder.DropIndex(
                name: "ix_tutor_students_student_id_is_active",
                schema: "booking",
                table: "tutor_students");

            migrationBuilder.DropIndex(
                name: "ix_tutor_students_tutor_id_is_active",
                schema: "booking",
                table: "tutor_students");

            migrationBuilder.DropIndex(
                name: "ix_tutor_availabilities_tutor_id_day_of_week",
                schema: "booking",
                table: "tutor_availabilities");

            migrationBuilder.DropIndex(
                name: "ix_tutor_availabilities_tutor_id_is_available",
                schema: "booking",
                table: "tutor_availabilities");

            migrationBuilder.DropIndex(
                name: "ix_topic_masteries_student_subject_id_topic_id",
                schema: "mastery",
                table: "topic_masteries");

            migrationBuilder.DropIndex(
                name: "ix_topic_masteries_topic_id",
                schema: "mastery",
                table: "topic_masteries");

            migrationBuilder.DropIndex(
                name: "ix_support_tickets_assigned_to_user_id",
                schema: "support",
                table: "support_tickets");

            migrationBuilder.DropIndex(
                name: "ix_support_tickets_priority",
                schema: "support",
                table: "support_tickets");

            migrationBuilder.DropIndex(
                name: "ix_support_tickets_requester_user_id",
                schema: "support",
                table: "support_tickets");

            migrationBuilder.DropIndex(
                name: "ix_support_tickets_status",
                schema: "support",
                table: "support_tickets");

            migrationBuilder.DropIndex(
                name: "ix_support_tickets_student_id",
                schema: "support",
                table: "support_tickets");

            migrationBuilder.DropIndex(
                name: "ix_support_tickets_student_id_status",
                schema: "support",
                table: "support_tickets");

            migrationBuilder.DropIndex(
                name: "ix_support_messages_sender_user_id",
                schema: "support",
                table: "support_messages");

            migrationBuilder.DropIndex(
                name: "ix_support_messages_ticket_id_created_at",
                schema: "support",
                table: "support_messages");

            migrationBuilder.DropIndex(
                name: "ix_support_categories_is_active",
                schema: "support",
                table: "support_categories");

            migrationBuilder.DropIndex(
                name: "ix_subscriptions_owner_user_id",
                schema: "entitlements",
                table: "subscriptions");

            migrationBuilder.DropIndex(
                name: "ix_subscriptions_status",
                schema: "entitlements",
                table: "subscriptions");

            migrationBuilder.DropIndex(
                name: "ix_subscription_members_user_id",
                schema: "entitlements",
                table: "subscription_members");

            migrationBuilder.DropIndex(
                name: "ix_subjects_category",
                schema: "academic_planning",
                table: "subjects");

            migrationBuilder.DropIndex(
                name: "ix_students_user_id1",
                schema: "wellbeing",
                table: "students");

            migrationBuilder.DropIndex(
                name: "ix_student_subjects_student_id",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropIndex(
                name: "ix_student_subjects_student_id_grade",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropIndex(
                name: "ix_student_subject_analytics_student_subject_id_topic_id",
                schema: "mastery",
                table: "student_subject_analytics");

            migrationBuilder.DropIndex(
                name: "ix_student_rewards_status",
                schema: "goals",
                table: "student_rewards");

            migrationBuilder.DropIndex(
                name: "ix_student_rewards_student_id_status",
                schema: "goals",
                table: "student_rewards");

            migrationBuilder.DropIndex(
                name: "ix_student_points_current_rank",
                schema: "goals",
                table: "student_points");

            migrationBuilder.DropIndex(
                name: "ix_rewards_is_active",
                schema: "goals",
                table: "rewards");

            migrationBuilder.DropIndex(
                name: "ix_rewards_reward_type",
                schema: "goals",
                table: "rewards");

            migrationBuilder.DropIndex(
                name: "ix_resources_grade_level",
                schema: "marketplace",
                table: "resources");

            migrationBuilder.DropIndex(
                name: "ix_resources_is_approved",
                schema: "marketplace",
                table: "resources");

            migrationBuilder.DropIndex(
                name: "ix_resources_is_free",
                schema: "marketplace",
                table: "resources");

            migrationBuilder.DropIndex(
                name: "ix_resources_resource_type",
                schema: "marketplace",
                table: "resources");

            migrationBuilder.DropIndex(
                name: "ix_resources_subject_id",
                schema: "marketplace",
                table: "resources");

            migrationBuilder.DropIndex(
                name: "ix_resources_user_id",
                schema: "marketplace",
                table: "resources");

            migrationBuilder.DropIndex(
                name: "ix_resource_downloads_user_id",
                schema: "marketplace",
                table: "resource_downloads");

            migrationBuilder.DropIndex(
                name: "ix_resource_downloads_user_id_resource_id",
                schema: "marketplace",
                table: "resource_downloads");

            migrationBuilder.DropIndex(
                name: "ix_reminders_is_sent",
                schema: "calendar",
                table: "reminders");

            migrationBuilder.DropIndex(
                name: "ix_reminders_reminder_type",
                schema: "calendar",
                table: "reminders");

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
                name: "ix_points_transactions_source",
                schema: "goals",
                table: "points_transactions");

            migrationBuilder.DropIndex(
                name: "ix_points_transactions_student_points_id_transaction_type",
                schema: "goals",
                table: "points_transactions");

            migrationBuilder.DropIndex(
                name: "ix_points_transactions_transaction_type",
                schema: "goals",
                table: "points_transactions");

            migrationBuilder.DropIndex(
                name: "ix_plans_kind",
                schema: "entitlements",
                table: "plans");

            migrationBuilder.DropIndex(
                name: "ix_plan_quotas_plan_code_quota_key",
                schema: "entitlements",
                table: "plan_quotas");

            migrationBuilder.DropIndex(
                name: "ix_plan_features_feature_key",
                schema: "entitlements",
                table: "plan_features");

            migrationBuilder.DropIndex(
                name: "ix_notifications_user_id_kind",
                schema: "notifications",
                table: "notifications");

            migrationBuilder.DropIndex(
                name: "ix_mood_trackings_student_id",
                schema: "wellbeing",
                table: "mood_trackings");

            migrationBuilder.DropIndex(
                name: "ix_mood_trackings_student_id_tracked_at",
                schema: "wellbeing",
                table: "mood_trackings");

            migrationBuilder.DropIndex(
                name: "ix_mood_trackings_tracked_at",
                schema: "wellbeing",
                table: "mood_trackings");

            migrationBuilder.DropIndex(
                name: "ix_module_lessons_module_id_order",
                schema: "marketplace",
                table: "module_lessons");

            migrationBuilder.DropIndex(
                name: "ix_moderation_actions_action_type",
                schema: "moderation",
                table: "moderation_actions");

            migrationBuilder.DropIndex(
                name: "ix_moderation_actions_moderator_user_id",
                schema: "moderation",
                table: "moderation_actions");

            migrationBuilder.DropIndex(
                name: "ix_knowledge_gaps_severity",
                schema: "mastery",
                table: "knowledge_gaps");

            migrationBuilder.DropIndex(
                name: "ix_knowledge_gaps_student_subject_id_severity",
                schema: "mastery",
                table: "knowledge_gaps");

            migrationBuilder.DropIndex(
                name: "ix_improvement_tips_student_subject_id_priority",
                schema: "insights",
                table: "improvement_tips");

            migrationBuilder.DropIndex(
                name: "ix_growth_trackings_student_id_tracking_date",
                schema: "goals",
                table: "growth_trackings");

            migrationBuilder.DropIndex(
                name: "ix_goals_category",
                schema: "goals",
                table: "goals");

            migrationBuilder.DropIndex(
                name: "ix_goals_status",
                schema: "goals",
                table: "goals");

            migrationBuilder.DropIndex(
                name: "ix_goals_student_id",
                schema: "goals",
                table: "goals");

            migrationBuilder.DropIndex(
                name: "ix_goals_student_id_status",
                schema: "goals",
                table: "goals");

            migrationBuilder.DropIndex(
                name: "ix_goals_subject_id",
                schema: "goals",
                table: "goals");

            migrationBuilder.DropIndex(
                name: "ix_goal_milestones_is_completed",
                schema: "goals",
                table: "goal_milestones");

            migrationBuilder.DropIndex(
                name: "ix_feature_usages_user_id_quota_key_period_start",
                schema: "entitlements",
                table: "feature_usages");

            migrationBuilder.DropIndex(
                name: "ix_feature_flags_environment",
                schema: "feature_flags",
                table: "feature_flags");

            migrationBuilder.DropIndex(
                name: "ix_feature_flags_is_enabled",
                schema: "feature_flags",
                table: "feature_flags");

            migrationBuilder.DropIndex(
                name: "ix_feature_flags_key",
                schema: "feature_flags",
                table: "feature_flags");

            migrationBuilder.DropIndex(
                name: "ix_feature_flag_rules_feature_flag_id_is_enabled",
                schema: "feature_flags",
                table: "feature_flag_rules");

            migrationBuilder.DropIndex(
                name: "ix_feature_flag_rules_feature_flag_id_priority",
                schema: "feature_flags",
                table: "feature_flag_rules");

            migrationBuilder.DropIndex(
                name: "ix_feature_flag_evaluations_evaluated_at",
                schema: "feature_flags",
                table: "feature_flag_evaluations");

            migrationBuilder.DropIndex(
                name: "ix_feature_flag_evaluations_feature_flag_id_user_id",
                schema: "feature_flags",
                table: "feature_flag_evaluations");

            migrationBuilder.DropIndex(
                name: "ix_feature_flag_evaluations_user_id",
                schema: "feature_flags",
                table: "feature_flag_evaluations");

            migrationBuilder.DropIndex(
                name: "ix_diary_goals_category",
                schema: "wellbeing",
                table: "diary_goals");

            migrationBuilder.DropIndex(
                name: "ix_diary_goals_is_completed",
                schema: "wellbeing",
                table: "diary_goals");

            migrationBuilder.DropIndex(
                name: "ix_diary_goals_student_id",
                schema: "wellbeing",
                table: "diary_goals");

            migrationBuilder.DropIndex(
                name: "ix_diary_goals_student_id_is_completed",
                schema: "wellbeing",
                table: "diary_goals");

            migrationBuilder.DropIndex(
                name: "ix_diary_goals_target_date",
                schema: "wellbeing",
                table: "diary_goals");

            migrationBuilder.DropIndex(
                name: "ix_diary_entries_entry_date",
                schema: "wellbeing",
                table: "diary_entries");

            migrationBuilder.DropIndex(
                name: "ix_diary_entries_entry_type",
                schema: "wellbeing",
                table: "diary_entries");

            migrationBuilder.DropIndex(
                name: "ix_diary_entries_needs_follow_up",
                schema: "wellbeing",
                table: "diary_entries");

            migrationBuilder.DropIndex(
                name: "ix_diary_entries_student_id",
                schema: "wellbeing",
                table: "diary_entries");

            migrationBuilder.DropIndex(
                name: "ix_diary_entries_student_id_entry_date",
                schema: "wellbeing",
                table: "diary_entries");

            migrationBuilder.DropIndex(
                name: "ix_curriculum_subjects_curriculum_id_subject_id",
                schema: "academic_planning",
                table: "curriculum_subjects");

            migrationBuilder.DropIndex(
                name: "ix_courses_is_published",
                schema: "marketplace",
                table: "courses");

            migrationBuilder.DropIndex(
                name: "ix_courses_level",
                schema: "marketplace",
                table: "courses");

            migrationBuilder.DropIndex(
                name: "ix_courses_subject_id",
                schema: "marketplace",
                table: "courses");

            migrationBuilder.DropIndex(
                name: "ix_course_modules_course_id_order",
                schema: "marketplace",
                table: "course_modules");

            migrationBuilder.DropIndex(
                name: "ix_course_enrollments_payment_status",
                schema: "marketplace",
                table: "course_enrollments");

            migrationBuilder.DropIndex(
                name: "ix_course_enrollments_user_id",
                schema: "marketplace",
                table: "course_enrollments");

            migrationBuilder.DropIndex(
                name: "ix_course_enrollments_user_id_course_id",
                schema: "marketplace",
                table: "course_enrollments");

            migrationBuilder.DropIndex(
                name: "ix_content_reports_content_type_content_id",
                schema: "moderation",
                table: "content_reports");

            migrationBuilder.DropIndex(
                name: "ix_content_reports_reported_user_id",
                schema: "moderation",
                table: "content_reports");

            migrationBuilder.DropIndex(
                name: "ix_content_reports_reporter_user_id",
                schema: "moderation",
                table: "content_reports");

            migrationBuilder.DropIndex(
                name: "ix_content_reports_severity",
                schema: "moderation",
                table: "content_reports");

            migrationBuilder.DropIndex(
                name: "ix_content_reports_status",
                schema: "moderation",
                table: "content_reports");

            migrationBuilder.DropIndex(
                name: "ix_content_reports_status_severity",
                schema: "moderation",
                table: "content_reports");

            migrationBuilder.DropIndex(
                name: "ix_content_filters_category",
                schema: "moderation",
                table: "content_filters");

            migrationBuilder.DropIndex(
                name: "ix_content_filters_filter_type",
                schema: "moderation",
                table: "content_filters");

            migrationBuilder.DropIndex(
                name: "ix_content_filters_is_active",
                schema: "moderation",
                table: "content_filters");

            migrationBuilder.DropIndex(
                name: "ix_content_filters_severity",
                schema: "moderation",
                table: "content_filters");

            migrationBuilder.DropIndex(
                name: "ix_calendar_syncs_provider",
                schema: "calendar",
                table: "calendar_syncs");

            migrationBuilder.DropIndex(
                name: "ix_calendar_syncs_student_id",
                schema: "calendar",
                table: "calendar_syncs");

            migrationBuilder.DropIndex(
                name: "ix_calendar_syncs_student_id_provider",
                schema: "calendar",
                table: "calendar_syncs");

            migrationBuilder.DropIndex(
                name: "ix_calendar_syncs_sync_status",
                schema: "calendar",
                table: "calendar_syncs");

            migrationBuilder.DropIndex(
                name: "ix_calendar_events_event_type",
                schema: "calendar",
                table: "calendar_events");

            migrationBuilder.DropIndex(
                name: "ix_calendar_events_related_entity_type_related_entity_id",
                schema: "calendar",
                table: "calendar_events");

            migrationBuilder.DropIndex(
                name: "ix_calendar_events_start_time",
                schema: "calendar",
                table: "calendar_events");

            migrationBuilder.DropIndex(
                name: "ix_calendar_events_status",
                schema: "calendar",
                table: "calendar_events");

            migrationBuilder.DropIndex(
                name: "ix_calendar_events_student_id",
                schema: "calendar",
                table: "calendar_events");

            migrationBuilder.DropIndex(
                name: "ix_calendar_events_student_id_start_time",
                schema: "calendar",
                table: "calendar_events");

            migrationBuilder.DropIndex(
                name: "ix_calendar_events_student_id_status",
                schema: "calendar",
                table: "calendar_events");

            migrationBuilder.DropIndex(
                name: "ix_audit_logs_correlation_id",
                schema: "audit",
                table: "audit_logs");

            migrationBuilder.DropIndex(
                name: "ix_audit_logs_entity_type_entity_id",
                schema: "audit",
                table: "audit_logs");

            migrationBuilder.DropIndex(
                name: "ix_audit_logs_service_name",
                schema: "audit",
                table: "audit_logs");

            migrationBuilder.DropIndex(
                name: "ix_audit_logs_user_id_created_at",
                schema: "audit",
                table: "audit_logs");

            migrationBuilder.DropIndex(
                name: "ix_audit_actions_category",
                schema: "audit",
                table: "audit_actions");

            migrationBuilder.DropIndex(
                name: "ix_audit_actions_is_active",
                schema: "audit",
                table: "audit_actions");

            migrationBuilder.DropIndex(
                name: "ix_audit_actions_severity",
                schema: "audit",
                table: "audit_actions");

            migrationBuilder.DropIndex(
                name: "ix_attempt_score_summaries_attempt_id",
                schema: "practice",
                table: "attempt_score_summaries");

            migrationBuilder.DropIndex(
                name: "ix_assessments_status",
                schema: "academic_planning",
                table: "assessments");

            migrationBuilder.DropIndex(
                name: "ix_assessments_student_id",
                schema: "academic_planning",
                table: "assessments");

            migrationBuilder.DropIndex(
                name: "ix_assessments_student_id_due_date",
                schema: "academic_planning",
                table: "assessments");

            migrationBuilder.DropIndex(
                name: "ix_assessments_student_id_status",
                schema: "academic_planning",
                table: "assessments");

            migrationBuilder.DropIndex(
                name: "ix_assessments_student_id_subject_id",
                schema: "academic_planning",
                table: "assessments");

            migrationBuilder.DropIndex(
                name: "ix_assessments_subject_id",
                schema: "academic_planning",
                table: "assessments");

            migrationBuilder.DropIndex(
                name: "ix_assessments_type",
                schema: "academic_planning",
                table: "assessments");

            migrationBuilder.DropIndex(
                name: "ix_answer_submissions_attempt_id",
                schema: "practice",
                table: "answer_submissions");

            migrationBuilder.DropIndex(
                name: "ix_answer_submissions_attempt_id_question_id",
                schema: "practice",
                table: "answer_submissions");

            migrationBuilder.DropColumn(
                name: "created_at",
                schema: "workspace",
                table: "workspace_drafts");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "workspace",
                table: "workspace_drafts");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "marketplace",
                table: "users");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "identity",
                table: "users");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "identity",
                table: "user_tokens");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "identity",
                table: "user_roles");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "identity",
                table: "user_logins");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "identity",
                table: "user_claims");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "marketplace",
                table: "tutors");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "marketplace",
                table: "tutors");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "booking",
                table: "tutors");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "marketplace",
                table: "tutor_subjects");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "marketplace",
                table: "tutor_students");

            migrationBuilder.DropColumn(
                name: "created_at",
                schema: "booking",
                table: "tutor_students");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "booking",
                table: "tutor_students");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "booking",
                table: "tutor_students");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "marketplace",
                table: "tutor_availabilities");

            migrationBuilder.DropColumn(
                name: "created_at",
                schema: "booking",
                table: "tutor_availabilities");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "booking",
                table: "tutor_availabilities");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "booking",
                table: "tutor_availabilities");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "practice",
                table: "topics");

            migrationBuilder.DropColumn(
                name: "created_at",
                schema: "mastery",
                table: "topic_masteries");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "mastery",
                table: "topic_masteries");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "mastery",
                table: "topic_masteries");

            migrationBuilder.DropColumn(
                name: "created_at",
                schema: "auth",
                table: "teachers");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "auth",
                table: "teachers");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "auth",
                table: "teachers");

            migrationBuilder.DropColumn(
                name: "requester_user_id",
                schema: "support",
                table: "support_tickets");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "support",
                table: "support_tickets");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "support",
                table: "support_messages");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "support",
                table: "support_messages");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "support",
                table: "support_categories");

            migrationBuilder.DropColumn(
                name: "created_at",
                schema: "auth",
                table: "superusers");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "auth",
                table: "superusers");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "auth",
                table: "superusers");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "entitlements",
                table: "subscriptions");

            migrationBuilder.DropColumn(
                name: "created_at",
                schema: "entitlements",
                table: "subscription_members");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "entitlements",
                table: "subscription_members");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "entitlements",
                table: "subscription_members");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "practice",
                table: "subjects");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "marketplace",
                table: "subjects");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "goals",
                table: "subjects");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "academic_planning",
                table: "subjects");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "wellbeing",
                table: "students");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "support",
                table: "students");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "practice",
                table: "students");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "goals",
                table: "students");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "calendar",
                table: "students");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "booking",
                table: "students");

            migrationBuilder.DropColumn(
                name: "created_at",
                schema: "auth",
                table: "students");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "auth",
                table: "students");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "auth",
                table: "students");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "auth",
                table: "student_teachers");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "mastery",
                table: "student_subjects");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "insights",
                table: "student_subjects");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "mastery",
                table: "student_subject_topics");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "insights",
                table: "student_subject_topics");

            migrationBuilder.DropColumn(
                name: "created_at",
                schema: "mastery",
                table: "student_subject_analytics");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "mastery",
                table: "student_subject_analytics");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "mastery",
                table: "student_subject_analytics");

            migrationBuilder.DropColumn(
                name: "created_at",
                schema: "goals",
                table: "student_rewards");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "goals",
                table: "student_rewards");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "goals",
                table: "student_rewards");

            migrationBuilder.DropColumn(
                name: "created_at",
                schema: "goals",
                table: "student_points");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "goals",
                table: "student_points");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "goals",
                table: "student_points");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "auth",
                table: "student_parents");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "auth",
                table: "student_admins");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "sales",
                table: "school_enquiries");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "identity",
                table: "roles");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "identity",
                table: "role_claims");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "goals",
                table: "rewards");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "goals",
                table: "rewards");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "goals",
                table: "reward_features");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "marketplace",
                table: "resources");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "marketplace",
                table: "resources");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "marketplace",
                table: "resource_downloads");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "calendar",
                table: "reminders");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "calendar",
                table: "reminders");

            migrationBuilder.DropColumn(
                name: "ai_generated",
                schema: "practice",
                table: "practice_tests");

            migrationBuilder.DropColumn(
                name: "aligned_sba",
                schema: "practice",
                table: "practice_tests");

            migrationBuilder.DropColumn(
                name: "created_at",
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
                name: "updated_at",
                schema: "practice",
                table: "practice_tests");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "practice",
                table: "practice_tests");

            migrationBuilder.DropColumn(
                name: "created_at",
                schema: "practice",
                table: "practice_attempts");

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
                name: "updated_at",
                schema: "practice",
                table: "practice_attempts");

            migrationBuilder.DropColumn(
                name: "xmin",
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
                name: "created_at",
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
                name: "updated_at",
                schema: "practice",
                table: "practice_attempt_items");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "practice",
                table: "practice_attempt_items");

            migrationBuilder.DropColumn(
                name: "created_at",
                schema: "goals",
                table: "points_transactions");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "goals",
                table: "points_transactions");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "goals",
                table: "points_transactions");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "entitlements",
                table: "plans");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "entitlements",
                table: "plan_quotas");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "entitlements",
                table: "plan_features");

            migrationBuilder.DropColumn(
                name: "created_at",
                schema: "auth",
                table: "parents");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "auth",
                table: "parents");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "auth",
                table: "parents");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "notifications",
                table: "notifications");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "notifications",
                table: "notifications");

            migrationBuilder.DropColumn(
                name: "sleep_hours",
                schema: "wellbeing",
                table: "mood_trackings");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "wellbeing",
                table: "mood_trackings");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "wellbeing",
                table: "mood_trackings");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "marketplace",
                table: "module_lessons");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "moderation",
                table: "moderation_actions");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "moderation",
                table: "moderation_actions");

            migrationBuilder.DropColumn(
                name: "created_at",
                schema: "mastery",
                table: "knowledge_gaps");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "mastery",
                table: "knowledge_gaps");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "mastery",
                table: "knowledge_gaps");

            migrationBuilder.DropColumn(
                name: "created_at",
                schema: "insights",
                table: "improvement_tips");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "insights",
                table: "improvement_tips");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "insights",
                table: "improvement_tips");

            migrationBuilder.DropColumn(
                name: "created_at",
                schema: "goals",
                table: "growth_trackings");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "goals",
                table: "growth_trackings");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "goals",
                table: "growth_trackings");

            migrationBuilder.DropColumn(
                name: "created_at",
                schema: "insights",
                table: "grade_distributions");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "insights",
                table: "grade_distributions");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "insights",
                table: "grade_distributions");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "goals",
                table: "goals");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "goals",
                table: "goal_milestones");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "practice",
                table: "generated_tests");

            migrationBuilder.DropColumn(
                name: "created_at",
                schema: "entitlements",
                table: "feature_usages");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "entitlements",
                table: "feature_usages");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "feature_flags",
                table: "feature_flags");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "feature_flags",
                table: "feature_flag_rules");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "feature_flags",
                table: "feature_flag_rules");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "feature_flags",
                table: "feature_flag_evaluations");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "wellbeing",
                table: "diary_goals");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "wellbeing",
                table: "diary_entries");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "academic_planning",
                table: "curriculum_subjects");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "academic_planning",
                table: "curricula");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "marketplace",
                table: "courses");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "marketplace",
                table: "course_modules");

            migrationBuilder.DropColumn(
                name: "created_at",
                schema: "marketplace",
                table: "course_enrollments");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "marketplace",
                table: "course_enrollments");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "marketplace",
                table: "course_enrollments");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "moderation",
                table: "content_reports");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "moderation",
                table: "content_filters");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "calendar",
                table: "calendar_syncs");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "calendar",
                table: "calendar_syncs");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "calendar",
                table: "calendar_events");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "audit",
                table: "audit_logs");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "audit",
                table: "audit_actions");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "audit",
                table: "audit_actions");

            migrationBuilder.DropColumn(
                name: "attempt_id",
                schema: "practice",
                table: "attempt_score_summaries");

            migrationBuilder.DropColumn(
                name: "correct_count",
                schema: "practice",
                table: "attempt_score_summaries");

            migrationBuilder.DropColumn(
                name: "created_at",
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
                name: "updated_at",
                schema: "practice",
                table: "attempt_score_summaries");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "practice",
                table: "attempt_score_summaries");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "academic_planning",
                table: "assessments");

            migrationBuilder.DropColumn(
                name: "attempt_id",
                schema: "practice",
                table: "answer_submissions");

            migrationBuilder.DropColumn(
                name: "created_at",
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

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "practice",
                table: "answer_submissions");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "practice",
                table: "answer_submissions");

            migrationBuilder.DropColumn(
                name: "created_at",
                schema: "auth",
                table: "admins");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "auth",
                table: "admins");

            migrationBuilder.DropColumn(
                name: "xmin",
                schema: "auth",
                table: "admins");

            migrationBuilder.AlterColumn<int>(
                name: "day_of_week",
                schema: "booking",
                table: "tutor_availabilities",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateIndex(
                name: "ix_plan_quotas_plan_code",
                schema: "entitlements",
                table: "plan_quotas",
                column: "plan_code");
        }
    }
}
