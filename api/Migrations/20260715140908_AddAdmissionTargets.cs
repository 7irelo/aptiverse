using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAdmissionTargets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "admission_targets",
                schema: "academic_planning",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<string>(type: "text", nullable: false),
                    institution = table.Column<string>(type: "text", nullable: false),
                    programme = table.Column<string>(type: "text", nullable: false),
                    kind = table.Column<string>(type: "text", nullable: false),
                    stage = table.Column<string>(type: "text", nullable: true),
                    overall_unit = table.Column<string>(type: "text", nullable: true),
                    overall_required = table.Column<int>(type: "integer", nullable: true),
                    deadline = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    source_note = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_admission_targets", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "admission_requirements",
                schema: "academic_planning",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    admission_target_id = table.Column<long>(type: "bigint", nullable: false),
                    unit_id = table.Column<string>(type: "text", nullable: false),
                    minimum_percent = table.Column<int>(type: "integer", nullable: false),
                    goal_id = table.Column<long>(type: "bigint", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_admission_requirements", x => x.id);
                    table.ForeignKey(
                        name: "fk_admission_requirements_admission_targets_admission_target_id",
                        column: x => x.admission_target_id,
                        principalSchema: "academic_planning",
                        principalTable: "admission_targets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_admission_requirements_admission_target_id",
                schema: "academic_planning",
                table: "admission_requirements",
                column: "admission_target_id");

            migrationBuilder.CreateIndex(
                name: "ix_admission_requirements_admission_target_id_unit_id",
                schema: "academic_planning",
                table: "admission_requirements",
                columns: new[] { "admission_target_id", "unit_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_admission_targets_student_id",
                schema: "academic_planning",
                table: "admission_targets",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_admission_targets_student_id_status",
                schema: "academic_planning",
                table: "admission_targets",
                columns: new[] { "student_id", "status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "admission_requirements",
                schema: "academic_planning");

            migrationBuilder.DropTable(
                name: "admission_targets",
                schema: "academic_planning");
        }
    }
}
