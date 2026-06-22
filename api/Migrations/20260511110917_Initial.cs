using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "entitlements");

            migrationBuilder.EnsureSchema(
                name: "auth");

            migrationBuilder.EnsureSchema(
                name: "practice");

            migrationBuilder.EnsureSchema(
                name: "academic_planning");

            migrationBuilder.EnsureSchema(
                name: "audit");

            migrationBuilder.EnsureSchema(
                name: "calendar");

            migrationBuilder.EnsureSchema(
                name: "moderation");

            migrationBuilder.EnsureSchema(
                name: "marketplace");

            migrationBuilder.EnsureSchema(
                name: "wellbeing");

            migrationBuilder.EnsureSchema(
                name: "feature_flags");

            migrationBuilder.EnsureSchema(
                name: "goals");

            migrationBuilder.EnsureSchema(
                name: "insights");

            migrationBuilder.EnsureSchema(
                name: "mastery");

            migrationBuilder.EnsureSchema(
                name: "identity");

            migrationBuilder.EnsureSchema(
                name: "booking");

            migrationBuilder.EnsureSchema(
                name: "support");

            migrationBuilder.CreateTable(
                name: "admins",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    school_name = table.Column<string>(type: "text", nullable: false),
                    school_code = table.Column<string>(type: "text", nullable: false),
                    contact_number = table.Column<string>(type: "text", nullable: false),
                    address = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_admins", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "answer_submissions",
                schema: "practice",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_answer_submissions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "attempt_score_summaries",
                schema: "practice",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_attempt_score_summaries", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "audit_actions",
                schema: "audit",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<string>(type: "text", nullable: false),
                    severity = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_audit_actions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "calendar_events",
                schema: "calendar",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    event_type = table.Column<string>(type: "text", nullable: false),
                    start_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_all_day = table.Column<bool>(type: "boolean", nullable: false),
                    location = table.Column<string>(type: "text", nullable: false),
                    recurrence_rule = table.Column<string>(type: "text", nullable: false),
                    color = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    related_entity_id = table.Column<long>(type: "bigint", nullable: true),
                    related_entity_type = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_calendar_events", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "calendar_syncs",
                schema: "calendar",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    provider = table.Column<string>(type: "text", nullable: false),
                    external_calendar_id = table.Column<string>(type: "text", nullable: false),
                    sync_token = table.Column<string>(type: "text", nullable: false),
                    last_synced_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    sync_status = table.Column<string>(type: "text", nullable: false),
                    sync_direction = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_calendar_syncs", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "content_filters",
                schema: "moderation",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    filter_type = table.Column<string>(type: "text", nullable: false),
                    pattern = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<string>(type: "text", nullable: false),
                    action = table.Column<string>(type: "text", nullable: false),
                    replacement = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    severity = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_content_filters", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "content_reports",
                schema: "moderation",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    reporter_user_id = table.Column<string>(type: "text", nullable: false),
                    reported_user_id = table.Column<string>(type: "text", nullable: false),
                    content_type = table.Column<string>(type: "text", nullable: false),
                    content_id = table.Column<string>(type: "text", nullable: false),
                    content_snapshot = table.Column<string>(type: "text", nullable: false),
                    reason = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    severity = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_content_reports", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "diary_entries",
                schema: "wellbeing",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    mood = table.Column<string>(type: "text", nullable: false),
                    mood_intensity = table.Column<int>(type: "integer", nullable: false),
                    entry_type = table.Column<string>(type: "text", nullable: false),
                    tags = table.Column<string>(type: "text", nullable: false),
                    is_private = table.Column<bool>(type: "boolean", nullable: false),
                    entry_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    sentiment_analysis = table.Column<string>(type: "text", nullable: false),
                    sentiment_score = table.Column<double>(type: "double precision", nullable: false),
                    key_themes = table.Column<string>(type: "text", nullable: false),
                    ai_insights = table.Column<string>(type: "text", nullable: false),
                    needs_follow_up = table.Column<bool>(type: "boolean", nullable: false),
                    follow_up_action = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_diary_entries", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "diary_goals",
                schema: "wellbeing",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<string>(type: "text", nullable: false),
                    target_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_completed = table.Column<bool>(type: "boolean", nullable: false),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_diary_goals", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "feature_flags",
                schema: "feature_flags",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    key = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    is_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    environment = table.Column<string>(type: "text", nullable: false),
                    rollout_percentage = table.Column<int>(type: "integer", nullable: false),
                    target_audience = table.Column<string>(type: "text", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_feature_flags", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "features",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "text", nullable: false),
                    code = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<string>(type: "text", nullable: false),
                    base_price = table.Column<decimal>(type: "numeric", nullable: false),
                    price_currency = table.Column<string>(type: "text", nullable: false),
                    billing_cycle = table.Column<string>(type: "text", nullable: false),
                    complexity_weight = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_features", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "generated_tests",
                schema: "practice",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_generated_tests", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "mood_trackings",
                schema: "wellbeing",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    mood = table.Column<string>(type: "text", nullable: false),
                    mood_score = table.Column<int>(type: "integer", nullable: false),
                    energy_level = table.Column<string>(type: "text", nullable: false),
                    stress_level = table.Column<string>(type: "text", nullable: false),
                    sleep_quality = table.Column<string>(type: "text", nullable: false),
                    triggers = table.Column<string>(type: "text", nullable: false),
                    coping_strategies = table.Column<string>(type: "text", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: false),
                    tracked_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_mood_trackings", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "parents",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    contact_number = table.Column<string>(type: "text", nullable: false),
                    address = table.Column<string>(type: "text", nullable: false),
                    occupation = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_parents", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "practice_attempt_items",
                schema: "practice",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_practice_attempt_items", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "practice_attempts",
                schema: "practice",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_practice_attempts", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "practice_tests",
                schema: "practice",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_practice_tests", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "rewards",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    reward_type = table.Column<string>(type: "text", nullable: false),
                    points_cost = table.Column<int>(type: "integer", nullable: false),
                    difficulty_tier = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    stock_quantity = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_rewards", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "rewards",
                schema: "goals",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    reward_type = table.Column<string>(type: "text", nullable: false),
                    points_cost = table.Column<int>(type: "integer", nullable: false),
                    difficulty_tier = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    stock_quantity = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_rewards", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "roles",
                schema: "identity",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    normalized_name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    concurrency_stamp = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_roles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "student_subject_analytics",
                schema: "academic_planning",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_student_subject_analytics", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "student_subject_topics",
                schema: "insights",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_student_subject_topics", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "student_subject_topics",
                schema: "mastery",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_student_subject_topics", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "student_subjects",
                schema: "insights",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_student_subjects", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "student_subjects",
                schema: "mastery",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_student_subjects", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "students",
                schema: "academic_planning",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_students", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "students",
                schema: "booking",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_students", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "students",
                schema: "calendar",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_students", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "students",
                schema: "goals",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_students", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "students",
                schema: "practice",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_students", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "students",
                schema: "support",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_students", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "students",
                schema: "wellbeing",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_students", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "subjects",
                schema: "academic_planning",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    code = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    color = table.Column<string>(type: "text", nullable: false),
                    text_color = table.Column<string>(type: "text", nullable: false),
                    border_color = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_subjects", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "subjects",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    code = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    color = table.Column<string>(type: "text", nullable: false),
                    text_color = table.Column<string>(type: "text", nullable: false),
                    border_color = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_subjects", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "subjects",
                schema: "goals",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_subjects", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "subjects",
                schema: "marketplace",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_subjects", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "subjects",
                schema: "practice",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_subjects", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "support_categories",
                schema: "support",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    parent_category_id = table.Column<long>(type: "bigint", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_support_categories", x => x.id);
                    table.ForeignKey(
                        name: "fk_support_categories_support_categories_parent_category_id",
                        column: x => x.parent_category_id,
                        principalSchema: "support",
                        principalTable: "support_categories",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "topics",
                schema: "practice",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_topics", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tutors",
                schema: "booking",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tutors", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tutors",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    qualification = table.Column<string>(type: "text", nullable: false),
                    specialization = table.Column<string>(type: "text", nullable: false),
                    bio = table.Column<string>(type: "text", nullable: false),
                    hourly_rate = table.Column<decimal>(type: "numeric", nullable: false),
                    years_of_experience = table.Column<int>(type: "integer", nullable: false),
                    teaching_style = table.Column<string>(type: "text", nullable: false),
                    is_verified = table.Column<bool>(type: "boolean", nullable: false),
                    rating = table.Column<double>(type: "double precision", nullable: false),
                    total_reviews = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tutors", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tutors",
                schema: "marketplace",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    qualification = table.Column<string>(type: "text", nullable: false),
                    specialization = table.Column<string>(type: "text", nullable: false),
                    bio = table.Column<string>(type: "text", nullable: false),
                    hourly_rate = table.Column<decimal>(type: "numeric", nullable: false),
                    years_of_experience = table.Column<int>(type: "integer", nullable: false),
                    teaching_style = table.Column<string>(type: "text", nullable: false),
                    is_verified = table.Column<bool>(type: "boolean", nullable: false),
                    rating = table.Column<double>(type: "double precision", nullable: false),
                    total_reviews = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tutors", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                schema: "identity",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    first_name = table.Column<string>(type: "text", nullable: false),
                    last_name = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    user_name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    normalized_user_name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    normalized_email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    email_confirmed = table.Column<bool>(type: "boolean", nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: true),
                    security_stamp = table.Column<string>(type: "text", nullable: true),
                    concurrency_stamp = table.Column<string>(type: "text", nullable: true),
                    phone_number = table.Column<string>(type: "text", nullable: true),
                    phone_number_confirmed = table.Column<bool>(type: "boolean", nullable: false),
                    two_factor_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    lockout_end = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    lockout_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    access_failed_count = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                schema: "marketplace",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "students",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    admin_id = table.Column<long>(type: "bigint", nullable: true),
                    grade = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_students", x => x.id);
                    table.ForeignKey(
                        name: "fk_students_admin_admin_id",
                        column: x => x.admin_id,
                        principalSchema: "entitlements",
                        principalTable: "admins",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "teachers",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    qualification = table.Column<string>(type: "text", nullable: false),
                    specialization = table.Column<string>(type: "text", nullable: false),
                    years_of_experience = table.Column<int>(type: "integer", nullable: false),
                    bio = table.Column<string>(type: "text", nullable: false),
                    hourly_rate = table.Column<decimal>(type: "numeric", nullable: false),
                    is_verified = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    admin_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_teachers", x => x.id);
                    table.ForeignKey(
                        name: "fk_teachers_admin_admin_id",
                        column: x => x.admin_id,
                        principalSchema: "entitlements",
                        principalTable: "admins",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "audit_logs",
                schema: "audit",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    user_email = table.Column<string>(type: "text", nullable: false),
                    user_role = table.Column<string>(type: "text", nullable: false),
                    action_id = table.Column<long>(type: "bigint", nullable: false),
                    entity_type = table.Column<string>(type: "text", nullable: false),
                    entity_id = table.Column<string>(type: "text", nullable: false),
                    service_name = table.Column<string>(type: "text", nullable: false),
                    old_values = table.Column<string>(type: "text", nullable: false),
                    new_values = table.Column<string>(type: "text", nullable: false),
                    ip_address = table.Column<string>(type: "text", nullable: false),
                    user_agent = table.Column<string>(type: "text", nullable: false),
                    correlation_id = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_audit_logs", x => x.id);
                    table.ForeignKey(
                        name: "fk_audit_logs_audit_actions_action_id",
                        column: x => x.action_id,
                        principalSchema: "audit",
                        principalTable: "audit_actions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "reminders",
                schema: "calendar",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    calendar_event_id = table.Column<long>(type: "bigint", nullable: false),
                    minutes_before = table.Column<int>(type: "integer", nullable: false),
                    reminder_type = table.Column<string>(type: "text", nullable: false),
                    is_sent = table.Column<bool>(type: "boolean", nullable: false),
                    sent_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_reminders", x => x.id);
                    table.ForeignKey(
                        name: "fk_reminders_calendar_events_calendar_event_id",
                        column: x => x.calendar_event_id,
                        principalSchema: "calendar",
                        principalTable: "calendar_events",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "moderation_actions",
                schema: "moderation",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    content_report_id = table.Column<long>(type: "bigint", nullable: false),
                    moderator_user_id = table.Column<string>(type: "text", nullable: false),
                    action_type = table.Column<string>(type: "text", nullable: false),
                    reason = table.Column<string>(type: "text", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: false),
                    is_automated = table.Column<bool>(type: "boolean", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_moderation_actions", x => x.id);
                    table.ForeignKey(
                        name: "fk_moderation_actions_content_reports_content_report_id",
                        column: x => x.content_report_id,
                        principalSchema: "moderation",
                        principalTable: "content_reports",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "feature_flag_evaluations",
                schema: "feature_flags",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    feature_flag_id = table.Column<long>(type: "bigint", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    result = table.Column<bool>(type: "boolean", nullable: false),
                    matched_rule_id = table.Column<string>(type: "text", nullable: false),
                    context = table.Column<string>(type: "text", nullable: false),
                    evaluated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_feature_flag_evaluations", x => x.id);
                    table.ForeignKey(
                        name: "fk_feature_flag_evaluations_feature_flags_feature_flag_id",
                        column: x => x.feature_flag_id,
                        principalSchema: "feature_flags",
                        principalTable: "feature_flags",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "feature_flag_rules",
                schema: "feature_flags",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    feature_flag_id = table.Column<long>(type: "bigint", nullable: false),
                    rule_type = table.Column<string>(type: "text", nullable: false),
                    @operator = table.Column<string>(name: "operator", type: "text", nullable: false),
                    value = table.Column<string>(type: "text", nullable: false),
                    priority = table.Column<int>(type: "integer", nullable: false),
                    is_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_feature_flag_rules", x => x.id);
                    table.ForeignKey(
                        name: "fk_feature_flag_rules_feature_flags_feature_flag_id",
                        column: x => x.feature_flag_id,
                        principalSchema: "feature_flags",
                        principalTable: "feature_flags",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "feature_purchases",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    feature_id = table.Column<long>(type: "bigint", nullable: false),
                    amount_paid = table.Column<decimal>(type: "numeric", nullable: false),
                    currency = table.Column<string>(type: "text", nullable: false),
                    payment_status = table.Column<string>(type: "text", nullable: false),
                    billing_cycle = table.Column<string>(type: "text", nullable: false),
                    purchase_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    activation_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    expiry_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_feature_purchases", x => x.id);
                    table.ForeignKey(
                        name: "fk_feature_purchases_features_feature_id",
                        column: x => x.feature_id,
                        principalSchema: "entitlements",
                        principalTable: "features",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "role_features",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    role_name = table.Column<string>(type: "text", nullable: false),
                    feature_id = table.Column<long>(type: "bigint", nullable: false),
                    is_default = table.Column<bool>(type: "boolean", nullable: false),
                    assigned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_role_features", x => x.id);
                    table.ForeignKey(
                        name: "fk_role_features_features_feature_id",
                        column: x => x.feature_id,
                        principalSchema: "entitlements",
                        principalTable: "features",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_features",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    feature_id = table.Column<long>(type: "bigint", nullable: false),
                    granted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    grant_type = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_features", x => x.id);
                    table.ForeignKey(
                        name: "fk_user_features_features_feature_id",
                        column: x => x.feature_id,
                        principalSchema: "entitlements",
                        principalTable: "features",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "reward_features",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    reward_id = table.Column<long>(type: "bigint", nullable: false),
                    feature_id = table.Column<long>(type: "bigint", nullable: false),
                    duration_days = table.Column<int>(type: "integer", nullable: false),
                    feature_weight = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_reward_features", x => x.id);
                    table.ForeignKey(
                        name: "fk_reward_features_features_feature_id",
                        column: x => x.feature_id,
                        principalSchema: "entitlements",
                        principalTable: "features",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_reward_features_rewards_reward_id",
                        column: x => x.reward_id,
                        principalSchema: "entitlements",
                        principalTable: "rewards",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "goals",
                schema: "goals",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    subject_id = table.Column<string>(type: "text", nullable: true),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    target = table.Column<string>(type: "text", nullable: false),
                    progress = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    due_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    category = table.Column<string>(type: "text", nullable: false),
                    reward = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    reward_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_goals", x => x.id);
                    table.ForeignKey(
                        name: "fk_goals_reward_reward_id",
                        column: x => x.reward_id,
                        principalSchema: "goals",
                        principalTable: "rewards",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "reward_features",
                schema: "goals",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    reward_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_reward_features", x => x.id);
                    table.ForeignKey(
                        name: "fk_reward_features_rewards_reward_id",
                        column: x => x.reward_id,
                        principalSchema: "goals",
                        principalTable: "rewards",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "role_claims",
                schema: "identity",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    role_id = table.Column<string>(type: "text", nullable: false),
                    claim_type = table.Column<string>(type: "text", nullable: true),
                    claim_value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_role_claims", x => x.id);
                    table.ForeignKey(
                        name: "fk_role_claims_roles_role_id",
                        column: x => x.role_id,
                        principalSchema: "identity",
                        principalTable: "roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "grade_distributions",
                schema: "insights",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_subject_id = table.Column<long>(type: "bigint", nullable: false),
                    grade = table.Column<string>(type: "text", nullable: false),
                    count = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_grade_distributions", x => x.id);
                    table.ForeignKey(
                        name: "fk_grade_distributions_student_subject_student_subject_id",
                        column: x => x.student_subject_id,
                        principalSchema: "insights",
                        principalTable: "student_subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "improvement_tips",
                schema: "insights",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_subject_id = table.Column<long>(type: "bigint", nullable: false),
                    student_subject_topic_id = table.Column<long>(type: "bigint", nullable: false),
                    tip = table.Column<string>(type: "text", nullable: false),
                    priority = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_improvement_tips", x => x.id);
                    table.ForeignKey(
                        name: "fk_improvement_tips_student_subject_student_subject_id",
                        column: x => x.student_subject_id,
                        principalSchema: "insights",
                        principalTable: "student_subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_improvement_tips_student_subject_topic_student_subject_topi",
                        column: x => x.student_subject_topic_id,
                        principalSchema: "insights",
                        principalTable: "student_subject_topics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "knowledge_gaps",
                schema: "mastery",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_subject_id = table.Column<long>(type: "bigint", nullable: false),
                    topic_id = table.Column<long>(type: "bigint", nullable: false),
                    concept = table.Column<string>(type: "text", nullable: false),
                    severity = table.Column<string>(type: "text", nullable: false),
                    last_tested = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_knowledge_gaps", x => x.id);
                    table.ForeignKey(
                        name: "fk_knowledge_gaps_student_subject_student_subject_id",
                        column: x => x.student_subject_id,
                        principalSchema: "mastery",
                        principalTable: "student_subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_knowledge_gaps_student_subject_topic_topic_id",
                        column: x => x.topic_id,
                        principalSchema: "mastery",
                        principalTable: "student_subject_topics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "student_subject_analytics",
                schema: "mastery",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_subject_id = table.Column<long>(type: "bigint", nullable: false),
                    topic_id = table.Column<long>(type: "bigint", nullable: false),
                    morning_percentage = table.Column<int>(type: "integer", nullable: false),
                    afternoon_percentage = table.Column<int>(type: "integer", nullable: false),
                    evening_percentage = table.Column<int>(type: "integer", nullable: false),
                    consistency = table.Column<int>(type: "integer", nullable: false),
                    preferred_days = table.Column<string>(type: "text", nullable: false),
                    session_length = table.Column<int>(type: "integer", nullable: false),
                    classes_attended = table.Column<int>(type: "integer", nullable: false),
                    total_classes = table.Column<int>(type: "integer", nullable: false),
                    attendance_rate = table.Column<double>(type: "double precision", nullable: false),
                    textbook_usage = table.Column<int>(type: "integer", nullable: false),
                    video_tutorials = table.Column<int>(type: "integer", nullable: false),
                    practice_problems = table.Column<int>(type: "integer", nullable: false),
                    group_study = table.Column<int>(type: "integer", nullable: false),
                    online_platforms = table.Column<int>(type: "integer", nullable: false),
                    questions_asked = table.Column<int>(type: "integer", nullable: false),
                    participation_rate = table.Column<int>(type: "integer", nullable: false),
                    resource_downloads = table.Column<int>(type: "integer", nullable: false),
                    forum_activity = table.Column<int>(type: "integer", nullable: false),
                    workload_this_week = table.Column<double>(type: "double precision", nullable: false),
                    stress_level = table.Column<double>(type: "double precision", nullable: false),
                    sleep_quality = table.Column<double>(type: "double precision", nullable: false),
                    motivation_level = table.Column<double>(type: "double precision", nullable: false),
                    importance = table.Column<int>(type: "integer", nullable: false),
                    interest_level = table.Column<double>(type: "double precision", nullable: false),
                    alignment = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_student_subject_analytics", x => x.id);
                    table.ForeignKey(
                        name: "fk_student_subject_analytics_student_subject_student_subject_id",
                        column: x => x.student_subject_id,
                        principalSchema: "mastery",
                        principalTable: "student_subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_student_subject_analytics_student_subject_topic_topic_id",
                        column: x => x.topic_id,
                        principalSchema: "mastery",
                        principalTable: "student_subject_topics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "topic_masteries",
                schema: "mastery",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_subject_id = table.Column<long>(type: "bigint", nullable: false),
                    topic_id = table.Column<string>(type: "text", nullable: false),
                    mastery_level = table.Column<double>(type: "double precision", nullable: false),
                    topic_id1 = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_topic_masteries", x => x.id);
                    table.ForeignKey(
                        name: "fk_topic_masteries_student_subject_student_subject_id",
                        column: x => x.student_subject_id,
                        principalSchema: "mastery",
                        principalTable: "student_subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_topic_masteries_student_subject_topic_topic_id1",
                        column: x => x.topic_id1,
                        principalSchema: "mastery",
                        principalTable: "student_subject_topics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "growth_trackings",
                schema: "goals",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    tracking_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    academic_growth = table.Column<decimal>(type: "numeric", nullable: false),
                    study_habit_growth = table.Column<decimal>(type: "numeric", nullable: false),
                    emotional_growth = table.Column<decimal>(type: "numeric", nullable: false),
                    overall_growth = table.Column<decimal>(type: "numeric", nullable: false),
                    growth_factors = table.Column<string>(type: "text", nullable: false),
                    areas_for_improvement = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_growth_trackings", x => x.id);
                    table.ForeignKey(
                        name: "fk_growth_trackings_student_student_id",
                        column: x => x.student_id,
                        principalSchema: "goals",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "student_points",
                schema: "goals",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    total_points = table.Column<int>(type: "integer", nullable: false),
                    available_points = table.Column<int>(type: "integer", nullable: false),
                    used_points = table.Column<int>(type: "integer", nullable: false),
                    level = table.Column<int>(type: "integer", nullable: false),
                    current_rank = table.Column<string>(type: "text", nullable: false),
                    last_updated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_student_points", x => x.id);
                    table.ForeignKey(
                        name: "fk_student_points_student_student_id",
                        column: x => x.student_id,
                        principalSchema: "goals",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "assessments",
                schema: "academic_planning",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    subject_id = table.Column<string>(type: "text", nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    score = table.Column<double>(type: "double precision", nullable: false),
                    max_score = table.Column<double>(type: "double precision", nullable: false),
                    date_taken = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    grade = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_assessments", x => x.id);
                    table.ForeignKey(
                        name: "fk_assessments_students_student_id",
                        column: x => x.student_id,
                        principalSchema: "academic_planning",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_assessments_subject_subject_id",
                        column: x => x.subject_id,
                        principalSchema: "academic_planning",
                        principalTable: "subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "student_subjects",
                schema: "academic_planning",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    subject_id = table.Column<string>(type: "text", nullable: false),
                    progress = table.Column<int>(type: "integer", nullable: true),
                    target = table.Column<int>(type: "integer", nullable: true),
                    average_score = table.Column<double>(type: "double precision", nullable: true),
                    study_hours = table.Column<int>(type: "integer", nullable: true),
                    assignments_completed = table.Column<int>(type: "integer", nullable: true),
                    upcoming_deadlines = table.Column<int>(type: "integer", nullable: true),
                    strength = table.Column<string>(type: "text", nullable: true),
                    weakness = table.Column<string>(type: "text", nullable: true),
                    last_activity = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    performance_trend = table.Column<string>(type: "text", nullable: true),
                    study_efficiency = table.Column<double>(type: "double precision", nullable: true),
                    predicted_score = table.Column<double>(type: "double precision", nullable: true),
                    difficulty_level = table.Column<double>(type: "double precision", nullable: true),
                    confidence_level = table.Column<double>(type: "double precision", nullable: true),
                    learning_velocity = table.Column<double>(type: "double precision", nullable: true),
                    retention_rate = table.Column<double>(type: "double precision", nullable: true),
                    analytics_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_student_subjects", x => x.id);
                    table.ForeignKey(
                        name: "fk_student_subjects_student_subject_analytics_analytics_id",
                        column: x => x.analytics_id,
                        principalSchema: "academic_planning",
                        principalTable: "student_subject_analytics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_student_subjects_students_student_id",
                        column: x => x.student_id,
                        principalSchema: "academic_planning",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_student_subjects_subject_subject_id",
                        column: x => x.subject_id,
                        principalSchema: "academic_planning",
                        principalTable: "subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "study_sessions",
                schema: "academic_planning",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    subject_id = table.Column<string>(type: "text", nullable: false),
                    start_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    duration_minutes = table.Column<int>(type: "integer", nullable: false),
                    session_type = table.Column<string>(type: "text", nullable: false),
                    topics_covered = table.Column<string>(type: "text", nullable: false),
                    efficiency_score = table.Column<double>(type: "double precision", nullable: false),
                    concentration_level = table.Column<int>(type: "integer", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: false),
                    resources_used = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_study_sessions", x => x.id);
                    table.ForeignKey(
                        name: "fk_study_sessions_students_student_id",
                        column: x => x.student_id,
                        principalSchema: "academic_planning",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_study_sessions_subject_subject_id",
                        column: x => x.subject_id,
                        principalSchema: "academic_planning",
                        principalTable: "subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "topics",
                schema: "academic_planning",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    subject_id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_topics", x => x.id);
                    table.ForeignKey(
                        name: "fk_topics_subjects_subject_id",
                        column: x => x.subject_id,
                        principalSchema: "academic_planning",
                        principalTable: "subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "topics",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    subject_id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_topics", x => x.id);
                    table.ForeignKey(
                        name: "fk_topics_subjects_subject_id",
                        column: x => x.subject_id,
                        principalSchema: "entitlements",
                        principalTable: "subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "support_tickets",
                schema: "support",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    category_id = table.Column<long>(type: "bigint", nullable: false),
                    subject = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    priority = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    assigned_to_user_id = table.Column<string>(type: "text", nullable: false),
                    channel = table.Column<string>(type: "text", nullable: false),
                    resolved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    closed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    resolution_notes = table.Column<string>(type: "text", nullable: false),
                    satisfaction_rating = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_support_tickets", x => x.id);
                    table.ForeignKey(
                        name: "fk_support_tickets_support_categories_category_id",
                        column: x => x.category_id,
                        principalSchema: "support",
                        principalTable: "support_categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tutor_availabilities",
                schema: "booking",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tutor_id = table.Column<long>(type: "bigint", nullable: false),
                    day_of_week = table.Column<int>(type: "integer", nullable: false),
                    start_time = table.Column<TimeSpan>(type: "interval", nullable: false),
                    end_time = table.Column<TimeSpan>(type: "interval", nullable: false),
                    is_available = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tutor_availabilities", x => x.id);
                    table.ForeignKey(
                        name: "fk_tutor_availabilities_tutors_tutor_id",
                        column: x => x.tutor_id,
                        principalSchema: "booking",
                        principalTable: "tutors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tutor_students",
                schema: "booking",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tutor_id = table.Column<long>(type: "bigint", nullable: false),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    started_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    sessions_per_week = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tutor_students", x => x.id);
                    table.ForeignKey(
                        name: "fk_tutor_students_students_student_id",
                        column: x => x.student_id,
                        principalSchema: "booking",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_tutor_students_tutors_tutor_id",
                        column: x => x.tutor_id,
                        principalSchema: "booking",
                        principalTable: "tutors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tutor_availabilities",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tutor_id = table.Column<long>(type: "bigint", nullable: false),
                    day_of_week = table.Column<int>(type: "integer", nullable: false),
                    start_time = table.Column<TimeSpan>(type: "interval", nullable: false),
                    end_time = table.Column<TimeSpan>(type: "interval", nullable: false),
                    is_available = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tutor_availabilities", x => x.id);
                    table.ForeignKey(
                        name: "fk_tutor_availabilities_tutors_tutor_id",
                        column: x => x.tutor_id,
                        principalSchema: "entitlements",
                        principalTable: "tutors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tutor_subjects",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tutor_id = table.Column<long>(type: "bigint", nullable: false),
                    subject_id = table.Column<string>(type: "text", nullable: false),
                    proficiency_level = table.Column<int>(type: "integer", nullable: false),
                    custom_hourly_rate = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tutor_subjects", x => x.id);
                    table.ForeignKey(
                        name: "fk_tutor_subjects_subject_subject_id",
                        column: x => x.subject_id,
                        principalSchema: "entitlements",
                        principalTable: "subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_tutor_subjects_tutors_tutor_id",
                        column: x => x.tutor_id,
                        principalSchema: "entitlements",
                        principalTable: "tutors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tutor_availabilities",
                schema: "marketplace",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tutor_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tutor_availabilities", x => x.id);
                    table.ForeignKey(
                        name: "fk_tutor_availabilities_tutors_tutor_id",
                        column: x => x.tutor_id,
                        principalSchema: "marketplace",
                        principalTable: "tutors",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "tutor_students",
                schema: "marketplace",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tutor_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tutor_students", x => x.id);
                    table.ForeignKey(
                        name: "fk_tutor_students_tutors_tutor_id",
                        column: x => x.tutor_id,
                        principalSchema: "marketplace",
                        principalTable: "tutors",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "tutor_subjects",
                schema: "marketplace",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tutor_id = table.Column<long>(type: "bigint", nullable: false),
                    subject_id = table.Column<string>(type: "text", nullable: false),
                    proficiency_level = table.Column<int>(type: "integer", nullable: false),
                    custom_hourly_rate = table.Column<decimal>(type: "numeric", nullable: false),
                    subject_id1 = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tutor_subjects", x => x.id);
                    table.ForeignKey(
                        name: "fk_tutor_subjects_subject_subject_id1",
                        column: x => x.subject_id1,
                        principalSchema: "marketplace",
                        principalTable: "subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_tutor_subjects_tutors_tutor_id",
                        column: x => x.tutor_id,
                        principalSchema: "marketplace",
                        principalTable: "tutors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "admins",
                schema: "auth",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_admins", x => x.id);
                    table.ForeignKey(
                        name: "fk_admins_users_user_id",
                        column: x => x.user_id,
                        principalSchema: "identity",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "parents",
                schema: "auth",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_parents", x => x.id);
                    table.ForeignKey(
                        name: "fk_parents_users_user_id",
                        column: x => x.user_id,
                        principalSchema: "identity",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "students",
                schema: "auth",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_students", x => x.id);
                    table.ForeignKey(
                        name: "fk_students_users_user_id",
                        column: x => x.user_id,
                        principalSchema: "identity",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "superusers",
                schema: "auth",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_superusers", x => x.id);
                    table.ForeignKey(
                        name: "fk_superusers_users_user_id",
                        column: x => x.user_id,
                        principalSchema: "identity",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "teachers",
                schema: "auth",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_teachers", x => x.id);
                    table.ForeignKey(
                        name: "fk_teachers_users_user_id",
                        column: x => x.user_id,
                        principalSchema: "identity",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_claims",
                schema: "identity",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    claim_type = table.Column<string>(type: "text", nullable: true),
                    claim_value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_claims", x => x.id);
                    table.ForeignKey(
                        name: "fk_user_claims_users_user_id",
                        column: x => x.user_id,
                        principalSchema: "identity",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_logins",
                schema: "identity",
                columns: table => new
                {
                    login_provider = table.Column<string>(type: "text", nullable: false),
                    provider_key = table.Column<string>(type: "text", nullable: false),
                    provider_display_name = table.Column<string>(type: "text", nullable: true),
                    user_id = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_logins", x => new { x.login_provider, x.provider_key });
                    table.ForeignKey(
                        name: "fk_user_logins_users_user_id",
                        column: x => x.user_id,
                        principalSchema: "identity",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_roles",
                schema: "identity",
                columns: table => new
                {
                    user_id = table.Column<string>(type: "text", nullable: false),
                    role_id = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_roles", x => new { x.user_id, x.role_id });
                    table.ForeignKey(
                        name: "fk_user_roles_roles_role_id",
                        column: x => x.role_id,
                        principalSchema: "identity",
                        principalTable: "roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_user_roles_users_user_id",
                        column: x => x.user_id,
                        principalSchema: "identity",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_tokens",
                schema: "identity",
                columns: table => new
                {
                    user_id = table.Column<string>(type: "text", nullable: false),
                    login_provider = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_tokens", x => new { x.user_id, x.login_provider, x.name });
                    table.ForeignKey(
                        name: "fk_user_tokens_users_user_id",
                        column: x => x.user_id,
                        principalSchema: "identity",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "courses",
                schema: "marketplace",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    subject_id = table.Column<string>(type: "text", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    tutor_id = table.Column<long>(type: "bigint", nullable: true),
                    price = table.Column<decimal>(type: "numeric", nullable: false),
                    currency = table.Column<string>(type: "text", nullable: false),
                    level = table.Column<string>(type: "text", nullable: false),
                    thumbnail_url = table.Column<string>(type: "text", nullable: false),
                    preview_video_url = table.Column<string>(type: "text", nullable: false),
                    rating = table.Column<double>(type: "double precision", nullable: false),
                    total_students = table.Column<int>(type: "integer", nullable: false),
                    total_lessons = table.Column<int>(type: "integer", nullable: false),
                    total_hours = table.Column<decimal>(type: "numeric", nullable: false),
                    is_published = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_courses", x => x.id);
                    table.ForeignKey(
                        name: "fk_courses_tutor_tutor_id",
                        column: x => x.tutor_id,
                        principalSchema: "marketplace",
                        principalTable: "tutors",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_courses_user_user_id",
                        column: x => x.user_id,
                        principalSchema: "marketplace",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "admin_students",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    school_admin_id = table.Column<long>(type: "bigint", nullable: false),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    enrolled_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    enrollment_status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_admin_students", x => x.id);
                    table.ForeignKey(
                        name: "fk_admin_students_admins_school_admin_id",
                        column: x => x.school_admin_id,
                        principalSchema: "entitlements",
                        principalTable: "admins",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_admin_students_students_student_id",
                        column: x => x.student_id,
                        principalSchema: "entitlements",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "assessments",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    subject_id = table.Column<string>(type: "text", nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    score = table.Column<double>(type: "double precision", nullable: false),
                    max_score = table.Column<double>(type: "double precision", nullable: false),
                    date_taken = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    grade = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_assessments", x => x.id);
                    table.ForeignKey(
                        name: "fk_assessments_student_student_id",
                        column: x => x.student_id,
                        principalSchema: "entitlements",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_assessments_subject_subject_id",
                        column: x => x.subject_id,
                        principalSchema: "entitlements",
                        principalTable: "subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "diary_entries",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    mood = table.Column<string>(type: "text", nullable: false),
                    mood_intensity = table.Column<int>(type: "integer", nullable: false),
                    entry_type = table.Column<string>(type: "text", nullable: false),
                    tags = table.Column<string>(type: "text", nullable: false),
                    is_private = table.Column<bool>(type: "boolean", nullable: false),
                    entry_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    sentiment_analysis = table.Column<string>(type: "text", nullable: false),
                    sentiment_score = table.Column<double>(type: "double precision", nullable: false),
                    key_themes = table.Column<string>(type: "text", nullable: false),
                    ai_insights = table.Column<string>(type: "text", nullable: false),
                    needs_follow_up = table.Column<bool>(type: "boolean", nullable: false),
                    follow_up_action = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_diary_entries", x => x.id);
                    table.ForeignKey(
                        name: "fk_diary_entries_students_student_id",
                        column: x => x.student_id,
                        principalSchema: "entitlements",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "diary_mood_trackings",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    tracking_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    overall_mood = table.Column<string>(type: "text", nullable: false),
                    energy_level = table.Column<int>(type: "integer", nullable: false),
                    stress_level = table.Column<int>(type: "integer", nullable: false),
                    motivation_level = table.Column<int>(type: "integer", nullable: false),
                    factors_affecting_mood = table.Column<string>(type: "text", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_diary_mood_trackings", x => x.id);
                    table.ForeignKey(
                        name: "fk_diary_mood_trackings_students_student_id",
                        column: x => x.student_id,
                        principalSchema: "entitlements",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "goals",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    goal_type = table.Column<string>(type: "text", nullable: false),
                    subject_id = table.Column<string>(type: "text", nullable: false),
                    target_value = table.Column<decimal>(type: "numeric", nullable: false),
                    current_value = table.Column<decimal>(type: "numeric", nullable: false),
                    unit = table.Column<string>(type: "text", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    target_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    priority = table.Column<int>(type: "integer", nullable: false),
                    difficulty_weight = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_goals", x => x.id);
                    table.ForeignKey(
                        name: "fk_goals_students_student_id",
                        column: x => x.student_id,
                        principalSchema: "entitlements",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_goals_subjects_subject_id",
                        column: x => x.subject_id,
                        principalSchema: "entitlements",
                        principalTable: "subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "growth_trackings",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    tracking_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    academic_growth = table.Column<decimal>(type: "numeric", nullable: false),
                    study_habit_growth = table.Column<decimal>(type: "numeric", nullable: false),
                    emotional_growth = table.Column<decimal>(type: "numeric", nullable: false),
                    overall_growth = table.Column<decimal>(type: "numeric", nullable: false),
                    growth_factors = table.Column<string>(type: "text", nullable: false),
                    areas_for_improvement = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_growth_trackings", x => x.id);
                    table.ForeignKey(
                        name: "fk_growth_trackings_students_student_id",
                        column: x => x.student_id,
                        principalSchema: "entitlements",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "parent_students",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    parent_id = table.Column<long>(type: "bigint", nullable: false),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    relationship = table.Column<string>(type: "text", nullable: false),
                    is_primary_contact = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_parent_students", x => x.id);
                    table.ForeignKey(
                        name: "fk_parent_students_parents_parent_id",
                        column: x => x.parent_id,
                        principalSchema: "entitlements",
                        principalTable: "parents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_parent_students_students_student_id",
                        column: x => x.student_id,
                        principalSchema: "entitlements",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "student_points",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    total_points = table.Column<int>(type: "integer", nullable: false),
                    available_points = table.Column<int>(type: "integer", nullable: false),
                    used_points = table.Column<int>(type: "integer", nullable: false),
                    level = table.Column<int>(type: "integer", nullable: false),
                    current_rank = table.Column<string>(type: "text", nullable: false),
                    last_updated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_student_points", x => x.id);
                    table.ForeignKey(
                        name: "fk_student_points_students_student_id",
                        column: x => x.student_id,
                        principalSchema: "entitlements",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "student_subjects",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    subject_id = table.Column<string>(type: "text", nullable: false),
                    progress = table.Column<int>(type: "integer", nullable: true),
                    target = table.Column<int>(type: "integer", nullable: true),
                    average_score = table.Column<double>(type: "double precision", nullable: true),
                    study_hours = table.Column<int>(type: "integer", nullable: true),
                    assignments_completed = table.Column<int>(type: "integer", nullable: true),
                    upcoming_deadlines = table.Column<int>(type: "integer", nullable: true),
                    strength = table.Column<string>(type: "text", nullable: true),
                    weakness = table.Column<string>(type: "text", nullable: true),
                    last_activity = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    performance_trend = table.Column<string>(type: "text", nullable: true),
                    study_efficiency = table.Column<double>(type: "double precision", nullable: true),
                    predicted_score = table.Column<double>(type: "double precision", nullable: true),
                    difficulty_level = table.Column<double>(type: "double precision", nullable: true),
                    confidence_level = table.Column<double>(type: "double precision", nullable: true),
                    learning_velocity = table.Column<double>(type: "double precision", nullable: true),
                    retention_rate = table.Column<double>(type: "double precision", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_student_subjects", x => x.id);
                    table.ForeignKey(
                        name: "fk_student_subjects_students_student_id",
                        column: x => x.student_id,
                        principalSchema: "entitlements",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_student_subjects_subject_subject_id",
                        column: x => x.subject_id,
                        principalSchema: "entitlements",
                        principalTable: "subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "study_sessions",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    subject_id = table.Column<string>(type: "text", nullable: false),
                    start_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    duration_minutes = table.Column<int>(type: "integer", nullable: false),
                    session_type = table.Column<string>(type: "text", nullable: false),
                    topics_covered = table.Column<string>(type: "text", nullable: false),
                    efficiency_score = table.Column<double>(type: "double precision", nullable: false),
                    concentration_level = table.Column<int>(type: "integer", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: false),
                    resources_used = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_study_sessions", x => x.id);
                    table.ForeignKey(
                        name: "fk_study_sessions_students_student_id",
                        column: x => x.student_id,
                        principalSchema: "entitlements",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_study_sessions_subject_subject_id",
                        column: x => x.subject_id,
                        principalSchema: "entitlements",
                        principalTable: "subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tutor_students",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tutor_id = table.Column<long>(type: "bigint", nullable: false),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    started_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    sessions_per_week = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tutor_students", x => x.id);
                    table.ForeignKey(
                        name: "fk_tutor_students_student_student_id",
                        column: x => x.student_id,
                        principalSchema: "entitlements",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_tutor_students_tutors_tutor_id",
                        column: x => x.tutor_id,
                        principalSchema: "entitlements",
                        principalTable: "tutors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "courses",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    subject_id = table.Column<string>(type: "text", nullable: false),
                    teacher_id = table.Column<long>(type: "bigint", nullable: true),
                    tutor_id = table.Column<long>(type: "bigint", nullable: true),
                    price = table.Column<decimal>(type: "numeric", nullable: false),
                    currency = table.Column<string>(type: "text", nullable: false),
                    level = table.Column<string>(type: "text", nullable: false),
                    thumbnail_url = table.Column<string>(type: "text", nullable: false),
                    preview_video_url = table.Column<string>(type: "text", nullable: false),
                    rating = table.Column<double>(type: "double precision", nullable: false),
                    total_students = table.Column<int>(type: "integer", nullable: false),
                    total_lessons = table.Column<int>(type: "integer", nullable: false),
                    total_hours = table.Column<decimal>(type: "numeric", nullable: false),
                    is_published = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_courses", x => x.id);
                    table.ForeignKey(
                        name: "fk_courses_subjects_subject_id",
                        column: x => x.subject_id,
                        principalSchema: "entitlements",
                        principalTable: "subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_courses_teachers_teacher_id",
                        column: x => x.teacher_id,
                        principalSchema: "entitlements",
                        principalTable: "teachers",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_courses_tutors_tutor_id",
                        column: x => x.tutor_id,
                        principalSchema: "entitlements",
                        principalTable: "tutors",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "teacher_admins",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    teacher_id = table.Column<long>(type: "bigint", nullable: false),
                    admin_id = table.Column<long>(type: "bigint", nullable: false),
                    associated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    role = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_teacher_admins", x => x.id);
                    table.ForeignKey(
                        name: "fk_teacher_admins_admin_admin_id",
                        column: x => x.admin_id,
                        principalSchema: "entitlements",
                        principalTable: "admins",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_teacher_admins_teachers_teacher_id",
                        column: x => x.teacher_id,
                        principalSchema: "entitlements",
                        principalTable: "teachers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "teacher_students",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    teacher_id = table.Column<long>(type: "bigint", nullable: false),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    assigned_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_teacher_students", x => x.id);
                    table.ForeignKey(
                        name: "fk_teacher_students_student_student_id",
                        column: x => x.student_id,
                        principalSchema: "entitlements",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_teacher_students_teachers_teacher_id",
                        column: x => x.teacher_id,
                        principalSchema: "entitlements",
                        principalTable: "teachers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "teacher_subjects",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    teacher_id = table.Column<long>(type: "bigint", nullable: false),
                    subject_id = table.Column<string>(type: "text", nullable: false),
                    proficiency_level = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_teacher_subjects", x => x.id);
                    table.ForeignKey(
                        name: "fk_teacher_subjects_subject_subject_id",
                        column: x => x.subject_id,
                        principalSchema: "entitlements",
                        principalTable: "subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_teacher_subjects_teachers_teacher_id",
                        column: x => x.teacher_id,
                        principalSchema: "entitlements",
                        principalTable: "teachers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "goal_milestones",
                schema: "goals",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    goal_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    priority = table.Column<int>(type: "integer", nullable: false),
                    is_completed = table.Column<bool>(type: "boolean", nullable: false),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    reward_points = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_goal_milestones", x => x.id);
                    table.ForeignKey(
                        name: "fk_goal_milestones_goals_goal_id",
                        column: x => x.goal_id,
                        principalSchema: "goals",
                        principalTable: "goals",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "student_rewards",
                schema: "goals",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    reward_id = table.Column<long>(type: "bigint", nullable: false),
                    goal_id = table.Column<long>(type: "bigint", nullable: true),
                    earned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    points_earned = table.Column<int>(type: "integer", nullable: false),
                    achievement_context = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_student_rewards", x => x.id);
                    table.ForeignKey(
                        name: "fk_student_rewards_goals_goal_id",
                        column: x => x.goal_id,
                        principalSchema: "goals",
                        principalTable: "goals",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_student_rewards_rewards_reward_id",
                        column: x => x.reward_id,
                        principalSchema: "goals",
                        principalTable: "rewards",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_student_rewards_student_student_id",
                        column: x => x.student_id,
                        principalSchema: "goals",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "points_transactions",
                schema: "goals",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_points_id = table.Column<long>(type: "bigint", nullable: false),
                    points = table.Column<int>(type: "integer", nullable: false),
                    transaction_type = table.Column<string>(type: "text", nullable: false),
                    source = table.Column<string>(type: "text", nullable: false),
                    related_goal_id = table.Column<long>(type: "bigint", nullable: true),
                    related_reward_id = table.Column<long>(type: "bigint", nullable: true),
                    description = table.Column<string>(type: "text", nullable: false),
                    transaction_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_points_transactions", x => x.id);
                    table.ForeignKey(
                        name: "fk_points_transactions_goals_related_goal_id",
                        column: x => x.related_goal_id,
                        principalSchema: "goals",
                        principalTable: "goals",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_points_transactions_reward_related_reward_id",
                        column: x => x.related_reward_id,
                        principalSchema: "goals",
                        principalTable: "rewards",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_points_transactions_student_points_student_points_id",
                        column: x => x.student_points_id,
                        principalSchema: "goals",
                        principalTable: "student_points",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "assessment_breakdowns",
                schema: "academic_planning",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_subject_id = table.Column<long>(type: "bigint", nullable: false),
                    assessment_type = table.Column<string>(type: "text", nullable: false),
                    count = table.Column<int>(type: "integer", nullable: false),
                    average = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_assessment_breakdowns", x => x.id);
                    table.ForeignKey(
                        name: "fk_assessment_breakdowns_student_subject_student_subject_id",
                        column: x => x.student_subject_id,
                        principalSchema: "academic_planning",
                        principalTable: "student_subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "improvement_tips",
                schema: "academic_planning",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_subject_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_improvement_tips", x => x.id);
                    table.ForeignKey(
                        name: "fk_improvement_tips_student_subject_student_subject_id",
                        column: x => x.student_subject_id,
                        principalSchema: "academic_planning",
                        principalTable: "student_subjects",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "knowledge_gaps",
                schema: "academic_planning",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_subject_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_knowledge_gaps", x => x.id);
                    table.ForeignKey(
                        name: "fk_knowledge_gaps_student_subject_student_subject_id",
                        column: x => x.student_subject_id,
                        principalSchema: "academic_planning",
                        principalTable: "student_subjects",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "weekly_study_hours",
                schema: "academic_planning",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_subject_id = table.Column<long>(type: "bigint", nullable: false),
                    week_number = table.Column<int>(type: "integer", nullable: false),
                    hours = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_weekly_study_hours", x => x.id);
                    table.ForeignKey(
                        name: "fk_weekly_study_hours_student_subjects_student_subject_id",
                        column: x => x.student_subject_id,
                        principalSchema: "academic_planning",
                        principalTable: "student_subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "student_subject_topics",
                schema: "academic_planning",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_subject_id = table.Column<long>(type: "bigint", nullable: false),
                    topic_id = table.Column<long>(type: "bigint", nullable: false),
                    score = table.Column<double>(type: "double precision", nullable: false),
                    trend = table.Column<string>(type: "text", nullable: false),
                    last_tested = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_student_subject_topics", x => x.id);
                    table.ForeignKey(
                        name: "fk_student_subject_topics_student_subjects_student_subject_id",
                        column: x => x.student_subject_id,
                        principalSchema: "academic_planning",
                        principalTable: "student_subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_student_subject_topics_topic_topic_id",
                        column: x => x.topic_id,
                        principalSchema: "academic_planning",
                        principalTable: "topics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "support_messages",
                schema: "support",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ticket_id = table.Column<long>(type: "bigint", nullable: false),
                    sender_user_id = table.Column<string>(type: "text", nullable: false),
                    sender_role = table.Column<string>(type: "text", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    attachment_urls = table.Column<string>(type: "text", nullable: false),
                    is_internal = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_support_messages", x => x.id);
                    table.ForeignKey(
                        name: "fk_support_messages_support_ticket_ticket_id",
                        column: x => x.ticket_id,
                        principalSchema: "support",
                        principalTable: "support_tickets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "student_admins",
                schema: "auth",
                columns: table => new
                {
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    admin_id = table.Column<long>(type: "bigint", nullable: false),
                    assigned_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_student_admins", x => new { x.student_id, x.admin_id });
                    table.ForeignKey(
                        name: "fk_student_admins_admins_admin_id",
                        column: x => x.admin_id,
                        principalSchema: "auth",
                        principalTable: "admins",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_student_admins_students_student_id",
                        column: x => x.student_id,
                        principalSchema: "auth",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "student_parents",
                schema: "auth",
                columns: table => new
                {
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    parent_id = table.Column<long>(type: "bigint", nullable: false),
                    assigned_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_student_parents", x => new { x.student_id, x.parent_id });
                    table.ForeignKey(
                        name: "fk_student_parents_parents_parent_id",
                        column: x => x.parent_id,
                        principalSchema: "auth",
                        principalTable: "parents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_student_parents_students_student_id",
                        column: x => x.student_id,
                        principalSchema: "auth",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "student_teachers",
                schema: "auth",
                columns: table => new
                {
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    teacher_id = table.Column<long>(type: "bigint", nullable: false),
                    assigned_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_student_teachers", x => new { x.student_id, x.teacher_id });
                    table.ForeignKey(
                        name: "fk_student_teachers_students_student_id",
                        column: x => x.student_id,
                        principalSchema: "auth",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_student_teachers_teacher_teacher_id",
                        column: x => x.teacher_id,
                        principalSchema: "auth",
                        principalTable: "teachers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "course_enrollments",
                schema: "marketplace",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    course_id = table.Column<long>(type: "bigint", nullable: false),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    enrolled_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    amount_paid = table.Column<decimal>(type: "numeric", nullable: false),
                    payment_status = table.Column<string>(type: "text", nullable: false),
                    progress = table.Column<decimal>(type: "numeric", nullable: false),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    user_id1 = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_enrollments", x => x.id);
                    table.ForeignKey(
                        name: "fk_course_enrollments_courses_course_id",
                        column: x => x.course_id,
                        principalSchema: "marketplace",
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_course_enrollments_user_user_id1",
                        column: x => x.user_id1,
                        principalSchema: "marketplace",
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "course_modules",
                schema: "marketplace",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    course_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    order = table.Column<int>(type: "integer", nullable: false),
                    duration_hours = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_modules", x => x.id);
                    table.ForeignKey(
                        name: "fk_course_modules_courses_course_id",
                        column: x => x.course_id,
                        principalSchema: "marketplace",
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "resources",
                schema: "marketplace",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    user_id = table.Column<long>(type: "bigint", nullable: true),
                    course_id = table.Column<long>(type: "bigint", nullable: true),
                    subject_id = table.Column<string>(type: "text", nullable: true),
                    resource_type = table.Column<string>(type: "text", nullable: false),
                    s3key = table.Column<string>(type: "text", nullable: false),
                    file_url = table.Column<string>(type: "text", nullable: false),
                    file_size = table.Column<string>(type: "text", nullable: false),
                    file_format = table.Column<string>(type: "text", nullable: false),
                    price = table.Column<decimal>(type: "numeric", nullable: false),
                    is_free = table.Column<bool>(type: "boolean", nullable: false),
                    download_count = table.Column<int>(type: "integer", nullable: false),
                    rating = table.Column<double>(type: "double precision", nullable: false),
                    grade_level = table.Column<string>(type: "text", nullable: false),
                    is_approved = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    user_id1 = table.Column<string>(type: "text", nullable: true),
                    subject_id1 = table.Column<long>(type: "bigint", nullable: false),
                    tutor_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_resources", x => x.id);
                    table.ForeignKey(
                        name: "fk_resources_courses_course_id",
                        column: x => x.course_id,
                        principalSchema: "marketplace",
                        principalTable: "courses",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_resources_subject_subject_id1",
                        column: x => x.subject_id1,
                        principalSchema: "marketplace",
                        principalTable: "subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_resources_tutor_tutor_id",
                        column: x => x.tutor_id,
                        principalSchema: "marketplace",
                        principalTable: "tutors",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_resources_user_user_id1",
                        column: x => x.user_id1,
                        principalSchema: "marketplace",
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "diary_goals",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    diary_entry_id = table.Column<long>(type: "bigint", nullable: false),
                    goal_id = table.Column<long>(type: "bigint", nullable: false),
                    connection_type = table.Column<string>(type: "text", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_diary_goals", x => x.id);
                    table.ForeignKey(
                        name: "fk_diary_goals_diary_entries_diary_entry_id",
                        column: x => x.diary_entry_id,
                        principalSchema: "entitlements",
                        principalTable: "diary_entries",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_diary_goals_goal_goal_id",
                        column: x => x.goal_id,
                        principalSchema: "entitlements",
                        principalTable: "goals",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "goal_milestones",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    goal_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    target_value = table.Column<decimal>(type: "numeric", nullable: false),
                    is_completed = table.Column<bool>(type: "boolean", nullable: false),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    reward_points = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_goal_milestones", x => x.id);
                    table.ForeignKey(
                        name: "fk_goal_milestones_goals_goal_id",
                        column: x => x.goal_id,
                        principalSchema: "entitlements",
                        principalTable: "goals",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "goal_reward",
                schema: "entitlements",
                columns: table => new
                {
                    applicable_goals_id = table.Column<long>(type: "bigint", nullable: false),
                    potential_rewards_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_goal_reward", x => new { x.applicable_goals_id, x.potential_rewards_id });
                    table.ForeignKey(
                        name: "fk_goal_reward_goal_applicable_goals_id",
                        column: x => x.applicable_goals_id,
                        principalSchema: "entitlements",
                        principalTable: "goals",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_goal_reward_reward_potential_rewards_id",
                        column: x => x.potential_rewards_id,
                        principalSchema: "entitlements",
                        principalTable: "rewards",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "student_rewards",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    reward_id = table.Column<long>(type: "bigint", nullable: false),
                    goal_id = table.Column<long>(type: "bigint", nullable: true),
                    earned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    points_earned = table.Column<int>(type: "integer", nullable: false),
                    achievement_context = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_student_rewards", x => x.id);
                    table.ForeignKey(
                        name: "fk_student_rewards_goal_goal_id",
                        column: x => x.goal_id,
                        principalSchema: "entitlements",
                        principalTable: "goals",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_student_rewards_rewards_reward_id",
                        column: x => x.reward_id,
                        principalSchema: "entitlements",
                        principalTable: "rewards",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_student_rewards_students_student_id",
                        column: x => x.student_id,
                        principalSchema: "entitlements",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "points_transactions",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_points_id = table.Column<long>(type: "bigint", nullable: false),
                    points = table.Column<int>(type: "integer", nullable: false),
                    transaction_type = table.Column<string>(type: "text", nullable: false),
                    source = table.Column<string>(type: "text", nullable: false),
                    related_goal_id = table.Column<long>(type: "bigint", nullable: true),
                    related_reward_id = table.Column<long>(type: "bigint", nullable: true),
                    description = table.Column<string>(type: "text", nullable: false),
                    transaction_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_points_transactions", x => x.id);
                    table.ForeignKey(
                        name: "fk_points_transactions_goal_related_goal_id",
                        column: x => x.related_goal_id,
                        principalSchema: "entitlements",
                        principalTable: "goals",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_points_transactions_reward_related_reward_id",
                        column: x => x.related_reward_id,
                        principalSchema: "entitlements",
                        principalTable: "rewards",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_points_transactions_student_points_student_points_id",
                        column: x => x.student_points_id,
                        principalSchema: "entitlements",
                        principalTable: "student_points",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "assessment_breakdowns",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_subject_id = table.Column<long>(type: "bigint", nullable: false),
                    assessment_type = table.Column<string>(type: "text", nullable: false),
                    count = table.Column<int>(type: "integer", nullable: false),
                    average = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_assessment_breakdowns", x => x.id);
                    table.ForeignKey(
                        name: "fk_assessment_breakdowns_student_subject_student_subject_id",
                        column: x => x.student_subject_id,
                        principalSchema: "entitlements",
                        principalTable: "student_subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "grade_distributions",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_subject_id = table.Column<long>(type: "bigint", nullable: false),
                    grade = table.Column<string>(type: "text", nullable: false),
                    count = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_grade_distributions", x => x.id);
                    table.ForeignKey(
                        name: "fk_grade_distributions_student_subject_student_subject_id",
                        column: x => x.student_subject_id,
                        principalSchema: "entitlements",
                        principalTable: "student_subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "improvement_tips",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_subject_id = table.Column<long>(type: "bigint", nullable: false),
                    tip = table.Column<string>(type: "text", nullable: false),
                    priority = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_improvement_tips", x => x.id);
                    table.ForeignKey(
                        name: "fk_improvement_tips_student_subject_student_subject_id",
                        column: x => x.student_subject_id,
                        principalSchema: "entitlements",
                        principalTable: "student_subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "knowledge_gaps",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_subject_id = table.Column<long>(type: "bigint", nullable: false),
                    concept = table.Column<string>(type: "text", nullable: false),
                    severity = table.Column<string>(type: "text", nullable: false),
                    last_tested = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_knowledge_gaps", x => x.id);
                    table.ForeignKey(
                        name: "fk_knowledge_gaps_student_subject_student_subject_id",
                        column: x => x.student_subject_id,
                        principalSchema: "entitlements",
                        principalTable: "student_subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "peer_comparisons",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_subject_id = table.Column<long>(type: "bigint", nullable: false),
                    class_average = table.Column<double>(type: "double precision", nullable: false),
                    percentile = table.Column<int>(type: "integer", nullable: false),
                    ranking = table.Column<int>(type: "integer", nullable: false),
                    trend_comparison = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_peer_comparisons", x => x.id);
                    table.ForeignKey(
                        name: "fk_peer_comparisons_student_subject_student_subject_id",
                        column: x => x.student_subject_id,
                        principalSchema: "entitlements",
                        principalTable: "student_subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "prediction_metrics",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_subject_id = table.Column<long>(type: "bigint", nullable: false),
                    final_grade_probability_a = table.Column<int>(type: "integer", nullable: false),
                    final_grade_probability_b = table.Column<int>(type: "integer", nullable: false),
                    final_grade_probability_c = table.Column<int>(type: "integer", nullable: false),
                    final_grade_probability_d = table.Column<int>(type: "integer", nullable: false),
                    risk_level = table.Column<string>(type: "text", nullable: false),
                    intervention_needed = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_prediction_metrics", x => x.id);
                    table.ForeignKey(
                        name: "fk_prediction_metrics_student_subject_student_subject_id",
                        column: x => x.student_subject_id,
                        principalSchema: "entitlements",
                        principalTable: "student_subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "prerequisite_masteries",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_subject_id = table.Column<long>(type: "bigint", nullable: false),
                    prerequisite = table.Column<string>(type: "text", nullable: false),
                    mastery_level = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_prerequisite_masteries", x => x.id);
                    table.ForeignKey(
                        name: "fk_prerequisite_masteries_student_subject_student_subject_id",
                        column: x => x.student_subject_id,
                        principalSchema: "entitlements",
                        principalTable: "student_subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "student_subject_analytics",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_subject_id = table.Column<long>(type: "bigint", nullable: false),
                    morning_percentage = table.Column<int>(type: "integer", nullable: false),
                    afternoon_percentage = table.Column<int>(type: "integer", nullable: false),
                    evening_percentage = table.Column<int>(type: "integer", nullable: false),
                    consistency = table.Column<int>(type: "integer", nullable: false),
                    preferred_days = table.Column<string>(type: "text", nullable: false),
                    session_length = table.Column<int>(type: "integer", nullable: false),
                    classes_attended = table.Column<int>(type: "integer", nullable: false),
                    total_classes = table.Column<int>(type: "integer", nullable: false),
                    attendance_rate = table.Column<double>(type: "double precision", nullable: false),
                    textbook_usage = table.Column<int>(type: "integer", nullable: false),
                    video_tutorials = table.Column<int>(type: "integer", nullable: false),
                    practice_problems = table.Column<int>(type: "integer", nullable: false),
                    group_study = table.Column<int>(type: "integer", nullable: false),
                    online_platforms = table.Column<int>(type: "integer", nullable: false),
                    questions_asked = table.Column<int>(type: "integer", nullable: false),
                    participation_rate = table.Column<int>(type: "integer", nullable: false),
                    resource_downloads = table.Column<int>(type: "integer", nullable: false),
                    forum_activity = table.Column<int>(type: "integer", nullable: false),
                    workload_this_week = table.Column<double>(type: "double precision", nullable: false),
                    stress_level = table.Column<double>(type: "double precision", nullable: false),
                    sleep_quality = table.Column<double>(type: "double precision", nullable: false),
                    motivation_level = table.Column<double>(type: "double precision", nullable: false),
                    importance = table.Column<int>(type: "integer", nullable: false),
                    interest_level = table.Column<double>(type: "double precision", nullable: false),
                    alignment = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_student_subject_analytics", x => x.id);
                    table.ForeignKey(
                        name: "fk_student_subject_analytics_student_subject_student_subject_id",
                        column: x => x.student_subject_id,
                        principalSchema: "entitlements",
                        principalTable: "student_subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "student_subject_topics",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_subject_id = table.Column<long>(type: "bigint", nullable: false),
                    topic_id = table.Column<long>(type: "bigint", nullable: false),
                    score = table.Column<double>(type: "double precision", nullable: false),
                    trend = table.Column<string>(type: "text", nullable: false),
                    last_tested = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_student_subject_topics", x => x.id);
                    table.ForeignKey(
                        name: "fk_student_subject_topics_student_subjects_student_subject_id",
                        column: x => x.student_subject_id,
                        principalSchema: "entitlements",
                        principalTable: "student_subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_student_subject_topics_topic_topic_id",
                        column: x => x.topic_id,
                        principalSchema: "entitlements",
                        principalTable: "topics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "weekly_study_hours",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_subject_id = table.Column<long>(type: "bigint", nullable: false),
                    week_number = table.Column<int>(type: "integer", nullable: false),
                    hours = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_weekly_study_hours", x => x.id);
                    table.ForeignKey(
                        name: "fk_weekly_study_hours_student_subjects_student_subject_id",
                        column: x => x.student_subject_id,
                        principalSchema: "entitlements",
                        principalTable: "student_subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "course_enrollments",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    course_id = table.Column<long>(type: "bigint", nullable: false),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    enrolled_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    amount_paid = table.Column<decimal>(type: "numeric", nullable: false),
                    payment_status = table.Column<string>(type: "text", nullable: false),
                    progress = table.Column<decimal>(type: "numeric", nullable: false),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_enrollments", x => x.id);
                    table.ForeignKey(
                        name: "fk_course_enrollments_courses_course_id",
                        column: x => x.course_id,
                        principalSchema: "entitlements",
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_course_enrollments_students_student_id",
                        column: x => x.student_id,
                        principalSchema: "entitlements",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "course_modules",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    course_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    order = table.Column<int>(type: "integer", nullable: false),
                    duration_hours = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_modules", x => x.id);
                    table.ForeignKey(
                        name: "fk_course_modules_courses_course_id",
                        column: x => x.course_id,
                        principalSchema: "entitlements",
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "resources",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    subject_id = table.Column<string>(type: "text", nullable: false),
                    teacher_id = table.Column<long>(type: "bigint", nullable: true),
                    tutor_id = table.Column<long>(type: "bigint", nullable: true),
                    course_id = table.Column<long>(type: "bigint", nullable: true),
                    resource_type = table.Column<string>(type: "text", nullable: false),
                    s3key = table.Column<string>(type: "text", nullable: false),
                    file_url = table.Column<string>(type: "text", nullable: false),
                    file_size = table.Column<string>(type: "text", nullable: false),
                    file_format = table.Column<string>(type: "text", nullable: false),
                    price = table.Column<decimal>(type: "numeric", nullable: false),
                    is_free = table.Column<bool>(type: "boolean", nullable: false),
                    download_count = table.Column<int>(type: "integer", nullable: false),
                    rating = table.Column<double>(type: "double precision", nullable: false),
                    grade_level = table.Column<string>(type: "text", nullable: false),
                    is_approved = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_resources", x => x.id);
                    table.ForeignKey(
                        name: "fk_resources_course_course_id",
                        column: x => x.course_id,
                        principalSchema: "entitlements",
                        principalTable: "courses",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_resources_subjects_subject_id",
                        column: x => x.subject_id,
                        principalSchema: "entitlements",
                        principalTable: "subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_resources_teachers_teacher_id",
                        column: x => x.teacher_id,
                        principalSchema: "entitlements",
                        principalTable: "teachers",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_resources_tutors_tutor_id",
                        column: x => x.tutor_id,
                        principalSchema: "entitlements",
                        principalTable: "tutors",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "module_lessons",
                schema: "marketplace",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    module_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    video_url = table.Column<string>(type: "text", nullable: false),
                    resource_urls = table.Column<string>(type: "text", nullable: false),
                    order = table.Column<int>(type: "integer", nullable: false),
                    duration_minutes = table.Column<decimal>(type: "numeric", nullable: false),
                    is_free_preview = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_module_lessons", x => x.id);
                    table.ForeignKey(
                        name: "fk_module_lessons_course_modules_module_id",
                        column: x => x.module_id,
                        principalSchema: "marketplace",
                        principalTable: "course_modules",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "resource_downloads",
                schema: "marketplace",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    resource_id = table.Column<long>(type: "bigint", nullable: false),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    downloaded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    user_id1 = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_resource_downloads", x => x.id);
                    table.ForeignKey(
                        name: "fk_resource_downloads_resources_resource_id",
                        column: x => x.resource_id,
                        principalSchema: "marketplace",
                        principalTable: "resources",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_resource_downloads_user_user_id1",
                        column: x => x.user_id1,
                        principalSchema: "marketplace",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "module_lessons",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    module_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    video_url = table.Column<string>(type: "text", nullable: false),
                    resource_urls = table.Column<string>(type: "text", nullable: false),
                    order = table.Column<int>(type: "integer", nullable: false),
                    duration_minutes = table.Column<decimal>(type: "numeric", nullable: false),
                    is_free_preview = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_module_lessons", x => x.id);
                    table.ForeignKey(
                        name: "fk_module_lessons_course_modules_module_id",
                        column: x => x.module_id,
                        principalSchema: "entitlements",
                        principalTable: "course_modules",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "resource_downloads",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    resource_id = table.Column<long>(type: "bigint", nullable: false),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    downloaded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_resource_downloads", x => x.id);
                    table.ForeignKey(
                        name: "fk_resource_downloads_resources_resource_id",
                        column: x => x.resource_id,
                        principalSchema: "entitlements",
                        principalTable: "resources",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_resource_downloads_students_student_id",
                        column: x => x.student_id,
                        principalSchema: "entitlements",
                        principalTable: "students",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_admin_students_school_admin_id",
                schema: "entitlements",
                table: "admin_students",
                column: "school_admin_id");

            migrationBuilder.CreateIndex(
                name: "ix_admin_students_student_id",
                schema: "entitlements",
                table: "admin_students",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_admins_user_id",
                schema: "auth",
                table: "admins",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_assessment_breakdowns_student_subject_id",
                schema: "academic_planning",
                table: "assessment_breakdowns",
                column: "student_subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_assessment_breakdowns_student_subject_id1",
                schema: "entitlements",
                table: "assessment_breakdowns",
                column: "student_subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_assessments_student_id",
                schema: "academic_planning",
                table: "assessments",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_assessments_subject_id",
                schema: "academic_planning",
                table: "assessments",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_assessments_student_id1",
                schema: "entitlements",
                table: "assessments",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_assessments_subject_id1",
                schema: "entitlements",
                table: "assessments",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_action_id",
                schema: "audit",
                table: "audit_logs",
                column: "action_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_enrollments_course_id",
                schema: "entitlements",
                table: "course_enrollments",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_enrollments_student_id",
                schema: "entitlements",
                table: "course_enrollments",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_enrollments_course_id1",
                schema: "marketplace",
                table: "course_enrollments",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_enrollments_user_id1",
                schema: "marketplace",
                table: "course_enrollments",
                column: "user_id1");

            migrationBuilder.CreateIndex(
                name: "ix_course_modules_course_id",
                schema: "entitlements",
                table: "course_modules",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_modules_course_id1",
                schema: "marketplace",
                table: "course_modules",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_courses_subject_id",
                schema: "entitlements",
                table: "courses",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_courses_teacher_id",
                schema: "entitlements",
                table: "courses",
                column: "teacher_id");

            migrationBuilder.CreateIndex(
                name: "ix_courses_tutor_id",
                schema: "entitlements",
                table: "courses",
                column: "tutor_id");

            migrationBuilder.CreateIndex(
                name: "ix_courses_tutor_id1",
                schema: "marketplace",
                table: "courses",
                column: "tutor_id");

            migrationBuilder.CreateIndex(
                name: "ix_courses_user_id",
                schema: "marketplace",
                table: "courses",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_diary_entries_student_id",
                schema: "entitlements",
                table: "diary_entries",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_diary_goals_diary_entry_id",
                schema: "entitlements",
                table: "diary_goals",
                column: "diary_entry_id");

            migrationBuilder.CreateIndex(
                name: "ix_diary_goals_goal_id",
                schema: "entitlements",
                table: "diary_goals",
                column: "goal_id");

            migrationBuilder.CreateIndex(
                name: "ix_diary_mood_trackings_student_id",
                schema: "entitlements",
                table: "diary_mood_trackings",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_feature_flag_evaluations_feature_flag_id",
                schema: "feature_flags",
                table: "feature_flag_evaluations",
                column: "feature_flag_id");

            migrationBuilder.CreateIndex(
                name: "ix_feature_flag_rules_feature_flag_id",
                schema: "feature_flags",
                table: "feature_flag_rules",
                column: "feature_flag_id");

            migrationBuilder.CreateIndex(
                name: "ix_feature_purchases_feature_id",
                schema: "entitlements",
                table: "feature_purchases",
                column: "feature_id");

            migrationBuilder.CreateIndex(
                name: "ix_goal_milestones_goal_id",
                schema: "entitlements",
                table: "goal_milestones",
                column: "goal_id");

            migrationBuilder.CreateIndex(
                name: "ix_goal_milestones_goal_id1",
                schema: "goals",
                table: "goal_milestones",
                column: "goal_id");

            migrationBuilder.CreateIndex(
                name: "ix_goal_reward_potential_rewards_id",
                schema: "entitlements",
                table: "goal_reward",
                column: "potential_rewards_id");

            migrationBuilder.CreateIndex(
                name: "ix_goals_student_id",
                schema: "entitlements",
                table: "goals",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_goals_subject_id",
                schema: "entitlements",
                table: "goals",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_goals_reward_id",
                schema: "goals",
                table: "goals",
                column: "reward_id");

            migrationBuilder.CreateIndex(
                name: "ix_grade_distributions_student_subject_id",
                schema: "entitlements",
                table: "grade_distributions",
                column: "student_subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_grade_distributions_student_subject_id1",
                schema: "insights",
                table: "grade_distributions",
                column: "student_subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_growth_trackings_student_id",
                schema: "entitlements",
                table: "growth_trackings",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_growth_trackings_student_id1",
                schema: "goals",
                table: "growth_trackings",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_improvement_tips_student_subject_id",
                schema: "academic_planning",
                table: "improvement_tips",
                column: "student_subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_improvement_tips_student_subject_id1",
                schema: "entitlements",
                table: "improvement_tips",
                column: "student_subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_improvement_tips_student_subject_id2",
                schema: "insights",
                table: "improvement_tips",
                column: "student_subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_improvement_tips_student_subject_topic_id",
                schema: "insights",
                table: "improvement_tips",
                column: "student_subject_topic_id");

            migrationBuilder.CreateIndex(
                name: "ix_knowledge_gaps_student_subject_id",
                schema: "academic_planning",
                table: "knowledge_gaps",
                column: "student_subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_knowledge_gaps_student_subject_id1",
                schema: "entitlements",
                table: "knowledge_gaps",
                column: "student_subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_knowledge_gaps_student_subject_id2",
                schema: "mastery",
                table: "knowledge_gaps",
                column: "student_subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_knowledge_gaps_topic_id",
                schema: "mastery",
                table: "knowledge_gaps",
                column: "topic_id");

            migrationBuilder.CreateIndex(
                name: "ix_moderation_actions_content_report_id",
                schema: "moderation",
                table: "moderation_actions",
                column: "content_report_id");

            migrationBuilder.CreateIndex(
                name: "ix_module_lessons_module_id",
                schema: "entitlements",
                table: "module_lessons",
                column: "module_id");

            migrationBuilder.CreateIndex(
                name: "ix_module_lessons_module_id1",
                schema: "marketplace",
                table: "module_lessons",
                column: "module_id");

            migrationBuilder.CreateIndex(
                name: "ix_parent_students_parent_id",
                schema: "entitlements",
                table: "parent_students",
                column: "parent_id");

            migrationBuilder.CreateIndex(
                name: "ix_parent_students_student_id",
                schema: "entitlements",
                table: "parent_students",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_parents_user_id",
                schema: "auth",
                table: "parents",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_peer_comparisons_student_subject_id",
                schema: "entitlements",
                table: "peer_comparisons",
                column: "student_subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_points_transactions_related_goal_id",
                schema: "entitlements",
                table: "points_transactions",
                column: "related_goal_id");

            migrationBuilder.CreateIndex(
                name: "ix_points_transactions_related_reward_id",
                schema: "entitlements",
                table: "points_transactions",
                column: "related_reward_id");

            migrationBuilder.CreateIndex(
                name: "ix_points_transactions_student_points_id",
                schema: "entitlements",
                table: "points_transactions",
                column: "student_points_id");

            migrationBuilder.CreateIndex(
                name: "ix_points_transactions_related_goal_id1",
                schema: "goals",
                table: "points_transactions",
                column: "related_goal_id");

            migrationBuilder.CreateIndex(
                name: "ix_points_transactions_related_reward_id1",
                schema: "goals",
                table: "points_transactions",
                column: "related_reward_id");

            migrationBuilder.CreateIndex(
                name: "ix_points_transactions_student_points_id1",
                schema: "goals",
                table: "points_transactions",
                column: "student_points_id");

            migrationBuilder.CreateIndex(
                name: "ix_prediction_metrics_student_subject_id",
                schema: "entitlements",
                table: "prediction_metrics",
                column: "student_subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_prerequisite_masteries_student_subject_id",
                schema: "entitlements",
                table: "prerequisite_masteries",
                column: "student_subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_reminders_calendar_event_id",
                schema: "calendar",
                table: "reminders",
                column: "calendar_event_id");

            migrationBuilder.CreateIndex(
                name: "ix_resource_downloads_resource_id",
                schema: "entitlements",
                table: "resource_downloads",
                column: "resource_id");

            migrationBuilder.CreateIndex(
                name: "ix_resource_downloads_student_id",
                schema: "entitlements",
                table: "resource_downloads",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_resource_downloads_resource_id1",
                schema: "marketplace",
                table: "resource_downloads",
                column: "resource_id");

            migrationBuilder.CreateIndex(
                name: "ix_resource_downloads_user_id1",
                schema: "marketplace",
                table: "resource_downloads",
                column: "user_id1");

            migrationBuilder.CreateIndex(
                name: "ix_resources_course_id",
                schema: "entitlements",
                table: "resources",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_resources_subject_id",
                schema: "entitlements",
                table: "resources",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_resources_teacher_id",
                schema: "entitlements",
                table: "resources",
                column: "teacher_id");

            migrationBuilder.CreateIndex(
                name: "ix_resources_tutor_id",
                schema: "entitlements",
                table: "resources",
                column: "tutor_id");

            migrationBuilder.CreateIndex(
                name: "ix_resources_course_id1",
                schema: "marketplace",
                table: "resources",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_resources_subject_id1",
                schema: "marketplace",
                table: "resources",
                column: "subject_id1");

            migrationBuilder.CreateIndex(
                name: "ix_resources_tutor_id1",
                schema: "marketplace",
                table: "resources",
                column: "tutor_id");

            migrationBuilder.CreateIndex(
                name: "ix_resources_user_id1",
                schema: "marketplace",
                table: "resources",
                column: "user_id1");

            migrationBuilder.CreateIndex(
                name: "ix_reward_features_feature_id",
                schema: "entitlements",
                table: "reward_features",
                column: "feature_id");

            migrationBuilder.CreateIndex(
                name: "ix_reward_features_reward_id",
                schema: "entitlements",
                table: "reward_features",
                column: "reward_id");

            migrationBuilder.CreateIndex(
                name: "ix_reward_features_reward_id1",
                schema: "goals",
                table: "reward_features",
                column: "reward_id");

            migrationBuilder.CreateIndex(
                name: "ix_role_claims_role_id",
                schema: "identity",
                table: "role_claims",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "ix_role_features_feature_id",
                schema: "entitlements",
                table: "role_features",
                column: "feature_id");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                schema: "identity",
                table: "roles",
                column: "normalized_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_student_admins_admin_id",
                schema: "auth",
                table: "student_admins",
                column: "admin_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_parents_parent_id",
                schema: "auth",
                table: "student_parents",
                column: "parent_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_points_student_id",
                schema: "entitlements",
                table: "student_points",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_points_student_id1",
                schema: "goals",
                table: "student_points",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_rewards_goal_id",
                schema: "entitlements",
                table: "student_rewards",
                column: "goal_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_rewards_reward_id",
                schema: "entitlements",
                table: "student_rewards",
                column: "reward_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_rewards_student_id",
                schema: "entitlements",
                table: "student_rewards",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_rewards_goal_id1",
                schema: "goals",
                table: "student_rewards",
                column: "goal_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_rewards_reward_id1",
                schema: "goals",
                table: "student_rewards",
                column: "reward_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_rewards_student_id1",
                schema: "goals",
                table: "student_rewards",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_subject_analytics_student_subject_id",
                schema: "entitlements",
                table: "student_subject_analytics",
                column: "student_subject_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_student_subject_analytics_student_subject_id1",
                schema: "mastery",
                table: "student_subject_analytics",
                column: "student_subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_subject_analytics_topic_id",
                schema: "mastery",
                table: "student_subject_analytics",
                column: "topic_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_subject_topics_student_subject_id",
                schema: "academic_planning",
                table: "student_subject_topics",
                column: "student_subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_subject_topics_topic_id",
                schema: "academic_planning",
                table: "student_subject_topics",
                column: "topic_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_subject_topics_student_subject_id1",
                schema: "entitlements",
                table: "student_subject_topics",
                column: "student_subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_subject_topics_topic_id1",
                schema: "entitlements",
                table: "student_subject_topics",
                column: "topic_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_subjects_analytics_id",
                schema: "academic_planning",
                table: "student_subjects",
                column: "analytics_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_subjects_student_id",
                schema: "academic_planning",
                table: "student_subjects",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_subjects_subject_id",
                schema: "academic_planning",
                table: "student_subjects",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_subjects_student_id1",
                schema: "entitlements",
                table: "student_subjects",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_subjects_subject_id1",
                schema: "entitlements",
                table: "student_subjects",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_teachers_teacher_id",
                schema: "auth",
                table: "student_teachers",
                column: "teacher_id");

            migrationBuilder.CreateIndex(
                name: "ix_students_user_id",
                schema: "auth",
                table: "students",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_students_admin_id",
                schema: "entitlements",
                table: "students",
                column: "admin_id");

            migrationBuilder.CreateIndex(
                name: "ix_study_sessions_student_id",
                schema: "academic_planning",
                table: "study_sessions",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_study_sessions_subject_id",
                schema: "academic_planning",
                table: "study_sessions",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_study_sessions_student_id1",
                schema: "entitlements",
                table: "study_sessions",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_study_sessions_subject_id1",
                schema: "entitlements",
                table: "study_sessions",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_superusers_user_id",
                schema: "auth",
                table: "superusers",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_support_categories_parent_category_id",
                schema: "support",
                table: "support_categories",
                column: "parent_category_id");

            migrationBuilder.CreateIndex(
                name: "ix_support_messages_ticket_id",
                schema: "support",
                table: "support_messages",
                column: "ticket_id");

            migrationBuilder.CreateIndex(
                name: "ix_support_tickets_category_id",
                schema: "support",
                table: "support_tickets",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "ix_teacher_admins_admin_id",
                schema: "entitlements",
                table: "teacher_admins",
                column: "admin_id");

            migrationBuilder.CreateIndex(
                name: "ix_teacher_admins_teacher_id",
                schema: "entitlements",
                table: "teacher_admins",
                column: "teacher_id");

            migrationBuilder.CreateIndex(
                name: "ix_teacher_students_student_id",
                schema: "entitlements",
                table: "teacher_students",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_teacher_students_teacher_id",
                schema: "entitlements",
                table: "teacher_students",
                column: "teacher_id");

            migrationBuilder.CreateIndex(
                name: "ix_teacher_subjects_subject_id",
                schema: "entitlements",
                table: "teacher_subjects",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_teacher_subjects_teacher_id",
                schema: "entitlements",
                table: "teacher_subjects",
                column: "teacher_id");

            migrationBuilder.CreateIndex(
                name: "ix_teachers_user_id",
                schema: "auth",
                table: "teachers",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_teachers_admin_id",
                schema: "entitlements",
                table: "teachers",
                column: "admin_id");

            migrationBuilder.CreateIndex(
                name: "ix_topic_masteries_student_subject_id",
                schema: "mastery",
                table: "topic_masteries",
                column: "student_subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_topic_masteries_topic_id1",
                schema: "mastery",
                table: "topic_masteries",
                column: "topic_id1");

            migrationBuilder.CreateIndex(
                name: "ix_topics_subject_id",
                schema: "academic_planning",
                table: "topics",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_topics_subject_id1",
                schema: "entitlements",
                table: "topics",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_tutor_availabilities_tutor_id1",
                schema: "booking",
                table: "tutor_availabilities",
                column: "tutor_id");

            migrationBuilder.CreateIndex(
                name: "ix_tutor_availabilities_tutor_id",
                schema: "entitlements",
                table: "tutor_availabilities",
                column: "tutor_id");

            migrationBuilder.CreateIndex(
                name: "ix_tutor_availabilities_tutor_id2",
                schema: "marketplace",
                table: "tutor_availabilities",
                column: "tutor_id");

            migrationBuilder.CreateIndex(
                name: "ix_tutor_students_student_id1",
                schema: "booking",
                table: "tutor_students",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_tutor_students_tutor_id1",
                schema: "booking",
                table: "tutor_students",
                column: "tutor_id");

            migrationBuilder.CreateIndex(
                name: "ix_tutor_students_student_id",
                schema: "entitlements",
                table: "tutor_students",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_tutor_students_tutor_id",
                schema: "entitlements",
                table: "tutor_students",
                column: "tutor_id");

            migrationBuilder.CreateIndex(
                name: "ix_tutor_students_tutor_id2",
                schema: "marketplace",
                table: "tutor_students",
                column: "tutor_id");

            migrationBuilder.CreateIndex(
                name: "ix_tutor_subjects_subject_id",
                schema: "entitlements",
                table: "tutor_subjects",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_tutor_subjects_tutor_id",
                schema: "entitlements",
                table: "tutor_subjects",
                column: "tutor_id");

            migrationBuilder.CreateIndex(
                name: "ix_tutor_subjects_subject_id1",
                schema: "marketplace",
                table: "tutor_subjects",
                column: "subject_id1");

            migrationBuilder.CreateIndex(
                name: "ix_tutor_subjects_tutor_id1",
                schema: "marketplace",
                table: "tutor_subjects",
                column: "tutor_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_claims_user_id",
                schema: "identity",
                table: "user_claims",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_features_feature_id",
                schema: "entitlements",
                table: "user_features",
                column: "feature_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_logins_user_id",
                schema: "identity",
                table: "user_logins",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_roles_role_id",
                schema: "identity",
                table: "user_roles",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                schema: "identity",
                table: "users",
                column: "normalized_email");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                schema: "identity",
                table: "users",
                column: "normalized_user_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_weekly_study_hours_student_subject_id",
                schema: "academic_planning",
                table: "weekly_study_hours",
                column: "student_subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_weekly_study_hours_student_subject_id1",
                schema: "entitlements",
                table: "weekly_study_hours",
                column: "student_subject_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "admin_students",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "answer_submissions",
                schema: "practice");

            migrationBuilder.DropTable(
                name: "assessment_breakdowns",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "assessment_breakdowns",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "assessments",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "assessments",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "attempt_score_summaries",
                schema: "practice");

            migrationBuilder.DropTable(
                name: "audit_logs",
                schema: "audit");

            migrationBuilder.DropTable(
                name: "calendar_syncs",
                schema: "calendar");

            migrationBuilder.DropTable(
                name: "content_filters",
                schema: "moderation");

            migrationBuilder.DropTable(
                name: "course_enrollments",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "course_enrollments",
                schema: "marketplace");

            migrationBuilder.DropTable(
                name: "diary_entries",
                schema: "wellbeing");

            migrationBuilder.DropTable(
                name: "diary_goals",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "diary_goals",
                schema: "wellbeing");

            migrationBuilder.DropTable(
                name: "diary_mood_trackings",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "feature_flag_evaluations",
                schema: "feature_flags");

            migrationBuilder.DropTable(
                name: "feature_flag_rules",
                schema: "feature_flags");

            migrationBuilder.DropTable(
                name: "feature_purchases",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "generated_tests",
                schema: "practice");

            migrationBuilder.DropTable(
                name: "goal_milestones",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "goal_milestones",
                schema: "goals");

            migrationBuilder.DropTable(
                name: "goal_reward",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "grade_distributions",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "grade_distributions",
                schema: "insights");

            migrationBuilder.DropTable(
                name: "growth_trackings",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "growth_trackings",
                schema: "goals");

            migrationBuilder.DropTable(
                name: "improvement_tips",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "improvement_tips",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "improvement_tips",
                schema: "insights");

            migrationBuilder.DropTable(
                name: "knowledge_gaps",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "knowledge_gaps",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "knowledge_gaps",
                schema: "mastery");

            migrationBuilder.DropTable(
                name: "moderation_actions",
                schema: "moderation");

            migrationBuilder.DropTable(
                name: "module_lessons",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "module_lessons",
                schema: "marketplace");

            migrationBuilder.DropTable(
                name: "mood_trackings",
                schema: "wellbeing");

            migrationBuilder.DropTable(
                name: "parent_students",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "peer_comparisons",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "points_transactions",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "points_transactions",
                schema: "goals");

            migrationBuilder.DropTable(
                name: "practice_attempt_items",
                schema: "practice");

            migrationBuilder.DropTable(
                name: "practice_attempts",
                schema: "practice");

            migrationBuilder.DropTable(
                name: "practice_tests",
                schema: "practice");

            migrationBuilder.DropTable(
                name: "prediction_metrics",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "prerequisite_masteries",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "reminders",
                schema: "calendar");

            migrationBuilder.DropTable(
                name: "resource_downloads",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "resource_downloads",
                schema: "marketplace");

            migrationBuilder.DropTable(
                name: "reward_features",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "reward_features",
                schema: "goals");

            migrationBuilder.DropTable(
                name: "role_claims",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "role_features",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "student_admins",
                schema: "auth");

            migrationBuilder.DropTable(
                name: "student_parents",
                schema: "auth");

            migrationBuilder.DropTable(
                name: "student_rewards",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "student_rewards",
                schema: "goals");

            migrationBuilder.DropTable(
                name: "student_subject_analytics",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "student_subject_analytics",
                schema: "mastery");

            migrationBuilder.DropTable(
                name: "student_subject_topics",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "student_subject_topics",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "student_teachers",
                schema: "auth");

            migrationBuilder.DropTable(
                name: "students",
                schema: "calendar");

            migrationBuilder.DropTable(
                name: "students",
                schema: "practice");

            migrationBuilder.DropTable(
                name: "students",
                schema: "support");

            migrationBuilder.DropTable(
                name: "students",
                schema: "wellbeing");

            migrationBuilder.DropTable(
                name: "study_sessions",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "study_sessions",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "subjects",
                schema: "goals");

            migrationBuilder.DropTable(
                name: "subjects",
                schema: "practice");

            migrationBuilder.DropTable(
                name: "superusers",
                schema: "auth");

            migrationBuilder.DropTable(
                name: "support_messages",
                schema: "support");

            migrationBuilder.DropTable(
                name: "teacher_admins",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "teacher_students",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "teacher_subjects",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "topic_masteries",
                schema: "mastery");

            migrationBuilder.DropTable(
                name: "topics",
                schema: "practice");

            migrationBuilder.DropTable(
                name: "tutor_availabilities",
                schema: "booking");

            migrationBuilder.DropTable(
                name: "tutor_availabilities",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "tutor_availabilities",
                schema: "marketplace");

            migrationBuilder.DropTable(
                name: "tutor_students",
                schema: "booking");

            migrationBuilder.DropTable(
                name: "tutor_students",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "tutor_students",
                schema: "marketplace");

            migrationBuilder.DropTable(
                name: "tutor_subjects",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "tutor_subjects",
                schema: "marketplace");

            migrationBuilder.DropTable(
                name: "user_claims",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "user_features",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "user_logins",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "user_roles",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "user_tokens",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "weekly_study_hours",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "weekly_study_hours",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "audit_actions",
                schema: "audit");

            migrationBuilder.DropTable(
                name: "diary_entries",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "feature_flags",
                schema: "feature_flags");

            migrationBuilder.DropTable(
                name: "student_subjects",
                schema: "insights");

            migrationBuilder.DropTable(
                name: "student_subject_topics",
                schema: "insights");

            migrationBuilder.DropTable(
                name: "content_reports",
                schema: "moderation");

            migrationBuilder.DropTable(
                name: "course_modules",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "course_modules",
                schema: "marketplace");

            migrationBuilder.DropTable(
                name: "parents",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "student_points",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "student_points",
                schema: "goals");

            migrationBuilder.DropTable(
                name: "calendar_events",
                schema: "calendar");

            migrationBuilder.DropTable(
                name: "resources",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "resources",
                schema: "marketplace");

            migrationBuilder.DropTable(
                name: "admins",
                schema: "auth");

            migrationBuilder.DropTable(
                name: "parents",
                schema: "auth");

            migrationBuilder.DropTable(
                name: "goals",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "rewards",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "goals",
                schema: "goals");

            migrationBuilder.DropTable(
                name: "topics",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "topics",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "students",
                schema: "auth");

            migrationBuilder.DropTable(
                name: "teachers",
                schema: "auth");

            migrationBuilder.DropTable(
                name: "support_tickets",
                schema: "support");

            migrationBuilder.DropTable(
                name: "student_subjects",
                schema: "mastery");

            migrationBuilder.DropTable(
                name: "student_subject_topics",
                schema: "mastery");

            migrationBuilder.DropTable(
                name: "students",
                schema: "booking");

            migrationBuilder.DropTable(
                name: "tutors",
                schema: "booking");

            migrationBuilder.DropTable(
                name: "features",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "roles",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "student_subjects",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "student_subjects",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "students",
                schema: "goals");

            migrationBuilder.DropTable(
                name: "courses",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "courses",
                schema: "marketplace");

            migrationBuilder.DropTable(
                name: "subjects",
                schema: "marketplace");

            migrationBuilder.DropTable(
                name: "rewards",
                schema: "goals");

            migrationBuilder.DropTable(
                name: "users",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "support_categories",
                schema: "support");

            migrationBuilder.DropTable(
                name: "student_subject_analytics",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "students",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "subjects",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "students",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "subjects",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "teachers",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "tutors",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "tutors",
                schema: "marketplace");

            migrationBuilder.DropTable(
                name: "users",
                schema: "marketplace");

            migrationBuilder.DropTable(
                name: "admins",
                schema: "entitlements");
        }
    }
}
