using Aptiverse.Affiliates.Domain.Models;
using Aptiverse.Api.Data;
using Aptiverse.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Affiliates.Application.Services
{
    // Two jobs, one timer, because both are cheap and neither wants its own
    // process:
    //
    //   1. Release matured holds. A commission that has sat out its 30 days
    //      without a refund arriving becomes payable.
    //
    //   2. Backfill referral codes. Every account gets one, including the ones
    //      that existed before this programme did and the ones created through
    //      OAuth, which never touch the email registration path. Doing it here
    //      rather than in the auth flow means no signup can fail because code
    //      minting had a bad day.
    public class AffiliateMaintenanceService(
        IServiceProvider services,
        ILogger<AffiliateMaintenanceService> logger) : BackgroundService
    {
        private static readonly TimeSpan Interval = TimeSpan.FromMinutes(10);

        // Backfill in batches so a large user table does not turn one tick
        // into a long transaction.
        private const int BackfillBatchSize = 200;

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation(
                "AffiliateMaintenanceService started: releasing matured holds and backfilling referral codes every {Min} min.",
                Interval.TotalMinutes);

            using var timer = new PeriodicTimer(Interval);
            try
            {
                do
                {
                    try
                    {
                        await TickAsync(stoppingToken);
                    }
                    catch (OperationCanceledException)
                    {
                        break;
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex, "AffiliateMaintenanceService tick failed; will retry next tick.");
                    }
                } while (await timer.WaitForNextTickAsync(stoppingToken));
            }
            catch (OperationCanceledException)
            {
                // Shutdown. WaitForNextTickAsync throws rather than returning
                // false when the token trips, and the host treats an unhandled
                // exception out of a BackgroundService as a reason to kill the
                // whole process. Swallowing it here is the difference between
                // a clean stop and a stop that looks like a crash.
            }

            logger.LogInformation("AffiliateMaintenanceService stopping.");
        }

        private async Task TickAsync(CancellationToken ct)
        {
            using var scope = services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var affiliates = scope.ServiceProvider.GetRequiredService<IAffiliateService>();

            await affiliates.ReleaseMaturedHoldsAsync(ct);

            var missing = await db.Set<User>().AsNoTracking()
                .Where(u => !db.Set<Affiliate>().Any(a => a.UserId == u.Id))
                .Select(u => u.Id)
                .Take(BackfillBatchSize)
                .ToListAsync(ct);

            foreach (var userId in missing)
            {
                try
                {
                    await affiliates.EnsureAffiliateAsync(userId, ct: ct);
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Could not mint a referral code for user {User}.", userId);
                }
            }

            if (missing.Count > 0)
            {
                logger.LogInformation("Referral codes backfilled for {Count} accounts.", missing.Count);
            }
        }
    }
}
