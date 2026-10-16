using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddExamMarksToAttempts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "feedback",
                schema: "practice",
                table: "practice_attempt_items",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "marks_available",
                schema: "practice",
                table: "practice_attempt_items",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "marks_awarded",
                schema: "practice",
                table: "practice_attempt_items",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "marks_awarded",
                schema: "practice",
                table: "attempt_score_summaries",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "marks_total",
                schema: "practice",
                table: "attempt_score_summaries",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "feedback",
                schema: "practice",
                table: "practice_attempt_items");

            migrationBuilder.DropColumn(
                name: "marks_available",
                schema: "practice",
                table: "practice_attempt_items");

            migrationBuilder.DropColumn(
                name: "marks_awarded",
                schema: "practice",
                table: "practice_attempt_items");

            migrationBuilder.DropColumn(
                name: "marks_awarded",
                schema: "practice",
                table: "attempt_score_summaries");

            migrationBuilder.DropColumn(
                name: "marks_total",
                schema: "practice",
                table: "attempt_score_summaries");
        }
    }
}
