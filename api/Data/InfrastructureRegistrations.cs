// Single point of infrastructure DI wire-up. Replaces the 15 per-module
// Infrastructure/Registrations.cs files that each tried to register Redis +
// their own DbContext + their own Repository<T>.

using Aptiverse.Api.Data.Email;
using Aptiverse.Core.Services;
using Aptiverse.Domain.Interfaces;
using Aptiverse.Domain.Models;
using Aptiverse.Infrastructure.Repositories;
using Aptiverse.Infrastructure.Services;
using Aptiverse.Infrastructure.Utilities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace Aptiverse.Api.Data
{
    public static class InfrastructureRegistrations
    {
        public static IServiceCollection AddInfrastructureServices(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            // Unified Postgres-backed DbContext. Migrations live in
            // api/Aptiverse.Api/Migrations/ — the host assembly itself.
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(
                    configuration.GetConnectionString("DefaultConnection"),
                    b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName))
                       .UseSnakeCaseNamingConvention()
                       .EnableSensitiveDataLogging()
                       .EnableDetailedErrors());

            services.AddIdentity<User, IdentityRole>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireNonAlphanumeric = true;
                options.Password.RequireUppercase = true;
                options.Password.RequiredLength = 8;
                options.Password.RequiredUniqueChars = 1;

                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.AllowedForNewUsers = true;

                options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
                options.User.RequireUniqueEmail = true;

                options.SignIn.RequireConfirmedEmail = false;
                options.SignIn.RequireConfirmedPhoneNumber = false;
            })
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

            services.AddRedisServices(configuration);

            services.Configure<EmailSettings>(configuration.GetSection("EmailSettings"));

            // In-process email pipeline. EmailSender (scoped) enqueues
            // EmailJob items. EmailDispatcher (BackgroundService) drains
            // the queue and sends via SMTP — set EmailSettings:Server to
            // email-smtp.{region}.amazonaws.com plus SES SMTP credentials.
            services.AddSingleton<EmailQueue>();
            services.AddHostedService<EmailDispatcher>();

            // Auth's repository contract (Aptiverse.Domain.Interfaces.IRepository<T>).
            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

            // Each domain module declares its own IRepository<T>/Repository<T>
            // pair under module-specific namespaces. Register all 14 here so
            // module Application services can resolve them.
            services.AddScoped(typeof(Aptiverse.AcademicPlanning.Domain.Repositories.IRepository<>),
                               typeof(Aptiverse.AcademicPlanning.Infrastructure.Repositories.Repository<>));
            services.AddScoped(typeof(Aptiverse.Audit.Domain.Repositories.IRepository<>),
                               typeof(Aptiverse.Audit.Infrastructure.Repositories.Repository<>));
            services.AddScoped(typeof(Aptiverse.Booking.Domain.Repositories.IRepository<>),
                               typeof(Aptiverse.Booking.Infrastructure.Repositories.Repository<>));
            services.AddScoped(typeof(Aptiverse.Calendar.Domain.Repositories.IRepository<>),
                               typeof(Aptiverse.Calendar.Infrastructure.Repositories.Repository<>));
            // Entitlements: no generic repository — EntitlementService talks
            // to ApplicationDbContext directly. (The pre-modulith generic
            // Repository<> was removed with the legacy module wipe.)
            services.AddScoped(typeof(Aptiverse.FeatureFlags.Domain.Repositories.IRepository<>),
                               typeof(Aptiverse.FeatureFlags.Infrastructure.Repositories.Repository<>));
            services.AddScoped(typeof(Aptiverse.Goals.Domain.Repositories.IRepository<>),
                               typeof(Aptiverse.Goals.Infrastructure.Repositories.Repository<>));
            services.AddScoped(typeof(Aptiverse.Insights.Domain.Repositories.IRepository<>),
                               typeof(Aptiverse.Insights.Infrastructure.Repositories.Repository<>));
            services.AddScoped(typeof(Aptiverse.Marketplace.Domain.Repositories.IRepository<>),
                               typeof(Aptiverse.Marketplace.Infrastructure.Repositories.Repository<>));
            services.AddScoped(typeof(Aptiverse.Mastery.Domain.Repositories.IRepository<>),
                               typeof(Aptiverse.Mastery.Infrastructure.Repositories.Repository<>));
            services.AddScoped(typeof(Aptiverse.Moderation.Domain.Repositories.IRepository<>),
                               typeof(Aptiverse.Moderation.Infrastructure.Repositories.Repository<>));
            services.AddScoped(typeof(Aptiverse.Practice.Domain.Repositories.IRepository<>),
                               typeof(Aptiverse.Practice.Infrastructure.Repositories.Repository<>));
            services.AddScoped(typeof(Aptiverse.Support.Domain.Repositories.IRepository<>),
                               typeof(Aptiverse.Support.Infrastructure.Repositories.Repository<>));
            services.AddScoped(typeof(Aptiverse.Wellbeing.Domain.Repositories.IRepository<>),
                               typeof(Aptiverse.Wellbeing.Infrastructure.Repositories.Repository<>));
            services.AddScoped<ITokenProvider, TokenProvider>();
            services.AddScoped<ITokenStorageService, RedisTokenStorageService>();
            services.AddScoped<IEmailSender, EmailSender>();
            services.AddScoped<
                Aptiverse.Notifications.Application.Services.INotificationService,
                Aptiverse.Notifications.Application.Services.NotificationService>();
            // Assessment upload storage. Local-disk for v1 — files land
            // under AssessmentUploads:RootPath (./uploads by default).
            // Swap to S3 by registering a different implementation here
            // when usage justifies the migration.
            services.AddSingleton<
                Aptiverse.AcademicPlanning.Application.Storage.IAssessmentUploadStorage,
                Aptiverse.AcademicPlanning.Infrastructure.Storage.LocalDiskAssessmentUploadStorage>();
            services.AddMemoryCache();

            return services;
        }

        private static IServiceCollection AddRedisServices(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            var redisConnectionString =
                configuration.GetConnectionString("Redis") ?? "localhost:6379,abortConnect=false";

            services.AddSingleton<IConnectionMultiplexer>(sp =>
            {
                var config = ConfigurationOptions.Parse(redisConnectionString);
                config.AbortOnConnectFail = false;
                config.ConnectRetry = 3;
                config.ConnectTimeout = 5000;
                config.SyncTimeout = 5000;
                var logger = sp.GetRequiredService<ILogger<ConnectionMultiplexer>>();
                logger.LogInformation("Connecting to Redis: {RedisConnection}", redisConnectionString);
                return ConnectionMultiplexer.Connect(config);
            });

            services.AddTransient<IDatabase>(sp =>
                sp.GetRequiredService<IConnectionMultiplexer>().GetDatabase());

            services.AddHealthChecks().AddRedis(redisConnectionString, name: "redis");
            return services;
        }
    }
}
