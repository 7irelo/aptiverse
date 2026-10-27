using System.Net;
using System.Text.RegularExpressions;
using Aptiverse.Notifications.Email;
using Scriban;
using Scriban.Runtime;

namespace Aptiverse.Notifications.Templates;

/// <summary>A rendered email: one-line subject, plain text and HTML.</summary>
internal sealed record RenderedEmail(string Subject, string Text, string Html);

/// <summary>
/// Renders the embedded Scriban templates. Every model value is HTML-encoded before it reaches an HTML part, so a
/// template cannot forget to escape a name; text parts and the subject get the raw values. Templates are parsed once
/// when the singleton is created, and a missing part or a parse error throws then.
/// </summary>
internal sealed partial class EmailTemplateRenderer
{
    public const string Brand = "Aptiverse";

    private const string ResourcePrefix = "templates/";

    private readonly EmailLinks _links;
    private readonly Template _htmlLayout;
    private readonly Template _textLayout;
    private readonly Dictionary<string, (Template Subject, Template Text, Template Html)> _parts = new(StringComparer.Ordinal);

    public EmailTemplateRenderer(EmailLinks links)
    {
        _links = links;
        _htmlLayout = Load("layout.html.sbn");
        _textLayout = Load("layout.txt.sbn");
        foreach (var template in EmailTemplates.All)
        {
            _parts[template.Key] = (
                Load($"{template.Key}.subject.sbn"),
                Load($"{template.Key}.txt.sbn"),
                Load($"{template.Key}.html.sbn"));
        }
    }

    public RenderedEmail Render(EmailTemplate template, IReadOnlyDictionary<string, string> model)
    {
        ArgumentNullException.ThrowIfNull(template);
        ArgumentNullException.ThrowIfNull(model);

        var missing = template.ModelKeys.Where(k => !model.ContainsKey(k)).ToList();
        var unexpected = model.Keys.Where(k => !template.ModelKeys.Contains(k)).ToList();
        if (missing.Count > 0 || unexpected.Count > 0)
        {
            throw new ArgumentException(
                $"Model for {template.Key} is missing [{string.Join(", ", missing)}] and has unexpected [{string.Join(", ", unexpected)}].",
                nameof(model));
        }

        var parts = _parts[template.Key];
        var raw = new Dictionary<string, string>(model, StringComparer.Ordinal)
        {
            ["brand"] = Brand,
            ["home_link"] = _links.Home().AbsoluteUri,
        };
        var encoded = raw.ToDictionary(kv => kv.Key, kv => WebUtility.HtmlEncode(kv.Value), StringComparer.Ordinal);

        // A subject is a header: collapse any line break a value smuggled in.
        var subject = Whitespace().Replace(Run(parts.Subject, raw), " ").Trim();

        var text = Run(_textLayout, new Dictionary<string, string>(raw, StringComparer.Ordinal) { ["content"] = Run(parts.Text, raw).Trim() });

        var html = Run(_htmlLayout, new Dictionary<string, string>(encoded, StringComparer.Ordinal)
        {
            ["subject"] = WebUtility.HtmlEncode(subject),
            ["content"] = Run(parts.Html, encoded),
        });

        return new RenderedEmail(subject, text.Trim() + "\n", html);
    }

    private static string Run(Template template, IReadOnlyDictionary<string, string> values)
    {
        var globals = new ScriptObject();
        foreach (var (key, value) in values)
        {
            globals.Add(key, value);
        }

        var context = new TemplateContext { StrictVariables = true };
        context.PushGlobal(globals);
        return template.Render(context);
    }

    private static Template Load(string name)
    {
        using var stream = typeof(EmailTemplateRenderer).Assembly.GetManifestResourceStream(ResourcePrefix + name)
            ?? throw new InvalidOperationException($"Email template part {name} is not embedded.");
        using var reader = new StreamReader(stream);
        var template = Template.Parse(reader.ReadToEnd(), name);
        return template.HasErrors
            ? throw new InvalidOperationException($"Email template part {name} does not parse: {string.Join("; ", template.Messages)}")
            : template;
    }

    [GeneratedRegex(@"\s+")]
    private static partial Regex Whitespace();
}
