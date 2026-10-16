using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class GoalBaselineAndQuotaGrants : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "goal_allowances",
                schema: "goals");

            migrationBuilder.AddColumn<string>(
                name: "achieved_difficulty",
                schema: "goals",
                table: "goals",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "assessment_id",
                schema: "goals",
                table: "goals",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "baseline_value",
                schema: "goals",
                table: "goals",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "quota_grants",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_id = table.Column<string>(type: "text", nullable: false),
                    quota_key = table.Column<string>(type: "text", nullable: false),
                    bonus = table.Column<int>(type: "integer", nullable: false),
                    reward_code = table.Column<string>(type: "text", nullable: false),
                    goal_id = table.Column<long>(type: "bigint", nullable: true),
                    points_spent = table.Column<int>(type: "integer", nullable: false),
                    granted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_quota_grants", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_quota_grants_expires_at",
                schema: "entitlements",
                table: "quota_grants",
                column: "expires_at");

            migrationBuilder.CreateIndex(
                name: "ix_quota_grants_student_id_quota_key_expires_at",
                schema: "entitlements",
                table: "quota_grants",
                columns: new[] { "student_id", "quota_key", "expires_at" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "quota_grants",
                schema: "entitlements");

            migrationBuilder.DropColumn(
                name: "achieved_difficulty",
                schema: "goals",
                table: "goals");

            migrationBuilder.DropColumn(
                name: "assessment_id",
                schema: "goals",
                table: "goals");

            migrationBuilder.DropColumn(
                name: "baseline_value",
                schema: "goals",
                table: "goals");

            migrationBuilder.CreateTable(
                name: "goal_allowances",
                schema: "goals",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    goal_id = table.Column<long>(type: "bigint", nullable: false),
                    amount_zar = table.Column<decimal>(type: "numeric", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    earned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    note = table.Column<string>(type: "text", nullable: true),
                    paid_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    sponsor_name = table.Column<string>(type: "text", nullable: false),
                    sponsor_user_id = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    student_id = table.Column<string>(type: "text", nullable: false),
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
    }
}
