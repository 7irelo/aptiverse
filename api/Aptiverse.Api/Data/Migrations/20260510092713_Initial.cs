using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Aptiverse.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "Identity");

            migrationBuilder.CreateTable(
                name: "AcademicPlanning_Student",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AcademicPlanning_Student", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AcademicPlanning_StudentSubjectAnalytics",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AcademicPlanning_StudentSubjectAnalytics", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AcademicPlanning_Subject",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: false),
                    TextColor = table.Column<string>(type: "text", nullable: false),
                    BorderColor = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AcademicPlanning_Subject", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Audit_AuditAction",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    Severity = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Audit_AuditAction", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Booking_Student",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Booking_Student", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Booking_Tutor",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Booking_Tutor", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Calendar_CalendarEvent",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    EventType = table.Column<string>(type: "text", nullable: false),
                    StartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsAllDay = table.Column<bool>(type: "boolean", nullable: false),
                    Location = table.Column<string>(type: "text", nullable: false),
                    RecurrenceRule = table.Column<string>(type: "text", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    RelatedEntityId = table.Column<long>(type: "bigint", nullable: true),
                    RelatedEntityType = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Calendar_CalendarEvent", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Calendar_CalendarSync",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    Provider = table.Column<string>(type: "text", nullable: false),
                    ExternalCalendarId = table.Column<string>(type: "text", nullable: false),
                    SyncToken = table.Column<string>(type: "text", nullable: false),
                    LastSyncedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SyncStatus = table.Column<string>(type: "text", nullable: false),
                    SyncDirection = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Calendar_CalendarSync", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Calendar_Student",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Calendar_Student", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_Admin",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    SchoolName = table.Column<string>(type: "text", nullable: false),
                    SchoolCode = table.Column<string>(type: "text", nullable: false),
                    ContactNumber = table.Column<string>(type: "text", nullable: false),
                    Address = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_Admin", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_Feature",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    BasePrice = table.Column<decimal>(type: "numeric", nullable: false),
                    PriceCurrency = table.Column<string>(type: "text", nullable: false),
                    BillingCycle = table.Column<string>(type: "text", nullable: false),
                    ComplexityWeight = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_Feature", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_Parent",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    ContactNumber = table.Column<string>(type: "text", nullable: false),
                    Address = table.Column<string>(type: "text", nullable: false),
                    Occupation = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_Parent", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_Reward",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    RewardType = table.Column<string>(type: "text", nullable: false),
                    PointsCost = table.Column<int>(type: "integer", nullable: false),
                    DifficultyTier = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    StockQuantity = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_Reward", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_Subject",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: false),
                    TextColor = table.Column<string>(type: "text", nullable: false),
                    BorderColor = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_Subject", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_Tutor",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    Qualification = table.Column<string>(type: "text", nullable: false),
                    Specialization = table.Column<string>(type: "text", nullable: false),
                    Bio = table.Column<string>(type: "text", nullable: false),
                    HourlyRate = table.Column<decimal>(type: "numeric", nullable: false),
                    YearsOfExperience = table.Column<int>(type: "integer", nullable: false),
                    TeachingStyle = table.Column<string>(type: "text", nullable: false),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false),
                    Rating = table.Column<double>(type: "double precision", nullable: false),
                    TotalReviews = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_Tutor", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FeatureFlags_FeatureFlag",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Key = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    Environment = table.Column<string>(type: "text", nullable: false),
                    RolloutPercentage = table.Column<int>(type: "integer", nullable: false),
                    TargetAudience = table.Column<string>(type: "text", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeatureFlags_FeatureFlag", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Goals_Reward",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    RewardType = table.Column<string>(type: "text", nullable: false),
                    PointsCost = table.Column<int>(type: "integer", nullable: false),
                    DifficultyTier = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    StockQuantity = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Goals_Reward", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Goals_Student",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Goals_Student", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Goals_Subject",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Goals_Subject", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Insights_StudentSubject",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Insights_StudentSubject", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Insights_StudentSubjectTopic",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Insights_StudentSubjectTopic", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Marketplace_Subject",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Marketplace_Subject", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Marketplace_Tutor",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    Qualification = table.Column<string>(type: "text", nullable: false),
                    Specialization = table.Column<string>(type: "text", nullable: false),
                    Bio = table.Column<string>(type: "text", nullable: false),
                    HourlyRate = table.Column<decimal>(type: "numeric", nullable: false),
                    YearsOfExperience = table.Column<int>(type: "integer", nullable: false),
                    TeachingStyle = table.Column<string>(type: "text", nullable: false),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false),
                    Rating = table.Column<double>(type: "double precision", nullable: false),
                    TotalReviews = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Marketplace_Tutor", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Marketplace_User",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Marketplace_User", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Mastery_StudentSubject",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Mastery_StudentSubject", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Mastery_StudentSubjectTopic",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Mastery_StudentSubjectTopic", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Moderation_ContentFilter",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FilterType = table.Column<string>(type: "text", nullable: false),
                    Pattern = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    Replacement = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Severity = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Moderation_ContentFilter", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Moderation_ContentReport",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ReporterUserId = table.Column<string>(type: "text", nullable: false),
                    ReportedUserId = table.Column<string>(type: "text", nullable: false),
                    ContentType = table.Column<string>(type: "text", nullable: false),
                    ContentId = table.Column<string>(type: "text", nullable: false),
                    ContentSnapshot = table.Column<string>(type: "text", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Severity = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Moderation_ContentReport", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Practice_AnswerSubmission",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Practice_AnswerSubmission", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Practice_AttemptScoreSummary",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Practice_AttemptScoreSummary", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Practice_GeneratedTest",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Practice_GeneratedTest", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Practice_PracticeAttempt",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Practice_PracticeAttempt", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Practice_PracticeAttemptItem",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Practice_PracticeAttemptItem", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Practice_PracticeTest",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Practice_PracticeTest", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Practice_Student",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Practice_Student", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Practice_Subject",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Practice_Subject", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Practice_Topic",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Practice_Topic", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                schema: "Identity",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Support_Student",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Support_Student", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Support_SupportCategory",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    ParentCategoryId = table.Column<long>(type: "bigint", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Support_SupportCategory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Support_SupportCategory_Support_SupportCategory_ParentCateg~",
                        column: x => x.ParentCategoryId,
                        principalTable: "Support_SupportCategory",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Users",
                schema: "Identity",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    FirstName = table.Column<string>(type: "text", nullable: false),
                    LastName = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UserName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: true),
                    SecurityStamp = table.Column<string>(type: "text", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Wellbeing_DiaryEntry",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    Mood = table.Column<string>(type: "text", nullable: false),
                    MoodIntensity = table.Column<int>(type: "integer", nullable: false),
                    EntryType = table.Column<string>(type: "text", nullable: false),
                    Tags = table.Column<string>(type: "text", nullable: false),
                    IsPrivate = table.Column<bool>(type: "boolean", nullable: false),
                    EntryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SentimentAnalysis = table.Column<string>(type: "text", nullable: false),
                    SentimentScore = table.Column<double>(type: "double precision", nullable: false),
                    KeyThemes = table.Column<string>(type: "text", nullable: false),
                    AiInsights = table.Column<string>(type: "text", nullable: false),
                    NeedsFollowUp = table.Column<bool>(type: "boolean", nullable: false),
                    FollowUpAction = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Wellbeing_DiaryEntry", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Wellbeing_DiaryGoal",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    TargetDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Wellbeing_DiaryGoal", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Wellbeing_MoodTracking",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    Mood = table.Column<string>(type: "text", nullable: false),
                    MoodScore = table.Column<int>(type: "integer", nullable: false),
                    EnergyLevel = table.Column<string>(type: "text", nullable: false),
                    StressLevel = table.Column<string>(type: "text", nullable: false),
                    SleepQuality = table.Column<string>(type: "text", nullable: false),
                    Triggers = table.Column<string>(type: "text", nullable: false),
                    CopingStrategies = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: false),
                    TrackedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Wellbeing_MoodTracking", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Wellbeing_Student",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Wellbeing_Student", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AcademicPlanning_Assessment",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    SubjectId = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Score = table.Column<double>(type: "double precision", nullable: false),
                    MaxScore = table.Column<double>(type: "double precision", nullable: false),
                    DateTaken = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Grade = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AcademicPlanning_Assessment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AcademicPlanning_Assessment_AcademicPlanning_Student_Studen~",
                        column: x => x.StudentId,
                        principalTable: "AcademicPlanning_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AcademicPlanning_Assessment_AcademicPlanning_Subject_Subjec~",
                        column: x => x.SubjectId,
                        principalTable: "AcademicPlanning_Subject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AcademicPlanning_StudentSubject",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    SubjectId = table.Column<string>(type: "text", nullable: false),
                    Progress = table.Column<int>(type: "integer", nullable: true),
                    Target = table.Column<int>(type: "integer", nullable: true),
                    AverageScore = table.Column<double>(type: "double precision", nullable: true),
                    StudyHours = table.Column<int>(type: "integer", nullable: true),
                    AssignmentsCompleted = table.Column<int>(type: "integer", nullable: true),
                    UpcomingDeadlines = table.Column<int>(type: "integer", nullable: true),
                    Strength = table.Column<string>(type: "text", nullable: true),
                    Weakness = table.Column<string>(type: "text", nullable: true),
                    LastActivity = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PerformanceTrend = table.Column<string>(type: "text", nullable: true),
                    StudyEfficiency = table.Column<double>(type: "double precision", nullable: true),
                    PredictedScore = table.Column<double>(type: "double precision", nullable: true),
                    DifficultyLevel = table.Column<double>(type: "double precision", nullable: true),
                    ConfidenceLevel = table.Column<double>(type: "double precision", nullable: true),
                    LearningVelocity = table.Column<double>(type: "double precision", nullable: true),
                    RetentionRate = table.Column<double>(type: "double precision", nullable: true),
                    AnalyticsId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AcademicPlanning_StudentSubject", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AcademicPlanning_StudentSubject_AcademicPlanning_StudentSub~",
                        column: x => x.AnalyticsId,
                        principalTable: "AcademicPlanning_StudentSubjectAnalytics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AcademicPlanning_StudentSubject_AcademicPlanning_Student_St~",
                        column: x => x.StudentId,
                        principalTable: "AcademicPlanning_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AcademicPlanning_StudentSubject_AcademicPlanning_Subject_Su~",
                        column: x => x.SubjectId,
                        principalTable: "AcademicPlanning_Subject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AcademicPlanning_StudySession",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    SubjectId = table.Column<string>(type: "text", nullable: false),
                    StartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    SessionType = table.Column<string>(type: "text", nullable: false),
                    TopicsCovered = table.Column<string>(type: "text", nullable: false),
                    EfficiencyScore = table.Column<double>(type: "double precision", nullable: false),
                    ConcentrationLevel = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: false),
                    ResourcesUsed = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AcademicPlanning_StudySession", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AcademicPlanning_StudySession_AcademicPlanning_Student_Stud~",
                        column: x => x.StudentId,
                        principalTable: "AcademicPlanning_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AcademicPlanning_StudySession_AcademicPlanning_Subject_Subj~",
                        column: x => x.SubjectId,
                        principalTable: "AcademicPlanning_Subject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AcademicPlanning_Topic",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SubjectId = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AcademicPlanning_Topic", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AcademicPlanning_Topic_AcademicPlanning_Subject_SubjectId",
                        column: x => x.SubjectId,
                        principalTable: "AcademicPlanning_Subject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Audit_AuditLog",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    UserEmail = table.Column<string>(type: "text", nullable: false),
                    UserRole = table.Column<string>(type: "text", nullable: false),
                    ActionId = table.Column<long>(type: "bigint", nullable: false),
                    EntityType = table.Column<string>(type: "text", nullable: false),
                    EntityId = table.Column<string>(type: "text", nullable: false),
                    ServiceName = table.Column<string>(type: "text", nullable: false),
                    OldValues = table.Column<string>(type: "text", nullable: false),
                    NewValues = table.Column<string>(type: "text", nullable: false),
                    IpAddress = table.Column<string>(type: "text", nullable: false),
                    UserAgent = table.Column<string>(type: "text", nullable: false),
                    CorrelationId = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Audit_AuditLog", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Audit_AuditLog_Audit_AuditAction_ActionId",
                        column: x => x.ActionId,
                        principalTable: "Audit_AuditAction",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Booking_TutorAvailability",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TutorId = table.Column<long>(type: "bigint", nullable: false),
                    DayOfWeek = table.Column<int>(type: "integer", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    IsAvailable = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Booking_TutorAvailability", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Booking_TutorAvailability_Booking_Tutor_TutorId",
                        column: x => x.TutorId,
                        principalTable: "Booking_Tutor",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Booking_TutorStudent",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TutorId = table.Column<long>(type: "bigint", nullable: false),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    StartedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    SessionsPerWeek = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Booking_TutorStudent", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Booking_TutorStudent_Booking_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Booking_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Booking_TutorStudent_Booking_Tutor_TutorId",
                        column: x => x.TutorId,
                        principalTable: "Booking_Tutor",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Calendar_Reminder",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CalendarEventId = table.Column<long>(type: "bigint", nullable: false),
                    MinutesBefore = table.Column<int>(type: "integer", nullable: false),
                    ReminderType = table.Column<string>(type: "text", nullable: false),
                    IsSent = table.Column<bool>(type: "boolean", nullable: false),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Calendar_Reminder", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Calendar_Reminder_Calendar_CalendarEvent_CalendarEventId",
                        column: x => x.CalendarEventId,
                        principalTable: "Calendar_CalendarEvent",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_Student",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    AdminId = table.Column<long>(type: "bigint", nullable: true),
                    Grade = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_Student", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_Student_Entitlements_Admin_AdminId",
                        column: x => x.AdminId,
                        principalTable: "Entitlements_Admin",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_Teacher",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    Qualification = table.Column<string>(type: "text", nullable: false),
                    Specialization = table.Column<string>(type: "text", nullable: false),
                    YearsOfExperience = table.Column<int>(type: "integer", nullable: false),
                    Bio = table.Column<string>(type: "text", nullable: false),
                    HourlyRate = table.Column<decimal>(type: "numeric", nullable: false),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AdminId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_Teacher", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_Teacher_Entitlements_Admin_AdminId",
                        column: x => x.AdminId,
                        principalTable: "Entitlements_Admin",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_FeaturePurchase",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    FeatureId = table.Column<long>(type: "bigint", nullable: false),
                    AmountPaid = table.Column<decimal>(type: "numeric", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    PaymentStatus = table.Column<string>(type: "text", nullable: false),
                    BillingCycle = table.Column<string>(type: "text", nullable: false),
                    PurchaseDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ActivationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_FeaturePurchase", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_FeaturePurchase_Entitlements_Feature_FeatureId",
                        column: x => x.FeatureId,
                        principalTable: "Entitlements_Feature",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_RoleFeature",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RoleName = table.Column<string>(type: "text", nullable: false),
                    FeatureId = table.Column<long>(type: "bigint", nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_RoleFeature", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_RoleFeature_Entitlements_Feature_FeatureId",
                        column: x => x.FeatureId,
                        principalTable: "Entitlements_Feature",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_UserFeature",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    FeatureId = table.Column<long>(type: "bigint", nullable: false),
                    GrantedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    GrantType = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_UserFeature", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_UserFeature_Entitlements_Feature_FeatureId",
                        column: x => x.FeatureId,
                        principalTable: "Entitlements_Feature",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_RewardFeature",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RewardId = table.Column<long>(type: "bigint", nullable: false),
                    FeatureId = table.Column<long>(type: "bigint", nullable: false),
                    DurationDays = table.Column<int>(type: "integer", nullable: false),
                    FeatureWeight = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_RewardFeature", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_RewardFeature_Entitlements_Feature_FeatureId",
                        column: x => x.FeatureId,
                        principalTable: "Entitlements_Feature",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Entitlements_RewardFeature_Entitlements_Reward_RewardId",
                        column: x => x.RewardId,
                        principalTable: "Entitlements_Reward",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_Topic",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SubjectId = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_Topic", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_Topic_Entitlements_Subject_SubjectId",
                        column: x => x.SubjectId,
                        principalTable: "Entitlements_Subject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_TutorAvailability",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TutorId = table.Column<long>(type: "bigint", nullable: false),
                    DayOfWeek = table.Column<int>(type: "integer", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    IsAvailable = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_TutorAvailability", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_TutorAvailability_Entitlements_Tutor_TutorId",
                        column: x => x.TutorId,
                        principalTable: "Entitlements_Tutor",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_TutorSubject",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TutorId = table.Column<long>(type: "bigint", nullable: false),
                    SubjectId = table.Column<string>(type: "text", nullable: false),
                    ProficiencyLevel = table.Column<int>(type: "integer", nullable: false),
                    CustomHourlyRate = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_TutorSubject", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_TutorSubject_Entitlements_Subject_SubjectId",
                        column: x => x.SubjectId,
                        principalTable: "Entitlements_Subject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Entitlements_TutorSubject_Entitlements_Tutor_TutorId",
                        column: x => x.TutorId,
                        principalTable: "Entitlements_Tutor",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FeatureFlags_FeatureFlagEvaluation",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FeatureFlagId = table.Column<long>(type: "bigint", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    Result = table.Column<bool>(type: "boolean", nullable: false),
                    MatchedRuleId = table.Column<string>(type: "text", nullable: false),
                    Context = table.Column<string>(type: "text", nullable: false),
                    EvaluatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeatureFlags_FeatureFlagEvaluation", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FeatureFlags_FeatureFlagEvaluation_FeatureFlags_FeatureFlag~",
                        column: x => x.FeatureFlagId,
                        principalTable: "FeatureFlags_FeatureFlag",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FeatureFlags_FeatureFlagRule",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FeatureFlagId = table.Column<long>(type: "bigint", nullable: false),
                    RuleType = table.Column<string>(type: "text", nullable: false),
                    Operator = table.Column<string>(type: "text", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeatureFlags_FeatureFlagRule", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FeatureFlags_FeatureFlagRule_FeatureFlags_FeatureFlag_Featu~",
                        column: x => x.FeatureFlagId,
                        principalTable: "FeatureFlags_FeatureFlag",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Goals_RewardFeature",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RewardId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Goals_RewardFeature", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Goals_RewardFeature_Goals_Reward_RewardId",
                        column: x => x.RewardId,
                        principalTable: "Goals_Reward",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Goals_GrowthTracking",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    TrackingDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AcademicGrowth = table.Column<decimal>(type: "numeric", nullable: false),
                    StudyHabitGrowth = table.Column<decimal>(type: "numeric", nullable: false),
                    EmotionalGrowth = table.Column<decimal>(type: "numeric", nullable: false),
                    OverallGrowth = table.Column<decimal>(type: "numeric", nullable: false),
                    GrowthFactors = table.Column<string>(type: "text", nullable: false),
                    AreasForImprovement = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Goals_GrowthTracking", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Goals_GrowthTracking_Goals_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Goals_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Goals_StudentPoints",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    TotalPoints = table.Column<int>(type: "integer", nullable: false),
                    AvailablePoints = table.Column<int>(type: "integer", nullable: false),
                    UsedPoints = table.Column<int>(type: "integer", nullable: false),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    CurrentRank = table.Column<string>(type: "text", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Goals_StudentPoints", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Goals_StudentPoints_Goals_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Goals_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Goals_Goal",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    GoalType = table.Column<string>(type: "text", nullable: false),
                    SubjectId = table.Column<string>(type: "text", nullable: false),
                    TargetValue = table.Column<decimal>(type: "numeric", nullable: false),
                    CurrentValue = table.Column<decimal>(type: "numeric", nullable: false),
                    Unit = table.Column<string>(type: "text", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TargetDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    DifficultyWeight = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SubjectId1 = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Goals_Goal", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Goals_Goal_Goals_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Goals_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Goals_Goal_Goals_Subject_SubjectId1",
                        column: x => x.SubjectId1,
                        principalTable: "Goals_Subject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Insights_GradeDistribution",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentSubjectId = table.Column<long>(type: "bigint", nullable: false),
                    Grade = table.Column<string>(type: "text", nullable: false),
                    Count = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Insights_GradeDistribution", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Insights_GradeDistribution_Insights_StudentSubject_StudentS~",
                        column: x => x.StudentSubjectId,
                        principalTable: "Insights_StudentSubject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Insights_ImprovementTip",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentSubjectId = table.Column<long>(type: "bigint", nullable: false),
                    StudentSubjectTopicId = table.Column<long>(type: "bigint", nullable: false),
                    Tip = table.Column<string>(type: "text", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Insights_ImprovementTip", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Insights_ImprovementTip_Insights_StudentSubjectTopic_Studen~",
                        column: x => x.StudentSubjectTopicId,
                        principalTable: "Insights_StudentSubjectTopic",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Insights_ImprovementTip_Insights_StudentSubject_StudentSubj~",
                        column: x => x.StudentSubjectId,
                        principalTable: "Insights_StudentSubject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Marketplace_TutorAvailability",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TutorId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Marketplace_TutorAvailability", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Marketplace_TutorAvailability_Marketplace_Tutor_TutorId",
                        column: x => x.TutorId,
                        principalTable: "Marketplace_Tutor",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Marketplace_TutorStudent",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TutorId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Marketplace_TutorStudent", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Marketplace_TutorStudent_Marketplace_Tutor_TutorId",
                        column: x => x.TutorId,
                        principalTable: "Marketplace_Tutor",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Marketplace_TutorSubject",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TutorId = table.Column<long>(type: "bigint", nullable: false),
                    SubjectId = table.Column<string>(type: "text", nullable: false),
                    ProficiencyLevel = table.Column<int>(type: "integer", nullable: false),
                    CustomHourlyRate = table.Column<decimal>(type: "numeric", nullable: false),
                    SubjectId1 = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Marketplace_TutorSubject", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Marketplace_TutorSubject_Marketplace_Subject_SubjectId1",
                        column: x => x.SubjectId1,
                        principalTable: "Marketplace_Subject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Marketplace_TutorSubject_Marketplace_Tutor_TutorId",
                        column: x => x.TutorId,
                        principalTable: "Marketplace_Tutor",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Marketplace_Course",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    SubjectId = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    TutorId = table.Column<long>(type: "bigint", nullable: true),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    Level = table.Column<string>(type: "text", nullable: false),
                    ThumbnailUrl = table.Column<string>(type: "text", nullable: false),
                    PreviewVideoUrl = table.Column<string>(type: "text", nullable: false),
                    Rating = table.Column<double>(type: "double precision", nullable: false),
                    TotalStudents = table.Column<int>(type: "integer", nullable: false),
                    TotalLessons = table.Column<int>(type: "integer", nullable: false),
                    TotalHours = table.Column<decimal>(type: "numeric", nullable: false),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Marketplace_Course", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Marketplace_Course_Marketplace_Tutor_TutorId",
                        column: x => x.TutorId,
                        principalTable: "Marketplace_Tutor",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Marketplace_Course_Marketplace_User_UserId",
                        column: x => x.UserId,
                        principalTable: "Marketplace_User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Mastery_KnowledgeGap",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentSubjectId = table.Column<long>(type: "bigint", nullable: false),
                    TopicId = table.Column<long>(type: "bigint", nullable: false),
                    Concept = table.Column<string>(type: "text", nullable: false),
                    Severity = table.Column<string>(type: "text", nullable: false),
                    LastTested = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Mastery_KnowledgeGap", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Mastery_KnowledgeGap_Mastery_StudentSubjectTopic_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Mastery_StudentSubjectTopic",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Mastery_KnowledgeGap_Mastery_StudentSubject_StudentSubjectId",
                        column: x => x.StudentSubjectId,
                        principalTable: "Mastery_StudentSubject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Mastery_StudentSubjectAnalytics",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentSubjectId = table.Column<long>(type: "bigint", nullable: false),
                    TopicId = table.Column<long>(type: "bigint", nullable: false),
                    MorningPercentage = table.Column<int>(type: "integer", nullable: false),
                    AfternoonPercentage = table.Column<int>(type: "integer", nullable: false),
                    EveningPercentage = table.Column<int>(type: "integer", nullable: false),
                    Consistency = table.Column<int>(type: "integer", nullable: false),
                    PreferredDays = table.Column<string>(type: "text", nullable: false),
                    SessionLength = table.Column<int>(type: "integer", nullable: false),
                    ClassesAttended = table.Column<int>(type: "integer", nullable: false),
                    TotalClasses = table.Column<int>(type: "integer", nullable: false),
                    AttendanceRate = table.Column<double>(type: "double precision", nullable: false),
                    TextbookUsage = table.Column<int>(type: "integer", nullable: false),
                    VideoTutorials = table.Column<int>(type: "integer", nullable: false),
                    PracticeProblems = table.Column<int>(type: "integer", nullable: false),
                    GroupStudy = table.Column<int>(type: "integer", nullable: false),
                    OnlinePlatforms = table.Column<int>(type: "integer", nullable: false),
                    QuestionsAsked = table.Column<int>(type: "integer", nullable: false),
                    ParticipationRate = table.Column<int>(type: "integer", nullable: false),
                    ResourceDownloads = table.Column<int>(type: "integer", nullable: false),
                    ForumActivity = table.Column<int>(type: "integer", nullable: false),
                    WorkloadThisWeek = table.Column<double>(type: "double precision", nullable: false),
                    StressLevel = table.Column<double>(type: "double precision", nullable: false),
                    SleepQuality = table.Column<double>(type: "double precision", nullable: false),
                    MotivationLevel = table.Column<double>(type: "double precision", nullable: false),
                    Importance = table.Column<int>(type: "integer", nullable: false),
                    InterestLevel = table.Column<double>(type: "double precision", nullable: false),
                    Alignment = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Mastery_StudentSubjectAnalytics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Mastery_StudentSubjectAnalytics_Mastery_StudentSubjectTopic~",
                        column: x => x.TopicId,
                        principalTable: "Mastery_StudentSubjectTopic",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Mastery_StudentSubjectAnalytics_Mastery_StudentSubject_Stud~",
                        column: x => x.StudentSubjectId,
                        principalTable: "Mastery_StudentSubject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Mastery_TopicMastery",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentSubjectId = table.Column<long>(type: "bigint", nullable: false),
                    TopicId = table.Column<string>(type: "text", nullable: false),
                    MasteryLevel = table.Column<double>(type: "double precision", nullable: false),
                    TopicId1 = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Mastery_TopicMastery", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Mastery_TopicMastery_Mastery_StudentSubjectTopic_TopicId1",
                        column: x => x.TopicId1,
                        principalTable: "Mastery_StudentSubjectTopic",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Mastery_TopicMastery_Mastery_StudentSubject_StudentSubjectId",
                        column: x => x.StudentSubjectId,
                        principalTable: "Mastery_StudentSubject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Moderation_ModerationAction",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ContentReportId = table.Column<long>(type: "bigint", nullable: false),
                    ModeratorUserId = table.Column<string>(type: "text", nullable: false),
                    ActionType = table.Column<string>(type: "text", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: false),
                    IsAutomated = table.Column<bool>(type: "boolean", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Moderation_ModerationAction", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Moderation_ModerationAction_Moderation_ContentReport_Conten~",
                        column: x => x.ContentReportId,
                        principalTable: "Moderation_ContentReport",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RoleClaims",
                schema: "Identity",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RoleId = table.Column<string>(type: "text", nullable: false),
                    ClaimType = table.Column<string>(type: "text", nullable: true),
                    ClaimValue = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RoleClaims_Roles_RoleId",
                        column: x => x.RoleId,
                        principalSchema: "Identity",
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Support_SupportTicket",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    CategoryId = table.Column<long>(type: "bigint", nullable: false),
                    Subject = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Priority = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    AssignedToUserId = table.Column<string>(type: "text", nullable: false),
                    Channel = table.Column<string>(type: "text", nullable: false),
                    ResolvedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ClosedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ResolutionNotes = table.Column<string>(type: "text", nullable: false),
                    SatisfactionRating = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Support_SupportTicket", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Support_SupportTicket_Support_SupportCategory_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Support_SupportCategory",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Auth_Admin",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Auth_Admin", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Auth_Admin_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "Identity",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Auth_Parent",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Auth_Parent", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Auth_Parent_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "Identity",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Auth_Student",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Auth_Student", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Auth_Student_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "Identity",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Auth_Superuser",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Auth_Superuser", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Auth_Superuser_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "Identity",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Auth_Teacher",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Auth_Teacher", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Auth_Teacher_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "Identity",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserClaims",
                schema: "Identity",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    ClaimType = table.Column<string>(type: "text", nullable: true),
                    ClaimValue = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserClaims_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "Identity",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserLogins",
                schema: "Identity",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "text", nullable: false),
                    ProviderKey = table.Column<string>(type: "text", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "text", nullable: true),
                    UserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_UserLogins_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "Identity",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserRoles",
                schema: "Identity",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "text", nullable: false),
                    RoleId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_UserRoles_Roles_RoleId",
                        column: x => x.RoleId,
                        principalSchema: "Identity",
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserRoles_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "Identity",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserTokens",
                schema: "Identity",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "text", nullable: false),
                    LoginProvider = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_UserTokens_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "Identity",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AcademicPlanning_AssessmentBreakdown",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentSubjectId = table.Column<long>(type: "bigint", nullable: false),
                    AssessmentType = table.Column<string>(type: "text", nullable: false),
                    Count = table.Column<int>(type: "integer", nullable: false),
                    Average = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AcademicPlanning_AssessmentBreakdown", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AcademicPlanning_AssessmentBreakdown_AcademicPlanning_Stude~",
                        column: x => x.StudentSubjectId,
                        principalTable: "AcademicPlanning_StudentSubject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AcademicPlanning_ImprovementTip",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentSubjectId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AcademicPlanning_ImprovementTip", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AcademicPlanning_ImprovementTip_AcademicPlanning_StudentSub~",
                        column: x => x.StudentSubjectId,
                        principalTable: "AcademicPlanning_StudentSubject",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "AcademicPlanning_KnowledgeGap",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentSubjectId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AcademicPlanning_KnowledgeGap", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AcademicPlanning_KnowledgeGap_AcademicPlanning_StudentSubje~",
                        column: x => x.StudentSubjectId,
                        principalTable: "AcademicPlanning_StudentSubject",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "AcademicPlanning_WeeklyStudyHour",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentSubjectId = table.Column<long>(type: "bigint", nullable: false),
                    WeekNumber = table.Column<int>(type: "integer", nullable: false),
                    Hours = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AcademicPlanning_WeeklyStudyHour", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AcademicPlanning_WeeklyStudyHour_AcademicPlanning_StudentSu~",
                        column: x => x.StudentSubjectId,
                        principalTable: "AcademicPlanning_StudentSubject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AcademicPlanning_StudentSubjectTopic",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentSubjectId = table.Column<long>(type: "bigint", nullable: false),
                    TopicId = table.Column<long>(type: "bigint", nullable: false),
                    Score = table.Column<double>(type: "double precision", nullable: false),
                    Trend = table.Column<string>(type: "text", nullable: false),
                    LastTested = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AcademicPlanning_StudentSubjectTopic", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AcademicPlanning_StudentSubjectTopic_AcademicPlanning_Stude~",
                        column: x => x.StudentSubjectId,
                        principalTable: "AcademicPlanning_StudentSubject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AcademicPlanning_StudentSubjectTopic_AcademicPlanning_Topic~",
                        column: x => x.TopicId,
                        principalTable: "AcademicPlanning_Topic",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_AdminStudent",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SchoolAdminId = table.Column<long>(type: "bigint", nullable: false),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    EnrolledDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EnrollmentStatus = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_AdminStudent", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_AdminStudent_Entitlements_Admin_SchoolAdminId",
                        column: x => x.SchoolAdminId,
                        principalTable: "Entitlements_Admin",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Entitlements_AdminStudent_Entitlements_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Entitlements_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_Assessment",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    SubjectId = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Score = table.Column<double>(type: "double precision", nullable: false),
                    MaxScore = table.Column<double>(type: "double precision", nullable: false),
                    DateTaken = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Grade = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_Assessment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_Assessment_Entitlements_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Entitlements_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Entitlements_Assessment_Entitlements_Subject_SubjectId",
                        column: x => x.SubjectId,
                        principalTable: "Entitlements_Subject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_DiaryEntry",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    Mood = table.Column<string>(type: "text", nullable: false),
                    MoodIntensity = table.Column<int>(type: "integer", nullable: false),
                    EntryType = table.Column<string>(type: "text", nullable: false),
                    Tags = table.Column<string>(type: "text", nullable: false),
                    IsPrivate = table.Column<bool>(type: "boolean", nullable: false),
                    EntryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SentimentAnalysis = table.Column<string>(type: "text", nullable: false),
                    SentimentScore = table.Column<double>(type: "double precision", nullable: false),
                    KeyThemes = table.Column<string>(type: "text", nullable: false),
                    AiInsights = table.Column<string>(type: "text", nullable: false),
                    NeedsFollowUp = table.Column<bool>(type: "boolean", nullable: false),
                    FollowUpAction = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_DiaryEntry", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_DiaryEntry_Entitlements_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Entitlements_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_DiaryMoodTracking",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    TrackingDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    OverallMood = table.Column<string>(type: "text", nullable: false),
                    EnergyLevel = table.Column<int>(type: "integer", nullable: false),
                    StressLevel = table.Column<int>(type: "integer", nullable: false),
                    MotivationLevel = table.Column<int>(type: "integer", nullable: false),
                    FactorsAffectingMood = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_DiaryMoodTracking", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_DiaryMoodTracking_Entitlements_Student_Student~",
                        column: x => x.StudentId,
                        principalTable: "Entitlements_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_Goal",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    GoalType = table.Column<string>(type: "text", nullable: false),
                    SubjectId = table.Column<string>(type: "text", nullable: false),
                    TargetValue = table.Column<decimal>(type: "numeric", nullable: false),
                    CurrentValue = table.Column<decimal>(type: "numeric", nullable: false),
                    Unit = table.Column<string>(type: "text", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TargetDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    DifficultyWeight = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_Goal", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_Goal_Entitlements_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Entitlements_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Entitlements_Goal_Entitlements_Subject_SubjectId",
                        column: x => x.SubjectId,
                        principalTable: "Entitlements_Subject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_GrowthTracking",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    TrackingDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AcademicGrowth = table.Column<decimal>(type: "numeric", nullable: false),
                    StudyHabitGrowth = table.Column<decimal>(type: "numeric", nullable: false),
                    EmotionalGrowth = table.Column<decimal>(type: "numeric", nullable: false),
                    OverallGrowth = table.Column<decimal>(type: "numeric", nullable: false),
                    GrowthFactors = table.Column<string>(type: "text", nullable: false),
                    AreasForImprovement = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_GrowthTracking", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_GrowthTracking_Entitlements_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Entitlements_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_ParentStudent",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ParentId = table.Column<long>(type: "bigint", nullable: false),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    Relationship = table.Column<string>(type: "text", nullable: false),
                    IsPrimaryContact = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_ParentStudent", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_ParentStudent_Entitlements_Parent_ParentId",
                        column: x => x.ParentId,
                        principalTable: "Entitlements_Parent",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Entitlements_ParentStudent_Entitlements_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Entitlements_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_StudentPoints",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    TotalPoints = table.Column<int>(type: "integer", nullable: false),
                    AvailablePoints = table.Column<int>(type: "integer", nullable: false),
                    UsedPoints = table.Column<int>(type: "integer", nullable: false),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    CurrentRank = table.Column<string>(type: "text", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_StudentPoints", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_StudentPoints_Entitlements_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Entitlements_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_StudentSubject",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    SubjectId = table.Column<string>(type: "text", nullable: false),
                    Progress = table.Column<int>(type: "integer", nullable: true),
                    Target = table.Column<int>(type: "integer", nullable: true),
                    AverageScore = table.Column<double>(type: "double precision", nullable: true),
                    StudyHours = table.Column<int>(type: "integer", nullable: true),
                    AssignmentsCompleted = table.Column<int>(type: "integer", nullable: true),
                    UpcomingDeadlines = table.Column<int>(type: "integer", nullable: true),
                    Strength = table.Column<string>(type: "text", nullable: true),
                    Weakness = table.Column<string>(type: "text", nullable: true),
                    LastActivity = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PerformanceTrend = table.Column<string>(type: "text", nullable: true),
                    StudyEfficiency = table.Column<double>(type: "double precision", nullable: true),
                    PredictedScore = table.Column<double>(type: "double precision", nullable: true),
                    DifficultyLevel = table.Column<double>(type: "double precision", nullable: true),
                    ConfidenceLevel = table.Column<double>(type: "double precision", nullable: true),
                    LearningVelocity = table.Column<double>(type: "double precision", nullable: true),
                    RetentionRate = table.Column<double>(type: "double precision", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_StudentSubject", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_StudentSubject_Entitlements_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Entitlements_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Entitlements_StudentSubject_Entitlements_Subject_SubjectId",
                        column: x => x.SubjectId,
                        principalTable: "Entitlements_Subject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_StudySession",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    SubjectId = table.Column<string>(type: "text", nullable: false),
                    StartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    SessionType = table.Column<string>(type: "text", nullable: false),
                    TopicsCovered = table.Column<string>(type: "text", nullable: false),
                    EfficiencyScore = table.Column<double>(type: "double precision", nullable: false),
                    ConcentrationLevel = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: false),
                    ResourcesUsed = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_StudySession", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_StudySession_Entitlements_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Entitlements_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Entitlements_StudySession_Entitlements_Subject_SubjectId",
                        column: x => x.SubjectId,
                        principalTable: "Entitlements_Subject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_TutorStudent",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TutorId = table.Column<long>(type: "bigint", nullable: false),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    StartedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    SessionsPerWeek = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_TutorStudent", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_TutorStudent_Entitlements_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Entitlements_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Entitlements_TutorStudent_Entitlements_Tutor_TutorId",
                        column: x => x.TutorId,
                        principalTable: "Entitlements_Tutor",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_Course",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    SubjectId = table.Column<string>(type: "text", nullable: false),
                    TeacherId = table.Column<long>(type: "bigint", nullable: true),
                    TutorId = table.Column<long>(type: "bigint", nullable: true),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    Level = table.Column<string>(type: "text", nullable: false),
                    ThumbnailUrl = table.Column<string>(type: "text", nullable: false),
                    PreviewVideoUrl = table.Column<string>(type: "text", nullable: false),
                    Rating = table.Column<double>(type: "double precision", nullable: false),
                    TotalStudents = table.Column<int>(type: "integer", nullable: false),
                    TotalLessons = table.Column<int>(type: "integer", nullable: false),
                    TotalHours = table.Column<decimal>(type: "numeric", nullable: false),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_Course", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_Course_Entitlements_Subject_SubjectId",
                        column: x => x.SubjectId,
                        principalTable: "Entitlements_Subject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Entitlements_Course_Entitlements_Teacher_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Entitlements_Teacher",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Entitlements_Course_Entitlements_Tutor_TutorId",
                        column: x => x.TutorId,
                        principalTable: "Entitlements_Tutor",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_TeacherAdmin",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TeacherId = table.Column<long>(type: "bigint", nullable: false),
                    AdminId = table.Column<long>(type: "bigint", nullable: false),
                    AssociatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_TeacherAdmin", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_TeacherAdmin_Entitlements_Admin_AdminId",
                        column: x => x.AdminId,
                        principalTable: "Entitlements_Admin",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Entitlements_TeacherAdmin_Entitlements_Teacher_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Entitlements_Teacher",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_TeacherStudent",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TeacherId = table.Column<long>(type: "bigint", nullable: false),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    AssignedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_TeacherStudent", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_TeacherStudent_Entitlements_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Entitlements_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Entitlements_TeacherStudent_Entitlements_Teacher_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Entitlements_Teacher",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_TeacherSubject",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TeacherId = table.Column<long>(type: "bigint", nullable: false),
                    SubjectId = table.Column<string>(type: "text", nullable: false),
                    ProficiencyLevel = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_TeacherSubject", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_TeacherSubject_Entitlements_Subject_SubjectId",
                        column: x => x.SubjectId,
                        principalTable: "Entitlements_Subject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Entitlements_TeacherSubject_Entitlements_Teacher_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Entitlements_Teacher",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GoalReward",
                columns: table => new
                {
                    ApplicableGoalsId = table.Column<long>(type: "bigint", nullable: false),
                    PotentialRewardsId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GoalReward", x => new { x.ApplicableGoalsId, x.PotentialRewardsId });
                    table.ForeignKey(
                        name: "FK_GoalReward_Goals_Goal_ApplicableGoalsId",
                        column: x => x.ApplicableGoalsId,
                        principalTable: "Goals_Goal",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GoalReward_Goals_Reward_PotentialRewardsId",
                        column: x => x.PotentialRewardsId,
                        principalTable: "Goals_Reward",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Goals_GoalMilestone",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GoalId = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    TargetValue = table.Column<decimal>(type: "numeric", nullable: false),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RewardPoints = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Goals_GoalMilestone", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Goals_GoalMilestone_Goals_Goal_GoalId",
                        column: x => x.GoalId,
                        principalTable: "Goals_Goal",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Goals_PointsTransaction",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentPointsId = table.Column<long>(type: "bigint", nullable: false),
                    Points = table.Column<int>(type: "integer", nullable: false),
                    TransactionType = table.Column<string>(type: "text", nullable: false),
                    Source = table.Column<string>(type: "text", nullable: false),
                    RelatedGoalId = table.Column<long>(type: "bigint", nullable: true),
                    RelatedRewardId = table.Column<long>(type: "bigint", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Goals_PointsTransaction", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Goals_PointsTransaction_Goals_Goal_RelatedGoalId",
                        column: x => x.RelatedGoalId,
                        principalTable: "Goals_Goal",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Goals_PointsTransaction_Goals_Reward_RelatedRewardId",
                        column: x => x.RelatedRewardId,
                        principalTable: "Goals_Reward",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Goals_PointsTransaction_Goals_StudentPoints_StudentPointsId",
                        column: x => x.StudentPointsId,
                        principalTable: "Goals_StudentPoints",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Goals_StudentReward",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    RewardId = table.Column<long>(type: "bigint", nullable: false),
                    GoalId = table.Column<long>(type: "bigint", nullable: true),
                    EarnedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    PointsEarned = table.Column<int>(type: "integer", nullable: false),
                    AchievementContext = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Goals_StudentReward", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Goals_StudentReward_Goals_Goal_GoalId",
                        column: x => x.GoalId,
                        principalTable: "Goals_Goal",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Goals_StudentReward_Goals_Reward_RewardId",
                        column: x => x.RewardId,
                        principalTable: "Goals_Reward",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Goals_StudentReward_Goals_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Goals_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Marketplace_CourseEnrollment",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CourseId = table.Column<long>(type: "bigint", nullable: false),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    EnrolledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AmountPaid = table.Column<decimal>(type: "numeric", nullable: false),
                    PaymentStatus = table.Column<string>(type: "text", nullable: false),
                    Progress = table.Column<decimal>(type: "numeric", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UserId1 = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Marketplace_CourseEnrollment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Marketplace_CourseEnrollment_Marketplace_Course_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Marketplace_Course",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Marketplace_CourseEnrollment_Marketplace_User_UserId1",
                        column: x => x.UserId1,
                        principalTable: "Marketplace_User",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Marketplace_CourseModule",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CourseId = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    DurationHours = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Marketplace_CourseModule", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Marketplace_CourseModule_Marketplace_Course_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Marketplace_Course",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Marketplace_Resource",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<long>(type: "bigint", nullable: true),
                    CourseId = table.Column<long>(type: "bigint", nullable: true),
                    SubjectId = table.Column<string>(type: "text", nullable: true),
                    ResourceType = table.Column<string>(type: "text", nullable: false),
                    S3Key = table.Column<string>(type: "text", nullable: false),
                    FileUrl = table.Column<string>(type: "text", nullable: false),
                    FileSize = table.Column<string>(type: "text", nullable: false),
                    FileFormat = table.Column<string>(type: "text", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    IsFree = table.Column<bool>(type: "boolean", nullable: false),
                    DownloadCount = table.Column<int>(type: "integer", nullable: false),
                    Rating = table.Column<double>(type: "double precision", nullable: false),
                    GradeLevel = table.Column<string>(type: "text", nullable: false),
                    IsApproved = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UserId1 = table.Column<string>(type: "text", nullable: true),
                    SubjectId1 = table.Column<long>(type: "bigint", nullable: false),
                    TutorId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Marketplace_Resource", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Marketplace_Resource_Marketplace_Course_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Marketplace_Course",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Marketplace_Resource_Marketplace_Subject_SubjectId1",
                        column: x => x.SubjectId1,
                        principalTable: "Marketplace_Subject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Marketplace_Resource_Marketplace_Tutor_TutorId",
                        column: x => x.TutorId,
                        principalTable: "Marketplace_Tutor",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Marketplace_Resource_Marketplace_User_UserId1",
                        column: x => x.UserId1,
                        principalTable: "Marketplace_User",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Support_SupportMessage",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TicketId = table.Column<long>(type: "bigint", nullable: false),
                    SenderUserId = table.Column<string>(type: "text", nullable: false),
                    SenderRole = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    AttachmentUrls = table.Column<string>(type: "text", nullable: false),
                    IsInternal = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Support_SupportMessage", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Support_SupportMessage_Support_SupportTicket_TicketId",
                        column: x => x.TicketId,
                        principalTable: "Support_SupportTicket",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Auth_StudentAdmin",
                columns: table => new
                {
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    AdminId = table.Column<long>(type: "bigint", nullable: false),
                    AssignedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Auth_StudentAdmin", x => new { x.StudentId, x.AdminId });
                    table.ForeignKey(
                        name: "FK_Auth_StudentAdmin_Auth_Admin_AdminId",
                        column: x => x.AdminId,
                        principalTable: "Auth_Admin",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Auth_StudentAdmin_Auth_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Auth_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Auth_StudentParent",
                columns: table => new
                {
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    ParentId = table.Column<long>(type: "bigint", nullable: false),
                    AssignedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Auth_StudentParent", x => new { x.StudentId, x.ParentId });
                    table.ForeignKey(
                        name: "FK_Auth_StudentParent_Auth_Parent_ParentId",
                        column: x => x.ParentId,
                        principalTable: "Auth_Parent",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Auth_StudentParent_Auth_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Auth_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Auth_StudentTeacher",
                columns: table => new
                {
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    TeacherId = table.Column<long>(type: "bigint", nullable: false),
                    AssignedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Auth_StudentTeacher", x => new { x.StudentId, x.TeacherId });
                    table.ForeignKey(
                        name: "FK_Auth_StudentTeacher_Auth_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Auth_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Auth_StudentTeacher_Auth_Teacher_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Auth_Teacher",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_DiaryGoal",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DiaryEntryId = table.Column<long>(type: "bigint", nullable: false),
                    GoalId = table.Column<long>(type: "bigint", nullable: false),
                    ConnectionType = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_DiaryGoal", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_DiaryGoal_Entitlements_DiaryEntry_DiaryEntryId",
                        column: x => x.DiaryEntryId,
                        principalTable: "Entitlements_DiaryEntry",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Entitlements_DiaryGoal_Entitlements_Goal_GoalId",
                        column: x => x.GoalId,
                        principalTable: "Entitlements_Goal",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_GoalMilestone",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GoalId = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    TargetValue = table.Column<decimal>(type: "numeric", nullable: false),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RewardPoints = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_GoalMilestone", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_GoalMilestone_Entitlements_Goal_GoalId",
                        column: x => x.GoalId,
                        principalTable: "Entitlements_Goal",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_StudentReward",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    RewardId = table.Column<long>(type: "bigint", nullable: false),
                    GoalId = table.Column<long>(type: "bigint", nullable: true),
                    EarnedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    PointsEarned = table.Column<int>(type: "integer", nullable: false),
                    AchievementContext = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_StudentReward", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_StudentReward_Entitlements_Goal_GoalId",
                        column: x => x.GoalId,
                        principalTable: "Entitlements_Goal",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Entitlements_StudentReward_Entitlements_Reward_RewardId",
                        column: x => x.RewardId,
                        principalTable: "Entitlements_Reward",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Entitlements_StudentReward_Entitlements_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Entitlements_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GoalReward1",
                columns: table => new
                {
                    ApplicableGoalsId = table.Column<long>(type: "bigint", nullable: false),
                    PotentialRewardsId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GoalReward1", x => new { x.ApplicableGoalsId, x.PotentialRewardsId });
                    table.ForeignKey(
                        name: "FK_GoalReward1_Entitlements_Goal_ApplicableGoalsId",
                        column: x => x.ApplicableGoalsId,
                        principalTable: "Entitlements_Goal",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GoalReward1_Entitlements_Reward_PotentialRewardsId",
                        column: x => x.PotentialRewardsId,
                        principalTable: "Entitlements_Reward",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_PointsTransaction",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentPointsId = table.Column<long>(type: "bigint", nullable: false),
                    Points = table.Column<int>(type: "integer", nullable: false),
                    TransactionType = table.Column<string>(type: "text", nullable: false),
                    Source = table.Column<string>(type: "text", nullable: false),
                    RelatedGoalId = table.Column<long>(type: "bigint", nullable: true),
                    RelatedRewardId = table.Column<long>(type: "bigint", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_PointsTransaction", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_PointsTransaction_Entitlements_Goal_RelatedGoa~",
                        column: x => x.RelatedGoalId,
                        principalTable: "Entitlements_Goal",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Entitlements_PointsTransaction_Entitlements_Reward_RelatedR~",
                        column: x => x.RelatedRewardId,
                        principalTable: "Entitlements_Reward",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Entitlements_PointsTransaction_Entitlements_StudentPoints_S~",
                        column: x => x.StudentPointsId,
                        principalTable: "Entitlements_StudentPoints",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_AssessmentBreakdown",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentSubjectId = table.Column<long>(type: "bigint", nullable: false),
                    AssessmentType = table.Column<string>(type: "text", nullable: false),
                    Count = table.Column<int>(type: "integer", nullable: false),
                    Average = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_AssessmentBreakdown", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_AssessmentBreakdown_Entitlements_StudentSubjec~",
                        column: x => x.StudentSubjectId,
                        principalTable: "Entitlements_StudentSubject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_GradeDistribution",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentSubjectId = table.Column<long>(type: "bigint", nullable: false),
                    Grade = table.Column<string>(type: "text", nullable: false),
                    Count = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_GradeDistribution", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_GradeDistribution_Entitlements_StudentSubject_~",
                        column: x => x.StudentSubjectId,
                        principalTable: "Entitlements_StudentSubject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_ImprovementTip",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentSubjectId = table.Column<long>(type: "bigint", nullable: false),
                    Tip = table.Column<string>(type: "text", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_ImprovementTip", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_ImprovementTip_Entitlements_StudentSubject_Stu~",
                        column: x => x.StudentSubjectId,
                        principalTable: "Entitlements_StudentSubject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_KnowledgeGap",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentSubjectId = table.Column<long>(type: "bigint", nullable: false),
                    Concept = table.Column<string>(type: "text", nullable: false),
                    Severity = table.Column<string>(type: "text", nullable: false),
                    LastTested = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_KnowledgeGap", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_KnowledgeGap_Entitlements_StudentSubject_Stude~",
                        column: x => x.StudentSubjectId,
                        principalTable: "Entitlements_StudentSubject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_PeerComparison",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentSubjectId = table.Column<long>(type: "bigint", nullable: false),
                    ClassAverage = table.Column<double>(type: "double precision", nullable: false),
                    Percentile = table.Column<int>(type: "integer", nullable: false),
                    Ranking = table.Column<int>(type: "integer", nullable: false),
                    TrendComparison = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_PeerComparison", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_PeerComparison_Entitlements_StudentSubject_Stu~",
                        column: x => x.StudentSubjectId,
                        principalTable: "Entitlements_StudentSubject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_PredictionMetrics",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentSubjectId = table.Column<long>(type: "bigint", nullable: false),
                    FinalGradeProbabilityA = table.Column<int>(type: "integer", nullable: false),
                    FinalGradeProbabilityB = table.Column<int>(type: "integer", nullable: false),
                    FinalGradeProbabilityC = table.Column<int>(type: "integer", nullable: false),
                    FinalGradeProbabilityD = table.Column<int>(type: "integer", nullable: false),
                    RiskLevel = table.Column<string>(type: "text", nullable: false),
                    InterventionNeeded = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_PredictionMetrics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_PredictionMetrics_Entitlements_StudentSubject_~",
                        column: x => x.StudentSubjectId,
                        principalTable: "Entitlements_StudentSubject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_PrerequisiteMastery",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentSubjectId = table.Column<long>(type: "bigint", nullable: false),
                    Prerequisite = table.Column<string>(type: "text", nullable: false),
                    MasteryLevel = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_PrerequisiteMastery", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_PrerequisiteMastery_Entitlements_StudentSubjec~",
                        column: x => x.StudentSubjectId,
                        principalTable: "Entitlements_StudentSubject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_StudentSubjectAnalytics",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentSubjectId = table.Column<long>(type: "bigint", nullable: false),
                    MorningPercentage = table.Column<int>(type: "integer", nullable: false),
                    AfternoonPercentage = table.Column<int>(type: "integer", nullable: false),
                    EveningPercentage = table.Column<int>(type: "integer", nullable: false),
                    Consistency = table.Column<int>(type: "integer", nullable: false),
                    PreferredDays = table.Column<string>(type: "text", nullable: false),
                    SessionLength = table.Column<int>(type: "integer", nullable: false),
                    ClassesAttended = table.Column<int>(type: "integer", nullable: false),
                    TotalClasses = table.Column<int>(type: "integer", nullable: false),
                    AttendanceRate = table.Column<double>(type: "double precision", nullable: false),
                    TextbookUsage = table.Column<int>(type: "integer", nullable: false),
                    VideoTutorials = table.Column<int>(type: "integer", nullable: false),
                    PracticeProblems = table.Column<int>(type: "integer", nullable: false),
                    GroupStudy = table.Column<int>(type: "integer", nullable: false),
                    OnlinePlatforms = table.Column<int>(type: "integer", nullable: false),
                    QuestionsAsked = table.Column<int>(type: "integer", nullable: false),
                    ParticipationRate = table.Column<int>(type: "integer", nullable: false),
                    ResourceDownloads = table.Column<int>(type: "integer", nullable: false),
                    ForumActivity = table.Column<int>(type: "integer", nullable: false),
                    WorkloadThisWeek = table.Column<double>(type: "double precision", nullable: false),
                    StressLevel = table.Column<double>(type: "double precision", nullable: false),
                    SleepQuality = table.Column<double>(type: "double precision", nullable: false),
                    MotivationLevel = table.Column<double>(type: "double precision", nullable: false),
                    Importance = table.Column<int>(type: "integer", nullable: false),
                    InterestLevel = table.Column<double>(type: "double precision", nullable: false),
                    Alignment = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_StudentSubjectAnalytics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_StudentSubjectAnalytics_Entitlements_StudentSu~",
                        column: x => x.StudentSubjectId,
                        principalTable: "Entitlements_StudentSubject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_StudentSubjectTopic",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentSubjectId = table.Column<long>(type: "bigint", nullable: false),
                    TopicId = table.Column<long>(type: "bigint", nullable: false),
                    Score = table.Column<double>(type: "double precision", nullable: false),
                    Trend = table.Column<string>(type: "text", nullable: false),
                    LastTested = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_StudentSubjectTopic", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_StudentSubjectTopic_Entitlements_StudentSubjec~",
                        column: x => x.StudentSubjectId,
                        principalTable: "Entitlements_StudentSubject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Entitlements_StudentSubjectTopic_Entitlements_Topic_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Entitlements_Topic",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_WeeklyStudyHour",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentSubjectId = table.Column<long>(type: "bigint", nullable: false),
                    WeekNumber = table.Column<int>(type: "integer", nullable: false),
                    Hours = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_WeeklyStudyHour", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_WeeklyStudyHour_Entitlements_StudentSubject_St~",
                        column: x => x.StudentSubjectId,
                        principalTable: "Entitlements_StudentSubject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_CourseEnrollment",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CourseId = table.Column<long>(type: "bigint", nullable: false),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    EnrolledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AmountPaid = table.Column<decimal>(type: "numeric", nullable: false),
                    PaymentStatus = table.Column<string>(type: "text", nullable: false),
                    Progress = table.Column<decimal>(type: "numeric", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_CourseEnrollment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_CourseEnrollment_Entitlements_Course_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Entitlements_Course",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Entitlements_CourseEnrollment_Entitlements_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Entitlements_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_CourseModule",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CourseId = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    DurationHours = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_CourseModule", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_CourseModule_Entitlements_Course_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Entitlements_Course",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_Resource",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    SubjectId = table.Column<string>(type: "text", nullable: false),
                    TeacherId = table.Column<long>(type: "bigint", nullable: true),
                    TutorId = table.Column<long>(type: "bigint", nullable: true),
                    CourseId = table.Column<long>(type: "bigint", nullable: true),
                    ResourceType = table.Column<string>(type: "text", nullable: false),
                    S3Key = table.Column<string>(type: "text", nullable: false),
                    FileUrl = table.Column<string>(type: "text", nullable: false),
                    FileSize = table.Column<string>(type: "text", nullable: false),
                    FileFormat = table.Column<string>(type: "text", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    IsFree = table.Column<bool>(type: "boolean", nullable: false),
                    DownloadCount = table.Column<int>(type: "integer", nullable: false),
                    Rating = table.Column<double>(type: "double precision", nullable: false),
                    GradeLevel = table.Column<string>(type: "text", nullable: false),
                    IsApproved = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_Resource", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_Resource_Entitlements_Course_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Entitlements_Course",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Entitlements_Resource_Entitlements_Subject_SubjectId",
                        column: x => x.SubjectId,
                        principalTable: "Entitlements_Subject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Entitlements_Resource_Entitlements_Teacher_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Entitlements_Teacher",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Entitlements_Resource_Entitlements_Tutor_TutorId",
                        column: x => x.TutorId,
                        principalTable: "Entitlements_Tutor",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Marketplace_ModuleLesson",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ModuleId = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    VideoUrl = table.Column<string>(type: "text", nullable: false),
                    ResourceUrls = table.Column<string>(type: "text", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    DurationMinutes = table.Column<decimal>(type: "numeric", nullable: false),
                    IsFreePreview = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Marketplace_ModuleLesson", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Marketplace_ModuleLesson_Marketplace_CourseModule_ModuleId",
                        column: x => x.ModuleId,
                        principalTable: "Marketplace_CourseModule",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Marketplace_ResourceDownload",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ResourceId = table.Column<long>(type: "bigint", nullable: false),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    DownloadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UserId1 = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Marketplace_ResourceDownload", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Marketplace_ResourceDownload_Marketplace_Resource_ResourceId",
                        column: x => x.ResourceId,
                        principalTable: "Marketplace_Resource",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Marketplace_ResourceDownload_Marketplace_User_UserId1",
                        column: x => x.UserId1,
                        principalTable: "Marketplace_User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_ModuleLesson",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ModuleId = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    VideoUrl = table.Column<string>(type: "text", nullable: false),
                    ResourceUrls = table.Column<string>(type: "text", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    DurationMinutes = table.Column<decimal>(type: "numeric", nullable: false),
                    IsFreePreview = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_ModuleLesson", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_ModuleLesson_Entitlements_CourseModule_ModuleId",
                        column: x => x.ModuleId,
                        principalTable: "Entitlements_CourseModule",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entitlements_ResourceDownload",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ResourceId = table.Column<long>(type: "bigint", nullable: false),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    DownloadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entitlements_ResourceDownload", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entitlements_ResourceDownload_Entitlements_Resource_Resourc~",
                        column: x => x.ResourceId,
                        principalTable: "Entitlements_Resource",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Entitlements_ResourceDownload_Entitlements_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Entitlements_Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AcademicPlanning_Assessment_StudentId",
                table: "AcademicPlanning_Assessment",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_AcademicPlanning_Assessment_SubjectId",
                table: "AcademicPlanning_Assessment",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_AcademicPlanning_AssessmentBreakdown_StudentSubjectId",
                table: "AcademicPlanning_AssessmentBreakdown",
                column: "StudentSubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_AcademicPlanning_ImprovementTip_StudentSubjectId",
                table: "AcademicPlanning_ImprovementTip",
                column: "StudentSubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_AcademicPlanning_KnowledgeGap_StudentSubjectId",
                table: "AcademicPlanning_KnowledgeGap",
                column: "StudentSubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_AcademicPlanning_StudentSubject_AnalyticsId",
                table: "AcademicPlanning_StudentSubject",
                column: "AnalyticsId");

            migrationBuilder.CreateIndex(
                name: "IX_AcademicPlanning_StudentSubject_StudentId",
                table: "AcademicPlanning_StudentSubject",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_AcademicPlanning_StudentSubject_SubjectId",
                table: "AcademicPlanning_StudentSubject",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_AcademicPlanning_StudentSubjectTopic_StudentSubjectId",
                table: "AcademicPlanning_StudentSubjectTopic",
                column: "StudentSubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_AcademicPlanning_StudentSubjectTopic_TopicId",
                table: "AcademicPlanning_StudentSubjectTopic",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_AcademicPlanning_StudySession_StudentId",
                table: "AcademicPlanning_StudySession",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_AcademicPlanning_StudySession_SubjectId",
                table: "AcademicPlanning_StudySession",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_AcademicPlanning_Topic_SubjectId",
                table: "AcademicPlanning_Topic",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_AcademicPlanning_WeeklyStudyHour_StudentSubjectId",
                table: "AcademicPlanning_WeeklyStudyHour",
                column: "StudentSubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Audit_AuditLog_ActionId",
                table: "Audit_AuditLog",
                column: "ActionId");

            migrationBuilder.CreateIndex(
                name: "IX_Auth_Admin_UserId",
                table: "Auth_Admin",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Auth_Parent_UserId",
                table: "Auth_Parent",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Auth_Student_UserId",
                table: "Auth_Student",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Auth_StudentAdmin_AdminId",
                table: "Auth_StudentAdmin",
                column: "AdminId");

            migrationBuilder.CreateIndex(
                name: "IX_Auth_StudentParent_ParentId",
                table: "Auth_StudentParent",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_Auth_StudentTeacher_TeacherId",
                table: "Auth_StudentTeacher",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_Auth_Superuser_UserId",
                table: "Auth_Superuser",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Auth_Teacher_UserId",
                table: "Auth_Teacher",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Booking_TutorAvailability_TutorId",
                table: "Booking_TutorAvailability",
                column: "TutorId");

            migrationBuilder.CreateIndex(
                name: "IX_Booking_TutorStudent_StudentId",
                table: "Booking_TutorStudent",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Booking_TutorStudent_TutorId",
                table: "Booking_TutorStudent",
                column: "TutorId");

            migrationBuilder.CreateIndex(
                name: "IX_Calendar_Reminder_CalendarEventId",
                table: "Calendar_Reminder",
                column: "CalendarEventId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_AdminStudent_SchoolAdminId",
                table: "Entitlements_AdminStudent",
                column: "SchoolAdminId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_AdminStudent_StudentId",
                table: "Entitlements_AdminStudent",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_Assessment_StudentId",
                table: "Entitlements_Assessment",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_Assessment_SubjectId",
                table: "Entitlements_Assessment",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_AssessmentBreakdown_StudentSubjectId",
                table: "Entitlements_AssessmentBreakdown",
                column: "StudentSubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_Course_SubjectId",
                table: "Entitlements_Course",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_Course_TeacherId",
                table: "Entitlements_Course",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_Course_TutorId",
                table: "Entitlements_Course",
                column: "TutorId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_CourseEnrollment_CourseId",
                table: "Entitlements_CourseEnrollment",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_CourseEnrollment_StudentId",
                table: "Entitlements_CourseEnrollment",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_CourseModule_CourseId",
                table: "Entitlements_CourseModule",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_DiaryEntry_StudentId",
                table: "Entitlements_DiaryEntry",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_DiaryGoal_DiaryEntryId",
                table: "Entitlements_DiaryGoal",
                column: "DiaryEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_DiaryGoal_GoalId",
                table: "Entitlements_DiaryGoal",
                column: "GoalId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_DiaryMoodTracking_StudentId",
                table: "Entitlements_DiaryMoodTracking",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_FeaturePurchase_FeatureId",
                table: "Entitlements_FeaturePurchase",
                column: "FeatureId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_Goal_StudentId",
                table: "Entitlements_Goal",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_Goal_SubjectId",
                table: "Entitlements_Goal",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_GoalMilestone_GoalId",
                table: "Entitlements_GoalMilestone",
                column: "GoalId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_GradeDistribution_StudentSubjectId",
                table: "Entitlements_GradeDistribution",
                column: "StudentSubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_GrowthTracking_StudentId",
                table: "Entitlements_GrowthTracking",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_ImprovementTip_StudentSubjectId",
                table: "Entitlements_ImprovementTip",
                column: "StudentSubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_KnowledgeGap_StudentSubjectId",
                table: "Entitlements_KnowledgeGap",
                column: "StudentSubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_ModuleLesson_ModuleId",
                table: "Entitlements_ModuleLesson",
                column: "ModuleId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_ParentStudent_ParentId",
                table: "Entitlements_ParentStudent",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_ParentStudent_StudentId",
                table: "Entitlements_ParentStudent",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_PeerComparison_StudentSubjectId",
                table: "Entitlements_PeerComparison",
                column: "StudentSubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_PointsTransaction_RelatedGoalId",
                table: "Entitlements_PointsTransaction",
                column: "RelatedGoalId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_PointsTransaction_RelatedRewardId",
                table: "Entitlements_PointsTransaction",
                column: "RelatedRewardId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_PointsTransaction_StudentPointsId",
                table: "Entitlements_PointsTransaction",
                column: "StudentPointsId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_PredictionMetrics_StudentSubjectId",
                table: "Entitlements_PredictionMetrics",
                column: "StudentSubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_PrerequisiteMastery_StudentSubjectId",
                table: "Entitlements_PrerequisiteMastery",
                column: "StudentSubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_Resource_CourseId",
                table: "Entitlements_Resource",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_Resource_SubjectId",
                table: "Entitlements_Resource",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_Resource_TeacherId",
                table: "Entitlements_Resource",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_Resource_TutorId",
                table: "Entitlements_Resource",
                column: "TutorId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_ResourceDownload_ResourceId",
                table: "Entitlements_ResourceDownload",
                column: "ResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_ResourceDownload_StudentId",
                table: "Entitlements_ResourceDownload",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_RewardFeature_FeatureId",
                table: "Entitlements_RewardFeature",
                column: "FeatureId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_RewardFeature_RewardId",
                table: "Entitlements_RewardFeature",
                column: "RewardId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_RoleFeature_FeatureId",
                table: "Entitlements_RoleFeature",
                column: "FeatureId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_Student_AdminId",
                table: "Entitlements_Student",
                column: "AdminId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_StudentPoints_StudentId",
                table: "Entitlements_StudentPoints",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_StudentReward_GoalId",
                table: "Entitlements_StudentReward",
                column: "GoalId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_StudentReward_RewardId",
                table: "Entitlements_StudentReward",
                column: "RewardId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_StudentReward_StudentId",
                table: "Entitlements_StudentReward",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_StudentSubject_StudentId",
                table: "Entitlements_StudentSubject",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_StudentSubject_SubjectId",
                table: "Entitlements_StudentSubject",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_StudentSubjectAnalytics_StudentSubjectId",
                table: "Entitlements_StudentSubjectAnalytics",
                column: "StudentSubjectId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_StudentSubjectTopic_StudentSubjectId",
                table: "Entitlements_StudentSubjectTopic",
                column: "StudentSubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_StudentSubjectTopic_TopicId",
                table: "Entitlements_StudentSubjectTopic",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_StudySession_StudentId",
                table: "Entitlements_StudySession",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_StudySession_SubjectId",
                table: "Entitlements_StudySession",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_Teacher_AdminId",
                table: "Entitlements_Teacher",
                column: "AdminId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_TeacherAdmin_AdminId",
                table: "Entitlements_TeacherAdmin",
                column: "AdminId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_TeacherAdmin_TeacherId",
                table: "Entitlements_TeacherAdmin",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_TeacherStudent_StudentId",
                table: "Entitlements_TeacherStudent",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_TeacherStudent_TeacherId",
                table: "Entitlements_TeacherStudent",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_TeacherSubject_SubjectId",
                table: "Entitlements_TeacherSubject",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_TeacherSubject_TeacherId",
                table: "Entitlements_TeacherSubject",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_Topic_SubjectId",
                table: "Entitlements_Topic",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_TutorAvailability_TutorId",
                table: "Entitlements_TutorAvailability",
                column: "TutorId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_TutorStudent_StudentId",
                table: "Entitlements_TutorStudent",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_TutorStudent_TutorId",
                table: "Entitlements_TutorStudent",
                column: "TutorId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_TutorSubject_SubjectId",
                table: "Entitlements_TutorSubject",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_TutorSubject_TutorId",
                table: "Entitlements_TutorSubject",
                column: "TutorId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_UserFeature_FeatureId",
                table: "Entitlements_UserFeature",
                column: "FeatureId");

            migrationBuilder.CreateIndex(
                name: "IX_Entitlements_WeeklyStudyHour_StudentSubjectId",
                table: "Entitlements_WeeklyStudyHour",
                column: "StudentSubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_FeatureFlags_FeatureFlagEvaluation_FeatureFlagId",
                table: "FeatureFlags_FeatureFlagEvaluation",
                column: "FeatureFlagId");

            migrationBuilder.CreateIndex(
                name: "IX_FeatureFlags_FeatureFlagRule_FeatureFlagId",
                table: "FeatureFlags_FeatureFlagRule",
                column: "FeatureFlagId");

            migrationBuilder.CreateIndex(
                name: "IX_GoalReward_PotentialRewardsId",
                table: "GoalReward",
                column: "PotentialRewardsId");

            migrationBuilder.CreateIndex(
                name: "IX_GoalReward1_PotentialRewardsId",
                table: "GoalReward1",
                column: "PotentialRewardsId");

            migrationBuilder.CreateIndex(
                name: "IX_Goals_Goal_StudentId",
                table: "Goals_Goal",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Goals_Goal_SubjectId1",
                table: "Goals_Goal",
                column: "SubjectId1");

            migrationBuilder.CreateIndex(
                name: "IX_Goals_GoalMilestone_GoalId",
                table: "Goals_GoalMilestone",
                column: "GoalId");

            migrationBuilder.CreateIndex(
                name: "IX_Goals_GrowthTracking_StudentId",
                table: "Goals_GrowthTracking",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Goals_PointsTransaction_RelatedGoalId",
                table: "Goals_PointsTransaction",
                column: "RelatedGoalId");

            migrationBuilder.CreateIndex(
                name: "IX_Goals_PointsTransaction_RelatedRewardId",
                table: "Goals_PointsTransaction",
                column: "RelatedRewardId");

            migrationBuilder.CreateIndex(
                name: "IX_Goals_PointsTransaction_StudentPointsId",
                table: "Goals_PointsTransaction",
                column: "StudentPointsId");

            migrationBuilder.CreateIndex(
                name: "IX_Goals_RewardFeature_RewardId",
                table: "Goals_RewardFeature",
                column: "RewardId");

            migrationBuilder.CreateIndex(
                name: "IX_Goals_StudentPoints_StudentId",
                table: "Goals_StudentPoints",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Goals_StudentReward_GoalId",
                table: "Goals_StudentReward",
                column: "GoalId");

            migrationBuilder.CreateIndex(
                name: "IX_Goals_StudentReward_RewardId",
                table: "Goals_StudentReward",
                column: "RewardId");

            migrationBuilder.CreateIndex(
                name: "IX_Goals_StudentReward_StudentId",
                table: "Goals_StudentReward",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Insights_GradeDistribution_StudentSubjectId",
                table: "Insights_GradeDistribution",
                column: "StudentSubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Insights_ImprovementTip_StudentSubjectId",
                table: "Insights_ImprovementTip",
                column: "StudentSubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Insights_ImprovementTip_StudentSubjectTopicId",
                table: "Insights_ImprovementTip",
                column: "StudentSubjectTopicId");

            migrationBuilder.CreateIndex(
                name: "IX_Marketplace_Course_TutorId",
                table: "Marketplace_Course",
                column: "TutorId");

            migrationBuilder.CreateIndex(
                name: "IX_Marketplace_Course_UserId",
                table: "Marketplace_Course",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Marketplace_CourseEnrollment_CourseId",
                table: "Marketplace_CourseEnrollment",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Marketplace_CourseEnrollment_UserId1",
                table: "Marketplace_CourseEnrollment",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_Marketplace_CourseModule_CourseId",
                table: "Marketplace_CourseModule",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Marketplace_ModuleLesson_ModuleId",
                table: "Marketplace_ModuleLesson",
                column: "ModuleId");

            migrationBuilder.CreateIndex(
                name: "IX_Marketplace_Resource_CourseId",
                table: "Marketplace_Resource",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Marketplace_Resource_SubjectId1",
                table: "Marketplace_Resource",
                column: "SubjectId1");

            migrationBuilder.CreateIndex(
                name: "IX_Marketplace_Resource_TutorId",
                table: "Marketplace_Resource",
                column: "TutorId");

            migrationBuilder.CreateIndex(
                name: "IX_Marketplace_Resource_UserId1",
                table: "Marketplace_Resource",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_Marketplace_ResourceDownload_ResourceId",
                table: "Marketplace_ResourceDownload",
                column: "ResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_Marketplace_ResourceDownload_UserId1",
                table: "Marketplace_ResourceDownload",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_Marketplace_TutorAvailability_TutorId",
                table: "Marketplace_TutorAvailability",
                column: "TutorId");

            migrationBuilder.CreateIndex(
                name: "IX_Marketplace_TutorStudent_TutorId",
                table: "Marketplace_TutorStudent",
                column: "TutorId");

            migrationBuilder.CreateIndex(
                name: "IX_Marketplace_TutorSubject_SubjectId1",
                table: "Marketplace_TutorSubject",
                column: "SubjectId1");

            migrationBuilder.CreateIndex(
                name: "IX_Marketplace_TutorSubject_TutorId",
                table: "Marketplace_TutorSubject",
                column: "TutorId");

            migrationBuilder.CreateIndex(
                name: "IX_Mastery_KnowledgeGap_StudentSubjectId",
                table: "Mastery_KnowledgeGap",
                column: "StudentSubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Mastery_KnowledgeGap_TopicId",
                table: "Mastery_KnowledgeGap",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_Mastery_StudentSubjectAnalytics_StudentSubjectId",
                table: "Mastery_StudentSubjectAnalytics",
                column: "StudentSubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Mastery_StudentSubjectAnalytics_TopicId",
                table: "Mastery_StudentSubjectAnalytics",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_Mastery_TopicMastery_StudentSubjectId",
                table: "Mastery_TopicMastery",
                column: "StudentSubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Mastery_TopicMastery_TopicId1",
                table: "Mastery_TopicMastery",
                column: "TopicId1");

            migrationBuilder.CreateIndex(
                name: "IX_Moderation_ModerationAction_ContentReportId",
                table: "Moderation_ModerationAction",
                column: "ContentReportId");

            migrationBuilder.CreateIndex(
                name: "IX_RoleClaims_RoleId",
                schema: "Identity",
                table: "RoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                schema: "Identity",
                table: "Roles",
                column: "NormalizedName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Support_SupportCategory_ParentCategoryId",
                table: "Support_SupportCategory",
                column: "ParentCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Support_SupportMessage_TicketId",
                table: "Support_SupportMessage",
                column: "TicketId");

            migrationBuilder.CreateIndex(
                name: "IX_Support_SupportTicket_CategoryId",
                table: "Support_SupportTicket",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_UserClaims_UserId",
                schema: "Identity",
                table: "UserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserLogins_UserId",
                schema: "Identity",
                table: "UserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_RoleId",
                schema: "Identity",
                table: "UserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                schema: "Identity",
                table: "Users",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                schema: "Identity",
                table: "Users",
                column: "NormalizedUserName",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AcademicPlanning_Assessment");

            migrationBuilder.DropTable(
                name: "AcademicPlanning_AssessmentBreakdown");

            migrationBuilder.DropTable(
                name: "AcademicPlanning_ImprovementTip");

            migrationBuilder.DropTable(
                name: "AcademicPlanning_KnowledgeGap");

            migrationBuilder.DropTable(
                name: "AcademicPlanning_StudentSubjectTopic");

            migrationBuilder.DropTable(
                name: "AcademicPlanning_StudySession");

            migrationBuilder.DropTable(
                name: "AcademicPlanning_WeeklyStudyHour");

            migrationBuilder.DropTable(
                name: "Audit_AuditLog");

            migrationBuilder.DropTable(
                name: "Auth_StudentAdmin");

            migrationBuilder.DropTable(
                name: "Auth_StudentParent");

            migrationBuilder.DropTable(
                name: "Auth_StudentTeacher");

            migrationBuilder.DropTable(
                name: "Auth_Superuser");

            migrationBuilder.DropTable(
                name: "Booking_TutorAvailability");

            migrationBuilder.DropTable(
                name: "Booking_TutorStudent");

            migrationBuilder.DropTable(
                name: "Calendar_CalendarSync");

            migrationBuilder.DropTable(
                name: "Calendar_Reminder");

            migrationBuilder.DropTable(
                name: "Calendar_Student");

            migrationBuilder.DropTable(
                name: "Entitlements_AdminStudent");

            migrationBuilder.DropTable(
                name: "Entitlements_Assessment");

            migrationBuilder.DropTable(
                name: "Entitlements_AssessmentBreakdown");

            migrationBuilder.DropTable(
                name: "Entitlements_CourseEnrollment");

            migrationBuilder.DropTable(
                name: "Entitlements_DiaryGoal");

            migrationBuilder.DropTable(
                name: "Entitlements_DiaryMoodTracking");

            migrationBuilder.DropTable(
                name: "Entitlements_FeaturePurchase");

            migrationBuilder.DropTable(
                name: "Entitlements_GoalMilestone");

            migrationBuilder.DropTable(
                name: "Entitlements_GradeDistribution");

            migrationBuilder.DropTable(
                name: "Entitlements_GrowthTracking");

            migrationBuilder.DropTable(
                name: "Entitlements_ImprovementTip");

            migrationBuilder.DropTable(
                name: "Entitlements_KnowledgeGap");

            migrationBuilder.DropTable(
                name: "Entitlements_ModuleLesson");

            migrationBuilder.DropTable(
                name: "Entitlements_ParentStudent");

            migrationBuilder.DropTable(
                name: "Entitlements_PeerComparison");

            migrationBuilder.DropTable(
                name: "Entitlements_PointsTransaction");

            migrationBuilder.DropTable(
                name: "Entitlements_PredictionMetrics");

            migrationBuilder.DropTable(
                name: "Entitlements_PrerequisiteMastery");

            migrationBuilder.DropTable(
                name: "Entitlements_ResourceDownload");

            migrationBuilder.DropTable(
                name: "Entitlements_RewardFeature");

            migrationBuilder.DropTable(
                name: "Entitlements_RoleFeature");

            migrationBuilder.DropTable(
                name: "Entitlements_StudentReward");

            migrationBuilder.DropTable(
                name: "Entitlements_StudentSubjectAnalytics");

            migrationBuilder.DropTable(
                name: "Entitlements_StudentSubjectTopic");

            migrationBuilder.DropTable(
                name: "Entitlements_StudySession");

            migrationBuilder.DropTable(
                name: "Entitlements_TeacherAdmin");

            migrationBuilder.DropTable(
                name: "Entitlements_TeacherStudent");

            migrationBuilder.DropTable(
                name: "Entitlements_TeacherSubject");

            migrationBuilder.DropTable(
                name: "Entitlements_TutorAvailability");

            migrationBuilder.DropTable(
                name: "Entitlements_TutorStudent");

            migrationBuilder.DropTable(
                name: "Entitlements_TutorSubject");

            migrationBuilder.DropTable(
                name: "Entitlements_UserFeature");

            migrationBuilder.DropTable(
                name: "Entitlements_WeeklyStudyHour");

            migrationBuilder.DropTable(
                name: "FeatureFlags_FeatureFlagEvaluation");

            migrationBuilder.DropTable(
                name: "FeatureFlags_FeatureFlagRule");

            migrationBuilder.DropTable(
                name: "GoalReward");

            migrationBuilder.DropTable(
                name: "GoalReward1");

            migrationBuilder.DropTable(
                name: "Goals_GoalMilestone");

            migrationBuilder.DropTable(
                name: "Goals_GrowthTracking");

            migrationBuilder.DropTable(
                name: "Goals_PointsTransaction");

            migrationBuilder.DropTable(
                name: "Goals_RewardFeature");

            migrationBuilder.DropTable(
                name: "Goals_StudentReward");

            migrationBuilder.DropTable(
                name: "Insights_GradeDistribution");

            migrationBuilder.DropTable(
                name: "Insights_ImprovementTip");

            migrationBuilder.DropTable(
                name: "Marketplace_CourseEnrollment");

            migrationBuilder.DropTable(
                name: "Marketplace_ModuleLesson");

            migrationBuilder.DropTable(
                name: "Marketplace_ResourceDownload");

            migrationBuilder.DropTable(
                name: "Marketplace_TutorAvailability");

            migrationBuilder.DropTable(
                name: "Marketplace_TutorStudent");

            migrationBuilder.DropTable(
                name: "Marketplace_TutorSubject");

            migrationBuilder.DropTable(
                name: "Mastery_KnowledgeGap");

            migrationBuilder.DropTable(
                name: "Mastery_StudentSubjectAnalytics");

            migrationBuilder.DropTable(
                name: "Mastery_TopicMastery");

            migrationBuilder.DropTable(
                name: "Moderation_ContentFilter");

            migrationBuilder.DropTable(
                name: "Moderation_ModerationAction");

            migrationBuilder.DropTable(
                name: "Practice_AnswerSubmission");

            migrationBuilder.DropTable(
                name: "Practice_AttemptScoreSummary");

            migrationBuilder.DropTable(
                name: "Practice_GeneratedTest");

            migrationBuilder.DropTable(
                name: "Practice_PracticeAttempt");

            migrationBuilder.DropTable(
                name: "Practice_PracticeAttemptItem");

            migrationBuilder.DropTable(
                name: "Practice_PracticeTest");

            migrationBuilder.DropTable(
                name: "Practice_Student");

            migrationBuilder.DropTable(
                name: "Practice_Subject");

            migrationBuilder.DropTable(
                name: "Practice_Topic");

            migrationBuilder.DropTable(
                name: "RoleClaims",
                schema: "Identity");

            migrationBuilder.DropTable(
                name: "Support_Student");

            migrationBuilder.DropTable(
                name: "Support_SupportMessage");

            migrationBuilder.DropTable(
                name: "UserClaims",
                schema: "Identity");

            migrationBuilder.DropTable(
                name: "UserLogins",
                schema: "Identity");

            migrationBuilder.DropTable(
                name: "UserRoles",
                schema: "Identity");

            migrationBuilder.DropTable(
                name: "UserTokens",
                schema: "Identity");

            migrationBuilder.DropTable(
                name: "Wellbeing_DiaryEntry");

            migrationBuilder.DropTable(
                name: "Wellbeing_DiaryGoal");

            migrationBuilder.DropTable(
                name: "Wellbeing_MoodTracking");

            migrationBuilder.DropTable(
                name: "Wellbeing_Student");

            migrationBuilder.DropTable(
                name: "AcademicPlanning_Topic");

            migrationBuilder.DropTable(
                name: "AcademicPlanning_StudentSubject");

            migrationBuilder.DropTable(
                name: "Audit_AuditAction");

            migrationBuilder.DropTable(
                name: "Auth_Admin");

            migrationBuilder.DropTable(
                name: "Auth_Parent");

            migrationBuilder.DropTable(
                name: "Auth_Student");

            migrationBuilder.DropTable(
                name: "Auth_Teacher");

            migrationBuilder.DropTable(
                name: "Booking_Student");

            migrationBuilder.DropTable(
                name: "Booking_Tutor");

            migrationBuilder.DropTable(
                name: "Calendar_CalendarEvent");

            migrationBuilder.DropTable(
                name: "Entitlements_DiaryEntry");

            migrationBuilder.DropTable(
                name: "Entitlements_CourseModule");

            migrationBuilder.DropTable(
                name: "Entitlements_Parent");

            migrationBuilder.DropTable(
                name: "Entitlements_StudentPoints");

            migrationBuilder.DropTable(
                name: "Entitlements_Resource");

            migrationBuilder.DropTable(
                name: "Entitlements_Topic");

            migrationBuilder.DropTable(
                name: "Entitlements_Feature");

            migrationBuilder.DropTable(
                name: "Entitlements_StudentSubject");

            migrationBuilder.DropTable(
                name: "FeatureFlags_FeatureFlag");

            migrationBuilder.DropTable(
                name: "Entitlements_Goal");

            migrationBuilder.DropTable(
                name: "Entitlements_Reward");

            migrationBuilder.DropTable(
                name: "Goals_StudentPoints");

            migrationBuilder.DropTable(
                name: "Goals_Goal");

            migrationBuilder.DropTable(
                name: "Goals_Reward");

            migrationBuilder.DropTable(
                name: "Insights_StudentSubjectTopic");

            migrationBuilder.DropTable(
                name: "Insights_StudentSubject");

            migrationBuilder.DropTable(
                name: "Marketplace_CourseModule");

            migrationBuilder.DropTable(
                name: "Marketplace_Resource");

            migrationBuilder.DropTable(
                name: "Mastery_StudentSubjectTopic");

            migrationBuilder.DropTable(
                name: "Mastery_StudentSubject");

            migrationBuilder.DropTable(
                name: "Moderation_ContentReport");

            migrationBuilder.DropTable(
                name: "Support_SupportTicket");

            migrationBuilder.DropTable(
                name: "Roles",
                schema: "Identity");

            migrationBuilder.DropTable(
                name: "AcademicPlanning_StudentSubjectAnalytics");

            migrationBuilder.DropTable(
                name: "AcademicPlanning_Student");

            migrationBuilder.DropTable(
                name: "AcademicPlanning_Subject");

            migrationBuilder.DropTable(
                name: "Users",
                schema: "Identity");

            migrationBuilder.DropTable(
                name: "Entitlements_Course");

            migrationBuilder.DropTable(
                name: "Entitlements_Student");

            migrationBuilder.DropTable(
                name: "Goals_Student");

            migrationBuilder.DropTable(
                name: "Goals_Subject");

            migrationBuilder.DropTable(
                name: "Marketplace_Course");

            migrationBuilder.DropTable(
                name: "Marketplace_Subject");

            migrationBuilder.DropTable(
                name: "Support_SupportCategory");

            migrationBuilder.DropTable(
                name: "Entitlements_Subject");

            migrationBuilder.DropTable(
                name: "Entitlements_Teacher");

            migrationBuilder.DropTable(
                name: "Entitlements_Tutor");

            migrationBuilder.DropTable(
                name: "Marketplace_Tutor");

            migrationBuilder.DropTable(
                name: "Marketplace_User");

            migrationBuilder.DropTable(
                name: "Entitlements_Admin");
        }
    }
}
