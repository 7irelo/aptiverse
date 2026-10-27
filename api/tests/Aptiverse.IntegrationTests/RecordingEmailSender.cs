using System.Collections.Concurrent;
using Aptiverse.Notifications.Email;

namespace Aptiverse.IntegrationTests;

/// <summary>
/// Stands in for SES and SMTP. Records every email and can fail the next sends to one address, so tests that run
/// while other tests' background emails are still flowing never see each other's failures.
/// </summary>
internal sealed class RecordingEmailSender : IEmailSender
{
    private readonly ConcurrentQueue<OutgoingEmail> _sent = new();
    private readonly ConcurrentDictionary<string, ConcurrentQueue<EmailSendException>> _failures = new(StringComparer.OrdinalIgnoreCase);
    private int _calls;

    /// <summary>Provider calls made, including failed ones.</summary>
    public int Calls => Volatile.Read(ref _calls);

    public IReadOnlyList<OutgoingEmail> To(string address) =>
        _sent.Where(e => string.Equals(e.ToAddress, address, StringComparison.OrdinalIgnoreCase)).ToList();

    /// <summary>The next send to <paramref name="address"/> throws <paramref name="failure"/>.</summary>
    public void FailNext(string address, EmailSendException failure) =>
        _failures.GetOrAdd(address, _ => new ConcurrentQueue<EmailSendException>()).Enqueue(failure);

    public Task<string> SendAsync(OutgoingEmail email, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(email);
        Interlocked.Increment(ref _calls);
        if (_failures.TryGetValue(email.ToAddress, out var queue) && queue.TryDequeue(out var failure))
        {
            throw failure;
        }

        _sent.Enqueue(email);
        return Task.FromResult($"test-{Guid.NewGuid():N}");
    }
}
