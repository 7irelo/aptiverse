namespace Aptiverse.Billing.Features.SyncPlans;

/// <param name="DryRun">Report what would change without calling Paystack's write endpoints. Defaults to true.</param>
internal sealed record SyncPlansRequest(bool DryRun = true);
