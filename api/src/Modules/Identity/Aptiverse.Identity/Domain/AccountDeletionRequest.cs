using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Identity.Domain;

/// <summary>A POPIA deletion request. Recorded for an operator to action; nothing is hard deleted yet.</summary>
internal sealed class AccountDeletionRequest : Entity
{
    public const string Pending = "pending";
    public const int ReasonMaxLength = 1000;
    public const int StatusMaxLength = 16;

    private AccountDeletionRequest()
    {
    }

    public Guid UserId { get; private set; }

    public string? Reason { get; private set; }

    public string Status { get; private set; } = Pending;

    public static AccountDeletionRequest Create(Guid userId, string? reason) =>
        new() { UserId = userId, Reason = string.IsNullOrWhiteSpace(reason) ? null : reason.Trim() };
}
