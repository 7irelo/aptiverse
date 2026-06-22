using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddQuotaUsageAndCommission : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "commission_percent",
                schema: "entitlements",
                table: "plans",
                type: "numeric",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "feature_usages",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    quota_key = table.Column<string>(type: "text", nullable: false),
                    period_start = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    used = table.Column<int>(type: "integer", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_feature_usages", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "plan_quotas",
                schema: "entitlements",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    plan_code = table.Column<string>(type: "text", nullable: false),
                    quota_key = table.Column<string>(type: "text", nullable: false),
                    per_month = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_plan_quotas", x => x.id);
                    table.ForeignKey(
                        name: "fk_plan_quotas_plans_plan_code",
                        column: x => x.plan_code,
                        principalSchema: "entitlements",
                        principalTable: "plans",
                        principalColumn: "code",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_plan_quotas_plan_code",
                schema: "entitlements",
                table: "plan_quotas",
                column: "plan_code");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "feature_usages",
                schema: "entitlements");

            migrationBuilder.DropTable(
                name: "plan_quotas",
                schema: "entitlements");

            migrationBuilder.DropColumn(
                name: "commission_percent",
                schema: "entitlements",
                table: "plans");
        }
    }
}
