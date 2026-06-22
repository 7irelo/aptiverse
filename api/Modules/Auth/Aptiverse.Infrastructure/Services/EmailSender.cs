using Aptiverse.Api.Data.Email;
using Aptiverse.Core.Services;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Infrastructure.Services
{
    /// <summary>
    /// Producer side of the email pipeline. Builds an EmailJob and pushes
    /// it onto the in-process EmailQueue. EmailDispatcher (BackgroundService)
    /// drains the queue and sends via SMTP.
    ///
    /// Replaced the old RabbitMQ producer — for an MVP-volume app, an
    /// in-process Channel + AWS SES handles 60k+ emails/month for free.
    /// </summary>
    public class EmailSender(EmailQueue queue, ILogger<EmailSender> logger) : IEmailSender
    {
        private readonly EmailQueue _queue = queue;
        private readonly ILogger<EmailSender> _log = logger;

        public async Task SendTemplateEmailAsync(
            string email, string subject, string templateType, object templateData)
        {
            var data = ToDictionary(templateData);
            var job = new EmailJob(
                To: email,
                Subject: subject,
                HtmlBody: null,
                TemplateType: templateType,
                TemplateData: data,
                EnqueuedAt: DateTime.UtcNow);
            await _queue.Enqueue(job);
            _log.LogInformation("Email queued: type={Template} to={Email}", templateType, email);
        }

        public async Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            var job = new EmailJob(
                To: email,
                Subject: subject,
                HtmlBody: htmlMessage,
                TemplateType: null,
                TemplateData: null,
                EnqueuedAt: DateTime.UtcNow);
            await _queue.Enqueue(job);
            _log.LogInformation("Email queued: to={Email} subject={Subject}", email, subject);
        }

        private static Dictionary<string, string?> ToDictionary(object? src)
        {
            var dict = new Dictionary<string, string?>(StringComparer.Ordinal);
            if (src is null) return dict;
            foreach (var p in src.GetType().GetProperties())
            {
                dict[p.Name] = p.GetValue(src)?.ToString();
            }
            return dict;
        }
    }
}
