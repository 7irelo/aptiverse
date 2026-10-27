using Aptiverse.Academics.Domain;
using Aptiverse.Academics.Features.Common;
using Aptiverse.Academics.Persistence;
using Aptiverse.SharedKernel.Results;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Academics.Features.ListUnitTopics;

internal sealed class ListUnitTopicsHandler(AcademicsDbContext db, UnitStore units)
{
    public async Task<Result<IReadOnlyList<TopicView>>> HandleAsync(
        Guid userId,
        Guid enrolmentId,
        ListUnitTopicsRequest request,
        CancellationToken cancellationToken)
    {
        var owned = await units.LoadOwnedAsync(userId, enrolmentId, cancellationToken);
        if (owned is null)
        {
            return AcademicsErrors.UnitNotFound;
        }

        var topics = db.Topics.AsNoTracking().Where(t => t.StudyUnitId == owned.Unit.Id && t.MergedIntoTopicId == null);
        if (request.Q is { } q)
        {
            var slug = Slugs.Topic(q);
            var pattern = "%" + Slugs.CleanText(q).Replace("\\", "\\\\", StringComparison.Ordinal)
                .Replace("%", "\\%", StringComparison.Ordinal)
                .Replace("_", "\\_", StringComparison.Ordinal) + "%";
            topics = topics.Where(t => EF.Functions.ILike(t.Name, pattern) || (slug.Length > 0 && t.Slug.Contains(slug)));
        }

        IReadOnlyList<TopicView> result = await topics
            .OrderBy(t => t.Name)
            .ThenBy(t => t.Id)
            .Take(request.Limit)
            .Select(t => new TopicView(t.Id, t.Name, t.Slug))
            .ToListAsync(cancellationToken);

        return Result.Success(result);
    }
}
