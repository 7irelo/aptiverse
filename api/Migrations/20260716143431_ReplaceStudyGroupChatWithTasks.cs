using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceStudyGroupChatWithTasks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "study_group_messages",
                schema: "study_groups");

            migrationBuilder.AddColumn<bool>(
                name: "auto_sync_tasks",
                schema: "study_groups",
                table: "study_groups",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "notify_on_new_task",
                schema: "study_groups",
                table: "study_groups",
                type: "boolean",
                nullable: false,
                // Existing groups keep the notify-on-task default rather than
                // silently starting off.
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "tasks_who_can_add",
                schema: "study_groups",
                table: "study_groups",
                type: "text",
                nullable: false,
                // Existing groups let any member add a task, matching the entity
                // default; an empty string would read as no-one.
                defaultValue: "everyone");

            migrationBuilder.CreateTable(
                name: "study_group_tasks",
                schema: "study_groups",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    study_group_id = table.Column<long>(type: "bigint", nullable: false),
                    created_by_user_id = table.Column<string>(type: "text", nullable: false),
                    created_by_name = table.Column<string>(type: "text", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: false),
                    due_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    done = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_study_group_tasks", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_study_group_tasks_study_group_id_due_date",
                schema: "study_groups",
                table: "study_group_tasks",
                columns: new[] { "study_group_id", "due_date" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "study_group_tasks",
                schema: "study_groups");

            migrationBuilder.DropColumn(
                name: "auto_sync_tasks",
                schema: "study_groups",
                table: "study_groups");

            migrationBuilder.DropColumn(
                name: "notify_on_new_task",
                schema: "study_groups",
                table: "study_groups");

            migrationBuilder.DropColumn(
                name: "tasks_who_can_add",
                schema: "study_groups",
                table: "study_groups");

            migrationBuilder.CreateTable(
                name: "study_group_messages",
                schema: "study_groups",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    body = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    study_group_id = table.Column<long>(type: "bigint", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
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
    }
}
