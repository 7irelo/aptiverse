using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aptiverse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptionPlanChangeFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "paystack_authorization_code",
                schema: "entitlements",
                table: "subscriptions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "pending_billing",
                schema: "entitlements",
                table: "subscriptions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "pending_plan_code",
                schema: "entitlements",
                table: "subscriptions",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "paystack_authorization_code",
                schema: "entitlements",
                table: "subscriptions");

            migrationBuilder.DropColumn(
                name: "pending_billing",
                schema: "entitlements",
                table: "subscriptions");

            migrationBuilder.DropColumn(
                name: "pending_plan_code",
                schema: "entitlements",
                table: "subscriptions");
        }
    }
}
