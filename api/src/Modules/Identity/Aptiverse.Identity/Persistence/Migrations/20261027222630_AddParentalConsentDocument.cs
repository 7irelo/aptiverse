using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aptiverse.Identity.Persistence.Migrations
{
    /// <inheritdoc />
    internal partial class AddParentalConsentDocument : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_user_consents_document_key",
                schema: "identity",
                table: "user_consents");

            migrationBuilder.AddCheckConstraint(
                name: "ck_user_consents_document_key",
                schema: "identity",
                table: "user_consents",
                sql: "document_key IN ('terms', 'privacy', 'marketing_email', 'adult_confirmation', 'parental_consent')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_user_consents_document_key",
                schema: "identity",
                table: "user_consents");

            migrationBuilder.AddCheckConstraint(
                name: "ck_user_consents_document_key",
                schema: "identity",
                table: "user_consents",
                sql: "document_key IN ('terms', 'privacy', 'marketing_email', 'adult_confirmation')");
        }
    }
}
