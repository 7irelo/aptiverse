using Aptiverse.Identity.Features.Common;
using Aptiverse.SharedKernel.Time;
using FluentValidation;

namespace Aptiverse.Identity.Features.UpdateMyProfile;

internal sealed class UpdateMyProfileValidator : AbstractValidator<UpdateMyProfileRequest>
{
    public UpdateMyProfileValidator(IClock clock)
    {
        RuleFor(r => r.Name).PersonName().When(r => r.Name is not null);
        RuleFor(r => r.PhoneNumber).PhoneNumber();
        RuleFor(r => r.DateOfBirth).DateOfBirth(clock);
        RuleFor(r => r.AdultConfirmed).Must(a => a is null or true).WithMessage("Confirm that you are 18 or older.");
    }
}
