using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddStudyGroups : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "study_groups");

            migrationBuilder.CreateTable(
                name: "study_group_members",
                schema: "study_groups",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    study_group_id = table.Column<long>(type: "bigint", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    role = table.Column<string>(type: "text", nullable: false),
                    joined_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_study_group_members", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "study_groups",
                schema: "study_groups",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    owner_id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    subject_id = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    privacy = table.Column<string>(type: "text", nullable: false),
                    next_session = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_study_groups", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_study_group_members_study_group_id",
                schema: "study_groups",
                table: "study_group_members",
                column: "study_group_id");

            migrationBuilder.CreateIndex(
                name: "ix_study_group_members_study_group_id_user_id",
                schema: "study_groups",
                table: "study_group_members",
                columns: new[] { "study_group_id", "user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_study_group_members_user_id",
                schema: "study_groups",
                table: "study_group_members",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_study_groups_owner_id",
                schema: "study_groups",
                table: "study_groups",
                column: "owner_id");

            migrationBuilder.CreateIndex(
                name: "ix_study_groups_subject_id",
                schema: "study_groups",
                table: "study_groups",
                column: "subject_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "study_group_members",
                schema: "study_groups");

            migrationBuilder.DropTable(
                name: "study_groups",
                schema: "study_groups");
        }
    }
}
