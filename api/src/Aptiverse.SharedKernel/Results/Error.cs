namespace Aptiverse.SharedKernel.Results;

/// <summary>An expected failure. Code is stable and machine readable; Description is safe to show to users.</summary>
public sealed record Error(string Code, string Description, ErrorType Type)
{
    public IReadOnlyDictionary<string, string[]>? ValidationErrors { get; init; }

    public static Error Failure(string code, string description) => new(code, description, ErrorType.Failure);

    public static Error NotFound(string code, string description) => new(code, description, ErrorType.NotFound);

    public static Error Conflict(string code, string description) => new(code, description, ErrorType.Conflict);

    public static Error Forbidden(string code, string description) => new(code, description, ErrorType.Forbidden);

    public static Error Unauthorized(string code, string description) => new(code, description, ErrorType.Unauthorized);

    public static Error TooManyRequests(string code, string description) => new(code, description, ErrorType.TooManyRequests);

    public static Error Validation(string code, string description, IReadOnlyDictionary<string, string[]>? errors = null) =>
        new(code, description, ErrorType.Validation) { ValidationErrors = errors };
}
