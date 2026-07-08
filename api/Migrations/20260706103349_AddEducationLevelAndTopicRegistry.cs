using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEducationLevelAndTopicRegistry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "education_level",
                schema: "identity",
                table: "users",
                type: "text",
                nullable: false,
                // Backfill existing users to highschool (the entity default);
                // EF emits "" from the column type, which we don't want.
                defaultValue: "highschool");

            migrationBuilder.AddColumn<string>(
                name: "owner_student_id",
                schema: "academic_planning",
                table: "subjects",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "topics",
                schema: "academic_planning",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    subject_id = table.Column<string>(type: "text", nullable: false),
                    slug = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_topics", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_subjects_owner_student_id",
                schema: "academic_planning",
                table: "subjects",
                column: "owner_student_id");

            migrationBuilder.CreateIndex(
                name: "ix_topics_subject_id",
                schema: "academic_planning",
                table: "topics",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "ix_topics_subject_id_slug",
                schema: "academic_planning",
                table: "topics",
                columns: new[] { "subject_id", "slug" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "topics",
                schema: "academic_planning");

            migrationBuilder.DropIndex(
                name: "ix_subjects_owner_student_id",
                schema: "academic_planning",
                table: "subjects");

            migrationBuilder.DropColumn(
                name: "education_level",
                schema: "identity",
                table: "users");

            migrationBuilder.DropColumn(
                name: "owner_student_id",
                schema: "academic_planning",
                table: "subjects");
        }
    }
}
