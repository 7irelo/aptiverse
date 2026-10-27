using System.Net.Sockets;
using MailKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using MimeKit.Utils;

namespace Aptiverse.Notifications.Email;

/// <summary>Plain SMTP for local development against Mailpit. One connection per email is fine at local volumes.</summary>
internal sealed class SmtpEmailSender(IOptions<EmailOptions> options) : IEmailSender
{
    public async Task<string> SendAsync(OutgoingEmail email, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(email);
        var settings = options.Value;

        using var message = new MimeMessage();
        message.From.Add(new MailboxAddress(settings.FromName, settings.FromAddress));
        message.To.Add(new MailboxAddress(email.ToName ?? string.Empty, email.ToAddress));
        message.Subject = email.Subject;
        message.Body = new BodyBuilder { TextBody = email.TextBody, HtmlBody = email.HtmlBody }.ToMessageBody();
        message.MessageId = MimeUtils.GenerateMessageId();

        using var client = new SmtpClient();
        try
        {
            var security = settings.Smtp.UseStartTls ? SecureSocketOptions.StartTls : SecureSocketOptions.None;
            await client.ConnectAsync(settings.Smtp.Host, settings.Smtp.Port, security, cancellationToken);
            if (!string.IsNullOrEmpty(settings.Smtp.Username))
            {
                await client.AuthenticateAsync(settings.Smtp.Username, settings.Smtp.Password ?? string.Empty, cancellationToken);
            }

            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(quit: true, cancellationToken);
            return message.MessageId;
        }
        catch (SmtpCommandException ex)
        {
            // 4xx replies are temporary by definition; 5xx (for example an unknown mailbox) will not change on retry.
            var code = (int)ex.StatusCode;
            throw new EmailSendException($"smtp_{code}", transient: code is >= 400 and < 500);
        }
        catch (SmtpProtocolException)
        {
            throw new EmailSendException("smtp_protocol", transient: true);
        }
        catch (AuthenticationException)
        {
            throw new EmailSendException("smtp_auth", transient: false);
        }
        catch (Exception ex) when (ex is SocketException or IOException or ServiceNotConnectedException)
        {
            throw new EmailSendException("smtp_unreachable", transient: true);
        }
    }
}
