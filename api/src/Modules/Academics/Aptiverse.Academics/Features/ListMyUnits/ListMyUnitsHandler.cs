using Aptiverse.Academics.Domain;
using Aptiverse.Academics.Features.Common;

namespace Aptiverse.Academics.Features.ListMyUnits;

/// <summary>The caller's units with weighting. Enrolments hidden by a stage change never appear.</summary>
internal sealed class ListMyUnitsHandler(UnitQueries queries)
{
    private static readonly string[] Active = [EnrolmentStatuses.Active];
    private static readonly string[] Completed = [EnrolmentStatuses.Completed];
    private static readonly string[] All = [EnrolmentStatuses.Active, EnrolmentStatuses.Completed, EnrolmentStatuses.Dropped];

    public async Task<IReadOnlyList<UnitSummary>> HandleAsync(Guid userId, ListMyUnitsRequest request, CancellationToken cancellationToken)
    {
        var statuses = request.Status switch
        {
            "completed" => Completed,
            "all" => All,
            _ => Active,
        };

        return await queries.ListAsync(userId, statuses, cancellationToken);
    }
}
