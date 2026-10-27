using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Features.Common;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Identity.Features.SetEducationLevel;

/// <summary>
/// Draft step: the student picks high school or tertiary. Switching clears the other stage's details. Before
/// onboarding is complete nothing is published; after it, a switch publishes StudentStageChanged so Academics can
/// flag enrolments of the other kind.
/// </summary>
internal sealed partial class SetEducationLevelHandler(ProfileStore store, IClock clock, ILogger<SetEducationLevelHandler> logger)
{
    public async Task<Result<Versioned<OnboardingState>>> HandleAsync(
        Guid userId,
        SetEducationLevelRequest request,
        string? ifMatch,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var loaded = await store.LoadAsync(userId, ifMatch, cancellationToken);
        if (loaded.IsFailure)
        {
            return loaded.Error!;
        }

        var user = loaded.Value;
        if (!user.IsStudent)
        {
            return IdentityErrors.OnboardingStudentsOnly;
        }

        if (user.SetEducationLevel(request.EducationLevel) && user.OnboardingCompletedAt is not null)
        {
            await store.Outbox.PublishAsync(new StudentStageChanged(
                user.Id, request.EducationLevel, user.Grade, user.YearOfStudy, user.StudyLevel, user.Curriculum, clock.UtcNow));
        }

        var saved = await store.SaveAsync(cancellationToken);
        if (saved.IsFailure)
        {
            return saved.Error!;
        }

        LogLevelSet(logger, user.Id, request.EducationLevel);
        return new Versioned<OnboardingState>(Onboarding.State(user, adultConfirmed: false), store.ETagOf(user));
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} set education level {EducationLevel}")]
    private static partial void LogLevelSet(ILogger logger, Guid userId, string educationLevel);
}
