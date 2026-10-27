using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Billing.Domain;

/// <summary>A payment verified with Paystack. Unique on Paystack's reference and transaction id, so it is recorded once.</summary>
internal sealed class Payment : Entity
{
    public const int ReferenceMaxLength = 100;
    public const int ChannelMaxLength = 20;

    private Payment()
    {
    }

    public Guid UserId { get; private set; }

    public Guid? InvoiceId { get; private set; }

    public Guid? SubscriptionId { get; private set; }

    public Guid? CheckoutSessionId { get; private set; }

    public string PaystackReference { get; private set; } = string.Empty;

    public long PaystackTransactionId { get; private set; }

    public long AmountCents { get; private set; }

    public long? FeesCents { get; private set; }

    public string Currency { get; private set; } = Currencies.Zar;

    public string Status { get; private set; } = PaymentStatuses.Succeeded;

    public string? Channel { get; private set; }

    public string Purpose { get; private set; } = PaymentPurposes.Subscription;

    public DateTimeOffset PaidAt { get; private set; }

    public static Payment Succeeded(
        Guid userId, Guid? subscriptionId, Guid? checkoutSessionId, string reference, long transactionId, long amountCents, long? feesCents,
        string currency, string? channel, string purpose, DateTimeOffset paidAt) => new()
        {
            UserId = userId,
            SubscriptionId = subscriptionId,
            CheckoutSessionId = checkoutSessionId,
            PaystackReference = reference,
            PaystackTransactionId = transactionId,
            AmountCents = amountCents,
            FeesCents = feesCents,
            Currency = currency,
            Status = PaymentStatuses.Succeeded,
            Channel = channel is { Length: > ChannelMaxLength } ? channel[..ChannelMaxLength] : channel,
            Purpose = purpose,
            PaidAt = paidAt,
        };

    public void AttachInvoice(Guid invoiceId) => InvoiceId = invoiceId;
}

/// <summary>A refund of part or all of a payment. The sum per payment never exceeds the payment (checked in the handler).</summary>
internal sealed class Refund : Entity
{
    public const int ReasonMaxLength = 200;

    private Refund()
    {
    }

    public Guid PaymentId { get; private set; }

    public long AmountCents { get; private set; }

    public string Currency { get; private set; } = Currencies.Zar;

    public string Reason { get; private set; } = string.Empty;

    public string Status { get; private set; } = RefundStatuses.Pending;

    public long? PaystackRefundId { get; private set; }

    /// <summary>The admin who asked for it; null when the refund started at Paystack.</summary>
    public Guid? RequestedByUserId { get; private set; }

    public DateTimeOffset? ProcessedAt { get; private set; }

    public static Refund FromPaystack(Guid paymentId, long amountCents, string currency, long paystackRefundId, string status, string reason) => new()
    {
        PaymentId = paymentId,
        AmountCents = amountCents,
        Currency = currency,
        PaystackRefundId = paystackRefundId,
        Status = status,
        Reason = reason.Length <= ReasonMaxLength ? reason : reason[..ReasonMaxLength],
    };

    /// <summary>Returns true only on the change to processed, so the ledger and event happen once.</summary>
    public bool MarkProcessed(DateTimeOffset now)
    {
        if (Status == RefundStatuses.Processed)
        {
            return false;
        }

        Status = RefundStatuses.Processed;
        ProcessedAt = now;
        return true;
    }

    public void MarkFailed()
    {
        if (Status != RefundStatuses.Processed)
        {
            Status = RefundStatuses.Failed;
        }
    }
}

/// <summary>
/// Append-only money ledger: every change of money is one row (charge positive, refund and credit negative). For any
/// user or payment the sum equals what was charged minus what was given back, to the cent.
/// </summary>
internal sealed class LedgerEntry : Entity
{
    public const int DescriptionMaxLength = 200;

    private LedgerEntry()
    {
    }

    public Guid UserId { get; private set; }

    public string Kind { get; private set; } = LedgerKinds.Charge;

    public long AmountCents { get; private set; }

    public string Currency { get; private set; } = Currencies.Zar;

    public Guid? PaymentId { get; private set; }

    public Guid? RefundId { get; private set; }

    public Guid? InvoiceId { get; private set; }

    public Guid? SubscriptionId { get; private set; }

    public string Description { get; private set; } = string.Empty;

    public DateTimeOffset OccurredAt { get; private set; }

    public static LedgerEntry Charge(Payment payment, Guid? invoiceId, string description) => new()
    {
        UserId = payment.UserId,
        Kind = LedgerKinds.Charge,
        AmountCents = payment.AmountCents,
        Currency = payment.Currency,
        PaymentId = payment.Id,
        InvoiceId = invoiceId,
        SubscriptionId = payment.SubscriptionId,
        Description = Clip(description),
        OccurredAt = payment.PaidAt,
    };

    public static LedgerEntry ForRefund(Payment payment, Refund refund, DateTimeOffset now) => new()
    {
        UserId = payment.UserId,
        Kind = LedgerKinds.Refund,
        AmountCents = -refund.AmountCents,
        Currency = refund.Currency,
        PaymentId = payment.Id,
        RefundId = refund.Id,
        InvoiceId = payment.InvoiceId,
        SubscriptionId = payment.SubscriptionId,
        Description = Clip($"Refund of {payment.PaystackReference}"),
        OccurredAt = now,
    };

    private static string Clip(string text) => text.Length <= DescriptionMaxLength ? text : text[..DescriptionMaxLength];
}

/// <summary>
/// A receipt for every payment, and a tax invoice only when VAT registered. Numbering is gapless per year. Name and
/// email are snapshots, pseudonymised when the account is erased; the money columns are kept as tax records.
/// </summary>
internal sealed class Invoice : Entity
{
    public const int NumberMaxLength = 20;
    public const int BillingNameMaxLength = 120;
    public const int BillingEmailMaxLength = 256;

    private Invoice()
    {
    }

    public string Number { get; private set; } = string.Empty;

    public Guid UserId { get; private set; }

    public Guid? SubscriptionId { get; private set; }

    public string Status { get; private set; } = InvoiceStatuses.Paid;

    public bool IsTaxInvoice { get; private set; }

    public DateTimeOffset? PeriodStart { get; private set; }

    public DateTimeOffset? PeriodEnd { get; private set; }

    public long SubtotalCents { get; private set; }

    public long VatCents { get; private set; }

    public long TotalCents { get; private set; }

    public int VatRateBps { get; private set; }

    public string Currency { get; private set; } = Currencies.Zar;

    public string BillingName { get; private set; } = string.Empty;

    public string BillingEmail { get; private set; } = string.Empty;

    public DateTimeOffset IssuedAt { get; private set; }

    public static Invoice Issue(
        string number, Guid userId, Guid? subscriptionId, VatSplit split, string currency, string billingName, string billingEmail,
        DateTimeOffset? periodStart, DateTimeOffset? periodEnd, DateTimeOffset issuedAt) => new()
        {
            Number = number,
            UserId = userId,
            SubscriptionId = subscriptionId,
            Status = InvoiceStatuses.Paid,
            IsTaxInvoice = split.IsTaxInvoice,
            SubtotalCents = split.SubtotalCents,
            VatCents = split.VatCents,
            TotalCents = split.TotalCents,
            VatRateBps = split.RateBps,
            Currency = currency,
            BillingName = Clip(billingName, BillingNameMaxLength),
            BillingEmail = Clip(billingEmail, BillingEmailMaxLength),
            PeriodStart = periodStart,
            PeriodEnd = periodEnd,
            IssuedAt = issuedAt,
        };

    public void ApplyRefunds(long refundedCents) =>
        Status = refundedCents <= 0 ? InvoiceStatuses.Paid
            : refundedCents >= TotalCents ? InvoiceStatuses.Refunded
            : InvoiceStatuses.PartiallyRefunded;

    public void Pseudonymise(string name, string email)
    {
        BillingName = name;
        BillingEmail = email;
    }

    private static string Clip(string text, int max) => text.Length <= max ? text : text[..max];
}

internal sealed class InvoiceLine : Entity
{
    public const int DescriptionMaxLength = 200;

    private InvoiceLine()
    {
    }

    public Guid InvoiceId { get; private set; }

    public string Description { get; private set; } = string.Empty;

    public int Quantity { get; private set; }

    public long UnitAmountCents { get; private set; }

    public long AmountCents { get; private set; }

    public static InvoiceLine Create(Guid invoiceId, string description, int quantity, long unitAmountCents) => new()
    {
        InvoiceId = invoiceId,
        Description = description.Length <= DescriptionMaxLength ? description : description[..DescriptionMaxLength],
        Quantity = quantity,
        UnitAmountCents = unitAmountCents,
        AmountCents = checked(quantity * unitAmountCents),
    };
}

/// <summary>The next invoice number of a year, taken under a row lock in the transaction that issues the invoice.</summary>
internal sealed class InvoiceSequence : Entity
{
    private InvoiceSequence()
    {
    }

    public int Year { get; private set; }

    public int NextValue { get; private set; }
}
