namespace Aptiverse.Identity.Contracts;

/// <summary>
/// The age facts Billing needs to decide whether a user may pay (decision 31: under-18s pay only with parental
/// consent). Carries no date of birth and no contact details.
/// </summary>
public interface IPayerEligibilityLookup
{
    /// <summary>Null when the account does not exist or has been erased.</summary>
    Task<PayerEligibility?> GetAsync(Guid userId, CancellationToken cancellationToken);
}

/// <param name="IsMinor">Under 18 on today's Johannesburg date; null while a student's date of birth is unknown. Parents are adults.</param>
/// <param name="ParentalConsentRecorded">A parent's consent is on record and not withdrawn.</param>
public sealed record PayerEligibility(bool? IsMinor, bool ParentalConsentRecorded)
{
    /// <summary>Adults may pay; minors only with recorded parental consent; an unknown age is refused (fails closed).</summary>
    public bool MayPay => IsMinor == false || (IsMinor == true && ParentalConsentRecorded);
}
