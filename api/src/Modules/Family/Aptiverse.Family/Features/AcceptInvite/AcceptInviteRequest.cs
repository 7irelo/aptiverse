using Aptiverse.Family.Contracts;

namespace Aptiverse.Family.Features.AcceptInvite;

/// <param name="Token">The token from the emailed link. Sent in the body, never the URL, so it stays out of access logs.</param>
/// <param name="Sharing">What to share with this parent from the start; omit for the defaults (everything but tutor activity).</param>
internal sealed record AcceptInviteRequest(string? Token, SharingFlags? Sharing);
