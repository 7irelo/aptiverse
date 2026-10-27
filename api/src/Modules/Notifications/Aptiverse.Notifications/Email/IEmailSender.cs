namespace Aptiverse.Notifications.Email;

/// <summary>A rendered email ready for a provider. Holds personal information: never log it.</summary>
internal sealed record OutgoingEmail(string ToAddress, string? ToName, string Subject, string TextBody, string HtmlBody);

/// <summary>Hands one rendered email to a provider.</summary>
internal interface IEmailSender
{
    /// <summary>
    /// Returns the provider's message id. Throws <see cref="EmailSendException"/> for failures the caller should
    /// record; anything else is a bug.
    /// </summary>
    Task<string> SendAsync(OutgoingEmail email, CancellationToken cancellationToken);
}

/// <summary>
/// A provider refused or failed a send. Carries only a provider error code, never the provider's message (SES
/// messages can quote the recipient address) and never the inner exception, so logging it cannot leak an address.
/// </summary>
internal sealed class EmailSendException : Exception
{
    public EmailSendException()
        : this("unknown", transient: true)
    {
    }

    public EmailSendException(string message)
        : this(message, transient: true)
    {
    }

    public EmailSendException(string message, Exception innerException)
        : base(message, innerException)
    {
        ErrorCode = "unknown";
        IsTransient = true;
    }

    public EmailSendException(string errorCode, bool transient)
        : base($"The email provider failed with {errorCode} ({(transient ? "transient" : "permanent")}).")
    {
        ArgumentNullException.ThrowIfNull(errorCode);
        ErrorCode = errorCode.Length > 64 ? errorCode[..64] : errorCode;
        IsTransient = transient;
    }

    /// <summary>Provider error code, at most 64 characters.</summary>
    public string ErrorCode { get; }

    /// <summary>True when the same send may succeed later (throttling, outage, network).</summary>
    public bool IsTransient { get; }
}

/// <summary>
/// Thrown by the dispatcher after a transient failure it recorded, so Wolverine reschedules the message with
/// backoff. The delivery row already holds the attempt count and error code.
/// </summary>
internal sealed class EmailDeliveryDeferredException : Exception
{
    public EmailDeliveryDeferredException()
    {
    }

    public EmailDeliveryDeferredException(string message)
        : base(message)
    {
    }

    public EmailDeliveryDeferredException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
