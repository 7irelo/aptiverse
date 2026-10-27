using Aptiverse.Family.Domain;
using Aptiverse.Family.Features.Common;
using Aptiverse.Family.Persistence;
using Aptiverse.Identity.Contracts;
using Aptiverse.SharedKernel.Results;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Wolverine.EntityFrameworkCore;

namespace Aptiverse.Family.Features.RedeemLinkCode;

/// <summary>
/// A parent enters the code a student gave them. Guessing is defeated three ways: each parent gets a few wrong codes
/// per window (counted in the database, so it holds across instances), each code burns after a few wrong guesses
/// against its selector, and codes live for minutes. The hash comparison is constant time over every candidate.
/// </summary>
internal sealed partial class RedeemLinkCodeHandler(
    IDbContextOutbox<FamilyDbContext> outbox,
    IUserDirectory directory,
    LinkWriter links,
    IClock clock,
    IOptions<FamilyOptions> options,
    ILogger<RedeemLinkCodeHandler> logger)
{
    private FamilyDbContext Db => outbox.DbContext;

    public async Task<Result<LinkView>> HandleAsync(Guid parentUserId, RedeemLinkCodeRequest request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var settings = options.Value;
        var now = clock.UtcNow;

        var windowStart = now.AddMinutes(-settings.LinkCodeFailureWindowMinutes);
        var failures = await Db.LinkCodeFailures.AsNoTracking()
            .Where(f => f.ParentUserId == parentUserId && f.OccurredAt > windowStart)
            .OrderBy(f => f.OccurredAt)
            .Select(f => f.OccurredAt)
            .ToListAsync(cancellationToken);
        if (failures.Count >= settings.LinkCodeMaxFailures)
        {
            FamilyMetrics.CodeFailed("blocked");
            var retryAfter = failures[^settings.LinkCodeMaxFailures] + TimeSpan.FromMinutes(settings.LinkCodeFailureWindowMinutes) - now;
            return FamilyErrors.TooManyCodeAttempts(retryAfter);
        }

        var parent = await directory.GetContactAsync(parentUserId, cancellationToken);
        if (parent is not { EmailVerified: true })
        {
            return FamilyErrors.EmailNotVerified;
        }

        var code = LinkCodes.Normalize(request.Code)!;
        var hash = LinkCodes.Hash(code);
        var selector = LinkCodes.SelectorOf(code);
        var candidates = await Db.LinkCodes
            .Where(c => c.Selector == selector && c.Status == LinkCodeStatuses.Active)
            .ToListAsync(cancellationToken);

        // Every candidate is compared, so the time taken does not say which one (if any) matched.
        LinkCode? match = null;
        foreach (var candidate in candidates)
        {
            if (LinkCodes.HashesEqual(candidate.CodeHash, hash))
            {
                match = candidate;
            }
        }

        if (match is null)
        {
            Db.LinkCodeFailures.Add(LinkCodeFailure.Create(parentUserId, now));
            candidates.ForEach(c => c.RecordFailure(settings.LinkCodeMaxAttempts));
            await SaveFailureAsync(cancellationToken);
            FamilyMetrics.CodeFailed("wrong");
            LogWrongCode(logger, parentUserId, candidates.Count);
            return FamilyErrors.LinkCodeInvalid;
        }

        if (match.IsExpired(now))
        {
            FamilyMetrics.CodeFailed("expired");
            return FamilyErrors.LinkCodeExpired;
        }

        Result<Domain.FamilyLink> created;
        try
        {
            created = await links.CreateAsync(
                new NewLink(parentUserId, match.StudentUserId, request.Relationship!, LinkMethods.LinkCode, match.Id, null),
                at => match.Use(parentUserId, at),
                cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            // Another parent used the code (or a wrong guess burned it) a moment earlier.
            return FamilyErrors.LinkCodeInvalid;
        }

        if (created.IsFailure)
        {
            return created.Error!;
        }

        LogRedeemed(logger, parentUserId, match.Id, created.Value.Id);
        return LinkView.Of(created.Value);
    }

    private async Task SaveFailureAsync(CancellationToken cancellationToken)
    {
        try
        {
            await Db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            // A candidate changed under us (used, replaced or burned); the parent's failure must still count.
            Db.ChangeTracker.Entries<LinkCode>().ToList().ForEach(e => e.State = EntityState.Detached);
            await Db.SaveChangesAsync(cancellationToken);
        }
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "Parent {UserId} entered a wrong family link code ({Candidates} codes shared its selector)")]
    private static partial void LogWrongCode(ILogger logger, Guid userId, int candidates);

    [LoggerMessage(Level = LogLevel.Information, Message = "Parent {UserId} redeemed family link code {CodeId}, link {LinkId}")]
    private static partial void LogRedeemed(ILogger logger, Guid userId, Guid codeId, Guid linkId);
}
