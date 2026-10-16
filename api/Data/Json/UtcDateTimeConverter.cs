using System.Text.Json;
using System.Text.Json.Serialization;

namespace Aptiverse.Api.Data.Json
{
    // Reads every incoming DateTime as UTC.
    //
    // Without this, logging an assessment and creating a goal both return a 500.
    // The chain: an <input type="date"> yields "2026-07-23", the frontend sends
    // that string as-is, System.Text.Json deserialises a bare date to a DateTime
    // with Kind=Unspecified, and Npgsql refuses to write an Unspecified DateTime
    // to a "timestamp with time zone" column. It throws
    // "Cannot write DateTime with Kind=Unspecified ... only UTC is supported",
    // EF wraps it in a DbUpdateException, and the student sees a server error on
    // the two things this product mainly asks them to do. Every empty dashboard,
    // calendar and goals list follows from that.
    //
    // Fixed centrally rather than per-controller because the bug belongs to the
    // seam, not to any one endpoint: it lands on any DateTime that arrives
    // without an offset, and the next date field added would inherit it. The
    // Unspecified case is the only one that needs a decision, and treating it as
    // UTC is right for this API: the wire format is ISO, every column is
    // timestamptz, and the server stores UTC throughout. Guessing the server's
    // local zone instead would silently shift a due date by two hours in SAST.
    //
    // Applies to DateTime? as well: System.Text.Json unwraps Nullable<T> onto the
    // converter registered for T.
    public sealed class UtcDateTimeConverter : JsonConverter<DateTime>
    {
        public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var value = reader.GetDateTime();

            return value.Kind switch
            {
                DateTimeKind.Utc => value,
                // Carried an offset, so the instant is already unambiguous.
                DateTimeKind.Local => value.ToUniversalTime(),
                // No offset: read it as UTC rather than as server-local time.
                _ => DateTime.SpecifyKind(value, DateTimeKind.Utc),
            };
        }

        public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
        {
            // Deliberately not a bare ToUniversalTime(): that treats an
            // Unspecified value as local and shifts it, which is the same guess
            // this converter exists to avoid. Values read back from Postgres are
            // already Utc, so this is a no-op for them.
            var utc = value.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(value, DateTimeKind.Utc)
                : value.ToUniversalTime();

            writer.WriteStringValue(utc);
        }
    }
}
