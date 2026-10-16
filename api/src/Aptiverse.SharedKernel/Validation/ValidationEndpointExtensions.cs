using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace Aptiverse.SharedKernel.Validation;

public static class ValidationEndpointExtensions
{
    /// <summary>
    /// Validates the <typeparamref name="TRequest"/> argument with its registered IValidator and returns a 400
    /// ValidationProblem on failure. An architecture test fails the build if a request type has no validator.
    /// </summary>
    public static RouteHandlerBuilder WithValidation<TRequest>(this RouteHandlerBuilder builder)
        where TRequest : class
    {
        ArgumentNullException.ThrowIfNull(builder);
        return builder
            .AddEndpointFilter<ValidationFilter<TRequest>>()
            .ProducesValidationProblem();
    }
}
