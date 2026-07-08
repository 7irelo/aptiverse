using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddStudyGroupEmailReminderPref : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "study_group_email_reminders",
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
                name: "study_group_email_reminders",
                schema: "identity",
                table: "users");
        }
    }
}
