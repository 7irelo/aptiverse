using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aptiverse.Academics.Persistence.Migrations
{
    /// <inheritdoc />
    internal partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "academics");

            migrationBuilder.CreateTable(
                name: "catalog_subjects",
                schema: "academics",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    slug = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    code = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    category = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: false),
                    language_type = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: true),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_catalog_subjects", x => x.id);
                    table.CheckConstraint("ck_catalog_subjects_category", "category IN ('language', 'mathematics', 'natural_science', 'commerce', 'humanities', 'services', 'technical', 'arts', 'life_orientation')");
                    table.CheckConstraint("ck_catalog_subjects_language_type", "language_type IS NULL OR language_type IN ('home', 'first_additional', 'second_additional')");
                });

            migrationBuilder.CreateTable(
                name: "curricula",
                schema: "academics",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    short_name = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_curricula", x => x.id);
                    table.CheckConstraint("ck_curricula_code", "code IN ('nsc', 'ieb')");
                });

            migrationBuilder.CreateTable(
                name: "institutions",
                schema: "academics",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    slug = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    name = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    short_name = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: true),
                    type = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    province = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_institutions", x => x.id);
                    table.CheckConstraint("ck_institutions_province", "province IS NULL OR province IN ('eastern_cape', 'free_state', 'gauteng', 'kwazulu_natal', 'limpopo', 'mpumalanga', 'northern_cape', 'north_west', 'western_cape')");
                    table.CheckConstraint("ck_institutions_type", "type IN ('university', 'university_of_technology', 'comprehensive_university', 'tvet', 'private_college')");
                });

            migrationBuilder.CreateTable(
                name: "curriculum_subjects",
                schema: "academics",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    curriculum_id = table.Column<Guid>(type: "uuid", nullable: false),
                    subject_id = table.Column<Guid>(type: "uuid", nullable: false),
                    min_grade = table.Column<short>(type: "smallint", nullable: false),
                    max_grade = table.Column<short>(type: "smallint", nullable: false),
                    is_compulsory = table.Column<bool>(type: "boolean", nullable: false),
                    notes = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_curriculum_subjects", x => x.id);
                    table.CheckConstraint("ck_curriculum_subjects_max_grade", "max_grade BETWEEN min_grade AND 12");
                    table.CheckConstraint("ck_curriculum_subjects_min_grade", "min_grade BETWEEN 8 AND 12");
                    table.ForeignKey(
                        name: "fk_curriculum_subjects_catalog_subjects_subject_id",
                        column: x => x.subject_id,
                        principalSchema: "academics",
                        principalTable: "catalog_subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_curriculum_subjects_curricula_curriculum_id",
                        column: x => x.curriculum_id,
                        principalSchema: "academics",
                        principalTable: "curricula",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "study_units",
                schema: "academics",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    kind = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    catalog_subject_id = table.Column<Guid>(type: "uuid", nullable: true),
                    curriculum_code = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: true),
                    grade = table.Column<short>(type: "smallint", nullable: true),
                    institution_id = table.Column<Guid>(type: "uuid", nullable: true),
                    owner_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    name = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    normalized_key = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    course_code = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: true),
                    level = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_study_units", x => x.id);
                    table.CheckConstraint("ck_study_units_curriculum_code", "curriculum_code IS NULL OR curriculum_code IN ('nsc', 'ieb')");
                    table.CheckConstraint("ck_study_units_grade", "grade IS NULL OR grade BETWEEN 8 AND 12");
                    table.CheckConstraint("ck_study_units_kind", "kind IN ('caps_subject', 'tertiary_course')");
                    table.CheckConstraint("ck_study_units_level", "level IS NULL OR level IN ('first_year', 'second_year', 'third_year', 'fourth_year', 'honours', 'masters', 'phd')");
                    table.CheckConstraint("ck_study_units_shape", "(kind = 'caps_subject' AND catalog_subject_id IS NOT NULL AND curriculum_code IS NOT NULL AND grade IS NOT NULL AND institution_id IS NULL AND owner_user_id IS NULL AND level IS NULL) OR (kind = 'tertiary_course' AND level IS NOT NULL AND catalog_subject_id IS NULL AND grade IS NULL AND curriculum_code IS NULL AND ((institution_id IS NULL) <> (owner_user_id IS NULL)))");
                    table.ForeignKey(
                        name: "fk_study_units_catalog_subjects_catalog_subject_id",
                        column: x => x.catalog_subject_id,
                        principalSchema: "academics",
                        principalTable: "catalog_subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_study_units_institutions_institution_id",
                        column: x => x.institution_id,
                        principalSchema: "academics",
                        principalTable: "institutions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "enrolments",
                schema: "academics",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    study_unit_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    teacher_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    started_on = table.Column<DateOnly>(type: "date", nullable: false),
                    duration = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: true),
                    expected_end_on = table.Column<DateOnly>(type: "date", nullable: true),
                    completed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    display_order = table.Column<short>(type: "smallint", nullable: false),
                    colour_token = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_enrolments", x => x.id);
                    table.CheckConstraint("ck_enrolments_colour_token", "colour_token IS NULL OR colour_token IN ('citron', 'graphite', 'sky', 'mint', 'rose', 'amber', 'violet', 'teal', 'coral', 'slate')");
                    table.CheckConstraint("ck_enrolments_display_order", "display_order BETWEEN 0 AND 99");
                    table.CheckConstraint("ck_enrolments_duration", "duration IS NULL OR duration IN ('semester', 'full_year')");
                    table.CheckConstraint("ck_enrolments_expected_end_on", "expected_end_on IS NULL OR expected_end_on >= started_on");
                    table.CheckConstraint("ck_enrolments_status", "status IN ('active', 'completed', 'dropped', 'stage_mismatch')");
                    table.ForeignKey(
                        name: "fk_enrolments_study_units_study_unit_id",
                        column: x => x.study_unit_id,
                        principalSchema: "academics",
                        principalTable: "study_units",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "topics",
                schema: "academics",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    study_unit_id = table.Column<Guid>(type: "uuid", nullable: false),
                    slug = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    source = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    merged_into_topic_id = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_topics", x => x.id);
                    table.CheckConstraint("ck_topics_source", "source IN ('generation', 'student', 'admin', 'migration')");
                    table.ForeignKey(
                        name: "fk_topics_study_units_study_unit_id",
                        column: x => x.study_unit_id,
                        principalSchema: "academics",
                        principalTable: "study_units",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_topics_topics_merged_into_topic_id",
                        column: x => x.merged_into_topic_id,
                        principalSchema: "academics",
                        principalTable: "topics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "assessments",
                schema: "academics",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    enrolment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    assessment_type = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: false),
                    weight_percent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    term = table.Column<short>(type: "smallint", nullable: true),
                    due_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    state = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    predicted_percent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    mark_obtained = table.Column<int>(type: "integer", nullable: true),
                    mark_total = table.Column<int>(type: "integer", nullable: true),
                    percent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    started_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    submitted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    graded_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_assessments", x => x.id);
                    table.CheckConstraint("ck_assessments_graded", "state <> 'graded' OR (graded_at IS NOT NULL AND mark_obtained IS NOT NULL)");
                    table.CheckConstraint("ck_assessments_mark", "(mark_obtained IS NULL AND mark_total IS NULL AND percent IS NULL) OR (mark_obtained >= 0 AND mark_total > 0 AND mark_total <= 10000 AND mark_obtained <= mark_total AND percent BETWEEN 0 AND 100)");
                    table.CheckConstraint("ck_assessments_predicted_percent", "predicted_percent IS NULL OR predicted_percent BETWEEN 0 AND 100");
                    table.CheckConstraint("ck_assessments_state", "state IN ('scheduled', 'in_progress', 'submitted', 'graded')");
                    table.CheckConstraint("ck_assessments_term", "term IS NULL OR term BETWEEN 1 AND 4");
                    table.CheckConstraint("ck_assessments_type", "assessment_type IN ('test', 'essay', 'investigation', 'practical', 'exam', 'project', 'oral', 'assignment', 'class_test', 'tutorial', 'lab_report', 'midterm', 'presentation')");
                    table.CheckConstraint("ck_assessments_weight_percent", "weight_percent IS NULL OR weight_percent BETWEEN 0 AND 100");
                    table.ForeignKey(
                        name: "fk_assessments_enrolments_enrolment_id",
                        column: x => x.enrolment_id,
                        principalSchema: "academics",
                        principalTable: "enrolments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_assessments_enrolment_id_due_at",
                schema: "academics",
                table: "assessments",
                columns: new[] { "enrolment_id", "due_at" });

            migrationBuilder.CreateIndex(
                name: "ix_assessments_user_id_due_at",
                schema: "academics",
                table: "assessments",
                columns: new[] { "user_id", "due_at" });

            migrationBuilder.CreateIndex(
                name: "ix_assessments_user_id_state",
                schema: "academics",
                table: "assessments",
                columns: new[] { "user_id", "state" });

            migrationBuilder.CreateIndex(
                name: "ix_catalog_subjects_slug",
                schema: "academics",
                table: "catalog_subjects",
                column: "slug",
                unique: true,
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_curricula_code",
                schema: "academics",
                table: "curricula",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_curriculum_subjects_curriculum_id_subject_id",
                schema: "academics",
                table: "curriculum_subjects",
                columns: new[] { "curriculum_id", "subject_id" },
                unique: true,
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_curriculum_subjects_subject_id",
                schema: "academics",
                table: "curriculum_subjects",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_enrolments_study_unit_id",
                schema: "academics",
                table: "enrolments",
                column: "study_unit_id");

            migrationBuilder.CreateIndex(
                name: "ix_enrolments_user_id_status",
                schema: "academics",
                table: "enrolments",
                columns: new[] { "user_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_enrolments_user_id_study_unit_id",
                schema: "academics",
                table: "enrolments",
                columns: new[] { "user_id", "study_unit_id" },
                unique: true,
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_institutions_slug",
                schema: "academics",
                table: "institutions",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_study_units_catalog_subject_id",
                schema: "academics",
                table: "study_units",
                column: "catalog_subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_study_units_institution_id_level",
                schema: "academics",
                table: "study_units",
                columns: new[] { "institution_id", "level" });

            migrationBuilder.CreateIndex(
                name: "ix_study_units_normalized_key",
                schema: "academics",
                table: "study_units",
                column: "normalized_key",
                unique: true,
                filter: "deleted_at IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_study_units_owner_user_id",
                schema: "academics",
                table: "study_units",
                column: "owner_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_topics_merged_into_topic_id",
                schema: "academics",
                table: "topics",
                column: "merged_into_topic_id");

            migrationBuilder.CreateIndex(
                name: "ix_topics_study_unit_id_slug",
                schema: "academics",
                table: "topics",
                columns: new[] { "study_unit_id", "slug" },
                unique: true,
                filter: "deleted_at IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "assessments",
                schema: "academics");

            migrationBuilder.DropTable(
                name: "curriculum_subjects",
                schema: "academics");

            migrationBuilder.DropTable(
                name: "topics",
                schema: "academics");

            migrationBuilder.DropTable(
                name: "enrolments",
                schema: "academics");

            migrationBuilder.DropTable(
                name: "curricula",
                schema: "academics");

            migrationBuilder.DropTable(
                name: "study_units",
                schema: "academics");

            migrationBuilder.DropTable(
                name: "catalog_subjects",
                schema: "academics");

            migrationBuilder.DropTable(
                name: "institutions",
                schema: "academics");
        }
    }
}
