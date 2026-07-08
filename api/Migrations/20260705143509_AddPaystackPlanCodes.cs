using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPaystackPlanCodes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "paystack_plan_code_annual",
                schema: "entitlements",
                table: "plans",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "paystack_plan_code_monthly",
                schema: "entitlements",
                table: "plans",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "paystack_plan_code_annual",
                schema: "entitlements",
                table: "plans");

            migrationBuilder.DropColumn(
                name: "paystack_plan_code_monthly",
                schema: "entitlements",
                table: "plans");
        }
    }
}
