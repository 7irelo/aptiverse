using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddGoalStudentId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Wipe pre-existing demo rows — they were inserted by the
            // old global GoalSeeder and have no StudentId, so they don't
            // belong to any real user. Delete milestones first to avoid
            // FK constraint failures regardless of cascade behaviour.
            migrationBuilder.Sql("DELETE FROM goals.goal_milestones;");
            migrationBuilder.Sql("DELETE FROM goals.goals;");

            migrationBuilder.AddColumn<string>(
                name: "student_id",
                schema: "goals",
                table: "goals",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_goals_student_id",
                schema: "goals",
                table: "goals",
                column: "student_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_goals_student_id",
                schema: "goals",
                table: "goals");

            migrationBuilder.DropColumn(
                name: "student_id",
                schema: "goals",
                table: "goals");
        }
    }
}
