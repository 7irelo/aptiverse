using Aptiverse.Academics.Features.Common;
using Aptiverse.Academics.Features.ListUnitTopics;

namespace Aptiverse.Academics.Features.GetMyUnit;

/// <param name="Unit">The enrolment and its unit.</param>
/// <param name="Assessments">Every assessment of the unit, soonest due first.</param>
/// <param name="Topics">Up to 50 of the unit's topics, by name.</param>
internal sealed record UnitDetailResponse(UnitSummary Unit, IReadOnlyList<AssessmentListItem> Assessments, IReadOnlyList<TopicView> Topics);
