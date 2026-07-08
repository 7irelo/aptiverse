using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddInstitutionsAndCourses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "institution_id",
                schema: "identity",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "courses",
                schema: "academic_planning",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    institution_id = table.Column<string>(type: "text", nullable: false),
                    slug = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    code = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_courses", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "institutions",
                schema: "academic_planning",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    short_name = table.Column<string>(type: "text", nullable: true),
                    type = table.Column<string>(type: "text", nullable: false),
                    province = table.Column<string>(type: "text", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_institutions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "student_courses",
                schema: "academic_planning",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<string>(type: "text", nullable: false),
                    course_id = table.Column<long>(type: "bigint", nullable: false),
                    lecturer = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_student_courses", x => x.id);
                    table.ForeignKey(
                        name: "fk_student_courses_courses_course_id",
                        column: x => x.course_id,
                        principalSchema: "academic_planning",
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_courses_institution_id",
                schema: "academic_planning",
                table: "courses",
                column: "institution_id");

            migrationBuilder.CreateIndex(
                name: "ix_courses_institution_id_slug",
                schema: "academic_planning",
                table: "courses",
                columns: new[] { "institution_id", "slug" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_institutions_type",
                schema: "academic_planning",
                table: "institutions",
                column: "type");

            migrationBuilder.CreateIndex(
                name: "ix_student_courses_course_id",
                schema: "academic_planning",
                table: "student_courses",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_courses_student_id",
                schema: "academic_planning",
                table: "student_courses",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_student_courses_student_id_course_id",
                schema: "academic_planning",
                table: "student_courses",
                columns: new[] { "student_id", "course_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "institutions",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "student_courses",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "courses",
                schema: "academic_planning");

            migrationBuilder.DropColumn(
                name: "institution_id",
                schema: "identity",
                table: "users");
        }
    }
}
