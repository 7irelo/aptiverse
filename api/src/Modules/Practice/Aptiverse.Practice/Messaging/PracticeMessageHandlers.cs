using Aptiverse.Identity.Contracts;
using Aptiverse.Practice.Contracts;
using Aptiverse.Practice.Erasure;
using Aptiverse.Practice.Generation;
using Aptiverse.Practice.Grading;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.Practice.Messaging;

// Wolverine handlers of the Practice module. They are public only because Wolverine generates code against them;
// each one resolves the internal service that does the work from a fresh scope, because Wolverine cannot inject
// internal types into a public handler. Retries of ai calls are explicit in those services (counted on the row and
// rescheduled), so a final failure always leaves the job or attempt in a clear state instead of a dead letter.

/// <summary>Starts a queued generation job on the ai service.</summary>
public static class StartPracticeGenerationHandler
{
    public static async Task HandleAsync(StartPracticeGeneration message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<GenerationRunner>().StartAsync(message.JobId, cancellationToken);
    }
}

/// <summary>Reads a running generation job's status; see IGenerationWatcher for the planned SQS replacement.</summary>
public static class PollPracticeGenerationHandler
{
    public static async Task HandleAsync(PollPracticeGeneration message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<GenerationPoller>().PollAsync(message.JobId, cancellationToken);
    }
}

/// <summary>Submits a timed attempt at its deadline plus the network grace.</summary>
public static class AutoSubmitPracticeAttemptHandler
{
    public static async Task HandleAsync(AutoSubmitPracticeAttempt message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<AutoSubmitter>().RunAsync(message, cancellationToken);
    }
}

/// <summary>Marks the written answers of a submitted attempt.</summary>
public static class GradePracticeAttemptHandler
{
    public static async Task HandleAsync(GradePracticeAttempt message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<WrittenGrader>().GradeAsync(message.AttemptId, cancellationToken);
    }
}

/// <summary>Erases the user's practice data when they ask for their account to be deleted (POPIA).</summary>
public static class AccountDeletionRequestedHandler
{
    public static async Task HandleAsync(AccountDeletionRequested message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<PracticeUserDataEraser>().EraseAsync(message.UserId, cancellationToken);
    }
}
