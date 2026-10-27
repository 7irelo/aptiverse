using Aptiverse.Academics.Features.Common;
using Aptiverse.SharedKernel.Results;

namespace Aptiverse.Academics.Features.GetMyAssessment;

internal sealed class GetMyAssessmentHandler(AssessmentQueries queries)
{
    public async Task<Result<(AssessmentView View, string ETag)>> HandleAsync(Guid userId, Guid assessmentId, CancellationToken cancellationToken)
    {
        var owned = await queries.LoadOwnedAsync(userId, assessmentId, cancellationToken);
        if (owned is null)
        {
            return AcademicsErrors.AssessmentNotFound;
        }

        return (await queries.ToViewAsync(owned, cancellationToken), queries.ETagOf(owned.Assessment));
    }
}
