using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Features.Common;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Identity.Features.SaveOnboardingDetails;

/// <summary>
/// Draft step: saves the details present for the stored level. After onboarding is complete the same call edits the
/// profile, and a change to grade, exam body or study level publishes StudentStageChanged.
/// </summary>
internal sealed partial class SaveOnboardingDetailsHandler(
    ProfileStore store,
    IClock clock,
    ILogger<SaveOnboardingDetailsHandler> logger)
{
    public async Task<Result<Versioned<OnboardingState>>> HandleAsync(
        Guid userId,
        SaveOnboardingDetailsRequest request,
        string? ifMatch,
        RequestInfo origin,
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

        if (user.EducationLevel is not { } level)
        {
            return IdentityErrors.LevelNotSet;
        }

        if (Onboarding.StageMismatch(level, request.Grade, request.Curriculum, request.StudyLevel, request.Programme) is { } mismatch)
        {
            return mismatch;
        }

        var dobWasMissing = user.DateOfBirth is null;
        if (request.DateOfBirth is { } dob && !user.SetDateOfBirth(dob))
        {
            return IdentityErrors.DateOfBirthAlreadySet;
        }

        if (dobWasMissing && user.DateOfBirth is not null)
        {
            store.Db.SecurityEvents.Add(SecurityEvent.Create(SecurityEventTypes.DateOfBirthSet, user.Id, null, origin, "Onboarding."));
        }

        var before = (user.Grade, user.Curriculum, user.StudyLevel);
        user.SaveOnboardingDraft(new OnboardingDetails(request.Grade, request.Curriculum, request.StudyLevel, request.Programme, request.InstitutionName));
        if (user.OnboardingCompletedAt is not null && before != (user.Grade, user.Curriculum, user.StudyLevel))
        {
            await store.Outbox.PublishAsync(new StudentStageChanged(
                user.Id, level, user.Grade, user.YearOfStudy, user.StudyLevel, user.Curriculum, clock.UtcNow));
        }

        var saved = await store.SaveAsync(cancellationToken);
        if (saved.IsFailure)
        {
            return saved.Error!;
        }

        LogSaved(logger, user.Id, level, user.Grade, user.StudyLevel, user.Curriculum);
        return new Versioned<OnboardingState>(Onboarding.State(user, adultConfirmed: false), store.ETagOf(user));
    }

    [LoggerMessage(
        Level = LogLevel.Information,
        Message = "User {UserId} saved onboarding details: {EducationLevel}, grade {Grade}, study level {StudyLevel}, curriculum {Curriculum}")]
    private static partial void LogSaved(ILogger logger, Guid userId, string educationLevel, int? grade, string? studyLevel, string? curriculum);
}
