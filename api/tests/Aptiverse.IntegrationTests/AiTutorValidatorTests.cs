using System.Text.Json;
using Aptiverse.AiTutor.AiService;
using Aptiverse.AiTutor.Features.CreateConversation;
using Aptiverse.AiTutor.Features.ListConversations;
using Aptiverse.AiTutor.Features.SendMessage;
using Microsoft.Extensions.Options;

namespace Aptiverse.IntegrationTests;

public sealed class AiTutorValidatorTests
{
    private static readonly SendMessageValidator SendValidator = new(Options.Create(new AiServiceOptions
    {
        BaseUrl = new Uri("http://ai.test"),
        MaxMessageChars = 50,
    }));

    [Theory]
    [InlineData(null, null)]
    [InlineData("Algebra help", "standard")]
    [InlineData(null, "deep")]
    public void Create_conversation_accepts_valid_requests(string? title, string? mode)
    {
        Assert.True(new CreateConversationValidator().Validate(new CreateConversationRequest(title, mode)).IsValid);
    }

    [Theory]
    [InlineData(null, "turbo")]
    [InlineData(null, "DEEP")]
    [InlineData("x", "")]
    public void Create_conversation_rejects_unknown_modes(string? title, string? mode)
    {
        var result = new CreateConversationValidator().Validate(new CreateConversationRequest(title, mode));

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(CreateConversationRequest.Mode));
    }

    [Fact]
    public void Create_conversation_rejects_long_titles()
    {
        var result = new CreateConversationValidator().Validate(new CreateConversationRequest(new string('t', 121), null));

        Assert.False(result.IsValid);
    }

    [Theory]
    [InlineData(0, 20)]
    [InlineData(1, 0)]
    [InlineData(1, 101)]
    public void List_conversations_rejects_bad_paging(int page, int pageSize)
    {
        Assert.False(new ListConversationsValidator().Validate(new ListConversationsRequest(page, pageSize)).IsValid);
    }

    [Fact]
    public void List_conversations_accepts_defaults()
    {
        Assert.True(new ListConversationsValidator().Validate(new ListConversationsRequest()).IsValid);
    }

    [Fact]
    public void Send_message_accepts_a_plain_message()
    {
        Assert.True(SendValidator.Validate(new SendMessageRequest("What is a derivative?")).IsValid);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Send_message_rejects_blank_messages(string message)
    {
        Assert.False(SendValidator.Validate(new SendMessageRequest(message)).IsValid);
    }

    [Fact]
    public void Send_message_enforces_the_configured_length()
    {
        Assert.True(SendValidator.Validate(new SendMessageRequest(new string('m', 50))).IsValid);
        Assert.False(SendValidator.Validate(new SendMessageRequest(new string('m', 51))).IsValid);
    }

    [Fact]
    public void Send_message_accepts_a_confirmed_quiz()
    {
        var action = new ConfirmedTutorAction("create_practice_quiz", Json("""{"topic":"Derivatives","questions":5}"""));

        Assert.True(SendValidator.Validate(new SendMessageRequest("Yes please", ConfirmedAction: action)).IsValid);
    }

    [Theory]
    [InlineData("delete_account", """{"a":1}""")]
    [InlineData("create_practice_quiz", "[1,2]")]
    [InlineData("create_practice_quiz", "null")]
    public void Send_message_rejects_unknown_or_malformed_actions(string tool, string arguments)
    {
        var action = new ConfirmedTutorAction(tool, Json(arguments));

        Assert.False(SendValidator.Validate(new SendMessageRequest("Yes", ConfirmedAction: action)).IsValid);
    }

    [Fact]
    public void Send_message_rejects_oversized_action_arguments()
    {
        var big = JsonSerializer.Serialize(new { note = new string('n', SendMessageValidator.MaxActionArgumentsLength) });
        var action = new ConfirmedTutorAction("create_practice_quiz", Json(big));

        Assert.False(SendValidator.Validate(new SendMessageRequest("Yes", ConfirmedAction: action)).IsValid);
    }

    private static JsonElement Json(string json)
    {
        using var document = JsonDocument.Parse(json);
        return document.RootElement.Clone();
    }
}
