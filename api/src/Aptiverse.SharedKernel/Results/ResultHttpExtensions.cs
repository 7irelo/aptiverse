using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Aptiverse.SharedKernel.Results;

/// <summary>Maps <see cref="Error"/> to RFC 9457 ProblemDetails via TypedResults so OpenAPI stays accurate.</summary>
public static class ResultHttpExtensions
{
    public static ProblemHttpResult ToProblem(this Error error)
    {
        ArgumentNullException.ThrowIfNull(error);

        var status = error.Type switch
        {
            ErrorType.Validation => StatusCodes.Status400BadRequest,
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            ErrorType.Forbidden => StatusCodes.Status403Forbidden,
            ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
            ErrorType.TooManyRequests => StatusCodes.Status429TooManyRequests,
            ErrorType.Unavailable => StatusCodes.Status503ServiceUnavailable,
            ErrorType.PreconditionFailed => StatusCodes.Status412PreconditionFailed,
            ErrorType.PreconditionRequired => StatusCodes.Status428PreconditionRequired,
            ErrorType.BadGateway => StatusCodes.Status502BadGateway,
            _ => StatusCodes.Status500InternalServerError,
        };

        var extensions = new Dictionary<string, object?>();
        foreach (var (key, value) in error.Extensions ?? new Dictionary<string, object?>())
        {
            extensions[key] = value;
        }

        // Set last so an extension can never overwrite the stable code.
        extensions["code"] = error.Code;
        if (error.ValidationErrors is not null)
        {
            extensions["errors"] = error.ValidationErrors;
        }

        return TypedResults.Problem(
            statusCode: status,
            title: Title(error.Type),
            detail: error.Description,
            extensions: extensions);
    }

    public static ProblemHttpResult ToProblem(this Result result)
    {
        ArgumentNullException.ThrowIfNull(result);
        return result.IsFailure
            ? result.Error!.ToProblem()
            : throw new InvalidOperationException("A successful result cannot be converted to a problem.");
    }

    private static string Title(ErrorType type) => type switch
    {
        ErrorType.Validation => "One or more validation errors occurred.",
        ErrorType.NotFound => "The resource was not found.",
        ErrorType.Conflict => "The request conflicts with the current state.",
        ErrorType.Forbidden => "You do not have access to this resource.",
        ErrorType.Unauthorized => "Authentication is required.",
        ErrorType.TooManyRequests => "Too many requests. Please slow down and try again shortly.",
        ErrorType.Unavailable => "The service is temporarily unavailable. Please try again shortly.",
        ErrorType.PreconditionFailed => "The resource changed since you loaded it.",
        ErrorType.PreconditionRequired => "This request must say which version it changes.",
        ErrorType.BadGateway => "An upstream provider could not complete the request.",
        _ => "The request could not be completed.",
    };
}
