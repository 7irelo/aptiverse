using System.Collections.Concurrent;
using System.Text;
using Microsoft.Extensions.Logging;

namespace Aptiverse.IntegrationTests;

/// <summary>One captured log entry: the rendered message, every structured value and the full exception.</summary>
public sealed record CapturedLog(string Category, LogLevel Level, string Text);

/// <summary>Keeps the most recent log entries in memory so tests can assert what never reaches the logs.</summary>
public sealed class CapturingLoggerProvider : ILoggerProvider
{
    private const int Capacity = 50_000;

    private readonly ConcurrentQueue<CapturedLog> _entries = new();

    public IReadOnlyList<CapturedLog> Entries => _entries.ToList();

    /// <summary>Entries whose message, structured values or exception mention <paramref name="value"/>, ignoring case.</summary>
    public IReadOnlyList<CapturedLog> Mentioning(string value) =>
        _entries.Where(e => e.Text.Contains(value, StringComparison.OrdinalIgnoreCase)).ToList();

    public ILogger CreateLogger(string categoryName) => new CapturingLogger(categoryName, this);

    public void Dispose()
    {
    }

    private void Add(CapturedLog entry)
    {
        _entries.Enqueue(entry);
        while (_entries.Count > Capacity && _entries.TryDequeue(out _))
        {
        }
    }

    private sealed class CapturingLogger(string category, CapturingLoggerProvider provider) : ILogger
    {
        public IDisposable? BeginScope<TState>(TState state)
            where TState : notnull => null;

        public bool IsEnabled(LogLevel logLevel) => logLevel != LogLevel.None;

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
        {
            var text = new StringBuilder(formatter(state, exception));
            if (state is IEnumerable<KeyValuePair<string, object?>> values)
            {
                foreach (var (key, value) in values)
                {
                    text.Append(" | ").Append(key).Append('=').Append(value);
                }
            }

            if (exception is not null)
            {
                text.Append(" | ").Append(exception);
            }

            provider.Add(new CapturedLog(category, logLevel, text.ToString()));
        }
    }
}
