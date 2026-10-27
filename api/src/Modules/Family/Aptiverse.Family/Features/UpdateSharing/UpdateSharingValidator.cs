using FluentValidation;

namespace Aptiverse.Family.Features.UpdateSharing;

internal sealed class UpdateSharingValidator : AbstractValidator<UpdateSharingRequest>
{
    public UpdateSharingValidator()
    {
        RuleFor(r => r.Academics).NotNull();
        RuleFor(r => r.Practice).NotNull();
        RuleFor(r => r.Goals).NotNull();
        RuleFor(r => r.TutorActivity).NotNull();
    }
}
