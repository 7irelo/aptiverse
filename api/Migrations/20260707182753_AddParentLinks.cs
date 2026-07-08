using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddParentLinks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "parent_links",
                schema: "auth",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    parent_user_id = table.Column<string>(type: "text", nullable: false),
                    parent_name = table.Column<string>(type: "text", nullable: false),
                    student_user_id = table.Column<string>(type: "text", nullable: true),
                    student_email = table.Column<string>(type: "text", nullable: false),
                    token = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    responded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_parent_links", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_parent_links_parent_user_id",
                schema: "auth",
                table: "parent_links",
                column: "parent_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_parent_links_student_email",
                schema: "auth",
                table: "parent_links",
                column: "student_email");

            migrationBuilder.CreateIndex(
                name: "ix_parent_links_student_user_id",
                schema: "auth",
                table: "parent_links",
                column: "student_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_parent_links_token",
                schema: "auth",
                table: "parent_links",
                column: "token",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "parent_links",
                schema: "auth");
        }
    }
}
