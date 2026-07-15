using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddVerifiableGoalsAndAllowances : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "achieved_at",
                schema: "goals",
                table: "goals",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "current_value",
                schema: "goals",
                table: "goals",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // "custom", not "" — every goal that already exists was written
            // before there was anything to verify it against, so it is a
            // self-reported goal by definition. An empty kind would match no
            // branch in GoalEvaluator and the row would silently never evaluate.
            migrationBuilder.AddColumn<string>(
                name: "kind",
                schema: "goals",
                table: "goals",
                type: "text",
                nullable: false,
                defaultValue: "custom");

            migrationBuilder.AddColumn<int>(
                name: "reward_points",
                schema: "goals",
                table: "goals",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "target_value",
                schema: "goals",
                table: "goals",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "topic_filter",
                schema: "goals",
                table: "goals",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "goal_allowances",
                schema: "goals",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    goal_id = table.Column<long>(type: "bigint", nullable: false),
                    student_id = table.Column<string>(type: "text", nullable: false),
                    sponsor_user_id = table.Column<string>(type: "text", nullable: false),
                    sponsor_name = table.Column<string>(type: "text", nullable: false),
                    amount_zar = table.Column<decimal>(type: "numeric", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    earned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    paid_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    note = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_goal_allowances", x => x.id);
                    table.ForeignKey(
                        name: "fk_goal_allowances_goals_goal_id",
                        column: x => x.goal_id,
                        principalSchema: "goals",
                        principalTable: "goals",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_goals_kind",
                schema: "goals",
                table: "goals",
                column: "kind");

            migrationBuilder.CreateIndex(
                name: "ix_goal_allowances_goal_id",
                schema: "goals",
                table: "goal_allowances",
                column: "goal_id");

            migrationBuilder.CreateIndex(
                name: "ix_goal_allowances_sponsor_user_id",
                schema: "goals",
                table: "goal_allowances",
                column: "sponsor_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_goal_allowances_status",
                schema: "goals",
                table: "goal_allowances",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_goal_allowances_student_id",
                schema: "goals",
                table: "goal_allowances",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_goal_allowances_student_id_status",
                schema: "goals",
                table: "goal_allowances",
                columns: new[] { "student_id", "status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "goal_allowances",
                schema: "goals");

            migrationBuilder.DropIndex(
                name: "ix_goals_kind",
                schema: "goals",
                table: "goals");

            migrationBuilder.DropColumn(
                name: "achieved_at",
                schema: "goals",
                table: "goals");

            migrationBuilder.DropColumn(
                name: "current_value",
                schema: "goals",
                table: "goals");

            migrationBuilder.DropColumn(
                name: "kind",
                schema: "goals",
                table: "goals");

            migrationBuilder.DropColumn(
                name: "reward_points",
                schema: "goals",
                table: "goals");

            migrationBuilder.DropColumn(
                name: "target_value",
                schema: "goals",
                table: "goals");

            migrationBuilder.DropColumn(
                name: "topic_filter",
                schema: "goals",
                table: "goals");
        }
    }
}
