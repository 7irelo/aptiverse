using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAssessmentDueReminderState : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "due_reminder_sent",
                schema: "academic_planning",
                table: "assessments",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "due_reminder_sent_at",
                schema: "academic_planning",
                table: "assessments",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "due_reminder_sent",
                schema: "academic_planning",
                table: "assessments");

            migrationBuilder.DropColumn(
                name: "due_reminder_sent_at",
                schema: "academic_planning",
                table: "assessments");
        }
    }
}
