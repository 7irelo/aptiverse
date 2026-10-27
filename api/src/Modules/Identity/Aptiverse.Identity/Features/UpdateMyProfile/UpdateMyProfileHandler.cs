using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Contracts;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Features.Common;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Identity.Features.UpdateMyProfile;

/// <param name="Id">The user id.</param>
/// <param name="Name">Display name.</param>
/// <param name="Email">Sign-in email address.</param>
/// <param name="PhoneNumber">Optional, international format.</param>
/// <param name="DateOfBirth">Returned to the account holder only.</param>
/// <param name="AdultConfirmedAt">When a parent confirmed they are 18 or older.</param>
/// <param name="IsMinor">Under 18 on today's Johannesburg date; null while a student has not given a date of birth.</param>
internal sealed record ProfileResponse(
    Guid Id,
    string Name,
    string Email,
    string? PhoneNumber,
    DateOnly? DateOfBirth,
    DateTimeOffset? AdultConfirmedAt,
    bool? IsMinor);

/// <summary>
/// Name and phone edits, plus the one-time age facts (BE-IDN-90): a student's date of birth and a parent's adult
/// confirmation. Neither can be changed by the user once set, so a minor cannot edit past the consent or payer
/// rules. Setting either is rate limited per user and audited, and the date itself is never logged.
/// </summary>
internal sealed partial class UpdateMyProfileHandler(
    ProfileStore store,
    EmailRateLimiter throttle,
    IClock clock,
    ILogger<UpdateMyProfileHandler> logger)
{
    public async Task<Result<Versioned<ProfileResponse>>> HandleAsync(
        Guid userId,
        UpdateMyProfileRequest request,
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
        if (request.DateOfBirth is not null && !user.IsStudent)
        {
            return IdentityErrors.Field("identity.not_applicable", "dateOfBirth", "Only students give a date of birth.");
        }

        if (request.AdultConfirmed is not null && !user.IsParent)
        {
            return IdentityErrors.Field("identity.not_applicable", "adultConfirmed", "Only parents confirm their age this way.");
        }

        if ((request.DateOfBirth is not null || request.AdultConfirmed is not null) && !throttle.TryAcquireAgeData(user.Id))
        {
            return AuthRateLimiting.TooManyAttempts(TimeSpan.FromMinutes(1), AuthRateLimiting.GenericDetail);
        }

        var now = clock.UtcNow;
        var today = Ages.Today(clock);
        var adultConfirmation = user.IsParent ? await AdultConfirmationAsync(user.Id, cancellationToken) : null;
        var bandBefore = AgeBand(user, adultConfirmation is not null, today);
        var changed = new List<string>();

        if (request.Name is { } name && name.Trim() != user.Name)
        {
            user.UpdateProfile(name, user.PhoneNumber);
            changed.Add("name");
        }

        if (request.PhoneNumberProvided && Normalize(request.PhoneNumber) != user.PhoneNumber)
        {
            user.UpdateProfile(user.Name, request.PhoneNumber);
            changed.Add("phoneNumber");
        }

        if (request.DateOfBirth is { } dob && user.DateOfBirth != dob)
        {
            if (!user.SetDateOfBirth(dob))
            {
                return IdentityErrors.DateOfBirthAlreadySet;
            }

            store.Db.SecurityEvents.Add(SecurityEvent.Create(SecurityEventTypes.DateOfBirthSet, user.Id, null, origin, "Profile."));
            changed.Add("dateOfBirth");
        }

        if (request.AdultConfirmed == true && adultConfirmation is null)
        {
            var consent = UserConsent.Create(
                user.Id, UserConsent.AdultConfirmation, UserConsent.UnversionedDocument, ConsentSources.Profile, origin, now);
            store.Db.UserConsents.Add(consent);
            store.Db.SecurityEvents.Add(SecurityEvent.Create(SecurityEventTypes.AdultConfirmed, user.Id, null, origin, "Profile."));
            adultConfirmation = consent.AcceptedAt;
            changed.Add("adultConfirmed");
        }

        var bandAfter = AgeBand(user, adultConfirmation is not null, today);
        if (changed.Contains("name") || bandAfter != bandBefore)
        {
            await store.Outbox.PublishAsync(new UserProfileUpdated(user.Id, user.Name, bandAfter, bandAfter != bandBefore, now));
        }

        if (changed.Count > 0)
        {
            var saved = await store.SaveAsync(cancellationToken);
            if (saved.IsFailure)
            {
                return saved.Error!;
            }

            LogUpdated(logger, user.Id, string.Join(",", changed));
        }

        var response = new ProfileResponse(
            user.Id, user.Name, user.Email, user.PhoneNumber, user.DateOfBirth, adultConfirmation, Ages.IsMinor(user, today));
        return new Versioned<ProfileResponse>(response, store.ETagOf(user));
    }

    private Task<DateTimeOffset?> AdultConfirmationAsync(Guid userId, CancellationToken cancellationToken) =>
        store.Db.UserConsents
            .Where(c => c.UserId == userId && c.DocumentKey == UserConsent.AdultConfirmation && c.WithdrawnAt == null)
            .Select(c => (DateTimeOffset?)c.AcceptedAt)
            .FirstOrDefaultAsync(cancellationToken);

    private static string AgeBand(User user, bool adultConfirmed, DateOnly today) =>
        user.IsStudent ? Ages.Band(user.DateOfBirth, today) : adultConfirmed ? Ages.Adult : Ages.Unknown;

    private static string? Normalize(string? phone) => string.IsNullOrWhiteSpace(phone) ? null : phone.Trim();

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} updated their profile: {ChangedFields}")]
    private static partial void LogUpdated(ILogger logger, Guid userId, string changedFields);
}
