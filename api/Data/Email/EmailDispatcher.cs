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

            try
            {
                await foreach (var job in _queue.Reader.ReadAllAsync(stoppingToken))
                {
                    await TrySendWithRetry(job, stoppingToken);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                // Normal shutdown: the queue reader was cancelled. Exit quietly
                // instead of letting the OCE escape (which StopHost escalates to
                // a crit and tears the host down).
            }

            _log.LogInformation("EmailDispatcher stopping.");
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

                // Billing emails we send ourselves (Path A). These replace the
                // generic ones Paystack would otherwise send, and stay on brand.
                "payment_receipt" => Shell(
                    "Payment received",
                    $"<p style=\"margin:0 0 16px\">Thanks, your payment for " +
                    $"<strong>{Get("PlanName")}</strong> went through.</p>" +
                    KeyValues(
                        ("Amount", Get("AmountZar")),
                        ("Next charge", Get("NextChargeDate")),
                        Get("CardLast4") is { Length: > 0 } l4 ? ("Card", $"ending {l4}") : ("", "")),
                    "View billing", Get("BillingUrl")),

                "payment_failed" => Shell(
                    "We couldn't charge your card",
                    $"<p style=\"margin:0 0 12px\">Your payment for " +
                    $"<strong>{Get("PlanName")}</strong> ({Get("AmountZar")}) didn't go through. " +
                    $"We'll keep trying over the next few days. Update your card to keep your plan active.</p>",
                    "Update payment", Get("BillingUrl")),

                "subscription_cancelled" => Shell(
                    "Your subscription is ending",
                    $"<p style=\"margin:0 0 12px\">Your <strong>{Get("PlanName")}</strong> subscription " +
                    $"has been cancelled. You keep full access until " +
                    $"<strong>{Get("AccessUntil")}</strong>, then you move to the free plan.</p>" +
                    $"<p style=\"margin:0\">Changed your mind? You can resubscribe any time.</p>",
                    "Resubscribe", Get("BillingUrl")),

                // Auto-acknowledgement to whoever submitted the contact form or a
                // school enquiry. Echoes their message back so they know it landed.
                "contact_received" => Shell(
                    "We got your message",
                    $"<p style=\"margin:0 0 14px\">Hi {System.Net.WebUtility.HtmlEncode(Get("FirstName"))}, thanks for reaching out to Aptiverse. " +
                    "We've received your message and someone from our team will reply within one business day.</p>" +
                    "<p style=\"margin:0 0 6px;color:#6B6E73;font-size:13px\">Your message</p>" +
                    $"<div style=\"padding:12px 14px;background:#F6F7F5;border-radius:8px;color:#3A3D42;white-space:pre-wrap\">{System.Net.WebUtility.HtmlEncode(Get("Message"))}</div>",
                    null, null,
                    "You're receiving this because you contacted Aptiverse. If this wasn't you, you can safely ignore it."),

                // Tutor notifications. Gated on the tutor's Settings prefs
                // before they're ever enqueued (see TutorNotifier).
                "tutor_connection" => Shell(
                    "New connection",
                    $"<p style=\"margin:0 0 12px\"><strong>{HtmlEncode(Get("StudentName"))}</strong> " +
                    $"just connected with you about <strong>{HtmlEncode(Get("Subject"))}</strong>. " +
                    "Aptiverse doesn't handle the tutoring itself, so reach out and arrange the details directly.</p>",
                    "View connection", Get("Url")),

                "tutor_review" => Shell(
                    "New review",
                    $"<p style=\"margin:0 0 12px\"><strong>{HtmlEncode(Get("StudentName"))}</strong> " +
                    $"left you a <strong>{HtmlEncode(Get("Rating"))}/5</strong> review. " +
                    "Reviews build the reputation that brings your next student.</p>",
                    "Read review", Get("Url")),

                // A study-group session is about to start. Only sent to members
                // who opted into email reminders (see User.StudyGroupEmailReminders).
                "study_group_session" => Shell(
                    "Study session soon",
                    $"<p style=\"margin:0 0 12px\"><strong>{HtmlEncode(Get("Title"))}</strong> " +
                    $"with <strong>{HtmlEncode(Get("GroupName"))}</strong> starts in about " +
                    $"{HtmlEncode(Get("Minutes"))} minute(s).</p>",
                    "Open study groups", Get("Url"),
                    "You're getting this because you turned on study-group email reminders. Change it in Settings."),

                // An assessment is coming due. Sent only when the student opted
                // into assessment email and has the email channel on (see
                // User.AssessmentDueEmailReminders + User.EmailNotifications).
                "assessment_due" => Shell(
                    "Assessment due soon",
                    $"<p style=\"margin:0 0 12px\"><strong>{HtmlEncode(Get("Title"))}</strong> is " +
                    $"{HtmlEncode(Get("Due"))}.</p>" +
                    "<p style=\"margin:0\">Open it to check your tasks and mark your progress.</p>",
                    "Open assessment", Get("Url"),
                    "You're getting this because you turned on assessment email reminders. Change it in Settings."),

                // A parent asked to link to this student's account. Accepting is
                // the student's call, done from their Connections hub.
                "parent_invite" => Shell(
                    "A parent wants to connect",
                    $"<p style=\"margin:0 0 12px\"><strong>{HtmlEncode(Get("ParentName"))}</strong> " +
                    "invited you to link your Aptiverse account with theirs. Once you accept, they can " +
                    "see your progress and upcoming assessments. They can't change anything, and you can " +
                    "unlink any time.</p>" +
                    "<p style=\"margin:0\">Open your Connections page to accept or decline.</p>",
                    "Review invite", Get("Url")),

                _ => $"<p>Hi {Get("FirstName")},</p><p>{Get("Body")}</p>",
            };
        }

        private static string HtmlEncode(string s) => System.Net.WebUtility.HtmlEncode(s);

        // A branded, email-client-safe wrapper (inline styles, table layout).
        // Graphite header with the citron accent mark; single graphite CTA.
        private static string Shell(string heading, string bodyHtml, string? ctaLabel, string? ctaUrl, string? footer = null)
        {
            var cta = string.IsNullOrWhiteSpace(ctaLabel) || string.IsNullOrWhiteSpace(ctaUrl)
                ? ""
                : "<tr><td style=\"padding:4px 32px 32px\">"
                    + $"<a href=\"{ctaUrl}\" style=\"display:inline-block;background:#1B1D22;color:#FFFFFF;"
                    + "text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:8px\">"
                    + $"{ctaLabel}</a></td></tr>";

            return
                "<div style=\"background:#F6F7F5;padding:24px 0;"
                + "font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif\">"
                + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\"><tr><td align=\"center\">"
                + "<table role=\"presentation\" width=\"520\" cellpadding=\"0\" cellspacing=\"0\" "
                + "style=\"max-width:520px;width:100%;background:#FFFFFF;border-radius:14px;overflow:hidden;border:1px solid #E4E6E1\">"
                + "<tr><td style=\"background:#1B1D22;padding:20px 32px\">"
                + "<span style=\"color:#F2F3F1;font-size:18px;font-weight:700;letter-spacing:-0.01em\">Aptiverse</span>"
                + "<span style=\"display:inline-block;width:8px;height:8px;border-radius:2px;background:#C3E84F;margin-left:8px\"></span>"
                + "</td></tr>"
                + $"<tr><td style=\"padding:28px 32px 8px\"><h1 style=\"margin:0;font-size:20px;font-weight:700;color:#1B1D22\">{heading}</h1></td></tr>"
                + $"<tr><td style=\"padding:8px 32px 20px;font-size:15px;line-height:1.55;color:#3A3D42\">{bodyHtml}</td></tr>"
                + cta
                + "<tr><td style=\"padding:18px 32px;border-top:1px solid #EDEEEB;font-size:12px;color:#9A9C98\">"
                + (string.IsNullOrWhiteSpace(footer)
                    ? "You're receiving this because you have an Aptiverse subscription. Manage it any time from your billing page."
                    : footer)
                + "</td></tr>"
                + "</table>"
                + "<div style=\"color:#9A9C98;font-size:11px;padding:16px\">Aptiverse, South Africa</div>"
                + "</td></tr></table></div>";
        }

        // Small label/value stack for receipt-style detail. Empty-key rows are
        // skipped so optional fields (e.g. card) drop out cleanly.
        private static string KeyValues(params (string Key, string Value)[] rows)
        {
            var body = "";
            foreach (var (key, value) in rows)
            {
                if (string.IsNullOrEmpty(key)) continue;
                body += $"<tr><td style=\"padding:2px 16px 2px 0;color:#6B6E73\">{key}</td>"
                    + $"<td style=\"font-weight:600;color:#1B1D22\">{value}</td></tr>";
            }
            return $"<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" style=\"font-size:14px\">{body}</table>";
        }
    }
}
