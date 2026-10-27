using System.Globalization;
using System.Text.Json;

namespace Aptiverse.Mcp.Tools;

/// <summary>
/// Validates tool arguments against the pinned schema. Supports exactly the keywords the pinned schemas use (closed
/// object with required; string with maxLength; integer with minimum and maximum; array with minItems, maxItems and
/// items) and fails closed on anything else. Strings must be non-blank plain text. Messages name the argument and
/// never echo its value.
/// </summary>
internal sealed class ArgumentSchema
{
    private readonly Dictionary<string, JsonElement> _properties;
    private readonly HashSet<string> _required;

    public ArgumentSchema(string schemaJson)
    {
        using var document = JsonDocument.Parse(schemaJson);
        var root = document.RootElement;
        if (root.GetProperty("type").GetString() != "object"
            || !root.TryGetProperty("additionalProperties", out var additional)
            || additional.ValueKind != JsonValueKind.False)
        {
            throw new InvalidOperationException("Tool schemas must be closed objects.");
        }

        _properties = root.GetProperty("properties").EnumerateObject().ToDictionary(p => p.Name, p => p.Value.Clone(), StringComparer.Ordinal);
        _required = root.TryGetProperty("required", out var required)
            ? required.EnumerateArray().Select(r => r.GetString()!).ToHashSet(StringComparer.Ordinal)
            : [];
    }

    /// <summary>Null when valid, otherwise a short reason for the model.</summary>
    public string? Validate(IReadOnlyDictionary<string, JsonElement> arguments)
    {
        ArgumentNullException.ThrowIfNull(arguments);

        if (arguments.Keys.Any(name => !_properties.ContainsKey(name)))
        {
            return "An argument is not part of this tool.";
        }

        if (_required.FirstOrDefault(name => !arguments.ContainsKey(name)) is { } missing)
        {
            return $"'{missing}' is required.";
        }

        foreach (var (name, value) in arguments)
        {
            if (Check(_properties[name], value) is { } problem)
            {
                return $"'{name}' {problem}";
            }
        }

        return null;
    }

    private static string? Check(JsonElement schema, JsonElement value) => schema.GetProperty("type").GetString() switch
    {
        "string" => CheckString(schema, value),
        "integer" => CheckInteger(schema, value),
        "array" => CheckArray(schema, value),
        _ => "has an unsupported type.",
    };

    private static string? CheckString(JsonElement schema, JsonElement value)
    {
        if (value.ValueKind != JsonValueKind.String)
        {
            return "must be a string.";
        }

        var text = value.GetString()!;
        if (text.Trim().Length == 0)
        {
            return "must not be empty.";
        }

        if (schema.TryGetProperty("maxLength", out var max) && text.Length > max.GetInt32())
        {
            return string.Create(CultureInfo.InvariantCulture, $"must be at most {max.GetInt32()} characters.");
        }

        return text.Any(char.IsControl) ? "must be plain text." : null;
    }

    private static string? CheckInteger(JsonElement schema, JsonElement value)
    {
        if (value.ValueKind != JsonValueKind.Number || !value.TryGetInt32(out var number))
        {
            return "must be a whole number.";
        }

        var min = schema.TryGetProperty("minimum", out var lo) ? lo.GetInt32() : int.MinValue;
        var max = schema.TryGetProperty("maximum", out var hi) ? hi.GetInt32() : int.MaxValue;
        return number < min || number > max
            ? string.Create(CultureInfo.InvariantCulture, $"must be between {min} and {max}.")
            : null;
    }

    private static string? CheckArray(JsonElement schema, JsonElement value)
    {
        if (value.ValueKind != JsonValueKind.Array)
        {
            return "must be a list.";
        }

        var count = value.GetArrayLength();
        var min = schema.TryGetProperty("minItems", out var lo) ? lo.GetInt32() : 0;
        var max = schema.TryGetProperty("maxItems", out var hi) ? hi.GetInt32() : int.MaxValue;
        if (count < min || count > max)
        {
            return string.Create(CultureInfo.InvariantCulture, $"must have {min} to {max} items.");
        }

        var items = schema.GetProperty("items");
        foreach (var item in value.EnumerateArray())
        {
            if (Check(items, item) is { } problem)
            {
                return "item " + problem;
            }
        }

        return null;
    }
}
