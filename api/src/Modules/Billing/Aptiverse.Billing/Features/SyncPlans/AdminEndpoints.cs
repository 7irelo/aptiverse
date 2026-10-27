using Aptiverse.Billing.Catalog;
using Aptiverse.Billing.Domain;
using Aptiverse.Billing.Paystack;
using Aptiverse.Billing.Reconciliation;
using Aptiverse.SharedKernel.Authorization;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Validation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Billing.Features.SyncPlans;

internal static class AdminEndpoints
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/admin/plans/sync", SyncAsync)
            .WithName("syncPlansToPaystack")
            .WithSummary("Push the plan catalog to Paystack")
            .WithDescription("Creates missing Paystack plans and renames drifted ones; never changes the amount of an existing Paystack plan. dryRun defaults to true. Never runs on boot.")
            .RequirePermission(Permissions.Billing.Admin)
            .WithValidation<SyncPlansRequest>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);

        group.MapPost("/admin/reconciliation/run", ReconcileAsync)
            .WithName("runReconciliation")
            .WithSummary("Compare recent Paystack transactions with local payments now")
            .WithDescription("Writes drift rows for every mismatch; the same job runs nightly at 02:00 SAST.")
            .RequirePermission(Permissions.Billing.Admin)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status502BadGateway)
            .ProducesProblem(StatusCodes.Status503ServiceUnavailable);
    }

    private static async Task<Ok<PlanSyncReport>> SyncAsync(SyncPlansRequest request, PlanSyncer syncer, CancellationToken cancellationToken) =>
        TypedResults.Ok(await syncer.SyncAsync(request.DryRun, cancellationToken));

    private static async Task<Results<Ok<ReconciliationSummary>, ProblemHttpResult>> ReconcileAsync(Reconciler reconciler, CancellationToken cancellationToken)
    {
        try
        {
            return TypedResults.Ok(await reconciler.RunNowAsync(cancellationToken));
        }
        catch (PaystackUnavailableException)
        {
            return BillingErrors.ProviderUnavailable.ToProblem();
        }
        catch (PaystackRejectedException)
        {
            return BillingErrors.ProviderError.ToProblem();
        }
    }
}
