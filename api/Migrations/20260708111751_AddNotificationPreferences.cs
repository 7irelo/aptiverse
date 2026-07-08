using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationPreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "assessment_due_reminders",
                schema: "identity",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "bursary_deadline_reminders",
                schema: "identity",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "email_notifications",
                schema: "identity",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "push_notifications",
                schema: "identity",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "weekly_study_summary",
                schema: "identity",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "wellbeing_checkin_reminders",
                schema: "identity",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "assessment_due_reminders",
                schema: "identity",
                table: "users");

            migrationBuilder.DropColumn(
                name: "bursary_deadline_reminders",
                schema: "identity",
                table: "users");

            migrationBuilder.DropColumn(
                name: "email_notifications",
                schema: "identity",
                table: "users");

            migrationBuilder.DropColumn(
                name: "push_notifications",
                schema: "identity",
                table: "users");

            migrationBuilder.DropColumn(
                name: "weekly_study_summary",
                schema: "identity",
                table: "users");

            migrationBuilder.DropColumn(
                name: "wellbeing_checkin_reminders",
                schema: "identity",
                table: "users");
        }
    }
}
