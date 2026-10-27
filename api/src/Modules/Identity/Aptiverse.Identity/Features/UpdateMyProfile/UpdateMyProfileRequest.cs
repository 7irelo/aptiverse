using System.Text.Json.Serialization;

namespace Aptiverse.Identity.Features.UpdateMyProfile;

/// <summary>
/// Send only the fields to change. An explicit null phone number clears it; leaving a field out keeps it.
/// The date of birth (students) and the adult confirmation (parents) are each set once.
/// </summary>
internal sealed record UpdateMyProfileRequest
{
    private readonly string? _phoneNumber;

    /// <summary>2 to 120 characters including letters.</summary>
    public string? Name { get; init; }

    /// <summary>International format, for example +27821234567; null clears it.</summary>
    public string? PhoneNumber
    {
        get => _phoneNumber;
        init
        {
            _phoneNumber = value;
            PhoneNumberProvided = true;
        }
    }

    /// <summary>Students without a date of birth: age 10 to 80. Set once; a correction goes through support.</summary>
    public DateOnly? DateOfBirth { get; init; }

    /// <summary>Parents: true confirms you are 18 or older. Set once.</summary>
    public bool? AdultConfirmed { get; init; }

    /// <summary>True when the body named phoneNumber, even as null, so null can mean "clear".</summary>
    [JsonIgnore]
    public bool PhoneNumberProvided { get; private init; }
}
