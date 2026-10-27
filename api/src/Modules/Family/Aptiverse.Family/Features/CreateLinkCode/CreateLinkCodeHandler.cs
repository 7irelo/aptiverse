using Aptiverse.Family.Domain;
using Aptiverse.Family.Features.Common;
using Aptiverse.Family.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Aptiverse.Family.Features.CreateLinkCode;

/// <summary>Issues a fresh link code and retires the student's previous one. Only the selector and the hash are stored.</summary>
internal sealed partial class CreateLinkCodeHandler(
    FamilyDbContext db,
    IClock clock,
    IOptions<FamilyOptions> options,
    ILogger<CreateLinkCodeHandler> logger)
{
    public Task<LinkCodeView> HandleAsync(Guid studentUserId, CancellationToken cancellationToken) =>
        FamilyLocks.RunAsync(db, studentUserId, async () =>
        {
            var previous = await db.LinkCodes
                .Where(c => c.StudentUserId == studentUserId && c.Status == LinkCodeStatuses.Active)
                .ToListAsync(cancellationToken);
            if (previous.Count > 0)
            {
                // Saved on its own first: the partial unique index allows one active code per student.
                previous.ForEach(c => c.Replace());
                await db.SaveChangesAsync(cancellationToken);
            }

            var code = LinkCodes.NewCode();
            var expiresAt = clock.UtcNow.AddMinutes(options.Value.LinkCodeExpiryMinutes);
            var row = LinkCode.Create(studentUserId, LinkCodes.SelectorOf(code), LinkCodes.Hash(code), expiresAt);
            db.LinkCodes.Add(row);
            await db.SaveChangesAsync(cancellationToken);

            FamilyMetrics.CodeIssued();
            LogIssued(logger, studentUserId, row.Id);
            return new LinkCodeView(LinkCodes.Display(code), expiresAt);
        }, cancellationToken);

    [LoggerMessage(Level = LogLevel.Information, Message = "Student {UserId} was issued family link code {CodeId}")]
    private static partial void LogIssued(ILogger logger, Guid userId, Guid codeId);
}
