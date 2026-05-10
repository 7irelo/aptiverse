using System.Threading.Channels;

namespace Aptiverse.Api.Data.Email
{
    /// <summary>
    /// Bounded in-process queue for outbound emails. Singleton.
    /// Producers (EmailSender) call <see cref="Enqueue"/>. The
    /// EmailDispatcher BackgroundService consumes via <see cref="Reader"/>.
    ///
    /// Capacity = 1024 with DropOldest backpressure: if 1024 emails
    /// accumulate without being dispatched, the oldest is dropped (logged
    /// in the dispatcher). Acceptable for transactional volume — when this
    /// pressure hits, swap the channel for AWS SQS.
    /// </summary>
    public sealed class EmailQueue
    {
        private readonly Channel<EmailJob> _channel = Channel.CreateBounded<EmailJob>(
            new BoundedChannelOptions(capacity: 1024)
            {
                FullMode = BoundedChannelFullMode.DropOldest,
                SingleReader = true,
                SingleWriter = false,
            });

        public ValueTask Enqueue(EmailJob job, CancellationToken ct = default) =>
            _channel.Writer.WriteAsync(job, ct);

        public ChannelReader<EmailJob> Reader => _channel.Reader;
    }
}
