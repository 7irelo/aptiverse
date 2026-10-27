using System.Security.Claims;
using Aptiverse.Identity.Persistence;
using Aptiverse.SharedKernel.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Identity.Features.ListMyConsents;

/// <param name="DocumentKey">"terms", "privacy", "marketing_email" or "adult_confirmation".</param>
/// <param name="Version">The accepted version.</param>
/// <param name="AcceptedAt">When it was accepted.</param>
/// <param name="Source">"register", "google", "reconsent", "migration", "onboarding" or "profile".</param>
/// <param name="WithdrawnAt">Set only for a withdrawn optional consent (marketing).</param>
internal sealed record ConsentView(string DocumentKey, string Version, DateTimeOffset AcceptedAt, string Source, DateTimeOffset? WithdrawnAt);

internal sealed class ListMyConsentsHandler(IdentityDbContext db)
{
    public async Task<IReadOnlyList<ConsentView>> HandleAsync(Guid userId, CancellationToken cancellationToken) =>
        await db.UserConsents.AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.AcceptedAt)
            .Select(c => new ConsentView(c.DocumentKey, c.DocumentVersion, c.AcceptedAt, c.Source, c.WithdrawnAt))
            .ToListAsync(cancellationToken);
}

internal static class ListMyConsentsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        // Any signed-in caller: re-accepting must work even when the role map is broken.
        group.MapGet("/consents", HandleAsync)
            .WithName("listMyConsents")
            .WithSummary("The legal documents and optional consents you accepted")
            .WithDescription("Newest first, with the version, when and how each was given.")
            .RequireAuthorization()
            .ProducesProblem(StatusCodes.Status401Unauthorized);
    }

    private static async Task<Ok<IReadOnlyList<ConsentView>>> HandleAsync(
        ClaimsPrincipal user,
        ListMyConsentsHandler handler,
        CancellationToken cancellationToken) =>
        TypedResults.Ok(await handler.HandleAsync(user.GetRequiredUserId(), cancellationToken));
}
