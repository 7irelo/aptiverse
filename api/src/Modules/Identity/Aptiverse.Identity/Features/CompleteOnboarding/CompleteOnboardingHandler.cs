using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Features.Common;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Identity.Features.CompleteOnboarding;

/// <summary>
/// Completes onboarding in one transaction: merges the body over the saved draft, requires a complete profile for
/// the role, and publishes UserOnboarded once. A repeated call returns the same completedAt; later edits go through
/// the draft steps or the profile.
/// </summary>
internal sealed partial class CompleteOnboardingHandler(
    ProfileStore store,
    IClock clock,
    ILogger<CompleteOnboardingHandler> logger)
{
    public async Task<Result<Versioned<OnboardingState>>> HandleAsync(
        Guid userId,
        CompleteOnboardingRequest request,
        RequestInfo origin,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var loaded = await store.LoadAsync(userId, null, cancellationToken);
        if (loaded.IsFailure)
        {
            return loaded.Error!;
        }

        var user = loaded.Value;
        if (!user.IsStudent && !user.IsParent)
        {
            return IdentityErrors.OnboardingNotApplicable;
        }

        var adultConfirmed = user.IsParent && await store.AdultConfirmedAsync(user.Id, cancellationToken);
        if (user.OnboardingCompletedAt is not null)
        {
            return new Versioned<OnboardingState>(Onboarding.State(user, adultConfirmed), store.ETagOf(user));
        }

        // Postgres keeps microseconds, so the first response carries exactly the value every later call reads back.
        var ticks = clock.UtcNow.UtcTicks;
        var now = new DateTimeOffset(ticks - (ticks % 10), TimeSpan.Zero);
        var completed = user.IsStudent
            ? CompleteStudent(user, request, origin, now)
            : CompleteParent(user, request, adultConfirmed, origin, now);
        if (completed.IsFailure)
        {
            return completed.Error!;
        }

        var role = user.IsStudent ? Roles.Student : Roles.Parent;
        await store.Outbox.PublishAsync(new UserOnboarded(
            user.Id,
            role,
            user.EducationLevel,
            user.Grade,
            user.YearOfStudy,
            user.StudyLevel,
            user.Curriculum,
            Ages.IsMinor(user, Ages.Today(clock)) == true,
            now));

        var saved = await store.SaveAsync(cancellationToken);
        if (saved.IsFailure)
        {
            return saved.Error!;
        }

        IdentityMetrics.Onboarded(role, user.EducationLevel);
        LogCompleted(logger, user.Id, role, user.EducationLevel);
        return new Versioned<OnboardingState>(Onboarding.State(user, adultConfirmed: user.IsParent), store.ETagOf(user));
    }

    private Result CompleteStudent(User user, CompleteOnboardingRequest request, RequestInfo origin, DateTimeOffset now)
    {
        if (request.AdultConfirmed is not null)
        {
            return IdentityErrors.Field("identity.not_applicable", "adultConfirmed", "Only parents confirm their age this way.");
        }

        var level = request.EducationLevel ?? user.EducationLevel;
        if (level is null)
        {
            return IdentityErrors.OnboardingIncomplete(["educationLevel"]);
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

        // Applied before the completeness check; nothing is saved when it fails, so a partial body changes nothing.
        user.CompleteOnboarding(
            level,
            new OnboardingDetails(request.Grade, request.Curriculum, request.StudyLevel, request.Programme, request.InstitutionName),
            now);
        if (Onboarding.Missing(user, adultConfirmed: false) is { Count: > 0 } missing)
        {
            return IdentityErrors.OnboardingIncomplete(missing);
        }

        if (dobWasMissing)
        {
            store.Db.SecurityEvents.Add(SecurityEvent.Create(SecurityEventTypes.DateOfBirthSet, user.Id, null, origin, "Onboarding."));
        }

        return Result.Success();
    }

    private Result CompleteParent(User user, CompleteOnboardingRequest request, bool adultConfirmed, RequestInfo origin, DateTimeOffset now)
    {
        var studentFields = new List<string>();
        AddIf(studentFields, request.EducationLevel is not null, "educationLevel");
        AddIf(studentFields, request.Grade is not null, "grade");
        AddIf(studentFields, request.Curriculum is not null, "curriculum");
        AddIf(studentFields, request.StudyLevel is not null, "studyLevel");
        AddIf(studentFields, request.Programme is not null, "programme");
        AddIf(studentFields, request.InstitutionName is not null, "institutionName");
        AddIf(studentFields, request.DateOfBirth is not null, "dateOfBirth");
        if (studentFields.Count > 0)
        {
            return IdentityErrors.ParentStudyFields(studentFields);
        }

        if (!adultConfirmed)
        {
            if (request.AdultConfirmed != true)
            {
                return IdentityErrors.OnboardingIncomplete(["adultConfirmed"]);
            }

            store.Db.UserConsents.Add(UserConsent.Create(
                user.Id, UserConsent.AdultConfirmation, UserConsent.UnversionedDocument, ConsentSources.Onboarding, origin, now));
            store.Db.SecurityEvents.Add(SecurityEvent.Create(SecurityEventTypes.AdultConfirmed, user.Id, null, origin, "Onboarding."));
        }

        user.CompleteParentOnboarding(now);
        return Result.Success();
    }

    private static void AddIf(List<string> fields, bool condition, string field)
    {
        if (condition)
        {
            fields.Add(field);
        }
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} completed onboarding as {Role}, level {EducationLevel}")]
    private static partial void LogCompleted(ILogger logger, Guid userId, string role, string? educationLevel);
}
