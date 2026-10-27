namespace Aptiverse.Family.Features.SendInvite;

/// <param name="Email">Your child's email address, up to 256 characters.</param>
/// <param name="Relationship">"mother", "father", "guardian" or "other".</param>
internal sealed record SendInviteRequest(string? Email, string? Relationship);

/// <param name="Id">The invite.</param>
/// <param name="InviteeEmailMasked">The address it went to, masked (j***@g***.com).</param>
/// <param name="Relationship">How you are related to the student.</param>
/// <param name="Status">"pending", "accepted", "cancelled" or "expired".</param>
/// <param name="ExpiresAt">When the emailed link stops working.</param>
/// <param name="CreatedAt">When it was sent.</param>
internal sealed record InviteView(Guid Id, string InviteeEmailMasked, string Relationship, string Status, DateTimeOffset ExpiresAt, DateTimeOffset CreatedAt);
