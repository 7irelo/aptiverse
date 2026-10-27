using Aptiverse.Billing.Paystack;
using Aptiverse.SharedKernel.Results;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Aptiverse.Billing.Features.ReceivePaystackWebhook;

internal static class ReceivePaystackWebhookEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/paystack/webhook", HandleAsync)
            .WithName("receivePaystackWebhook")
            .WithSummary("Paystack webhook (signed with HMAC-SHA512)")
            .WithDescription("Anonymous; authenticated by the x-paystack-signature header over the raw body. Body limit 64 KB. A duplicate event returns 200 and changes nothing.")
            .AllowAnonymous()
            .RequireRateLimiting(BillingRateLimiting.Webhook)
            .WithMetadata(new RequestSizeLimitAttribute(PaystackWebhooks.MaxBodyBytes))
            .Accepts<object>("application/json")
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status413PayloadTooLarge)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<Ok, ProblemHttpResult>> HandleAsync(
        HttpRequest request,
        ReceivePaystackWebhookHandler handler,
        CancellationToken cancellationToken)
    {
        var body = await ReadBoundedAsync(request, PaystackWebhooks.MaxBodyBytes, cancellationToken);
        if (body is null)
        {
            return TypedResults.Problem(
                statusCode: StatusCodes.Status413PayloadTooLarge,
                title: "The request body is too large.",
                extensions: new Dictionary<string, object?> { ["code"] = "billing.webhook_too_large" });
        }

        var signature = request.Headers[PaystackWebhooks.SignatureHeader].ToString();
        var result = await handler.HandleAsync(body.Value, signature, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok() : result.ToProblem();
    }

    /// <summary>Reads at most <paramref name="max"/> bytes; null when the body is larger, whatever Content-Length claims.</summary>
    private static async Task<ReadOnlyMemory<byte>?> ReadBoundedAsync(HttpRequest request, int max, CancellationToken cancellationToken)
    {
        if (request.ContentLength > max)
        {
            return null;
        }

        using var buffer = new MemoryStream();
        var chunk = new byte[8192];
        int read;
        while ((read = await request.Body.ReadAsync(chunk, cancellationToken)) > 0)
        {
            if (buffer.Length + read > max)
            {
                return null;
            }

            buffer.Write(chunk, 0, read);
        }

        return buffer.ToArray();
    }
}
