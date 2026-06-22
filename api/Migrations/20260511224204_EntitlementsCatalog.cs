using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class EntitlementsCatalog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "admin_students",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "assessment_breakdowns",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "assessments",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "course_enrollments",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "diary_goals",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "diary_mood_trackings",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "feature_purchases",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "goal_milestones",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "goal_reward",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "grade_distributions",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "growth_trackings",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "improvement_tips",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "knowledge_gaps",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "module_lessons",
                schema: "entitlements");

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
                name: "prediction_metrics",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "prerequisite_masteries",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "resource_downloads",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "reward_features",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "role_features",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "student_rewards",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "student_subject_analytics",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "student_subject_topics",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "study_sessions",
                schema: "entitlements");

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
                name: "tutor_availabilities",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "tutor_students",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "tutor_subjects",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "user_features",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "weekly_study_hours",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "diary_entries",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "course_modules",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "parents",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "student_points",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "resources",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "goals",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "rewards",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "topics",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "features",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "student_subjects",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "courses",
                schema: "entitlements");

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
                name: "admins",
                schema: "entitlements");

            migrationBuilder.RenameIndex(
                name: "ix_tutor_subjects_tutor_id1",
                schema: "marketplace",
                table: "tutor_subjects",
                newName: "ix_tutor_subjects_tutor_id");

            migrationBuilder.RenameIndex(
                name: "ix_tutor_students_tutor_id2",
                schema: "marketplace",
                table: "tutor_students",
                newName: "ix_tutor_students_tutor_id1");

            migrationBuilder.RenameIndex(
                name: "ix_tutor_students_tutor_id1",
                schema: "booking",
                table: "tutor_students",
                newName: "ix_tutor_students_tutor_id");

            migrationBuilder.RenameIndex(
                name: "ix_tutor_students_student_id1",
                schema: "booking",
                table: "tutor_students",
                newName: "ix_tutor_students_student_id");

            migrationBuilder.RenameIndex(
                name: "ix_tutor_availabilities_tutor_id2",
                schema: "marketplace",
                table: "tutor_availabilities",
                newName: "ix_tutor_availabilities_tutor_id1");

            migrationBuilder.RenameIndex(
                name: "ix_tutor_availabilities_tutor_id1",
                schema: "booking",
                table: "tutor_availabilities",
                newName: "ix_tutor_availabilities_tutor_id");

            migrationBuilder.RenameIndex(
                name: "ix_student_subject_analytics_student_subject_id1",
                schema: "mastery",
                table: "student_subject_analytics",
                newName: "ix_student_subject_analytics_student_subject_id");

            migrationBuilder.RenameIndex(
                name: "ix_student_rewards_student_id1",
                schema: "goals",
                table: "student_rewards",
                newName: "ix_student_rewards_student_id");

            migrationBuilder.RenameIndex(
                name: "ix_student_rewards_reward_id1",
                schema: "goals",
                table: "student_rewards",
                newName: "ix_student_rewards_reward_id");

            migrationBuilder.RenameIndex(
                name: "ix_student_rewards_goal_id1",
                schema: "goals",
                table: "student_rewards",
                newName: "ix_student_rewards_goal_id");

            migrationBuilder.RenameIndex(
                name: "ix_student_points_student_id1",
                schema: "goals",
                table: "student_points",
                newName: "ix_student_points_student_id");

            migrationBuilder.RenameIndex(
                name: "ix_reward_features_reward_id1",
                schema: "goals",
                table: "reward_features",
                newName: "ix_reward_features_reward_id");

            migrationBuilder.RenameIndex(
                name: "ix_resources_tutor_id1",
                schema: "marketplace",
                table: "resources",
                newName: "ix_resources_tutor_id");

            migrationBuilder.RenameIndex(
                name: "ix_resources_course_id1",
                schema: "marketplace",
                table: "resources",
                newName: "ix_resources_course_id");

            migrationBuilder.RenameIndex(
                name: "ix_resource_downloads_resource_id1",
                schema: "marketplace",
                table: "resource_downloads",
                newName: "ix_resource_downloads_resource_id");

            migrationBuilder.RenameIndex(
                name: "ix_points_transactions_student_points_id1",
                schema: "goals",
                table: "points_transactions",
                newName: "ix_points_transactions_student_points_id");

            migrationBuilder.RenameIndex(
                name: "ix_points_transactions_related_reward_id1",
                schema: "goals",
                table: "points_transactions",
                newName: "ix_points_transactions_related_reward_id");

            migrationBuilder.RenameIndex(
                name: "ix_points_transactions_related_goal_id1",
                schema: "goals",
                table: "points_transactions",
                newName: "ix_points_transactions_related_goal_id");

            migrationBuilder.RenameIndex(
                name: "ix_module_lessons_module_id1",
                schema: "marketplace",
                table: "module_lessons",
                newName: "ix_module_lessons_module_id");

            migrationBuilder.RenameIndex(
                name: "ix_knowledge_gaps_student_subject_id1",
                schema: "mastery",
                table: "knowledge_gaps",
                newName: "ix_knowledge_gaps_student_subject_id");

            migrationBuilder.RenameIndex(
                name: "ix_improvement_tips_student_subject_id1",
                schema: "insights",
                table: "improvement_tips",
                newName: "ix_improvement_tips_student_subject_id");

            migrationBuilder.RenameIndex(
                name: "ix_growth_trackings_student_id1",
                schema: "goals",
                table: "growth_trackings",
                newName: "ix_growth_trackings_student_id");

            migrationBuilder.RenameIndex(
                name: "ix_grade_distributions_student_subject_id1",
                schema: "insights",
                table: "grade_distributions",
                newName: "ix_grade_distributions_student_subject_id");

            migrationBuilder.RenameIndex(
                name: "ix_goal_milestones_goal_id1",
                schema: "goals",
                table: "goal_milestones",
                newName: "ix_goal_milestones_goal_id");

            migrationBuilder.RenameIndex(
                name: "ix_courses_tutor_id1",
                schema: "marketplace",
                table: "courses",
                newName: "ix_courses_tutor_id");

            migrationBuilder.RenameIndex(
                name: "ix_course_modules_course_id1",
                schema: "marketplace",
                table: "course_modules",
                newName: "ix_course_modules_course_id");

            migrationBuilder.RenameIndex(
                name: "ix_course_enrollments_course_id1",
                schema: "marketplace",
                table: "course_enrollments",
                newName: "ix_course_enrollments_course_id");

            migrationBuilder.CreateTable(
                name: "plans",
                schema: "entitlements",
                columns: table => new
                {
                    code = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    monthly_price_zar = table.Column<decimal>(type: "numeric", nullable: true),
                    annual_price_zar = table.Column<decimal>(type: "numeric", nullable: true),
                    max_members = table.Column<int>(type: "integer", nullable: false),
                    kind = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_plans", x => x.code);
                });

            migrationBuilder.CreateTable(
                name: "plan_features",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    plan_code = table.Column<string>(type: "text", nullable: false),
                    feature_key = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_plan_features", x => x.id);
                    table.ForeignKey(
                        name: "fk_plan_features_plans_plan_code",
                        column: x => x.plan_code,
                        principalSchema: "entitlements",
                        principalTable: "plans",
                        principalColumn: "code",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "subscriptions",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    plan_code = table.Column<string>(type: "text", nullable: false),
                    owner_user_id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    cancelled_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    valid_until = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    paystack_subscription_code = table.Column<string>(type: "text", nullable: true),
                    paystack_customer_code = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_subscriptions", x => x.id);
                    table.ForeignKey(
                        name: "fk_subscriptions_plans_plan_code",
                        column: x => x.plan_code,
                        principalSchema: "entitlements",
                        principalTable: "plans",
                        principalColumn: "code",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "subscription_members",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    subscription_id = table.Column<long>(type: "bigint", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    role = table.Column<string>(type: "text", nullable: false),
                    joined_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    invited_by_user_id = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_subscription_members", x => x.id);
                    table.ForeignKey(
                        name: "fk_subscription_members_subscriptions_subscription_id",
                        column: x => x.subscription_id,
                        principalSchema: "entitlements",
                        principalTable: "subscriptions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_plan_features_plan_code",
                schema: "entitlements",
                table: "plan_features",
                column: "plan_code");

            migrationBuilder.CreateIndex(
                name: "ix_subscription_members_subscription_id",
                schema: "entitlements",
                table: "subscription_members",
                column: "subscription_id");

            migrationBuilder.CreateIndex(
                name: "ix_subscriptions_plan_code",
                schema: "entitlements",
                table: "subscriptions",
                column: "plan_code");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "plan_features",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "subscription_members",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "subscriptions",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "plans",
                schema: "entitlements");

            migrationBuilder.RenameIndex(
                name: "ix_tutor_subjects_tutor_id",
                schema: "marketplace",
                table: "tutor_subjects",
                newName: "ix_tutor_subjects_tutor_id1");

            migrationBuilder.RenameIndex(
                name: "ix_tutor_students_tutor_id1",
                schema: "marketplace",
                table: "tutor_students",
                newName: "ix_tutor_students_tutor_id2");

            migrationBuilder.RenameIndex(
                name: "ix_tutor_students_tutor_id",
                schema: "booking",
                table: "tutor_students",
                newName: "ix_tutor_students_tutor_id1");

            migrationBuilder.RenameIndex(
                name: "ix_tutor_students_student_id",
                schema: "booking",
                table: "tutor_students",
                newName: "ix_tutor_students_student_id1");

            migrationBuilder.RenameIndex(
                name: "ix_tutor_availabilities_tutor_id1",
                schema: "marketplace",
                table: "tutor_availabilities",
                newName: "ix_tutor_availabilities_tutor_id2");

            migrationBuilder.RenameIndex(
                name: "ix_tutor_availabilities_tutor_id",
                schema: "booking",
                table: "tutor_availabilities",
                newName: "ix_tutor_availabilities_tutor_id1");

            migrationBuilder.RenameIndex(
                name: "ix_student_subject_analytics_student_subject_id",
                schema: "mastery",
                table: "student_subject_analytics",
                newName: "ix_student_subject_analytics_student_subject_id1");

            migrationBuilder.RenameIndex(
                name: "ix_student_rewards_student_id",
                schema: "goals",
                table: "student_rewards",
                newName: "ix_student_rewards_student_id1");

            migrationBuilder.RenameIndex(
                name: "ix_student_rewards_reward_id",
                schema: "goals",
                table: "student_rewards",
                newName: "ix_student_rewards_reward_id1");

            migrationBuilder.RenameIndex(
                name: "ix_student_rewards_goal_id",
                schema: "goals",
                table: "student_rewards",
                newName: "ix_student_rewards_goal_id1");

            migrationBuilder.RenameIndex(
                name: "ix_student_points_student_id",
                schema: "goals",
                table: "student_points",
                newName: "ix_student_points_student_id1");

            migrationBuilder.RenameIndex(
                name: "ix_reward_features_reward_id",
                schema: "goals",
                table: "reward_features",
                newName: "ix_reward_features_reward_id1");

            migrationBuilder.RenameIndex(
                name: "ix_resources_tutor_id",
                schema: "marketplace",
                table: "resources",
                newName: "ix_resources_tutor_id1");

            migrationBuilder.RenameIndex(
                name: "ix_resources_course_id",
                schema: "marketplace",
                table: "resources",
                newName: "ix_resources_course_id1");

            migrationBuilder.RenameIndex(
                name: "ix_resource_downloads_resource_id",
                schema: "marketplace",
                table: "resource_downloads",
                newName: "ix_resource_downloads_resource_id1");

            migrationBuilder.RenameIndex(
                name: "ix_points_transactions_student_points_id",
                schema: "goals",
                table: "points_transactions",
                newName: "ix_points_transactions_student_points_id1");

            migrationBuilder.RenameIndex(
                name: "ix_points_transactions_related_reward_id",
                schema: "goals",
                table: "points_transactions",
                newName: "ix_points_transactions_related_reward_id1");

            migrationBuilder.RenameIndex(
                name: "ix_points_transactions_related_goal_id",
                schema: "goals",
                table: "points_transactions",
                newName: "ix_points_transactions_related_goal_id1");

            migrationBuilder.RenameIndex(
                name: "ix_module_lessons_module_id",
                schema: "marketplace",
                table: "module_lessons",
                newName: "ix_module_lessons_module_id1");

            migrationBuilder.RenameIndex(
                name: "ix_knowledge_gaps_student_subject_id",
                schema: "mastery",
                table: "knowledge_gaps",
                newName: "ix_knowledge_gaps_student_subject_id1");

            migrationBuilder.RenameIndex(
                name: "ix_improvement_tips_student_subject_id",
                schema: "insights",
                table: "improvement_tips",
                newName: "ix_improvement_tips_student_subject_id1");

            migrationBuilder.RenameIndex(
                name: "ix_growth_trackings_student_id",
                schema: "goals",
                table: "growth_trackings",
                newName: "ix_growth_trackings_student_id1");

            migrationBuilder.RenameIndex(
                name: "ix_grade_distributions_student_subject_id",
                schema: "insights",
                table: "grade_distributions",
                newName: "ix_grade_distributions_student_subject_id1");

            migrationBuilder.RenameIndex(
                name: "ix_goal_milestones_goal_id",
                schema: "goals",
                table: "goal_milestones",
                newName: "ix_goal_milestones_goal_id1");

            migrationBuilder.RenameIndex(
                name: "ix_courses_tutor_id",
                schema: "marketplace",
                table: "courses",
                newName: "ix_courses_tutor_id1");

            migrationBuilder.RenameIndex(
                name: "ix_course_modules_course_id",
                schema: "marketplace",
                table: "course_modules",
                newName: "ix_course_modules_course_id1");

            migrationBuilder.RenameIndex(
                name: "ix_course_enrollments_course_id",
                schema: "marketplace",
                table: "course_enrollments",
                newName: "ix_course_enrollments_course_id1");

            migrationBuilder.CreateTable(
                name: "admins",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    address = table.Column<string>(type: "text", nullable: false),
                    contact_number = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    school_code = table.Column<string>(type: "text", nullable: false),
                    school_name = table.Column<string>(type: "text", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_admins", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "features",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    base_price = table.Column<decimal>(type: "numeric", nullable: false),
                    billing_cycle = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<string>(type: "text", nullable: false),
                    code = table.Column<string>(type: "text", nullable: false),
                    complexity_weight = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    price_currency = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_features", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "parents",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    address = table.Column<string>(type: "text", nullable: false),
                    contact_number = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    occupation = table.Column<string>(type: "text", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_parents", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "rewards",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    difficulty_tier = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    points_cost = table.Column<int>(type: "integer", nullable: false),
                    reward_type = table.Column<string>(type: "text", nullable: false),
                    stock_quantity = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_rewards", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "subjects",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    border_color = table.Column<string>(type: "text", nullable: false),
                    code = table.Column<string>(type: "text", nullable: false),
                    color = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    text_color = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_subjects", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tutors",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    bio = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    hourly_rate = table.Column<decimal>(type: "numeric", nullable: false),
                    is_verified = table.Column<bool>(type: "boolean", nullable: false),
                    qualification = table.Column<string>(type: "text", nullable: false),
                    rating = table.Column<double>(type: "double precision", nullable: false),
                    specialization = table.Column<string>(type: "text", nullable: false),
                    teaching_style = table.Column<string>(type: "text", nullable: false),
                    total_reviews = table.Column<int>(type: "integer", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    years_of_experience = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tutors", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "students",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    admin_id = table.Column<long>(type: "bigint", nullable: true),
                    grade = table.Column<string>(type: "text", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false)
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
                    admin_id = table.Column<long>(type: "bigint", nullable: true),
                    bio = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    hourly_rate = table.Column<decimal>(type: "numeric", nullable: false),
                    is_verified = table.Column<bool>(type: "boolean", nullable: false),
                    qualification = table.Column<string>(type: "text", nullable: false),
                    specialization = table.Column<string>(type: "text", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    years_of_experience = table.Column<int>(type: "integer", nullable: false)
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
                name: "feature_purchases",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    feature_id = table.Column<long>(type: "bigint", nullable: false),
                    activation_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    amount_paid = table.Column<decimal>(type: "numeric", nullable: false),
                    billing_cycle = table.Column<string>(type: "text", nullable: false),
                    currency = table.Column<string>(type: "text", nullable: false),
                    expiry_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    payment_status = table.Column<string>(type: "text", nullable: false),
                    purchase_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false)
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
                    feature_id = table.Column<long>(type: "bigint", nullable: false),
                    assigned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_default = table.Column<bool>(type: "boolean", nullable: false),
                    role_name = table.Column<string>(type: "text", nullable: false)
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
                    feature_id = table.Column<long>(type: "bigint", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    grant_type = table.Column<string>(type: "text", nullable: false),
                    granted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false)
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
                    feature_id = table.Column<long>(type: "bigint", nullable: false),
                    reward_id = table.Column<long>(type: "bigint", nullable: false),
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
                name: "tutor_availabilities",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tutor_id = table.Column<long>(type: "bigint", nullable: false),
                    day_of_week = table.Column<int>(type: "integer", nullable: false),
                    end_time = table.Column<TimeSpan>(type: "interval", nullable: false),
                    is_available = table.Column<bool>(type: "boolean", nullable: false),
                    start_time = table.Column<TimeSpan>(type: "interval", nullable: false)
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
                    subject_id = table.Column<string>(type: "text", nullable: false),
                    tutor_id = table.Column<long>(type: "bigint", nullable: false),
                    custom_hourly_rate = table.Column<decimal>(type: "numeric", nullable: false),
                    proficiency_level = table.Column<int>(type: "integer", nullable: false)
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
                    date_taken = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    grade = table.Column<string>(type: "text", nullable: false),
                    max_score = table.Column<double>(type: "double precision", nullable: false),
                    score = table.Column<double>(type: "double precision", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    type = table.Column<string>(type: "text", nullable: false)
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
                    ai_insights = table.Column<string>(type: "text", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    entry_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    entry_type = table.Column<string>(type: "text", nullable: false),
                    follow_up_action = table.Column<string>(type: "text", nullable: false),
                    is_private = table.Column<bool>(type: "boolean", nullable: false),
                    key_themes = table.Column<string>(type: "text", nullable: false),
                    mood = table.Column<string>(type: "text", nullable: false),
                    mood_intensity = table.Column<int>(type: "integer", nullable: false),
                    needs_follow_up = table.Column<bool>(type: "boolean", nullable: false),
                    sentiment_analysis = table.Column<string>(type: "text", nullable: false),
                    sentiment_score = table.Column<double>(type: "double precision", nullable: false),
                    tags = table.Column<string>(type: "text", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
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
                    energy_level = table.Column<int>(type: "integer", nullable: false),
                    factors_affecting_mood = table.Column<string>(type: "text", nullable: false),
                    motivation_level = table.Column<int>(type: "integer", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: false),
                    overall_mood = table.Column<string>(type: "text", nullable: false),
                    stress_level = table.Column<int>(type: "integer", nullable: false),
                    tracking_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
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
                    subject_id = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    current_value = table.Column<decimal>(type: "numeric", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    difficulty_weight = table.Column<int>(type: "integer", nullable: false),
                    goal_type = table.Column<string>(type: "text", nullable: false),
                    priority = table.Column<int>(type: "integer", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    target_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    target_value = table.Column<decimal>(type: "numeric", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    unit = table.Column<string>(type: "text", nullable: false),
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
                    academic_growth = table.Column<decimal>(type: "numeric", nullable: false),
                    areas_for_improvement = table.Column<string>(type: "text", nullable: false),
                    emotional_growth = table.Column<decimal>(type: "numeric", nullable: false),
                    growth_factors = table.Column<string>(type: "text", nullable: false),
                    overall_growth = table.Column<decimal>(type: "numeric", nullable: false),
                    study_habit_growth = table.Column<decimal>(type: "numeric", nullable: false),
                    tracking_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
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
                    is_primary_contact = table.Column<bool>(type: "boolean", nullable: false),
                    relationship = table.Column<string>(type: "text", nullable: false)
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
                    available_points = table.Column<int>(type: "integer", nullable: false),
                    current_rank = table.Column<string>(type: "text", nullable: false),
                    last_updated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    level = table.Column<int>(type: "integer", nullable: false),
                    total_points = table.Column<int>(type: "integer", nullable: false),
                    used_points = table.Column<int>(type: "integer", nullable: false)
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
                    assignments_completed = table.Column<int>(type: "integer", nullable: true),
                    average_score = table.Column<double>(type: "double precision", nullable: true),
                    confidence_level = table.Column<double>(type: "double precision", nullable: true),
                    difficulty_level = table.Column<double>(type: "double precision", nullable: true),
                    last_activity = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    learning_velocity = table.Column<double>(type: "double precision", nullable: true),
                    performance_trend = table.Column<string>(type: "text", nullable: true),
                    predicted_score = table.Column<double>(type: "double precision", nullable: true),
                    progress = table.Column<int>(type: "integer", nullable: true),
                    retention_rate = table.Column<double>(type: "double precision", nullable: true),
                    strength = table.Column<string>(type: "text", nullable: true),
                    study_efficiency = table.Column<double>(type: "double precision", nullable: true),
                    study_hours = table.Column<int>(type: "integer", nullable: true),
                    target = table.Column<int>(type: "integer", nullable: true),
                    upcoming_deadlines = table.Column<int>(type: "integer", nullable: true),
                    weakness = table.Column<string>(type: "text", nullable: true)
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
                    concentration_level = table.Column<int>(type: "integer", nullable: false),
                    duration_minutes = table.Column<int>(type: "integer", nullable: false),
                    efficiency_score = table.Column<double>(type: "double precision", nullable: false),
                    end_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: false),
                    resources_used = table.Column<string>(type: "text", nullable: false),
                    session_type = table.Column<string>(type: "text", nullable: false),
                    start_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    topics_covered = table.Column<string>(type: "text", nullable: false)
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
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    tutor_id = table.Column<long>(type: "bigint", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    sessions_per_week = table.Column<int>(type: "integer", nullable: false),
                    started_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
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
                    subject_id = table.Column<string>(type: "text", nullable: false),
                    teacher_id = table.Column<long>(type: "bigint", nullable: true),
                    tutor_id = table.Column<long>(type: "bigint", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    currency = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    is_published = table.Column<bool>(type: "boolean", nullable: false),
                    level = table.Column<string>(type: "text", nullable: false),
                    preview_video_url = table.Column<string>(type: "text", nullable: false),
                    price = table.Column<decimal>(type: "numeric", nullable: false),
                    rating = table.Column<double>(type: "double precision", nullable: false),
                    thumbnail_url = table.Column<string>(type: "text", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    total_hours = table.Column<decimal>(type: "numeric", nullable: false),
                    total_lessons = table.Column<int>(type: "integer", nullable: false),
                    total_students = table.Column<int>(type: "integer", nullable: false),
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
                    admin_id = table.Column<long>(type: "bigint", nullable: false),
                    teacher_id = table.Column<long>(type: "bigint", nullable: false),
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
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    teacher_id = table.Column<long>(type: "bigint", nullable: false),
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
                    subject_id = table.Column<string>(type: "text", nullable: false),
                    teacher_id = table.Column<long>(type: "bigint", nullable: false),
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
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    description = table.Column<string>(type: "text", nullable: false),
                    is_completed = table.Column<bool>(type: "boolean", nullable: false),
                    reward_points = table.Column<int>(type: "integer", nullable: false),
                    target_value = table.Column<decimal>(type: "numeric", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false)
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
                    goal_id = table.Column<long>(type: "bigint", nullable: true),
                    reward_id = table.Column<long>(type: "bigint", nullable: false),
                    student_id = table.Column<long>(type: "bigint", nullable: false),
                    achievement_context = table.Column<string>(type: "text", nullable: false),
                    earned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    points_earned = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false)
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
                    related_goal_id = table.Column<long>(type: "bigint", nullable: true),
                    related_reward_id = table.Column<long>(type: "bigint", nullable: true),
                    student_points_id = table.Column<long>(type: "bigint", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    points = table.Column<int>(type: "integer", nullable: false),
                    source = table.Column<string>(type: "text", nullable: false),
                    transaction_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    transaction_type = table.Column<string>(type: "text", nullable: false)
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
                    average = table.Column<double>(type: "double precision", nullable: false),
                    count = table.Column<int>(type: "integer", nullable: false)
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
                    count = table.Column<int>(type: "integer", nullable: false),
                    grade = table.Column<string>(type: "text", nullable: false)
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
                    priority = table.Column<int>(type: "integer", nullable: false),
                    tip = table.Column<string>(type: "text", nullable: false)
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
                    last_tested = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    severity = table.Column<string>(type: "text", nullable: false)
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
                    intervention_needed = table.Column<bool>(type: "boolean", nullable: false),
                    risk_level = table.Column<string>(type: "text", nullable: false)
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
                    mastery_level = table.Column<int>(type: "integer", nullable: false),
                    prerequisite = table.Column<string>(type: "text", nullable: false)
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
                    afternoon_percentage = table.Column<int>(type: "integer", nullable: false),
                    alignment = table.Column<string>(type: "text", nullable: false),
                    attendance_rate = table.Column<double>(type: "double precision", nullable: false),
                    classes_attended = table.Column<int>(type: "integer", nullable: false),
                    consistency = table.Column<int>(type: "integer", nullable: false),
                    evening_percentage = table.Column<int>(type: "integer", nullable: false),
                    forum_activity = table.Column<int>(type: "integer", nullable: false),
                    group_study = table.Column<int>(type: "integer", nullable: false),
                    importance = table.Column<int>(type: "integer", nullable: false),
                    interest_level = table.Column<double>(type: "double precision", nullable: false),
                    morning_percentage = table.Column<int>(type: "integer", nullable: false),
                    motivation_level = table.Column<double>(type: "double precision", nullable: false),
                    online_platforms = table.Column<int>(type: "integer", nullable: false),
                    participation_rate = table.Column<int>(type: "integer", nullable: false),
                    practice_problems = table.Column<int>(type: "integer", nullable: false),
                    preferred_days = table.Column<string>(type: "text", nullable: false),
                    questions_asked = table.Column<int>(type: "integer", nullable: false),
                    resource_downloads = table.Column<int>(type: "integer", nullable: false),
                    session_length = table.Column<int>(type: "integer", nullable: false),
                    sleep_quality = table.Column<double>(type: "double precision", nullable: false),
                    stress_level = table.Column<double>(type: "double precision", nullable: false),
                    textbook_usage = table.Column<int>(type: "integer", nullable: false),
                    total_classes = table.Column<int>(type: "integer", nullable: false),
                    video_tutorials = table.Column<int>(type: "integer", nullable: false),
                    workload_this_week = table.Column<double>(type: "double precision", nullable: false)
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
                    last_tested = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    score = table.Column<double>(type: "double precision", nullable: false),
                    trend = table.Column<string>(type: "text", nullable: false)
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
                    hours = table.Column<int>(type: "integer", nullable: false),
                    week_number = table.Column<int>(type: "integer", nullable: false)
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
                    amount_paid = table.Column<decimal>(type: "numeric", nullable: false),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    enrolled_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    payment_status = table.Column<string>(type: "text", nullable: false),
                    progress = table.Column<decimal>(type: "numeric", nullable: false)
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
                    description = table.Column<string>(type: "text", nullable: false),
                    duration_hours = table.Column<decimal>(type: "numeric", nullable: false),
                    order = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false)
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
                    course_id = table.Column<long>(type: "bigint", nullable: true),
                    subject_id = table.Column<string>(type: "text", nullable: false),
                    teacher_id = table.Column<long>(type: "bigint", nullable: true),
                    tutor_id = table.Column<long>(type: "bigint", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    download_count = table.Column<int>(type: "integer", nullable: false),
                    file_format = table.Column<string>(type: "text", nullable: false),
                    file_size = table.Column<string>(type: "text", nullable: false),
                    file_url = table.Column<string>(type: "text", nullable: false),
                    grade_level = table.Column<string>(type: "text", nullable: false),
                    is_approved = table.Column<bool>(type: "boolean", nullable: false),
                    is_free = table.Column<bool>(type: "boolean", nullable: false),
                    price = table.Column<decimal>(type: "numeric", nullable: false),
                    rating = table.Column<double>(type: "double precision", nullable: false),
                    resource_type = table.Column<string>(type: "text", nullable: false),
                    s3key = table.Column<string>(type: "text", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false)
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
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    module_id = table.Column<long>(type: "bigint", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    duration_minutes = table.Column<decimal>(type: "numeric", nullable: false),
                    is_free_preview = table.Column<bool>(type: "boolean", nullable: false),
                    order = table.Column<int>(type: "integer", nullable: false),
                    resource_urls = table.Column<string>(type: "text", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    video_url = table.Column<string>(type: "text", nullable: false)
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
                name: "ix_assessment_breakdowns_student_subject_id",
                schema: "entitlements",
                table: "assessment_breakdowns",
                column: "student_subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_assessments_student_id",
                schema: "entitlements",
                table: "assessments",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_assessments_subject_id",
                schema: "entitlements",
                table: "assessments",
                column: "subject_id");

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
                name: "ix_course_modules_course_id",
                schema: "entitlements",
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
                name: "ix_grade_distributions_student_subject_id",
                schema: "entitlements",
                table: "grade_distributions",
                column: "student_subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_growth_trackings_student_id",
                schema: "entitlements",
                table: "growth_trackings",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_improvement_tips_student_subject_id",
                schema: "entitlements",
                table: "improvement_tips",
                column: "student_subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_knowledge_gaps_student_subject_id",
                schema: "entitlements",
                table: "knowledge_gaps",
                column: "student_subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_module_lessons_module_id",
                schema: "entitlements",
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
                name: "ix_role_features_feature_id",
                schema: "entitlements",
                table: "role_features",
                column: "feature_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_points_student_id",
                schema: "entitlements",
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
                name: "ix_student_subject_analytics_student_subject_id",
                schema: "entitlements",
                table: "student_subject_analytics",
                column: "student_subject_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_student_subject_topics_student_subject_id",
                schema: "entitlements",
                table: "student_subject_topics",
                column: "student_subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_subject_topics_topic_id",
                schema: "entitlements",
                table: "student_subject_topics",
                column: "topic_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_subjects_student_id",
                schema: "entitlements",
                table: "student_subjects",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_subjects_subject_id",
                schema: "entitlements",
                table: "student_subjects",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_students_admin_id",
                schema: "entitlements",
                table: "students",
                column: "admin_id");

            migrationBuilder.CreateIndex(
                name: "ix_study_sessions_student_id",
                schema: "entitlements",
                table: "study_sessions",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_study_sessions_subject_id",
                schema: "entitlements",
                table: "study_sessions",
                column: "subject_id");

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
                name: "ix_teachers_admin_id",
                schema: "entitlements",
                table: "teachers",
                column: "admin_id");

            migrationBuilder.CreateIndex(
                name: "ix_topics_subject_id",
                schema: "entitlements",
                table: "topics",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_tutor_availabilities_tutor_id",
                schema: "entitlements",
                table: "tutor_availabilities",
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
                name: "ix_user_features_feature_id",
                schema: "entitlements",
                table: "user_features",
                column: "feature_id");

            migrationBuilder.CreateIndex(
                name: "ix_weekly_study_hours_student_subject_id",
                schema: "entitlements",
                table: "weekly_study_hours",
                column: "student_subject_id");
        }
    }
}
