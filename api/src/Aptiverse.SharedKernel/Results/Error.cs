namespace Aptiverse.SharedKernel.Results;

/// <summary>An expected failure. Code is stable and machine readable; Description is safe to show to users.</summary>
public sealed record Error(string Code, string Description, ErrorType Type)
{
    public IReadOnlyDictionary<string, string[]>? ValidationErrors { get; init; }

    /// <summary>Extra machine readable values for the ProblemDetails, for example the id of a conflicting row.</summary>
    public IReadOnlyDictionary<string, object?>? Extensions { get; init; }

    /// <summary>A copy of this error carrying one more ProblemDetails extension.</summary>
    public Error With(string key, object? value)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(key);
        var extensions = Extensions is null ? new Dictionary<string, object?>() : new Dictionary<string, object?>(Extensions);
        extensions[key] = value;
        return this with { Extensions = extensions };
    }

    public static Error Failure(string code, string description) => new(code, description, ErrorType.Failure);

    public static Error NotFound(string code, string description) => new(code, description, ErrorType.NotFound);

    public static Error Conflict(string code, string description) => new(code, description, ErrorType.Conflict);

    public static Error Forbidden(string code, string description) => new(code, description, ErrorType.Forbidden);

    public static Error Unauthorized(string code, string description) => new(code, description, ErrorType.Unauthorized);

    public static Error TooManyRequests(string code, string description) => new(code, description, ErrorType.TooManyRequests);

    /// <summary>A dependency the use case needs is down. Maps to 503 so clients retry later.</summary>
    public static Error Unavailable(string code, string description) => new(code, description, ErrorType.Unavailable);

    /// <summary>An If-Match value no longer matches the current version. Maps to 412.</summary>
    public static Error PreconditionFailed(string code, string description) => new(code, description, ErrorType.PreconditionFailed);

    /// <summary>A write that needs If-Match arrived without it. Maps to 428.</summary>
    public static Error PreconditionRequired(string code, string description) => new(code, description, ErrorType.PreconditionRequired);

    /// <summary>An upstream provider answered with an error. Maps to 502; the request may be retried.</summary>
    public static Error BadGateway(string code, string description) => new(code, description, ErrorType.BadGateway);

    /// <summary>The resource existed but is no longer usable, for example an expired single-use link. Maps to 410.</summary>
    public static Error Gone(string code, string description) => new(code, description, ErrorType.Gone);

    public static Error Validation(string code, string description, IReadOnlyDictionary<string, string[]>? errors = null) =>
        new(code, description, ErrorType.Validation) { ValidationErrors = errors };
}
