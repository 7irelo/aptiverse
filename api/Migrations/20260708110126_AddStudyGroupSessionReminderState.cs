using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddStudyGroupSessionReminderState : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "reminders_sent",
                schema: "study_groups",
                table: "study_group_sessions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "reminders_sent_at",
                schema: "study_groups",
                table: "study_group_sessions",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "reminders_sent",
                schema: "study_groups",
                table: "study_group_sessions");

            migrationBuilder.DropColumn(
                name: "reminders_sent_at",
                schema: "study_groups",
                table: "study_group_sessions");
        }
    }
}
