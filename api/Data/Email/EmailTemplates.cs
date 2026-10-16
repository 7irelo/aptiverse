using System.Net;
using System.Text;

namespace Aptiverse.Api.Data.Email
{
    /// <summary>
    /// The branded email template system. One shell, one set of block
    /// primitives, and a body per template type. Every template renders
    /// BOTH an HTML part and a real plain-text part, so the dispatcher can
    /// always send multipart/alternative (better inbox placement, and the
    /// text part is what watches, screen readers and text-only clients get).
    ///
    /// Email HTML is not web HTML. The rules this file follows:
    ///   - Table layout only. No flex, no grid, no float. Outlook renders
    ///     with Word and destroys anything modern.
    ///   - Styles inline on the element. The &lt;head&gt; block is progressive
    ///     enhancement only (responsive padding, dark mode) because Gmail
    ///     strips it in several contexts. Nothing structural depends on it.
    ///   - 600px content column, fluid below that. Most of this audience
    ///     reads mail on a mid-range Android phone.
    ///   - Buttons are table cells with a VML fallback for Outlook, not a
    ///     styled anchor (which collapses to a bare link in Word).
    ///   - No web fonts, no background images, no SVG, no images at all.
    ///     Images are blocked by default in many clients; an email built
    ///     entirely from text and table cells simply cannot break that way.
    ///
    /// Brand: graphite #1B1D22 ink, citron #C3E84F as a SURFACE only (the
    /// button block and the header mark), never as coloured type.
    /// </summary>
    public static class EmailTemplates
    {
        public const string SupportEmail = "support@aptiverse.co.za";

        // Palette. Muted tones are deliberately dark enough to clear 4.5:1
        // on white; the old footer grey (#9A9C98) sat at about 2.6:1.
        private const string Graphite = "#1B1D22";
        private const string Citron = "#C3E84F";
        private const string PageBg = "#EFF0EC";
        private const string CardBg = "#FFFFFF";
        private const string Ink = "#33363B";
        private const string Muted = "#63666B";
        private const string Hairline = "#E1E3DE";
        private const string Surface = "#F5F6F2";

        private const string FontStack =
            "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

        /// <summary>HTML and plain-text parts of one rendered email.</summary>
        public sealed record Rendered(string Html, string Text);

        /// <summary>
        /// Render a template type with its data bag. Unknown or null types
        /// fall through to the generic shell, which still gets the header,
        /// footer and a text part.
        /// </summary>
        public static Rendered Render(string? templateType, IDictionary<string, string?>? data)
        {
            var d = data ?? new Dictionary<string, string?>();
            string G(string key) => d.TryGetValue(key, out var v) ? (v ?? "").Trim() : "";

            var m = Build(templateType, G);
            return new Rendered(BuildHtml(m), BuildText(m));
        }

        /// <summary>
        /// Pass-through for jobs that carry their own HTML body. We do not
        /// restyle it, but we still derive a text part so every message the
        /// dispatcher sends is multipart.
        /// </summary>
        public static Rendered RenderRaw(string html) => new(html, TextFromHtml(html));

        // ------------------------------------------------------------------
        // Template bodies
        // ------------------------------------------------------------------

        private static Message Build(string? templateType, Func<string, string> G) => templateType switch
        {
            "email_confirmation" => new Message
            {
                Preheader = "Confirm this address so we can reach you about your account.",
                Greeting = G("FirstName"),
                Heading = "Confirm your email address",
                Blocks =
                {
                    new Para("This address was used to create an Aptiverse account. Confirm it so we know we can reach you about your account."),
                    new Note("If you did not create an account, ignore this email. Nothing happens without the confirmation."),
                },
                CtaLabel = "Confirm email address",
                CtaUrl = G("ConfirmationLink"),
                Reason = "You received this because this address was used to create an Aptiverse account.",
            },

            "password_reset" => new Message
            {
                Preheader = "A password reset was requested. The link expires in 30 minutes.",
                Greeting = G("FirstName"),
                Heading = "Reset your password",
                Blocks =
                {
                    new Para("Someone asked to reset the password on the Aptiverse account for this address."),
                    new Note("The link expires in 30 minutes. If you did not ask for this, ignore this email and your password stays as it is."),
                },
                CtaLabel = "Set a new password",
                CtaUrl = G("ConfirmationLink"),
                Reason = "You received this because a password reset was requested for this address.",
            },

            // Billing mail we send ourselves (Path A). Paystack's own
            // subscription mail is off, so this is the customer's receipt.
            "payment_receipt" => new Message
            {
                Preheader = $"Receipt for {Or(G("PlanName"), "your Aptiverse plan")}.",
                Heading = "Payment received",
                Blocks =
                {
                    new Para("Your subscription payment went through. Here are the details."),
                    new Details(
                        ("Plan", G("PlanName")),
                        ("Amount", G("AmountZar")),
                        ("Next charge", G("NextChargeDate")),
                        ("Card", G("CardLast4") is { Length: > 0 } l4 ? $"ending {l4}" : "")),
                },
                CtaLabel = "View billing",
                CtaUrl = G("BillingUrl"),
                Reason = "You received this because you have a paid Aptiverse subscription. Receipts are part of the subscription and are not optional.",
            },

            "payment_failed" => new Message
            {
                Preheader = "The card on your subscription was declined. Update it to keep the plan active.",
                Heading = "We could not charge your card",
                Blocks =
                {
                    new Para("The payment for your subscription did not go through."),
                    new Details(
                        ("Plan", G("PlanName")),
                        ("Amount", G("AmountZar"))),
                    new Para("We will try again over the next few days. Update your card before then to keep the plan active."),
                },
                CtaLabel = "Update payment details",
                CtaUrl = G("BillingUrl"),
                Reason = "You received this because a payment on your Aptiverse subscription was declined.",
            },

            "subscription_cancelled" => new Message
            {
                Preheader = "Your plan has been cancelled. Access continues until the end of the paid period.",
                Heading = "Your subscription is ending",
                Blocks =
                {
                    new Para("Your subscription has been cancelled. Nothing more will be charged."),
                    new Details(
                        ("Plan", G("PlanName")),
                        ("Access until", G("AccessUntil"))),
                    new Para("You keep full access until that date, then the account moves to the free plan. You can subscribe again whenever you want."),
                },
                CtaLabel = "Manage billing",
                CtaUrl = G("BillingUrl"),
                Reason = "You received this because a subscription on your Aptiverse account was cancelled.",
            },

            // Auto-acknowledgement to whoever submitted the contact form or a
            // school enquiry. Echoes the message back so they know it landed.
            "contact_received" => new Message
            {
                Preheader = "Your message reached us. Someone from the team will reply.",
                Greeting = G("FirstName"),
                Heading = "We have your message",
                Blocks =
                {
                    new Para("Thanks for getting in touch. Your message is with the team and someone will reply, usually within one business day."),
                    new Quote("Your message", G("Message")),
                },
                Reason = "You received this because this address was used to contact Aptiverse. If that was not you, you can ignore it.",
            },

            // Internal intake mail to the support inbox. Same shell so the
            // team reads it in the same shape the customer sees.
            "contact_enquiry" => new Message
            {
                Preheader = $"Contact enquiry from {Or(G("FirstName") + " " + G("LastName"), "a visitor")}.",
                Heading = "Contact enquiry",
                Blocks =
                {
                    new Details(
                        ("Name", ($"{G("FirstName")} {G("LastName")}").Trim()),
                        ("Email", G("Email")),
                        ("Organisation", G("Organisation")),
                        ("Reason", G("Reason")),
                        ("Enquiry id", G("Id"))),
                    new Quote("Message", G("Message")),
                },
                Reason = "Internal notification from the Aptiverse contact form. The enquiry is stored and can also be read from the admin dashboard.",
            },

            "school_enquiry" => new Message
            {
                Preheader = $"School enquiry from {Or(G("SchoolName"), "a school")}.",
                Heading = "School enquiry",
                Blocks =
                {
                    new Details(
                        ("School", G("SchoolName")),
                        ("Contact", G("ContactName")),
                        ("Role", G("ContactRole")),
                        ("Email", G("Email")),
                        ("Phone", G("Phone")),
                        ("Province", G("Province")),
                        ("City", G("City")),
                        ("Curricula", G("Curricula")),
                        ("Learners", G("LearnerCount")),
                        ("Stage", G("Stage")),
                        ("Enquiry id", G("Id"))),
                    new Quote("Notes", G("Notes")),
                },
                Reason = "Internal notification from the Aptiverse school enquiry form. The enquiry is stored and can also be read from the admin dashboard.",
            },

            // Tutor notifications. Gated on the tutor's own Settings toggles
            // before they are ever enqueued (see TutorNotifier).
            "tutor_connection" => new Message
            {
                Preheader = $"{Or(G("StudentName"), "A student")} connected with you.",
                Greeting = G("FirstName"),
                Heading = "New connection",
                Blocks =
                {
                    new Details(
                        ("Student", G("StudentName")),
                        ("About", G("Subject"))),
                    new Para("Aptiverse does not handle the tutoring itself and never takes a cut. Reach out and arrange the details with them directly."),
                },
                CtaLabel = "Open connections",
                CtaUrl = G("Url"),
                Reason = "You received this because you turned on connection emails in your tutor settings.",
            },

            "tutor_review" => new Message
            {
                Preheader = $"{Or(G("StudentName"), "A student")} left you a review.",
                Greeting = G("FirstName"),
                Heading = "New review",
                Blocks =
                {
                    new Details(
                        ("Student", G("StudentName")),
                        ("Rating", G("Rating") is { Length: > 0 } r ? $"{r} out of 5" : "")),
                    new Para("Reviews show on your public tutor profile."),
                },
                CtaLabel = "Read the review",
                CtaUrl = G("Url"),
                Reason = "You received this because you turned on review emails in your tutor settings.",
            },

            // A study-group session is about to start. Only sent to members
            // who opted into email reminders (User.StudyGroupEmailReminders).
            "study_group_session" => new Message
            {
                Preheader = $"{Or(G("Title"), "A study session")} starts in about {Or(G("Minutes"), "a few")} minutes.",
                Heading = "Study session starting soon",
                Blocks =
                {
                    new Details(
                        ("Session", G("Title")),
                        ("Group", G("GroupName")),
                        ("Starts in", MinutesLabel(G("Minutes")))),
                },
                CtaLabel = "Open the group",
                CtaUrl = G("Url"),
                Reason = "You received this because you turned on study-group email reminders. You can turn them off in Settings.",
            },

            // An assessment is coming due. Sent only when the student opted
            // into assessment email and has the email channel on.
            "assessment_due" => new Message
            {
                Preheader = $"{Or(G("Title"), "An assessment")} is {Or(G("Due"), "due soon")}.",
                Heading = "Assessment due soon",
                Blocks =
                {
                    new Details(
                        ("Assessment", G("Title")),
                        ("Due", G("Due"))),
                    new Para("Open it to check the tasks and log where you are."),
                },
                CtaLabel = "Open assessment",
                CtaUrl = G("Url"),
                Reason = "You received this because you turned on assessment email reminders. You can turn them off in Settings.",
            },

            // A parent asked to link to this student's account. Accepting is
            // the student's call, done from the tokenised invite page.
            "parent_invite" => new Message
            {
                Preheader = $"{Or(G("ParentName"), "A parent")} asked to link to your Aptiverse account.",
                Heading = "A parent asked to connect",
                Blocks =
                {
                    new Para($"{Or(G("ParentName"), "A parent")} invited you to link your Aptiverse account with theirs."),
                    new Para("If you accept, they get a read-only overview of your progress and your upcoming assessments. They cannot change anything, and you can unlink at any time."),
                    new Note("If you do not know who this is, ignore this email. Nothing is shared unless you accept."),
                },
                CtaLabel = "Review the invite",
                CtaUrl = G("Url"),
                Reason = "You received this because someone entered this address when inviting a student to link accounts on Aptiverse.",
            },

            // Sent once, on successful email verification. The referral code
            // itself is owned by the affiliates module; this template only
            // renders it. Terms come from AffiliateProgramme, so if the rate
            // or the payment count changes there, the caller passes the new
            // numbers and this copy follows.
            "affiliate_welcome" => new Message
            {
                Preheader = "Your referral link, and exactly what it pays.",
                Greeting = G("FirstName"),
                Heading = "Your referral link",
                Blocks =
                {
                    new Para("Your email is confirmed. Every Aptiverse account comes with a referral link, including yours. There is nothing to apply for."),
                    new Details(
                        ("Your code", G("ReferralCode")),
                        ("You earn", G("CommissionRate")),
                        ("On", G("CommissionWindow")),
                        ("Held for", G("HoldWindow"))),
                    // Two things stated precisely because they are easy to get
                    // loosely wrong: commission is on payments actually made,
                    // not on a plan price, and the count starts at their first
                    // paid payment rather than at signup.
                    new Para("Share the link below. If someone signs up through it and later pays for a plan, you earn a share of each of those payments. The count starts at their first payment, not at signup, so a person who joins free now and upgrades months later still counts."),
                    new Para("Commission is held for a while first, in case the payment is refunded, and becomes payable after that."),
                    new Note("You earn only when someone you referred actually pays, and only on the payments they actually make. A link on its own earns nothing."),
                },
                CtaLabel = "Open your link",
                CtaUrl = G("Url"),
                Reason = "You received this once because you confirmed your email address on Aptiverse. There is nothing further to do with it.",
            },

            // Generic fallback. Still branded, still gets a text part.
            _ => new Message
            {
                Preheader = Truncate(StripMarkup(G("Body")), 140),
                Greeting = G("FirstName"),
                Heading = Or(G("Heading"), "Aptiverse"),
                Blocks = { new Para(StripMarkup(G("Body"))) },
                CtaLabel = G("CtaLabel"),
                CtaUrl = G("Url"),
                Reason = "You received this because it relates to your Aptiverse account.",
            },
        };

        // ------------------------------------------------------------------
        // Content model
        // ------------------------------------------------------------------

        private abstract record Block;

        /// <summary>Body copy. Plain text in, encoded on the way out.</summary>
        private sealed record Para(string Text) : Block;

        /// <summary>Small, quieter line: expiry windows, "ignore this" notes.</summary>
        private sealed record Note(string Text) : Block;

        /// <summary>Label/value facts. Blank values drop out entirely.</summary>
        private sealed record Details : Block
        {
            public (string Label, string Value)[] Rows { get; }
            public Details(params (string Label, string Value)[] rows) => Rows = rows;
        }

        /// <summary>Quoted user-supplied text on a citron-ruled surface.</summary>
        private sealed record Quote(string Label, string Text) : Block;

        private sealed class Message
        {
            public string Preheader = "";
            public string? Greeting;
            public string Heading = "";
            public List<Block> Blocks = [];
            public string? CtaLabel;
            public string? CtaUrl;
            public string Reason = "";
        }

        // ------------------------------------------------------------------
        // HTML rendering
        // ------------------------------------------------------------------

        private static string BuildHtml(Message m)
        {
            var sb = new StringBuilder();

            sb.Append("<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" ")
              .Append("\"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">")
              .Append("<html xmlns=\"http://www.w3.org/1999/xhtml\" lang=\"en\">")
              .Append("<head>")
              .Append("<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />")
              .Append("<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\" />")
              .Append("<meta name=\"x-apple-disable-message-reformatting\" />")
              .Append("<meta name=\"color-scheme\" content=\"light dark\" />")
              .Append("<meta name=\"supported-color-schemes\" content=\"light dark\" />")
              .Append("<title>").Append(Enc(m.Heading)).Append("</title>")
              // Progressive enhancement only. Every rule below has an inline
              // equivalent that already looks right when the block is stripped.
              .Append("<style type=\"text/css\">")
              .Append(":root{color-scheme:light dark;supported-color-schemes:light dark;}")
              .Append("body{margin:0;padding:0;width:100%!important;")
              .Append("-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}")
              .Append("table{border-collapse:collapse;}")
              .Append("img{border:0;outline:none;}")
              .Append("@media only screen and (max-width:480px){")
              .Append(".ap-pad{padding-left:22px!important;padding-right:22px!important;}")
              .Append(".ap-h1{font-size:21px!important;line-height:28px!important;}")
              .Append(".ap-btn a{display:block!important;}")
              .Append("}")
              // Clients that honour prefers-color-scheme (Apple Mail, iOS Mail,
              // Outlook.com in places) get a real dark palette instead of an
              // algorithmic inversion of a white card.
              .Append("@media (prefers-color-scheme:dark){")
              // Three distinguishable planes in dark, same as in light: the
              // page recedes furthest, the header band sits between, the card
              // comes forward. Collapsing them to one dark field loses the
              // header entirely, which is where the brand lives.
              .Append(".ap-page{background:#0D0F12!important;}")
              .Append(".ap-head{background:#17191E!important;}")
              .Append(".ap-card{background:#1E2126!important;border-color:#2E3238!important;}")
              .Append(".ap-ink{color:#EDEEEA!important;}")
              .Append(".ap-muted{color:#A9ACA7!important;}")
              .Append(".ap-rule{border-color:#2E3238!important;}")
              .Append(".ap-surface{background:#262A30!important;}")
              .Append(".ap-link{color:#EDEEEA!important;}")
              .Append("}")
              .Append("</style>")
              .Append("</head>");

            sb.Append("<body class=\"ap-page\" style=\"margin:0;padding:0;background:").Append(PageBg)
              .Append(";font-family:").Append(FontStack).Append(";\">");

            // Preheader: the snippet the inbox list shows next to the subject.
            // Hidden in the body, then padded so the client does not pull the
            // next visible words ("Aptiverse Confirm your...") in after it.
            sb.Append("<div style=\"display:none;font-size:1px;line-height:1px;max-height:0;")
              .Append("max-width:0;opacity:0;overflow:hidden;mso-hide:all;color:transparent;\">")
              .Append(Enc(m.Preheader))
              .Append(new string('‌', 0))
              .Append(string.Concat(Enumerable.Repeat("&#847;&zwnj;&nbsp;", 30)))
              .Append("</div>");

            sb.Append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" ")
              .Append("class=\"ap-page\" style=\"background:").Append(PageBg).Append(";\">")
              .Append("<tr><td align=\"center\" style=\"padding:24px 12px 32px;\">");

            sb.Append("<table role=\"presentation\" width=\"600\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" ")
              .Append("style=\"width:100%;max-width:600px;\">");

            // Header band: graphite, wordmark set in type (no image, so it
            // cannot be blocked), citron square as the brand mark.
            sb.Append("<tr><td class=\"ap-pad ap-head\" style=\"background:").Append(Graphite)
              .Append(";padding:22px 32px;border-radius:12px 12px 0 0;\">")
              .Append("<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr>")
              .Append("<td style=\"font-family:").Append(FontStack)
              .Append(";font-size:19px;line-height:24px;font-weight:700;letter-spacing:-0.01em;color:#FFFFFF;\">")
              .Append("Aptiverse</td>")
              .Append("<td width=\"10\" style=\"width:10px;\">&nbsp;</td>")
              .Append("<td width=\"10\" style=\"width:10px;\">")
              .Append("<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"10\">")
              .Append("<tr><td height=\"10\" style=\"width:10px;height:10px;background:").Append(Citron)
              .Append(";border-radius:2px;font-size:0;line-height:0;\">&nbsp;</td></tr></table>")
              .Append("</td></tr></table>")
              .Append("</td></tr>");

            // Card.
            sb.Append("<tr><td class=\"ap-card\" style=\"background:").Append(CardBg)
              .Append(";border:1px solid ").Append(Hairline)
              .Append(";border-top:0;border-radius:0 0 12px 12px;\">")
              .Append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">");

            sb.Append("<tr><td class=\"ap-pad\" style=\"padding:32px 32px 0;\">");
            sb.Append("<h1 class=\"ap-h1 ap-ink\" style=\"margin:0;font-family:").Append(FontStack)
              .Append(";font-size:24px;line-height:31px;font-weight:700;letter-spacing:-0.015em;color:")
              .Append(Graphite).Append(";\">").Append(Enc(m.Heading)).Append("</h1>");
            sb.Append("</td></tr>");

            if (!string.IsNullOrWhiteSpace(m.Greeting))
            {
                sb.Append("<tr><td class=\"ap-pad\" style=\"padding:18px 32px 0;\">")
                  .Append(P($"Hi {m.Greeting},"))
                  .Append("</td></tr>");
            }

            foreach (var block in m.Blocks)
            {
                var html = RenderBlock(block);
                if (string.IsNullOrEmpty(html)) continue;
                sb.Append("<tr><td class=\"ap-pad\" style=\"padding:16px 32px 0;\">")
                  .Append(html)
                  .Append("</td></tr>");
            }

            if (!string.IsNullOrWhiteSpace(m.CtaLabel) && !string.IsNullOrWhiteSpace(m.CtaUrl))
            {
                sb.Append("<tr><td class=\"ap-pad\" style=\"padding:26px 32px 0;\">")
                  .Append(Button(m.CtaLabel!, m.CtaUrl!))
                  .Append("</td></tr>");

                // Same URL in plain sight. Some clients strip the anchor, some
                // people forward the mail to a device without a browser, and a
                // visible destination is the honest way to show where a link goes.
                sb.Append("<tr><td class=\"ap-pad\" style=\"padding:18px 32px 0;\">")
                  .Append("<p class=\"ap-muted\" style=\"margin:0;font-family:").Append(FontStack)
                  .Append(";font-size:13px;line-height:20px;color:").Append(Muted)
                  // break-all belongs on the URL alone. On the paragraph it
                  // also chops the sentence mid-word at phone widths.
                  .Append(";\">If the button does not work, paste this into your browser:<br />")
                  .Append("<a class=\"ap-link\" href=\"").Append(Attr(m.CtaUrl!))
                  .Append("\" style=\"color:").Append(Muted)
                  .Append(";text-decoration:underline;word-break:break-all;\">")
                  .Append(Enc(m.CtaUrl!)).Append("</a></p>")
                  .Append("</td></tr>");
            }

            sb.Append("<tr><td class=\"ap-pad\" style=\"padding:0 32px 32px;\">&nbsp;</td></tr>");
            sb.Append("</table></td></tr>");

            // Footer sits outside the card: quieter, and it survives a client
            // that decides the card is the "message" and collapses the rest.
            sb.Append("<tr><td class=\"ap-pad\" style=\"padding:22px 32px 0;\">")
              .Append("<p class=\"ap-muted\" style=\"margin:0 0 10px;font-family:").Append(FontStack)
              .Append(";font-size:13px;line-height:20px;color:").Append(Muted).Append(";\">")
              .Append(Enc(m.Reason))
              .Append("</p>")
              .Append("<p class=\"ap-muted\" style=\"margin:0 0 10px;font-family:").Append(FontStack)
              .Append(";font-size:13px;line-height:20px;color:").Append(Muted).Append(";\">")
              .Append("Questions? Reply to this email or write to ")
              .Append("<a class=\"ap-link\" href=\"mailto:").Append(SupportEmail)
              .Append("\" style=\"color:").Append(Muted).Append(";text-decoration:underline;\">")
              .Append(SupportEmail).Append("</a>.")
              .Append("</p>")
              .Append("<p class=\"ap-muted\" style=\"margin:0;font-family:").Append(FontStack)
              .Append(";font-size:12px;line-height:18px;color:").Append(Muted).Append(";\">")
              .Append("Aptiverse, South Africa")
              .Append("</p>")
              .Append("</td></tr>");

            sb.Append("</table></td></tr></table></body></html>");
            return sb.ToString();
        }

        private static string RenderBlock(Block block) => block switch
        {
            Para p => string.IsNullOrWhiteSpace(p.Text) ? "" : P(p.Text),

            Note n => string.IsNullOrWhiteSpace(n.Text) ? "" :
                $"<p class=\"ap-muted\" style=\"margin:0;font-family:{FontStack};font-size:14px;" +
                $"line-height:22px;color:{Muted};\">{Enc(n.Text)}</p>",

            Details det => RenderDetails(det),

            Quote q => string.IsNullOrWhiteSpace(q.Text) ? "" :
                "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr>" +
                // Citron used the only way it is allowed to be used: as a
                // filled surface, here a 4px rule down the side of the quote.
                $"<td width=\"4\" style=\"width:4px;background:{Citron};font-size:0;line-height:0;\">&nbsp;</td>" +
                $"<td class=\"ap-surface\" style=\"background:{Surface};padding:14px 16px;\">" +
                $"<p class=\"ap-muted\" style=\"margin:0 0 6px;font-family:{FontStack};font-size:12px;" +
                $"line-height:16px;letter-spacing:0.04em;text-transform:uppercase;color:{Muted};\">" +
                $"{Enc(q.Label)}</p>" +
                $"<p class=\"ap-ink\" style=\"margin:0;font-family:{FontStack};font-size:15px;" +
                $"line-height:23px;color:{Ink};white-space:pre-wrap;\">{Enc(q.Text)}</p>" +
                "</td></tr></table>",

            _ => "",
        };

        private static string RenderDetails(Details det)
        {
            var rows = det.Rows.Where(r =>
                !string.IsNullOrWhiteSpace(r.Label) && !string.IsNullOrWhiteSpace(r.Value)).ToArray();
            if (rows.Length == 0) return "";

            var sb = new StringBuilder();
            sb.Append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" ")
              .Append("class=\"ap-surface\" style=\"background:").Append(Surface)
              .Append(";border-radius:10px;\">");
            for (var i = 0; i < rows.Length; i++)
            {
                var top = i == 0 ? 14 : 0;
                var bottom = i == rows.Length - 1 ? 14 : 0;
                sb.Append("<tr>")
                  .Append("<td class=\"ap-muted\" style=\"padding:").Append(top).Append("px 8px ")
                  .Append(bottom == 0 ? 8 : bottom).Append("px 16px;font-family:").Append(FontStack)
                  .Append(";font-size:14px;line-height:20px;color:").Append(Muted)
                  .Append(";vertical-align:top;white-space:nowrap;\">").Append(Enc(rows[i].Label)).Append("</td>")
                  .Append("<td class=\"ap-ink\" style=\"padding:").Append(top).Append("px 16px ")
                  .Append(bottom == 0 ? 8 : bottom).Append("px 0;font-family:").Append(FontStack)
                  .Append(";font-size:14px;line-height:20px;font-weight:600;color:").Append(Graphite)
                  .Append(";vertical-align:top;text-align:right;\">").Append(Enc(rows[i].Value)).Append("</td>")
                  .Append("</tr>");
            }
            sb.Append("</table>");
            return sb.ToString();
        }

        private static string P(string text) =>
            $"<p class=\"ap-ink\" style=\"margin:0;font-family:{FontStack};font-size:16px;" +
            $"line-height:25px;color:{Ink};\">{Enc(text)}</p>";

        /// <summary>
        /// Bulletproof button. Outlook (Word engine) gets a VML roundrect;
        /// everything else gets a padded anchor inside a background-filled
        /// table cell, which is the only construction that survives Gmail,
        /// Yahoo and the older Android clients intact.
        /// Citron surface, graphite ink: about 11:1 contrast.
        /// </summary>
        private static string Button(string label, string url)
        {
            var width = Math.Max(190, label.Length * 11 + 56);
            return
                "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" class=\"ap-btn\"><tr><td>" +
                "<!--[if mso]>" +
                "<v:roundrect xmlns:v=\"urn:schemas-microsoft-com:vml\" xmlns:w=\"urn:schemas-microsoft-com:office:word\" " +
                $"href=\"{Attr(url)}\" style=\"height:48px;v-text-anchor:middle;width:{width}px;\" " +
                $"arcsize=\"18%\" stroke=\"f\" fillcolor=\"{Citron}\">" +
                "<w:anchorlock/>" +
                $"<center style=\"color:{Graphite};font-family:Arial,sans-serif;font-size:16px;font-weight:bold;\">" +
                Enc(label) + "</center>" +
                "</v:roundrect>" +
                "<![endif]-->" +
                "<!--[if !mso]><!-->" +
                $"<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"{Citron}\" " +
                $"style=\"background:{Citron};border-radius:8px;\"><tr>" +
                $"<td align=\"center\" style=\"border-radius:8px;\">" +
                $"<a href=\"{Attr(url)}\" target=\"_blank\" style=\"display:inline-block;padding:14px 28px;" +
                $"font-family:{FontStack};font-size:16px;line-height:20px;font-weight:700;color:{Graphite};" +
                "text-decoration:none;border-radius:8px;\">" + Enc(label) + "</a>" +
                "</td></tr></table>" +
                "<!--<![endif]-->" +
                "</td></tr></table>";
        }

        // ------------------------------------------------------------------
        // Plain-text rendering
        //
        // Written from the same content model, not scraped off the HTML, so
        // the text part is a real alternative rather than a stripped page.
        // Wrapped at 72 columns, which is what text clients expect and what
        // keeps the message readable in a terminal or a watch.
        // ------------------------------------------------------------------

        private static string BuildText(Message m)
        {
            var sb = new StringBuilder();
            sb.Append("APTIVERSE\n\n");
            sb.Append(m.Heading.ToUpperInvariant()).Append('\n');
            sb.Append(new string('=', Math.Min(72, Math.Max(3, m.Heading.Length)))).Append("\n\n");

            if (!string.IsNullOrWhiteSpace(m.Greeting))
                sb.Append("Hi ").Append(m.Greeting).Append(",\n\n");

            foreach (var block in m.Blocks)
            {
                switch (block)
                {
                    case Para p when !string.IsNullOrWhiteSpace(p.Text):
                        sb.Append(Wrap(p.Text)).Append("\n\n");
                        break;

                    case Note n when !string.IsNullOrWhiteSpace(n.Text):
                        sb.Append(Wrap(n.Text)).Append("\n\n");
                        break;

                    case Details det:
                    {
                        var rows = det.Rows.Where(r =>
                            !string.IsNullOrWhiteSpace(r.Label) && !string.IsNullOrWhiteSpace(r.Value)).ToArray();
                        if (rows.Length == 0) break;
                        var pad = rows.Max(r => r.Label.Length);
                        foreach (var r in rows)
                            sb.Append("  ").Append(r.Label.PadRight(pad)).Append("  ").Append(r.Value).Append('\n');
                        sb.Append('\n');
                        break;
                    }

                    case Quote q when !string.IsNullOrWhiteSpace(q.Text):
                        sb.Append(q.Label).Append(":\n");
                        foreach (var line in Wrap(q.Text, 68).Split('\n'))
                            sb.Append("  > ").Append(line).Append('\n');
                        sb.Append('\n');
                        break;
                }
            }

            if (!string.IsNullOrWhiteSpace(m.CtaLabel) && !string.IsNullOrWhiteSpace(m.CtaUrl))
                sb.Append(m.CtaLabel).Append(":\n").Append(m.CtaUrl).Append("\n\n");

            sb.Append("--\n");
            sb.Append(Wrap(m.Reason)).Append('\n');
            sb.Append(Wrap($"Questions? Reply to this email or write to {SupportEmail}.")).Append('\n');
            sb.Append("Aptiverse, South Africa\n");
            return sb.ToString();
        }

        /// <summary>
        /// Last-resort text part for jobs that supplied raw HTML. Not as good
        /// as a written text body, but far better than shipping HTML-only.
        /// </summary>
        private static string TextFromHtml(string html)
        {
            var s = System.Text.RegularExpressions.Regex.Replace(
                html, @"<\s*(br|/p|/div|/tr|/h[1-6])\s*/?>", "\n",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            s = System.Text.RegularExpressions.Regex.Replace(
                s, @"<(script|style)[^>]*>.*?</\1>", "",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase |
                System.Text.RegularExpressions.RegexOptions.Singleline);
            s = System.Text.RegularExpressions.Regex.Replace(s, "<[^>]+>", "");
            s = WebUtility.HtmlDecode(s);
            s = System.Text.RegularExpressions.Regex.Replace(s, @"[ \t]+", " ");
            s = System.Text.RegularExpressions.Regex.Replace(s, @"\n{3,}", "\n\n");
            return s.Trim();
        }

        // ------------------------------------------------------------------
        // Helpers
        // ------------------------------------------------------------------

        private static string Enc(string s) => WebUtility.HtmlEncode(s ?? "");

        // URLs go into an href, so encode the HTML-significant characters and
        // nothing else. Never interpolate an unencoded value into markup.
        private static string Attr(string s) => WebUtility.HtmlEncode(s ?? "");

        private static string Or(string value, string fallback) =>
            string.IsNullOrWhiteSpace(value) ? fallback : value.Trim();

        private static string MinutesLabel(string minutes)
        {
            if (string.IsNullOrWhiteSpace(minutes)) return "";
            return int.TryParse(minutes, out var n) && n == 1 ? "about 1 minute" : $"about {minutes} minutes";
        }

        private static string StripMarkup(string s) =>
            string.IsNullOrWhiteSpace(s) ? "" :
            WebUtility.HtmlDecode(System.Text.RegularExpressions.Regex.Replace(s, "<[^>]+>", " "))
                .Replace("  ", " ").Trim();

        private static string Truncate(string s, int max) =>
            string.IsNullOrEmpty(s) || s.Length <= max ? s ?? "" : s[..(max - 1)].TrimEnd() + "…";

        private static string Wrap(string text, int width = 72)
        {
            if (string.IsNullOrWhiteSpace(text)) return "";

            // Line breaks the author (or the person who typed the message we
            // are quoting back) put in are structure, so they survive; only
            // the runs between them get re-flowed.
            var paragraphs = text.Replace("\r\n", "\n").Replace('\r', '\n').Split('\n');
            var outLines = new List<string>();

            foreach (var paragraph in paragraphs)
            {
                if (paragraph.Trim().Length == 0) { outLines.Add(""); continue; }

                var sb = new StringBuilder();
                var line = 0;
                foreach (var word in paragraph.Split(' ', StringSplitOptions.RemoveEmptyEntries))
                {
                    if (line > 0 && line + 1 + word.Length > width) { sb.Append('\n'); line = 0; }
                    else if (line > 0) { sb.Append(' '); line += 1; }
                    sb.Append(word);
                    line += word.Length;
                }
                outLines.Add(sb.ToString());
            }

            return string.Join('\n', outLines);
        }
    }
}
