using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPracticeContentFormats : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "criteria",
                schema: "practice",
                table: "practice_tests",
                type: "jsonb",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "format",
                schema: "practice",
                table: "practice_tests",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "passage",
                schema: "practice",
                table: "practice_tests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "prompt",
                schema: "practice",
                table: "practice_tests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "expected_answer_text",
                schema: "practice",
                table: "practice_attempt_items",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "given_answer_text",
                schema: "practice",
                table: "practice_attempt_items",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "text_answer",
                schema: "practice",
                table: "answer_submissions",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "criteria",
                schema: "practice",
                table: "practice_tests");

            migrationBuilder.DropColumn(
                name: "format",
                schema: "practice",
                table: "practice_tests");

            migrationBuilder.DropColumn(
                name: "passage",
                schema: "practice",
                table: "practice_tests");

            migrationBuilder.DropColumn(
                name: "prompt",
                schema: "practice",
                table: "practice_tests");

            migrationBuilder.DropColumn(
                name: "expected_answer_text",
                schema: "practice",
                table: "practice_attempt_items");

            migrationBuilder.DropColumn(
                name: "given_answer_text",
                schema: "practice",
                table: "practice_attempt_items");

            migrationBuilder.DropColumn(
                name: "text_answer",
                schema: "practice",
                table: "answer_submissions");
        }
    }
}
