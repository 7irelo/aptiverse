using Aptiverse.Academics.Contracts;
using Aptiverse.Identity.Contracts;
using Aptiverse.Practice.Contracts;
using Aptiverse.Progress.Contracts;
using Aptiverse.Progress.Erasure;
using Aptiverse.Progress.Evidence;
using Aptiverse.Progress.Goals;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.Progress.Messaging;

// Wolverine handlers of the Progress module. They are public only because Wolverine generates code against them;
// each one resolves the internal service that does the work from a fresh scope, because Wolverine cannot inject
// internal types into a public handler. Every one is safe to run more than once for the same message.

/// <summary>Mastery observations, practice result and goal progress from a graded practice attempt.</summary>
public static class ProgressPracticeAttemptGradedHandler
{
    public static async Task HandleAsync(PracticeAttemptGraded message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<EvidenceIngestor>().OnPracticeGradedAsync(message, cancellationToken);
    }
}

/// <summary>A recorded or changed assessment mark: whole-unit mastery and mark and submission goals.</summary>
public static class ProgressAssessmentGradedHandler
{
    public static async Task HandleAsync(AssessmentGraded message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<EvidenceIngestor>().OnAssessmentGradedAsync(message, cancellationToken);
    }
}

/// <summary>An assessment submitted: submission count goals.</summary>
public static class ProgressAssessmentSubmittedHandler
{
    public static async Task HandleAsync(AssessmentSubmitted message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<EvidenceIngestor>().OnAssessmentSubmittedAsync(message, cancellationToken);
    }
}

/// <summary>A mark removed: its mastery evidence is superseded and goals re-measured.</summary>
public static class ProgressAssessmentMarkRemovedHandler
{
    public static async Task HandleAsync(AssessmentMarkRemoved message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<EvidenceIngestor>().OnAssessmentMarkRemovedAsync(message, cancellationToken);
    }
}

/// <summary>An assessment deleted: it no longer counts toward mastery or goals.</summary>
public static class ProgressAssessmentDeletedHandler
{
    public static async Task HandleAsync(AssessmentDeleted message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<EvidenceIngestor>().OnAssessmentDeletedAsync(message, cancellationToken);
    }
}

/// <summary>Expires a goal at its due date.</summary>
public static class ExpireProgressGoalHandler
{
    public static async Task HandleAsync(ExpireProgressGoal message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<GoalExpirer>().ExpireAsync(message, cancellationToken);
    }
}

/// <summary>Erases the user's progress data when they ask for their account to be deleted (POPIA).</summary>
public static class ProgressAccountDeletionRequestedHandler
{
    public static async Task HandleAsync(AccountDeletionRequested message, IServiceScopeFactory scopes, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentNullException.ThrowIfNull(scopes);
        await using var scope = scopes.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<ProgressUserDataEraser>().EraseAsync(message.UserId, cancellationToken);
    }
}
