using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AnalyticsUniqueKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_topic_masteries_student_subject_id_topic_id",
                schema: "mastery",
                table: "topic_masteries");

            migrationBuilder.DropIndex(
                name: "ix_student_subject_analytics_student_subject_id_topic_id",
                schema: "mastery",
                table: "student_subject_analytics");

            migrationBuilder.DropIndex(
                name: "ix_growth_trackings_student_id_tracking_date",
                schema: "goals",
                table: "growth_trackings");

            migrationBuilder.CreateIndex(
                name: "ix_topic_masteries_student_subject_id_topic_id",
                schema: "mastery",
                table: "topic_masteries",
                columns: new[] { "student_subject_id", "topic_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_student_subject_analytics_student_subject_id_topic_id",
                schema: "mastery",
                table: "student_subject_analytics",
                columns: new[] { "student_subject_id", "topic_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_knowledge_gaps_student_subject_id_topic_id",
                schema: "mastery",
                table: "knowledge_gaps",
                columns: new[] { "student_subject_id", "topic_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_improvement_tips_student_subject_id_student_subject_topic_id",
                schema: "insights",
                table: "improvement_tips",
                columns: new[] { "student_subject_id", "student_subject_topic_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_growth_trackings_student_id_tracking_date",
                schema: "goals",
                table: "growth_trackings",
                columns: new[] { "student_id", "tracking_date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_grade_distributions_student_subject_id_grade",
                schema: "insights",
                table: "grade_distributions",
                columns: new[] { "student_subject_id", "grade" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_topic_masteries_student_subject_id_topic_id",
                schema: "mastery",
                table: "topic_masteries");

            migrationBuilder.DropIndex(
                name: "ix_student_subject_analytics_student_subject_id_topic_id",
                schema: "mastery",
                table: "student_subject_analytics");

            migrationBuilder.DropIndex(
                name: "ix_knowledge_gaps_student_subject_id_topic_id",
                schema: "mastery",
                table: "knowledge_gaps");

            migrationBuilder.DropIndex(
                name: "ix_improvement_tips_student_subject_id_student_subject_topic_id",
                schema: "insights",
                table: "improvement_tips");

            migrationBuilder.DropIndex(
                name: "ix_growth_trackings_student_id_tracking_date",
                schema: "goals",
                table: "growth_trackings");

            migrationBuilder.DropIndex(
                name: "ix_grade_distributions_student_subject_id_grade",
                schema: "insights",
                table: "grade_distributions");

            migrationBuilder.CreateIndex(
                name: "ix_topic_masteries_student_subject_id_topic_id",
                schema: "mastery",
                table: "topic_masteries",
                columns: new[] { "student_subject_id", "topic_id" });

            migrationBuilder.CreateIndex(
                name: "ix_student_subject_analytics_student_subject_id_topic_id",
                schema: "mastery",
                table: "student_subject_analytics",
                columns: new[] { "student_subject_id", "topic_id" });

            migrationBuilder.CreateIndex(
                name: "ix_growth_trackings_student_id_tracking_date",
                schema: "goals",
                table: "growth_trackings",
                columns: new[] { "student_id", "tracking_date" });
        }
    }
}
