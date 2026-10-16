using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddStudyGroupChatAndCapacity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "member_capacity",
                schema: "study_groups",
                table: "study_groups",
                type: "integer",
                nullable: false,
                // Backfill existing groups with the standard ceiling rather than
                // 0, which would report every one of them as already full.
                defaultValue: 12);

            migrationBuilder.CreateTable(
                name: "study_group_messages",
                schema: "study_groups",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    study_group_id = table.Column<long>(type: "bigint", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    body = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_study_group_messages", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_study_group_messages_study_group_id_created_at",
                schema: "study_groups",
                table: "study_group_messages",
                columns: new[] { "study_group_id", "created_at" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "study_group_messages",
                schema: "study_groups");

            migrationBuilder.DropColumn(
                name: "member_capacity",
                schema: "study_groups",
                table: "study_groups");
        }
    }
}
