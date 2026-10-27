using Aptiverse.SharedKernel.Paging;

namespace Aptiverse.Academics.Features.ListMyAssessments;

/// <param name="EnrolmentId">Optional: only this unit's assessments.</param>
/// <param name="State">Optional, repeatable: "scheduled", "in_progress", "submitted", "graded".</param>
/// <param name="From">Optional first day (South African time), inclusive.</param>
/// <param name="To">Optional last day (South African time), inclusive; at most 400 days after From.</param>
/// <param name="Type">Optional assessment type.</param>
/// <param name="Sort">"due_asc" (default) or "due_desc".</param>
/// <param name="Page">1-based page.</param>
/// <param name="PageSize">1 to 100, default 20.</param>
internal sealed record ListMyAssessmentsRequest(
    Guid? EnrolmentId,
    string[]? State,
    DateOnly? From,
    DateOnly? To,
    string? Type,
    string? Sort,
    int Page = 1,
    int PageSize = PageRequest.DefaultPageSize);
