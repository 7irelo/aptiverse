namespace Aptiverse.Api.Data.Email
{
    /// <summary>
    /// Single email enqueued for async dispatch by EmailDispatcher.
    /// Templated emails carry a template type + arbitrary template data;
    /// raw HTML emails carry the body directly.
    /// </summary>
    public sealed record EmailJob(
        string To,
        string Subject,
        string? HtmlBody,
        string? TemplateType,
        IDictionary<string, string?>? TemplateData,
        DateTime EnqueuedAt);
}
