using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aptiverse.Mcp.Persistence.Migrations
{
    /// <inheritdoc />
    internal partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "mcp");

            migrationBuilder.CreateTable(
                name: "tool_calls",
                schema: "mcp",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tool = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    scope = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    outcome = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    latency_ms = table.Column<int>(type: "integer", nullable: false),
                    client = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    token_id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    request_id = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    resource_id = table.Column<Guid>(type: "uuid", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tool_calls", x => x.id);
                    table.CheckConstraint("ck_tool_calls_latency_ms", "latency_ms >= 0");
                });

            migrationBuilder.CreateIndex(
                name: "ix_tool_calls_user_id_created_at",
                schema: "mcp",
                table: "tool_calls",
                columns: new[] { "user_id", "created_at" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tool_calls",
                schema: "mcp");
        }
    }
}
