using Aptiverse.AI.Core;
using Aptiverse.Api.Data;
using Aptiverse.Practice.Domain.Models.Practice;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Practice.Application.Practice.Services
{
    // Drains practice.practice_generation_jobs, running the Anthropic calls off
    // the request path. Follows the same shape as OutboxDispatcher and
    // SubscriptionScheduleService: a BackgroundService that opens a fresh scope
    // per tick via IServiceScopeFactory rather than capturing a scoped
    // ApplicationDbContext for its lifetime.
    //
    // Each tick does two things:
    //   1. releases claims that have gone stale (a killed process leaves a job
    //      sitting in "running" forever otherwise);
    //   2. claims the oldest queued job and generates it.
    //
    // Delivery is at-least-once, deliberately. A job is claimed before the
    // model calls start, so a crash mid-generation re-runs it after the stale
    // sweep. The re-run costs Anthropic tokens but never costs the student a
    // second generation: the practice.generate quota is consumed once, at
    // enqueue time, in PracticeController.
    public sealed class PracticeGenerationWorker(
        IServiceScopeFactory scopeFactory,
        ILogger<PracticeGenerationWorker> logger) : BackgroundService
    {
        // How many generations may run at once.
        //
        // ONE. This is deliberate and it is not a placeholder. Production is a
        // free-tier t3.micro: two burstable vCPUs with a ~10% sustained CPU
        // baseline, and 1 GiB of RAM shared between this process, Redis and
        // Docker. A single generation is four to six Anthropic round trips
        // whose responses are parsed, canonicalised and written as jsonb; two
        // of them in parallel doubles the peak working set on a box that has no
        // headroom for it and drains the CPU credit balance that keeps every
        // other request fast. Practice generation is a background convenience,
        // not a latency-critical path, so it queues rather than competes.
        //
        // Raise this only when the instance is bigger, and raise it in step
        // with measured memory, not optimistically.
        private const int MaxConcurrentGenerations = 1;

        // How often to look for queued work. Fast enough that a student sees
        // "running" almost immediately, slow enough to be a rounding error on
        // the CPU baseline when the queue is empty.
        private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(3);

        // A claim older than this is presumed dead and released. Generous,
        // because a 150-mark paper legitimately takes minutes; anything past it
        // is a killed process or a wedged HTTP call, not slow work.
        private static readonly TimeSpan StaleClaimAfter = TimeSpan.FromMinutes(10);

        // Hard ceiling on one attempt, so a hung upstream call cannot occupy
        // the single generation slot until the stale sweep notices.
        private static readonly TimeSpan GenerationTimeout = TimeSpan.FromMinutes(5);

        // Total attempts before a job is failed for good. Two, not five: a
        // retry is worth having for a dropped connection or a 529 from
        // Anthropic, and past that the student is better served by an honest
        // error than by a queue that keeps spending tokens on their behalf.
        private const int MaxAttempts = 2;

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation(
                "PracticeGenerationWorker started: {Max} generation at a time, polling every {Seconds}s.",
                MaxConcurrentGenerations, PollInterval.TotalSeconds);

            // On a cold start, anything left "running" belongs to the process
            // that just died. Release it before taking new work.
            try
            {
                await ReleaseStaleClaimsAsync(TimeSpan.Zero, stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "PracticeGenerationWorker startup sweep failed.");
            }

            using var timer = new PeriodicTimer(PollInterval);
            do
            {
                try
                {
                    await ReleaseStaleClaimsAsync(StaleClaimAfter, stoppingToken);

                    // MaxConcurrentGenerations is 1, so this is one job per
                    // tick. The loop is written against the constant rather
                    // than hard-coding the single job, so raising the constant
                    // on a bigger box is the only change needed.
                    for (var i = 0; i < MaxConcurrentGenerations; i++)
                    {
                        if (!await RunNextJobAsync(stoppingToken)) break;
                    }
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    // Never let one bad tick kill the loop.
                    logger.LogError(ex, "PracticeGenerationWorker tick failed; will retry next tick.");
                }
            } while (await SafeWaitAsync(timer, stoppingToken));

            logger.LogInformation("PracticeGenerationWorker stopping.");
        }

        private static async Task<bool> SafeWaitAsync(PeriodicTimer timer, CancellationToken ct)
        {
            try
            {
                return await timer.WaitForNextTickAsync(ct);
            }
            catch (OperationCanceledException)
            {
                return false;
            }
        }

        // Puts jobs whose claim has gone stale back on the queue, or fails them
        // when they are out of attempts. This is what stops a crashed or
        // restarted process leaving a student staring at a job that says
        // "running" and never moves again.
        private async Task ReleaseStaleClaimsAsync(TimeSpan olderThan, CancellationToken ct)
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var cutoff = DateTime.UtcNow - olderThan;
            var stale = await db.Set<PracticeGenerationJob>()
                .Where(j => j.Status == PracticeGenerationStatus.Running
                    && (j.ClaimedAt == null || j.ClaimedAt <= cutoff))
                .ToListAsync(ct);
            if (stale.Count == 0) return;

            var now = DateTime.UtcNow;
            foreach (var job in stale)
            {
                if (job.Attempts >= MaxAttempts)
                {
                    job.Status = PracticeGenerationStatus.Failed;
                    job.Error = "Generation stopped unexpectedly. Please try again.";
                    job.FinishedAt = now;
                    job.ClaimedAt = null;
                    logger.LogWarning(
                        "Generation job {JobId} failed after {Attempts} interrupted attempt(s).",
                        job.Id, job.Attempts);
                }
                else
                {
                    job.Status = PracticeGenerationStatus.Queued;
                    job.ClaimedAt = null;
                    logger.LogWarning(
                        "Generation job {JobId} had a stale claim; requeued (attempt {Attempts} of {Max}).",
                        job.Id, job.Attempts, MaxAttempts);
                }
            }

            await db.SaveChangesAsync(ct);
        }

        // Claims and runs the oldest queued job. Returns false when there was
        // nothing to do.
        private async Task<bool> RunNextJobAsync(CancellationToken ct)
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var candidateId = await db.Set<PracticeGenerationJob>().AsNoTracking()
                .Where(j => j.Status == PracticeGenerationStatus.Queued)
                .OrderBy(j => j.Id)
                .Select(j => (long?)j.Id)
                .FirstOrDefaultAsync(ct);
            if (candidateId is null) return false;

            // Claim with a conditional UPDATE rather than a read-then-write, so
            // two hosts (or a host and a stale sweep) cannot both take the same
            // row. Zero rows affected means somebody else got there first.
            var now = DateTime.UtcNow;
            var claimed = await db.Set<PracticeGenerationJob>()
                .Where(j => j.Id == candidateId && j.Status == PracticeGenerationStatus.Queued)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(j => j.Status, PracticeGenerationStatus.Running)
                    .SetProperty(j => j.ClaimedAt, now)
                    .SetProperty(j => j.StartedAt, j => j.StartedAt ?? now)
                    .SetProperty(j => j.Attempts, j => j.Attempts + 1)
                    .SetProperty(j => j.UpdatedAt, now), ct);
            if (claimed == 0) return false;

            var job = await db.Set<PracticeGenerationJob>()
                .FirstOrDefaultAsync(j => j.Id == candidateId, ct);
            if (job is null) return false;

            var generator = scope.ServiceProvider.GetRequiredService<IPracticeTestGenerator>();

            // The job's own deadline. Linked to the host token so shutdown
            // still cancels promptly.
            using var timeout = CancellationTokenSource.CreateLinkedTokenSource(ct);
            timeout.CancelAfter(GenerationTimeout);

            var startedAt = DateTime.UtcNow;
            try
            {
                var testId = await generator.GenerateAsync(job, timeout.Token);

                job.Status = PracticeGenerationStatus.Succeeded;
                job.PracticeTestId = testId;
                job.Error = null;
                job.FinishedAt = DateTime.UtcNow;
                job.ClaimedAt = null;
                await db.SaveChangesAsync(ct);

                logger.LogInformation(
                    "Generation job {JobId} produced test {TestId} in {Seconds:0.0}s ({Format}).",
                    job.Id, testId, (DateTime.UtcNow - startedAt).TotalSeconds, job.Format);
                return true;
            }
            catch (OperationCanceledException) when (ct.IsCancellationRequested)
            {
                // Host shutdown. Leave the claim in place: the startup sweep on
                // the next boot releases it and the job runs again.
                logger.LogInformation("Generation job {JobId} interrupted by shutdown; will resume.", job.Id);
                return false;
            }
            catch (Exception ex)
            {
                var message = ex switch
                {
                    OperationCanceledException =>
                        "Generation took too long and was stopped. Please try again.",
                    PracticeGenerationFailedException f => f.Message,
                    AnthropicException =>
                        "The generator had trouble. Please try again.",
                    _ => "Something went wrong while writing your test. Please try again.",
                };

                // Out of attempts is a real failure the student must be told
                // about. Otherwise requeue and let the next tick try again.
                if (job.Attempts >= MaxAttempts)
                {
                    job.Status = PracticeGenerationStatus.Failed;
                    job.Error = message;
                    job.FinishedAt = DateTime.UtcNow;
                    job.ClaimedAt = null;
                    logger.LogWarning(ex,
                        "Generation job {JobId} failed after {Attempts} attempt(s).", job.Id, job.Attempts);
                }
                else
                {
                    job.Status = PracticeGenerationStatus.Queued;
                    job.Error = null;
                    job.ClaimedAt = null;
                    logger.LogWarning(ex,
                        "Generation job {JobId} attempt {Attempts} failed; requeued.", job.Id, job.Attempts);
                }

                await db.SaveChangesAsync(ct);
                return true;
            }
        }
    }
}
