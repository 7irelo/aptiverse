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

    public static Error Validation(string code, string description, IReadOnlyDictionary<string, string[]>? errors = null) =>
        new(code, description, ErrorType.Validation) { ValidationErrors = errors };
}
