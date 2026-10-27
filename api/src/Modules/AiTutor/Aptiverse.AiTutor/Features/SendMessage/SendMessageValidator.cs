using System.Text.Json;
using Aptiverse.AiTutor.AiService;
using FluentValidation;
using Microsoft.Extensions.Options;

namespace Aptiverse.AiTutor.Features.SendMessage;

internal sealed class SendMessageValidator : AbstractValidator<SendMessageRequest>
{
    public const int MaxActionArgumentsLength = 2000;

    /// <summary>Write tools the tutor may propose. Anything else sent back as confirmed is rejected.</summary>
    public static readonly IReadOnlyList<string> ConfirmableTools = ["create_practice_quiz"];

    public SendMessageValidator(IOptions<AiServiceOptions> options)
    {
        ArgumentNullException.ThrowIfNull(options);
        var maxChars = options.Value.MaxMessageChars;

        RuleFor(r => r.Message).NotEmpty().MaximumLength(maxChars);

        When(r => r.ConfirmedAction is not null, () =>
        {
            RuleFor(r => r.ConfirmedAction!.Tool)
                .Must(tool => ConfirmableTools.Contains(tool))
                .WithMessage("This action cannot be confirmed.")
                .OverridePropertyName("ConfirmedAction.Tool");
            RuleFor(r => r.ConfirmedAction!.Arguments)
                .Must(args => args.ValueKind == JsonValueKind.Object && args.GetRawText().Length <= MaxActionArgumentsLength)
                .WithMessage($"Arguments must be a JSON object of at most {MaxActionArgumentsLength} characters.")
                .OverridePropertyName("ConfirmedAction.Arguments");
        });
    }
}
