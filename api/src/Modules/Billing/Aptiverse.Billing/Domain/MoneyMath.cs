using System.Globalization;

namespace Aptiverse.Billing.Domain;

/// <param name="TotalCents">What the payer paid (prices are VAT inclusive).</param>
/// <param name="SubtotalCents">Total without VAT.</param>
/// <param name="VatCents">The VAT inside the total; 0 when not registered.</param>
/// <param name="RateBps">VAT rate in basis points; 0 when not registered.</param>
/// <param name="IsTaxInvoice">True only when VAT registered.</param>
internal sealed record VatSplit(long TotalCents, long SubtotalCents, long VatCents, int RateBps, bool IsTaxInvoice);

/// <summary>Pure money maths in integer cents. No floating point anywhere near money.</summary>
internal static class MoneyMath
{
    /// <summary>
    /// Splits a VAT inclusive total: vat = round_half_even(total * rate / (10000 + rate)). Subtotal plus VAT always
    /// equals the total exactly, because the subtotal is derived by subtraction.
    /// </summary>
    public static VatSplit SplitInclusive(long totalCents, bool registered, int rateBps)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(totalCents);
        if (!registered || rateBps <= 0)
        {
            return new VatSplit(totalCents, totalCents, 0, 0, false);
        }

        var numerator = checked((decimal)totalCents * rateBps);
        var vat = (long)Math.Round(numerator / (10_000 + rateBps), MidpointRounding.ToEven);
        return new VatSplit(totalCents, totalCents - vat, vat, rateBps, true);
    }

    /// <summary>Gapless per-year invoice number, for example APT-2026-000123.</summary>
    public static string InvoiceNumber(int year, int sequence) =>
        string.Create(CultureInfo.InvariantCulture, $"APT-{year:D4}-{sequence:D6}");
}
