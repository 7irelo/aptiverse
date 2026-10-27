using Aptiverse.Progress.Domain;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Progress.Features.GetJourney;

internal sealed class GetJourneyValidator : AbstractValidator<GetJourneyRequest>
{
    public GetJourneyValidator()
    {
        RuleFor(r => r.Take).InclusiveBetween(1, GetJourneyRequest.MaxTake);
        RuleFor(r => r.Before).Must(c => c is null || JourneyCursor.TryDecode(c, out _)).WithMessage("The cursor is not valid.");
        RuleFor(r => r.Kinds).Must(k => k is null || (k.Length <= 200 && JourneyCursor.Kinds(k).All(JourneyKinds.All.Contains)))
            .WithMessage($"Kinds must be among: {string.Join(", ", JourneyKinds.All)}.");
    }
}
