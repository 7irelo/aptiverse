using FluentValidation;

namespace Aptiverse.Academics.Features.UnenrolFromUnit;

/// <summary>Nothing to check beyond binding; kept so every request type has a validator.</summary>
internal sealed class UnenrolFromUnitValidator : AbstractValidator<UnenrolFromUnitRequest>
{
}
