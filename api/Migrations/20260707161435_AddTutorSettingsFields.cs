using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTutorSettingsFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "accepting_students",
                schema: "marketplace",
                table: "tutors",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "available_days",
                schema: "marketplace",
                table: "tutors",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "earliest_hour",
                schema: "marketplace",
                table: "tutors",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "latest_hour",
                schema: "marketplace",
                table: "tutors",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "notify_on_connection",
                schema: "marketplace",
                table: "tutors",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "notify_on_review",
                schema: "marketplace",
                table: "tutors",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "subjects",
                schema: "marketplace",
                table: "tutors",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "weekly_summary",
                schema: "marketplace",
                table: "tutors",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "accepting_students",
                schema: "marketplace",
                table: "tutors");

            migrationBuilder.DropColumn(
                name: "available_days",
                schema: "marketplace",
                table: "tutors");

            migrationBuilder.DropColumn(
                name: "earliest_hour",
                schema: "marketplace",
                table: "tutors");

            migrationBuilder.DropColumn(
                name: "latest_hour",
                schema: "marketplace",
                table: "tutors");

            migrationBuilder.DropColumn(
                name: "notify_on_connection",
                schema: "marketplace",
                table: "tutors");

            migrationBuilder.DropColumn(
                name: "notify_on_review",
                schema: "marketplace",
                table: "tutors");

            migrationBuilder.DropColumn(
                name: "subjects",
                schema: "marketplace",
                table: "tutors");

            migrationBuilder.DropColumn(
                name: "weekly_summary",
                schema: "marketplace",
                table: "tutors");
        }
    }
}
