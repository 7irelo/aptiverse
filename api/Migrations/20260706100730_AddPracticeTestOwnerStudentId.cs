using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPracticeTestOwnerStudentId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "owner_student_id",
                schema: "practice",
                table: "practice_tests",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_practice_tests_owner_student_id",
                schema: "practice",
                table: "practice_tests",
                column: "owner_student_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_practice_tests_owner_student_id",
                schema: "practice",
                table: "practice_tests");

            migrationBuilder.DropColumn(
                name: "owner_student_id",
                schema: "practice",
                table: "practice_tests");
        }
    }
}
