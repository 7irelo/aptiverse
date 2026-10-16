using System.Security.Cryptography;
using System.Text;

namespace Aptiverse.Affiliates.Application
{
    // The commercial terms of the referral programme, in one place, so that
    // changing them is a decision rather than an archaeology exercise.
    public static class AffiliateProgramme
    {
        // 40% of each subscription payment actually received. A R129/month
        // plan yields R51.60 a month. The rate is stored on each commission
        // entry at accrual time, so changing it here only affects payments made
        // from now on — earnings already booked at the old rate keep it.
        public const decimal CommissionRate = 0.40m;

        // For the first three payments from a referred person, and no more.
        // Counted from their FIRST paid payment, whenever that happens, not
        // from the day they signed up.
        public const int CommissionablePayments = 3;

        // Annual plans pay a whole year in one charge, so a single annual
        // payment already earns 40% of a year's subscription — more than three
        // monthly payments combined. They therefore commission FEWER payments:
        // one year, not three. Without this an annual referral would pay out
        // 40% of three full years.
        public const int CommissionableAnnualPayments = 1;

        // How many payments are commissionable, given whether the charge is
        // annual. Monthly gets three, annual gets one.
        public static int CommissionablePaymentsFor(bool isAnnual)
            => isAnnual ? CommissionableAnnualPayments : CommissionablePayments;

        // Refunds and chargebacks arrive late. Money does not leave until the
        // window they arrive in has closed.
        public const int HoldDays = 30;

        // How long after signup a referral still counts.
        //
        // Null means LIFETIME: the link never expires, and an account that
        // signs up free in March and upgrades the following September still
        // earns its referrer three months of commission.
        //
        // That is a deliberate commercial choice and it creates an open-ended
        // liability tail: every free account ever referred remains a future
        // payable. Set this to a TimeSpan (for example TimeSpan.FromDays(365))
        // to close that window without touching anything else.
        public static readonly TimeSpan? AttributionWindow = null;

        // How long after an account is CREATED a referral may still be
        // recorded against it.
        //
        // Not to be confused with AttributionWindow above, which governs how
        // long a recorded referral keeps earning (lifetime). This one answers
        // a different question: is this a new signup, or an existing customer
        // who happened to click somebody's link?
        //
        // Without it, any long-standing user who opens a referral link would
        // be attributed to that affiliate and earn them commission on
        // subscription payments they were always going to make. That is not a
        // referral, it is a cost. A week is generous cover for signup, email
        // verification and onboarding spread over a few sessions.
        public static readonly TimeSpan ClaimGracePeriod = TimeSpan.FromDays(7);

        // Codes are read aloud, typed on phones and written on paper. The
        // alphabet drops O/0, I/1 and similar so that a mis-read code fails
        // fast rather than landing on someone else's.
        private const string CodeAlphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
        private const int CodeLength = 8;

        public static string NewCode()
        {
            var chars = new char[CodeLength];
            for (var i = 0; i < CodeLength; i++)
            {
                chars[i] = CodeAlphabet[RandomNumberGenerator.GetInt32(CodeAlphabet.Length)];
            }
            return new string(chars);
        }

        // Codes are compared case-insensitively and whitespace-insensitively,
        // because people paste them with a trailing space more often than not.
        public static string NormaliseCode(string? code)
            => (code ?? string.Empty).Trim().ToUpperInvariant();

        // Money is rounded to cents explicitly, away from zero, at the point it
        // is stored. Never left to the database or to a later formatter.
        public static decimal ToCents(decimal amount)
            => decimal.Round(amount, 2, MidpointRounding.AwayFromZero);

        public static decimal CommissionOn(decimal paymentZar)
            => ToCents(paymentZar * CommissionRate);

        // One-way hash for fingerprints. We only ever ask whether two values
        // are equal, so keeping the original would be storing a payment
        // identifier for no benefit.
        public static string Hash(string value)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value.Trim()));
            return Convert.ToHexString(bytes);
        }

        // ---- South African tax year ---------------------------------------
        //
        // 1 March to the last day of February. The year is named for the year
        // it STARTS in: the 2026 tax year runs 1 March 2026 to 28 February
        // 2027. Getting this wrong makes every statement useless for the one
        // purpose it exists for.
        public static int TaxYearOf(DateTime utc)
            => utc.Month >= 3 ? utc.Year : utc.Year - 1;

        public static (DateTime Start, DateTime End) TaxYearBounds(int taxYear)
        {
            var start = new DateTime(taxYear, 3, 1, 0, 0, 0, DateTimeKind.Utc);
            // Exclusive end: 1 March of the following year. Comparisons use
            // `< End`, which sidesteps the leap-year question entirely.
            var end = new DateTime(taxYear + 1, 3, 1, 0, 0, 0, DateTimeKind.Utc);
            return (start, end);
        }

        public static string TaxYearLabel(int taxYear) => $"{taxYear}/{taxYear + 1}";
    }
}
