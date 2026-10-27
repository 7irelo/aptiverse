using System.Net;
using Amazon.Runtime;
using Amazon.SimpleEmailV2;
using Amazon.SimpleEmailV2.Model;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Aptiverse.Notifications.Email;

/// <summary>
/// Sends through SESv2 SendEmail with the configuration set, using the default credential chain (the ECS task role,
/// never access keys). The SDK retries throttling and 5xx a few times itself; whatever still fails is classified
/// here and retried later by Wolverine with backoff.
/// </summary>
internal sealed class SesEmailSender(IAmazonSimpleEmailServiceV2 ses, IOptions<EmailOptions> options) : IEmailSender
{
    private const string Utf8 = "UTF-8";

    // Throttling, quota and account-state errors clear on their own or after an operator fixes SES, so the email
    // waits in the durable queue instead of being dropped.
    private static readonly HashSet<string> TransientCodes = new(StringComparer.Ordinal)
    {
        "TooManyRequestsException",
        "LimitExceededException",
        "SendingPausedException",
        "AccountSuspendedException",
        "Throttling",
        "ThrottlingException",
        "ServiceUnavailable",
        "InternalFailure",
    };

    public async Task<string> SendAsync(OutgoingEmail email, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(email);
        var settings = options.Value;

        var request = new SendEmailRequest
        {
            FromEmailAddress = new MailboxAddress(settings.FromName, settings.FromAddress).ToString(),
            Destination = new Destination { ToAddresses = [email.ToAddress] },
            ConfigurationSetName = settings.ConfigurationSet,
            Content = new EmailContent
            {
                Simple = new Message
                {
                    Subject = new Content { Data = email.Subject, Charset = Utf8 },
                    Body = new Body
                    {
                        Text = new Content { Data = email.TextBody, Charset = Utf8 },
                        Html = new Content { Data = email.HtmlBody, Charset = Utf8 },
                    },
                },
            },
        };

        try
        {
            var response = await ses.SendEmailAsync(request, cancellationToken);
            return response.MessageId;
        }
        catch (AmazonServiceException ex)
        {
            var code = string.IsNullOrEmpty(ex.ErrorCode) ? ex.GetType().Name : ex.ErrorCode;
            var transient = TransientCodes.Contains(code)
                || TransientCodes.Contains(ex.GetType().Name)
                || ex.StatusCode >= HttpStatusCode.InternalServerError
                || ex.StatusCode == HttpStatusCode.TooManyRequests;
            throw new EmailSendException(code, transient);
        }
        catch (AmazonClientException ex)
        {
            // Network failures and credential lookups that timed out.
            throw new EmailSendException(ex.GetType().Name, transient: true);
        }
        catch (HttpRequestException)
        {
            throw new EmailSendException("network_error", transient: true);
        }
        catch (TaskCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            throw new EmailSendException("timeout", transient: true);
        }
    }
}
