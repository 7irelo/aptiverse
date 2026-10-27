using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aptiverse.Practice.Persistence.Migrations
{
    /// <inheritdoc />
    internal partial class AddGenerationQuotaReservation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "quota_reservation_id",
                schema: "practice",
                table: "generation_jobs",
                type: "uuid",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "quota_reservation_id",
                schema: "practice",
                table: "generation_jobs");
        }
    }
}
