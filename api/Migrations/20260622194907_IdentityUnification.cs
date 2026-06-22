using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class IdentityUnification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_course_enrollments_user_user_id1",
                schema: "marketplace",
                table: "course_enrollments");

            migrationBuilder.DropForeignKey(
                name: "fk_growth_trackings_student_student_id",
                schema: "goals",
                table: "growth_trackings");

            migrationBuilder.DropForeignKey(
                name: "fk_resource_downloads_user_user_id1",
                schema: "marketplace",
                table: "resource_downloads");

            migrationBuilder.DropForeignKey(
                name: "fk_resources_user_user_id1",
                schema: "marketplace",
                table: "resources");

            migrationBuilder.DropForeignKey(
                name: "fk_student_points_student_student_id",
                schema: "goals",
                table: "student_points");

            migrationBuilder.DropForeignKey(
                name: "fk_student_rewards_student_student_id",
                schema: "goals",
                table: "student_rewards");

            migrationBuilder.DropForeignKey(
                name: "fk_tutor_students_students_student_id",
                schema: "booking",
                table: "tutor_students");

            migrationBuilder.DropIndex(
                name: "ix_resources_user_id1",
                schema: "marketplace",
                table: "resources");

            migrationBuilder.DropIndex(
                name: "ix_resource_downloads_user_id1",
                schema: "marketplace",
                table: "resource_downloads");

            migrationBuilder.DropIndex(
                name: "ix_course_enrollments_user_id1",
                schema: "marketplace",
                table: "course_enrollments");

            migrationBuilder.DropColumn(
                name: "user_id1",
                schema: "marketplace",
                table: "resources");

            migrationBuilder.DropColumn(
                name: "user_id1",
                schema: "marketplace",
                table: "resource_downloads");

            migrationBuilder.DropColumn(
                name: "user_id1",
                schema: "marketplace",
                table: "course_enrollments");

            // NOTE: Postgres cannot implicitly cast bigint -> text; an explicit USING clause is
            // required or the ALTER fails with "cannot be cast automatically to type text".
            // Npgsql's AlterColumn does not emit USING for this conversion, so each bigint->text
            // person-ref column is altered via raw SQL with an explicit ::text cast. All affected
            // tables are empty (0 rows), so this is data-loss-safe.
            migrationBuilder.Sql("ALTER TABLE booking.tutor_students ALTER COLUMN student_id TYPE text USING student_id::text;");
            migrationBuilder.Sql("ALTER TABLE support.support_tickets ALTER COLUMN student_id TYPE text USING student_id::text;");
            migrationBuilder.Sql("ALTER TABLE goals.student_rewards ALTER COLUMN student_id TYPE text USING student_id::text;");
            migrationBuilder.Sql("ALTER TABLE goals.student_points ALTER COLUMN student_id TYPE text USING student_id::text;");
            migrationBuilder.Sql("ALTER TABLE marketplace.resources ALTER COLUMN user_id TYPE text USING user_id::text;");
            migrationBuilder.Sql("ALTER TABLE marketplace.resource_downloads ALTER COLUMN user_id TYPE text USING user_id::text;");
            migrationBuilder.Sql("ALTER TABLE wellbeing.mood_trackings ALTER COLUMN student_id TYPE text USING student_id::text;");
            migrationBuilder.Sql("ALTER TABLE goals.growth_trackings ALTER COLUMN student_id TYPE text USING student_id::text;");
            migrationBuilder.Sql("ALTER TABLE wellbeing.diary_goals ALTER COLUMN student_id TYPE text USING student_id::text;");
            migrationBuilder.Sql("ALTER TABLE wellbeing.diary_entries ALTER COLUMN student_id TYPE text USING student_id::text;");
            migrationBuilder.Sql("ALTER TABLE marketplace.course_enrollments ALTER COLUMN user_id TYPE text USING user_id::text;");
            migrationBuilder.Sql("ALTER TABLE calendar.calendar_syncs ALTER COLUMN student_id TYPE text USING student_id::text;");
            migrationBuilder.Sql("ALTER TABLE calendar.calendar_events ALTER COLUMN student_id TYPE text USING student_id::text;");

            migrationBuilder.AddForeignKey(
                name: "fk_course_enrollments_user_user_id",
                schema: "marketplace",
                table: "course_enrollments",
                column: "user_id",
                principalSchema: "marketplace",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_resource_downloads_user_user_id",
                schema: "marketplace",
                table: "resource_downloads",
                column: "user_id",
                principalSchema: "marketplace",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_resources_user_user_id",
                schema: "marketplace",
                table: "resources",
                column: "user_id",
                principalSchema: "marketplace",
                principalTable: "users",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_course_enrollments_user_user_id",
                schema: "marketplace",
                table: "course_enrollments");

            migrationBuilder.DropForeignKey(
                name: "fk_resource_downloads_user_user_id",
                schema: "marketplace",
                table: "resource_downloads");

            migrationBuilder.DropForeignKey(
                name: "fk_resources_user_user_id",
                schema: "marketplace",
                table: "resources");

            // Reverse: text -> bigint also needs an explicit USING cast in Postgres.
            migrationBuilder.Sql("ALTER TABLE booking.tutor_students ALTER COLUMN student_id TYPE bigint USING student_id::bigint;");
            migrationBuilder.Sql("ALTER TABLE support.support_tickets ALTER COLUMN student_id TYPE bigint USING student_id::bigint;");
            migrationBuilder.Sql("ALTER TABLE goals.student_rewards ALTER COLUMN student_id TYPE bigint USING student_id::bigint;");
            migrationBuilder.Sql("ALTER TABLE goals.student_points ALTER COLUMN student_id TYPE bigint USING student_id::bigint;");
            migrationBuilder.Sql("ALTER TABLE marketplace.resources ALTER COLUMN user_id TYPE bigint USING user_id::bigint;");

            migrationBuilder.AddColumn<string>(
                name: "user_id1",
                schema: "marketplace",
                table: "resources",
                type: "text",
                nullable: true);

            migrationBuilder.Sql("ALTER TABLE marketplace.resource_downloads ALTER COLUMN user_id TYPE bigint USING user_id::bigint;");

            migrationBuilder.AddColumn<string>(
                name: "user_id1",
                schema: "marketplace",
                table: "resource_downloads",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql("ALTER TABLE wellbeing.mood_trackings ALTER COLUMN student_id TYPE bigint USING student_id::bigint;");
            migrationBuilder.Sql("ALTER TABLE goals.growth_trackings ALTER COLUMN student_id TYPE bigint USING student_id::bigint;");
            migrationBuilder.Sql("ALTER TABLE wellbeing.diary_goals ALTER COLUMN student_id TYPE bigint USING student_id::bigint;");
            migrationBuilder.Sql("ALTER TABLE wellbeing.diary_entries ALTER COLUMN student_id TYPE bigint USING student_id::bigint;");
            migrationBuilder.Sql("ALTER TABLE marketplace.course_enrollments ALTER COLUMN user_id TYPE bigint USING user_id::bigint;");

            migrationBuilder.AddColumn<string>(
                name: "user_id1",
                schema: "marketplace",
                table: "course_enrollments",
                type: "text",
                nullable: true);

            migrationBuilder.Sql("ALTER TABLE calendar.calendar_syncs ALTER COLUMN student_id TYPE bigint USING student_id::bigint;");
            migrationBuilder.Sql("ALTER TABLE calendar.calendar_events ALTER COLUMN student_id TYPE bigint USING student_id::bigint;");

            migrationBuilder.CreateIndex(
                name: "ix_resources_user_id1",
                schema: "marketplace",
                table: "resources",
                column: "user_id1");

            migrationBuilder.CreateIndex(
                name: "ix_resource_downloads_user_id1",
                schema: "marketplace",
                table: "resource_downloads",
                column: "user_id1");

            migrationBuilder.CreateIndex(
                name: "ix_course_enrollments_user_id1",
                schema: "marketplace",
                table: "course_enrollments",
                column: "user_id1");

            migrationBuilder.AddForeignKey(
                name: "fk_course_enrollments_user_user_id1",
                schema: "marketplace",
                table: "course_enrollments",
                column: "user_id1",
                principalSchema: "marketplace",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_growth_trackings_student_student_id",
                schema: "goals",
                table: "growth_trackings",
                column: "student_id",
                principalSchema: "goals",
                principalTable: "students",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_resource_downloads_user_user_id1",
                schema: "marketplace",
                table: "resource_downloads",
                column: "user_id1",
                principalSchema: "marketplace",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_resources_user_user_id1",
                schema: "marketplace",
                table: "resources",
                column: "user_id1",
                principalSchema: "marketplace",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_student_points_student_student_id",
                schema: "goals",
                table: "student_points",
                column: "student_id",
                principalSchema: "goals",
                principalTable: "students",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_student_rewards_student_student_id",
                schema: "goals",
                table: "student_rewards",
                column: "student_id",
                principalSchema: "goals",
                principalTable: "students",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_tutor_students_students_student_id",
                schema: "booking",
                table: "tutor_students",
                column: "student_id",
                principalSchema: "booking",
                principalTable: "students",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
