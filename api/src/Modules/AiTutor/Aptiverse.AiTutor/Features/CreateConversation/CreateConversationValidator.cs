using Aptiverse.AiTutor.Domain;
using FluentValidation;

namespace Aptiverse.AiTutor.Features.CreateConversation;

internal sealed class CreateConversationValidator : AbstractValidator<CreateConversationRequest>
{
    public CreateConversationValidator()
    {
        RuleFor(r => r.Title).MaximumLength(Conversation.TitleMaxLength);
        RuleFor(r => r.Mode)
            .Must(mode => mode is null || ConversationModes.All.Contains(mode))
            .WithMessage($"Mode must be one of: {string.Join(", ", ConversationModes.All)}.");
    }
}
