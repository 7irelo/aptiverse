using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCurriculumCatalog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_student_subjects_student_subject_analytics_analytics_id",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropForeignKey(
                name: "fk_student_subjects_students_student_id",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropForeignKey(
                name: "fk_student_subjects_subject_subject_id",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropTable(
                name: "assessment_breakdowns",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "assessments",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "improvement_tips",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "knowledge_gaps",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "student_subject_analytics",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "student_subject_topics",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "study_sessions",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "weekly_study_hours",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "topics",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "students",
                schema: "academic_planning");

            migrationBuilder.DropIndex(
                name: "ix_student_subjects_student_id",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropIndex(
                name: "ix_student_subjects_subject_id",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropColumn(
                name: "border_color",
                schema: "academic_planning",
                table: "subjects");

            migrationBuilder.DropColumn(
                name: "color",
                schema: "academic_planning",
                table: "subjects");

            migrationBuilder.DropColumn(
                name: "assignments_completed",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropColumn(
                name: "average_score",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropColumn(
                name: "confidence_level",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropColumn(
                name: "difficulty_level",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropColumn(
                name: "last_activity",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropColumn(
                name: "learning_velocity",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropColumn(
                name: "performance_trend",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropColumn(
                name: "predicted_score",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropColumn(
                name: "progress",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropColumn(
                name: "retention_rate",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropColumn(
                name: "strength",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropColumn(
                name: "study_efficiency",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropColumn(
                name: "study_hours",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropColumn(
                name: "subject_id",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropColumn(
                name: "target",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropColumn(
                name: "upcoming_deadlines",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.RenameIndex(
                name: "ix_weekly_study_hours_student_subject_id1",
                schema: "entitlements",
                table: "weekly_study_hours",
                newName: "ix_weekly_study_hours_student_subject_id");

            migrationBuilder.RenameIndex(
                name: "ix_topics_subject_id1",
                schema: "entitlements",
                table: "topics",
                newName: "ix_topics_subject_id");

            migrationBuilder.RenameColumn(
                name: "text_color",
                schema: "academic_planning",
                table: "subjects",
                newName: "category");

            migrationBuilder.RenameIndex(
                name: "ix_study_sessions_subject_id1",
                schema: "entitlements",
                table: "study_sessions",
                newName: "ix_study_sessions_subject_id");

            migrationBuilder.RenameIndex(
                name: "ix_study_sessions_student_id1",
                schema: "entitlements",
                table: "study_sessions",
                newName: "ix_study_sessions_student_id");

            migrationBuilder.RenameIndex(
                name: "ix_student_subjects_subject_id1",
                schema: "entitlements",
                table: "student_subjects",
                newName: "ix_student_subjects_subject_id");

            migrationBuilder.RenameIndex(
                name: "ix_student_subjects_student_id1",
                schema: "entitlements",
                table: "student_subjects",
                newName: "ix_student_subjects_student_id");

            migrationBuilder.RenameColumn(
                name: "weakness",
                schema: "academic_planning",
                table: "student_subjects",
                newName: "teacher");

            migrationBuilder.RenameColumn(
                name: "analytics_id",
                schema: "academic_planning",
                table: "student_subjects",
                newName: "curriculum_subject_id");

            migrationBuilder.RenameIndex(
                name: "ix_student_subjects_analytics_id",
                schema: "academic_planning",
                table: "student_subjects",
                newName: "ix_student_subjects_curriculum_subject_id");

            migrationBuilder.RenameIndex(
                name: "ix_student_subject_topics_topic_id1",
                schema: "entitlements",
                table: "student_subject_topics",
                newName: "ix_student_subject_topics_topic_id");

            migrationBuilder.RenameIndex(
                name: "ix_student_subject_topics_student_subject_id1",
                schema: "entitlements",
                table: "student_subject_topics",
                newName: "ix_student_subject_topics_student_subject_id");

            migrationBuilder.RenameIndex(
                name: "ix_knowledge_gaps_student_subject_id2",
                schema: "mastery",
                table: "knowledge_gaps",
                newName: "ix_knowledge_gaps_student_subject_id1");

            migrationBuilder.RenameIndex(
                name: "ix_knowledge_gaps_student_subject_id1",
                schema: "entitlements",
                table: "knowledge_gaps",
                newName: "ix_knowledge_gaps_student_subject_id");

            migrationBuilder.RenameIndex(
                name: "ix_improvement_tips_student_subject_id2",
                schema: "insights",
                table: "improvement_tips",
                newName: "ix_improvement_tips_student_subject_id1");

            migrationBuilder.RenameIndex(
                name: "ix_improvement_tips_student_subject_id1",
                schema: "entitlements",
                table: "improvement_tips",
                newName: "ix_improvement_tips_student_subject_id");

            migrationBuilder.RenameIndex(
                name: "ix_assessments_subject_id1",
                schema: "entitlements",
                table: "assessments",
                newName: "ix_assessments_subject_id");

            migrationBuilder.RenameIndex(
                name: "ix_assessments_student_id1",
                schema: "entitlements",
                table: "assessments",
                newName: "ix_assessments_student_id");

            migrationBuilder.RenameIndex(
                name: "ix_assessment_breakdowns_student_subject_id1",
                schema: "entitlements",
                table: "assessment_breakdowns",
                newName: "ix_assessment_breakdowns_student_subject_id");

            migrationBuilder.AddColumn<string>(
                name: "curriculum_id",
                schema: "identity",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "grade",
                schema: "identity",
                table: "users",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "school",
                schema: "identity",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "description",
                schema: "academic_planning",
                table: "subjects",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<string>(
                name: "language_type",
                schema: "academic_planning",
                table: "subjects",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "student_id",
                schema: "academic_planning",
                table: "student_subjects",
                type: "text",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                schema: "academic_planning",
                table: "student_subjects",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "grade",
                schema: "academic_planning",
                table: "student_subjects",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                schema: "academic_planning",
                table: "student_subjects",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateTable(
                name: "curricula",
                schema: "academic_planning",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    short_name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_curricula", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "curriculum_subjects",
                schema: "academic_planning",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    curriculum_id = table.Column<string>(type: "text", nullable: false),
                    subject_id = table.Column<string>(type: "text", nullable: false),
                    is_compulsory = table.Column<bool>(type: "boolean", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_curriculum_subjects", x => x.id);
                    table.ForeignKey(
                        name: "fk_curriculum_subjects_curricula_curriculum_id",
                        column: x => x.curriculum_id,
                        principalSchema: "academic_planning",
                        principalTable: "curricula",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_curriculum_subjects_subject_subject_id",
                        column: x => x.subject_id,
                        principalSchema: "academic_planning",
                        principalTable: "subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_curriculum_subjects_curriculum_id",
                schema: "academic_planning",
                table: "curriculum_subjects",
                column: "curriculum_id");

            migrationBuilder.CreateIndex(
                name: "ix_curriculum_subjects_subject_id",
                schema: "academic_planning",
                table: "curriculum_subjects",
                column: "subject_id");

            migrationBuilder.AddForeignKey(
                name: "fk_student_subjects_curriculum_subjects_curriculum_subject_id",
                schema: "academic_planning",
                table: "student_subjects",
                column: "curriculum_subject_id",
                principalSchema: "academic_planning",
                principalTable: "curriculum_subjects",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_student_subjects_curriculum_subjects_curriculum_subject_id",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropTable(
                name: "curriculum_subjects",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "curricula",
                schema: "academic_planning");

            migrationBuilder.DropColumn(
                name: "curriculum_id",
                schema: "identity",
                table: "users");

            migrationBuilder.DropColumn(
                name: "grade",
                schema: "identity",
                table: "users");

            migrationBuilder.DropColumn(
                name: "school",
                schema: "identity",
                table: "users");

            migrationBuilder.DropColumn(
                name: "language_type",
                schema: "academic_planning",
                table: "subjects");

            migrationBuilder.DropColumn(
                name: "created_at",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropColumn(
                name: "grade",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.DropColumn(
                name: "updated_at",
                schema: "academic_planning",
                table: "student_subjects");

            migrationBuilder.RenameIndex(
                name: "ix_weekly_study_hours_student_subject_id",
                schema: "entitlements",
                table: "weekly_study_hours",
                newName: "ix_weekly_study_hours_student_subject_id1");

            migrationBuilder.RenameIndex(
                name: "ix_topics_subject_id",
                schema: "entitlements",
                table: "topics",
                newName: "ix_topics_subject_id1");

            migrationBuilder.RenameColumn(
                name: "category",
                schema: "academic_planning",
                table: "subjects",
                newName: "text_color");

            migrationBuilder.RenameIndex(
                name: "ix_study_sessions_subject_id",
                schema: "entitlements",
                table: "study_sessions",
                newName: "ix_study_sessions_subject_id1");

            migrationBuilder.RenameIndex(
                name: "ix_study_sessions_student_id",
                schema: "entitlements",
                table: "study_sessions",
                newName: "ix_study_sessions_student_id1");

            migrationBuilder.RenameIndex(
                name: "ix_student_subjects_subject_id",
                schema: "entitlements",
                table: "student_subjects",
                newName: "ix_student_subjects_subject_id1");

            migrationBuilder.RenameIndex(
                name: "ix_student_subjects_student_id",
                schema: "entitlements",
                table: "student_subjects",
                newName: "ix_student_subjects_student_id1");

            migrationBuilder.RenameColumn(
                name: "teacher",
                schema: "academic_planning",
                table: "student_subjects",
                newName: "weakness");

            migrationBuilder.RenameColumn(
                name: "curriculum_subject_id",
                schema: "academic_planning",
                table: "student_subjects",
                newName: "analytics_id");

            migrationBuilder.RenameIndex(
                name: "ix_student_subjects_curriculum_subject_id",
                schema: "academic_planning",
                table: "student_subjects",
                newName: "ix_student_subjects_analytics_id");

            migrationBuilder.RenameIndex(
                name: "ix_student_subject_topics_topic_id",
                schema: "entitlements",
                table: "student_subject_topics",
                newName: "ix_student_subject_topics_topic_id1");

            migrationBuilder.RenameIndex(
                name: "ix_student_subject_topics_student_subject_id",
                schema: "entitlements",
                table: "student_subject_topics",
                newName: "ix_student_subject_topics_student_subject_id1");

            migrationBuilder.RenameIndex(
                name: "ix_knowledge_gaps_student_subject_id1",
                schema: "mastery",
                table: "knowledge_gaps",
                newName: "ix_knowledge_gaps_student_subject_id2");

            migrationBuilder.RenameIndex(
                name: "ix_knowledge_gaps_student_subject_id",
                schema: "entitlements",
                table: "knowledge_gaps",
                newName: "ix_knowledge_gaps_student_subject_id1");

            migrationBuilder.RenameIndex(
                name: "ix_improvement_tips_student_subject_id1",
                schema: "insights",
                table: "improvement_tips",
                newName: "ix_improvement_tips_student_subject_id2");

            migrationBuilder.RenameIndex(
                name: "ix_improvement_tips_student_subject_id",
                schema: "entitlements",
                table: "improvement_tips",
                newName: "ix_improvement_tips_student_subject_id1");

            migrationBuilder.RenameIndex(
                name: "ix_assessments_subject_id",
                schema: "entitlements",
                table: "assessments",
                newName: "ix_assessments_subject_id1");

            migrationBuilder.RenameIndex(
                name: "ix_assessments_student_id",
                schema: "entitlements",
                table: "assessments",
                newName: "ix_assessments_student_id1");

            migrationBuilder.RenameIndex(
                name: "ix_assessment_breakdowns_student_subject_id",
                schema: "entitlements",
                table: "assessment_breakdowns",
                newName: "ix_assessment_breakdowns_student_subject_id1");

            migrationBuilder.AlterColumn<string>(
                name: "description",
                schema: "academic_planning",
                table: "subjects",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "border_color",
                schema: "academic_planning",
                table: "subjects",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "color",
                schema: "academic_planning",
                table: "subjects",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<long>(
                name: "student_id",
                schema: "academic_planning",
                table: "student_subjects",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<int>(
                name: "assignments_completed",
                schema: "academic_planning",
                table: "student_subjects",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "average_score",
                schema: "academic_planning",
                table: "student_subjects",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "confidence_level",
                schema: "academic_planning",
                table: "student_subjects",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "difficulty_level",
                schema: "academic_planning",
                table: "student_subjects",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "last_activity",
                schema: "academic_planning",
                table: "student_subjects",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "learning_velocity",
                schema: "academic_planning",
                table: "student_subjects",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "performance_trend",
                schema: "academic_planning",
                table: "student_subjects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "predicted_score",
                schema: "academic_planning",
                table: "student_subjects",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "progress",
                schema: "academic_planning",
                table: "student_subjects",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "retention_rate",
                schema: "academic_planning",
                table: "student_subjects",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "strength",
                schema: "academic_planning",
                table: "student_subjects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "study_efficiency",
                schema: "academic_planning",
                table: "student_subjects",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "study_hours",
                schema: "academic_planning",
                table: "student_subjects",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "subject_id",
                schema: "academic_planning",
                table: "student_subjects",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "target",
                schema: "academic_planning",
                table: "student_subjects",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "upcoming_deadlines",
                schema: "academic_planning",
                table: "student_subjects",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "assessment_breakdowns",
                schema: "academic_planning",
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
                name: "weekly_study_hours",
                schema: "academic_planning",
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
                        principalSchema: "academic_planning",
                        principalTable: "student_subjects",
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
                name: "study_sessions",
                schema: "academic_planning",
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
                name: "student_subject_topics",
                schema: "academic_planning",
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
                name: "ix_assessment_breakdowns_student_subject_id",
                schema: "academic_planning",
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
                name: "ix_improvement_tips_student_subject_id",
                schema: "academic_planning",
                table: "improvement_tips",
                column: "student_subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_knowledge_gaps_student_subject_id",
                schema: "academic_planning",
                table: "knowledge_gaps",
                column: "student_subject_id");

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
                name: "ix_topics_subject_id",
                schema: "academic_planning",
                table: "topics",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_weekly_study_hours_student_subject_id",
                schema: "academic_planning",
                table: "weekly_study_hours",
                column: "student_subject_id");

            migrationBuilder.AddForeignKey(
                name: "fk_student_subjects_student_subject_analytics_analytics_id",
                schema: "academic_planning",
                table: "student_subjects",
                column: "analytics_id",
                principalSchema: "academic_planning",
                principalTable: "student_subject_analytics",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_student_subjects_students_student_id",
                schema: "academic_planning",
                table: "student_subjects",
                column: "student_id",
                principalSchema: "academic_planning",
                principalTable: "students",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_student_subjects_subject_subject_id",
                schema: "academic_planning",
                table: "student_subjects",
                column: "subject_id",
                principalSchema: "academic_planning",
                principalTable: "subjects",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
