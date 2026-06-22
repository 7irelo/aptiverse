using Aptiverse.Infrastructure.Utilities;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using MimeKit.Text;

namespace Aptiverse.Api.Data.Email
{
    /// <summary>
    /// Background service that drains EmailQueue and sends each email via
    /// MailKit. Configured to talk to AWS SES SMTP by default — set
    /// EmailSettings:Server = email-smtp.{region}.amazonaws.com, plus the
    /// SES SMTP credentials.
    ///
    /// Retry: per-message exponential backoff (3 attempts: 1s, 4s, 16s).
    /// On final failure the email is logged and dropped — for stronger
    /// durability swap EmailQueue for SQS and run a separate retry consumer.
    /// </summary>
    public sealed class EmailDispatcher(
        EmailQueue queue,
        IOptions<EmailSettings> options,
        ILogger<EmailDispatcher> logger) : BackgroundService
    {
        private readonly EmailQueue _queue = queue;
        private readonly EmailSettings _settings = options.Value;
        private readonly ILogger<EmailDispatcher> _log = logger;

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _log.LogInformation("EmailDispatcher started — using SMTP host {Host}:{Port}",
                _settings.Server, _settings.Port);

            await foreach (var job in _queue.Reader.ReadAllAsync(stoppingToken))
            {
                await TrySendWithRetry(job, stoppingToken);
            }
        }

        private async Task TrySendWithRetry(EmailJob job, CancellationToken ct)
        {
            var attempts = new[] { 0, 1_000, 4_000, 16_000 };
            for (int i = 1; i < attempts.Length; i++)
            {
                try
                {
                    if (attempts[i - 1] > 0) await Task.Delay(attempts[i - 1], ct);
                    await SendOnce(job, ct);
                    _log.LogInformation("Email dispatched to {To} (subject: {Subject})", job.To, job.Subject);
                    return;
                }
                catch (Exception ex) when (i < attempts.Length - 1)
                {
                    _log.LogWarning(ex,
                        "Email send attempt {Attempt} to {To} failed; will retry",
                        i, job.To);
                }
                catch (Exception ex)
                {
                    _log.LogError(ex,
                        "Email send to {To} (subject: {Subject}) failed permanently after retries",
                        job.To, job.Subject);
                }
            }
        }

        private async Task SendOnce(EmailJob job, CancellationToken ct)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                _settings.SenderName ?? "Aptiverse",
                _settings.SenderEmail ?? "noreply@example.com"));
            message.To.Add(MailboxAddress.Parse(job.To));
            message.Subject = job.Subject;

            var body = job.HtmlBody ?? RenderTemplate(job);
            message.Body = new TextPart(TextFormat.Html) { Text = body };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(
                _settings.Server,
                _settings.Port == 0 ? 587 : _settings.Port,
                SecureSocketOptions.StartTls,
                ct);

            if (!string.IsNullOrWhiteSpace(_settings.Username))
            {
                await smtp.AuthenticateAsync(_settings.Username, _settings.Password ?? string.Empty, ct);
            }

            await smtp.SendAsync(message, ct);
            await smtp.DisconnectAsync(true, ct);
        }

        // Minimal template renderer. Replace {Key} tokens in a string body
        // built per template type. For real templating swap in Razor or
        // Scriban — this is enough for verification + reset emails.
        private static string RenderTemplate(EmailJob job)
        {
            var data = job.TemplateData ?? new Dictionary<string, string?>();
            string Get(string key) => data.TryGetValue(key, out var v) ? v ?? "" : "";

            return job.TemplateType switch
            {
                "email_confirmation" =>
                    $"<p>Hi {Get("FirstName")},</p>" +
                    $"<p>Confirm your Aptiverse email by clicking " +
                    $"<a href=\"{Get("ConfirmationLink")}\">here</a>.</p>" +
                    $"<p>If you didn't sign up, ignore this message.</p>",
                "password_reset" =>
                    $"<p>Hi {Get("FirstName")},</p>" +
                    $"<p>Reset your password by clicking " +
                    $"<a href=\"{Get("ConfirmationLink")}\">here</a>. " +
                    $"The link expires in 30 minutes.</p>",
                _ => $"<p>Hi {Get("FirstName")},</p><p>{Get("Body")}</p>",
            };
        }
    }
}
