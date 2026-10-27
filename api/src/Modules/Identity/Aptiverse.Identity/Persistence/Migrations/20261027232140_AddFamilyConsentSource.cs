using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aptiverse.Identity.Persistence.Migrations
{
    /// <inheritdoc />
    internal partial class AddFamilyConsentSource : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_user_consents_source",
                schema: "identity",
                table: "user_consents");

            migrationBuilder.AddCheckConstraint(
                name: "ck_user_consents_source",
                schema: "identity",
                table: "user_consents",
                sql: "source IN ('register', 'google', 'reconsent', 'migration', 'onboarding', 'profile', 'family')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_user_consents_source",
                schema: "identity",
                table: "user_consents");

            migrationBuilder.AddCheckConstraint(
                name: "ck_user_consents_source",
                schema: "identity",
                table: "user_consents",
                sql: "source IN ('register', 'google', 'reconsent', 'migration', 'onboarding', 'profile')");
        }
    }
}
