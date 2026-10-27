using Aptiverse.Family.Contracts;
using Aptiverse.Family.Domain;

namespace Aptiverse.Family.Features.Common;

/// <param name="LinkId">The link.</param>
/// <param name="ParentUserId">The parent.</param>
/// <param name="StudentUserId">The student.</param>
/// <param name="Relationship">"mother", "father", "guardian" or "other".</param>
/// <param name="Method">"invite" or "link_code".</param>
/// <param name="LinkedAt">When the link was made.</param>
/// <param name="Sharing">What the student shares with this parent.</param>
internal sealed record LinkView(
    Guid LinkId,
    Guid ParentUserId,
    Guid StudentUserId,
    string Relationship,
    string Method,
    DateTimeOffset LinkedAt,
    SharingFlags Sharing)
{
    public static LinkView Of(FamilyLink link)
    {
        ArgumentNullException.ThrowIfNull(link);
        return new(link.Id, link.ParentUserId, link.StudentUserId, link.Relationship, link.Method, link.LinkedAt, link.Sharing);
    }
}

/// <param name="Status">"not_required" (18 or older), "required", "granted" or "withdrawn".</param>
/// <param name="GrantedByYou">True when the caller is the consenting parent.</param>
/// <param name="GrantedAt">When the current consent was given; null unless granted.</param>
/// <param name="DocumentVersion">The consent text version confirmed; null unless granted.</param>
internal sealed record ConsentView(string Status, bool GrantedByYou, DateTimeOffset? GrantedAt, string? DocumentVersion)
{
    /// <param name="isMinor">From Identity: under 18, or null while the date of birth is unknown (treated as a minor).</param>
    /// <param name="current">The student's latest consent row.</param>
    /// <param name="viewerUserId">The caller.</param>
    public static ConsentView Of(bool? isMinor, ParentalConsentRecord? current, Guid viewerUserId)
    {
        if (isMinor == false)
        {
            return new(ConsentStatuses.NotRequired, false, null, null);
        }

        return current switch
        {
            null => new(ConsentStatuses.Required, false, null, null),
            { IsGrant: true } => new(ConsentStatuses.Granted, current.ParentUserId == viewerUserId, current.OccurredAt, current.DocumentVersion),
            _ => new(ConsentStatuses.Withdrawn, false, null, null),
        };
    }
}
