namespace Aptiverse.SharedKernel.Persistence;

/// <summary>SQL for the check constraint that backs a string column holding one of a fixed set of values.</summary>
public static class CheckConstraints
{
    public static string In(string column, IEnumerable<string> values)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(column);
        ArgumentNullException.ThrowIfNull(values);

        var list = string.Join(", ", values.Select(v => $"'{v.Replace("'", "''", StringComparison.Ordinal)}'"));
        return $"{column} IN ({list})";
    }
}
